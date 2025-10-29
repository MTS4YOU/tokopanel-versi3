"use server"

import { calculateFee, generateTransactionId } from "@/lib/utils"
import { plans } from "@/data/plans"
import { revalidatePath } from "next/cache"
import clientPromise from "@/lib/mongodb"
import { appConfig } from "@/data/config"
import type { ObjectId } from "mongodb"
import crypto from "crypto"

const API_ID = `${appConfig.pay.api_id}`
const API_KEY = `${appConfig.pay.api_key}`
const BANK_CODE = "SP" // bisa kamu ganti ke "DA", "OVO", dll

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

    // 🔐 Buat signature (md5 dari api_id + api_key)
    const signature = crypto
      .createHash("md5")
      .update(`${API_ID}${API_KEY}${transactionId}`)
      .digest("hex")

    // 🔹 Siapkan body JSON untuk API Topupku
    const bodyData = {
      api_id: API_ID,
      api_key: API_KEY,
      nominal: nominal.toString(),
      signature: signature,
      reff_id: transactionId,
      kode_bank: BANK_CODE,
    }

    const response = await fetch("https://topupku.com/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data?.msg || "Gagal membuat pembayaran ke Topupku")
    }

    const payData = data.data

    // 💰 Gunakan nilai dari API Topupku
    const apiFee = Number(payData.fee) || 0
    const totalBayar = Number(payData.total_bayar) || nominal
    const totalDiterima = Number(payData.total_diterima) || plan.price

    // 🧾 Data pembayaran untuk database
    const paymentData: PaymentData = {
      transactionId,
      vpediaId: String(payData.trx_id),
      planId,
      username,
      email,
      amount: totalDiterima,      // uang yang masuk tanpa fee
      fee: internalFee + apiFee,  // total fee (internal + topupku)
      total: totalBayar,          // total bayar sesuai QR API
      qrImageUrl: payData.kode_pembayaran || "",
      expirationTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      status: "pending",
      createdAt: new Date().toISOString(),
    }

    const client = await clientPromise
    const db = client.db(appConfig.mongodb.dbName)
    const paymentsCollection = db.collection("payments")
    await paymentsCollection.insertOne(paymentData)

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
