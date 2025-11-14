"use server"

import { calculateFee, generateTransactionId } from "@/lib/utils"
import { plans } from "@/data/plans"
import { revalidatePath } from "next/cache"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import type { ObjectId } from "mongodb"

const API_KEY = `${appConfig.pay.api_key}` // ambil dari config kamu
const API_URL = "https://atlantich2h.com/deposit/create" // endpoint Atlantic Pedia

export interface PaymentData {
  _id?: ObjectId
  transactionId: string
  vpediaId: string
  planId: string
  username: string
  email: string
  amount: number
  fee: number
  total: number
  qrImageUrl: string
  expirationTime: string
  status: "pending" | "paid" | "completed" | "failed"
  createdAt: string
  panelDetails?: {
    username: string
    password: string
    serverId: number
  }
}

export async function createPayment(planId: string, username: string, email: string) {
  try {
    const plan = plans.find((p) => p.id === planId)
    if (!plan) throw new Error("Plan tidak ditemukan")

    const internalFee = calculateFee(plan.price)
    const nominal = plan.price + internalFee
    const transactionId = generateTransactionId()
    
    const bodyData = new URLSearchParams()
    bodyData.append("api_key", API_KEY)
    bodyData.append("reff_id", transactionId)
    bodyData.append("nominal", nominal.toString())
    bodyData.append("type", "ewallet")
    bodyData.append("metode", "qris")

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0",       
        "Accept": "application/json",      
      },
      body: bodyData,
      redirect: "follow",
    })

    const raw = await response.text()

    let data
    try {
      data = JSON.parse(raw)
    } catch {
      console.error("Atlantic returned NON-JSON response:", raw)
      throw new Error("Atlantic API tidak mengembalikan JSON (kemungkinan terblokir Cloudflare)")
    }

    if (!response.ok || !data.status) {
      throw new Error(data?.message || "Gagal membuat pembayaran ke Atlantic Pedia")
    }

    const payData = data.data

    // 🧾 Data pembayaran
    const paymentData: PaymentData = {
      transactionId,
      vpediaId: String(payData.id),
      planId,
      username,
      email,
      amount: Number(payData.nominal),
      fee: internalFee,
      total: Number(payData.nominal),
      qrImageUrl: payData.qr_image,
      expirationTime: new Date(payData.expired_at).toISOString(),
      status: payData.status === "pending" ? "pending" : "failed",
      createdAt: new Date(payData.created_at).toISOString(),
    }

    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    await db.collection("payments").insertOne(paymentData)

    revalidatePath(`/invoice/${transactionId}`)

    return { success: true, transactionId }

  } catch (error) {
    console.error("Error creating payment:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat membuat pembayaran",
    }
  }
}

export async function getPayment(transactionId: string): Promise<PaymentData | null> {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const paymentsCollection = db.collection("payments")
    const payment = (await paymentsCollection.findOne({ transactionId })) as PaymentData | null
    return payment
  } catch (error) {
    console.error("Error getting payment:", error)
    return null
  }
}

export async function updatePaymentStatus(
  transactionId: string,
  status: "pending" | "paid" | "completed" | "failed",
  panelDetails?: {
    username: string
    password: string
    serverId: number
  },
): Promise<boolean> {
  try {
    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const paymentsCollection = db.collection("payments")

    const updateData: Partial<PaymentData> = { status }
    if (panelDetails) updateData.panelDetails = panelDetails

    const result = await paymentsCollection.updateOne({ transactionId }, { $set: updateData })

    if (result.matchedCount > 0) {
      revalidatePath(`/invoice/${transactionId}`)
      return true
    }
    return false
  } catch (error) {
    console.error("Error updating payment status:", error)
    return false
  }
}
