"use server"

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
}

export async function fetchSettings() {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to fetch settings: ${error}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching settings:", error)
    throw error
  }
}

export async function saveSettings(settings: Record<string, unknown>) {
  try {
    const baseUrl = getBaseUrl()
    const response = await fetch(`${baseUrl}/api/admin/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
      cache: "no-store",
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to save settings: ${error}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving settings:", error)
    throw error
  }
}
