"use server"

export async function fetchSettings() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/admin/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch settings")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching settings:", error)
    return null
  }
}

export async function saveSettings(settings: any) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/admin/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    })

    if (!response.ok) {
      throw new Error("Failed to save settings")
    }

    return await response.json()
  } catch (error) {
    console.error("Error saving settings:", error)
    throw error
  }
}
