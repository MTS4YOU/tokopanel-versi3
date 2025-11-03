"use server"

import { getPayment, updatePaymentStatus } from "./create-payment"
import { revalidatePath } from "next/cache"
import { plans } from "@/data/plans"
import { createPanel } from "./create-panel"
import { appConfig } from "@/data/config"

const API_KEY = `${appConfig.pay.api_key}`
const API_BASE = "https://atlantich2h.com/deposit"

interface AtlanticStatusResponse {
  status: boolean
  data?: {
    id: string
    reff_id: string
    nominal: string
    tambahan: string
    fee: string
    get_balance: string
    metode: string
    status: string // "pending" | "processing" | "success" | "failed"
    created_at: string
  }
  code?: number
}

interface AtlanticInstantResponse {
  status: boolean
  data?: {
    id: string
    reff_id: string
    nominal: number
    penanganan: number
    total_fee: number
    total_diterima: number
    status: string
    created_at: string
  }
  code?: number
}

export async function checkPaymentStatus(transactionId: string) {
  try {
    const payment = await getPayment(transactionId)
    if (!payment) return { success: false, error: "Pembayaran tidak ditemukan" }

    // ✅ Kalau sudah selesai, skip
    if (payment.status === "completed")
      return { success: true, status: "completed", panelDetails: payment.panelDetails }

    // 🔹 Cek status pembayaran ke Atlantic
    const bodyData = new URLSearchParams()
    bodyData.append("api_key", API_KEY)
    bodyData.append("id", payment.vpediaId)

    const response = await fetch(`${API_BASE}/status`, {
      method: "POST",
      body: bodyData,
      redirect: "follow",
    })

    const data: AtlanticStatusResponse = await response.json()
    if (!response.ok || !data.status)
      return { success: false, error: "Gagal memeriksa status pembayaran" }

    const payStatus = data.data?.status?.toLowerCase()

    // 🟡 Jika status masih pending
    if (payStatus === "pending") {
      return { success: true, status: "pending" }
    }

    // 🟠 Jika status "processing" —> trigger instant deposit
    if (payStatus === "processing") {
      const instantBody = new URLSearchParams()
      instantBody.append("api_key", API_KEY)
      instantBody.append("id", payment.vpediaId)
      instantBody.append("action", "false")

      const instantResponse = await fetch(`${API_BASE}/instant`, {
        method: "POST",
        body: instantBody,
        redirect: "follow",
      })

      const instantData: AtlanticInstantResponse = await instantResponse.json()
      if (!instantResponse.ok || !instantData.status)
        return { success: false, error: "Gagal memproses instant deposit" }

      // Setelah diproses instan, kita tunggu sampai status success
      if (instantData.data?.status === "success") {
        await updatePaymentStatus(transactionId, "paid")
      } else {
        return { success: true, status: "processing" }
      }
    }

    // 🟢 Kalau status "success" → lanjut buat panel
    if (payStatus === "success") {
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

    // 🔴 Kalau gagal
    if (payStatus === "failed") {
      await updatePaymentStatus(transactionId, "failed")
      return { success: true, status: "failed" }
    }

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
