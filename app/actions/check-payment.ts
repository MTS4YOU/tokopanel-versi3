"use server"
import { getPayment, updatePaymentStatus } from "./create-payment"
import { revalidatePath } from "next/cache"
import { plans } from "@/data/plans"
import { createPanel } from "./create-panel"
import { appConfig } from "@/data/config"
import crypto from "crypto"

const API_ID = `${appConfig.pay.api_id}`
const API_KEY = `${appConfig.pay.api_key}`
const BANK_CODE = "SP" // bisa kamu ganti ke "DA", "OVO", dll

interface TopupkuResponse {
  status: boolean
  msg: string
  data?: {
    reff_id: string
    status: "Paid" | "Unpaid" | "Gagal"
    total_bayar: string
    kode_pembayaran: string
    trx_id: string
    total_diterima: string
    fee: string
  }
}

export async function checkPaymentStatus(transactionId: string) {
  try {
    const payment = await getPayment(transactionId)
    if (!payment) return { success: false, error: "Pembayaran tidak ditemukan" }

    // 🔹 Kalau udah selesai, ga perlu cek lagi
    if (payment.status === "completed")
      return { success: true, status: "completed", panelDetails: payment.panelDetails }

    // 🔹 Buat signature MD5 baru
    const signature = crypto
      .createHash("md5")
      .update(`${API_ID}${API_KEY}`)
      .digest("hex")

    const bodyData = {
      api_id: API_ID,
      api_key: API_KEY,
      signature,
      reff_id: transactionId,
      kode_bank: BANK_CODE,
    }

    // 🔹 Request ke Topupku
    const response = await fetch("https://topupku.com/api/status-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyData),
    })

    const data: TopupkuResponse = await response.json()
    if (!response.ok || !data.status)
      return { success: false, error: data.msg || "Gagal memeriksa status pembayaran" }

    const status = data.data?.status

    // 🔸 Kalau sudah dibayar
    if (status === "Paid") {
      await updatePaymentStatus(transactionId, "paid")

      const plan = plans.find((p) => p.id === payment.planId)
      if (!plan) return { success: false, error: "Plan tidak ditemukan" }

      // 🔧 Buat panel otomatis
      const panelResult = await createPanel({
        username: payment.username,
        email: payment.email,
        memory: plan.memory,
        disk: plan.disk,
        cpu: plan.cpu,
        planId: payment.planId,
        createdAt: payment.createdAt,
        panelType: payment.panelType,
        transactionId,
      })

      if (!panelResult.success) {
        await updatePaymentStatus(transactionId, "failed")
        return { success: false, error: "Gagal membuat panel" }
      }

      const panelDetails = {
        username: payment.username,
        password: panelResult.password,
        serverId: panelResult.serverId,
      }

      await updatePaymentStatus(transactionId, "completed", panelDetails)
      revalidatePath(`/invoice/${transactionId}`)

      return {
        success: true,
        status: "completed",
        panelDetails,
        showWhatsappPopup: true,
        saveToHistory: true,
        historyData: {
          transactionId,
          username: payment.username,
          email: payment.email,
          planName: plan.name,
          total: payment.total,
          createdAt: payment.createdAt,
          status: "completed",
        },
      }
    }

    // 🔸 Kalau gagal / expired
    if (status === "Gagal") {
      await updatePaymentStatus(transactionId, "failed")
      return { success: true, status: "failed" }
    }

    // 🔸 Kalau belum dibayar
    return { success: true, status: "pending" }
  } catch (error) {
    console.error("Error checking payment status:", error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memeriksa status pembayaran",
    }
  }
}
