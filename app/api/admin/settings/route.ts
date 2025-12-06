import { MongoClient, Db, MongoError } from "mongodb"
import { validateSettings, getValidationErrors } from "@/lib/schemas"

interface CachedConnection {
  client: MongoClient
  db: Db
}

let cached: CachedConnection | null = null

async function connectToDatabase(): Promise<CachedConnection> {
  if (cached?.client && cached?.db) {
    return cached
  }

  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not defined")
  }

  try {
    const client = new MongoClient(uri)
    await client.connect()

    const db = client.db(process.env.MONGODB_DB_NAME || "tokopanel_admin")
    cached = { client, db }

    return cached
  } catch (error) {
    console.error("MongoDB connection error:", error)
    throw new Error("Failed to connect to MongoDB")
  }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection("settings").findOne({ _id: "app_config" })

    return Response.json(settings || {}, { status: 200 })
  } catch (error) {
    console.error("Error fetching settings:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch settings"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (!body || typeof body !== "object") {
      return Response.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Validate settings
    const validation = validateSettings(body)
    if (!validation.success) {
      const errors = getValidationErrors(validation.error)
      return Response.json(
        { error: "Validation failed", details: errors },
        { status: 422 }
      )
    }

    const { db } = await connectToDatabase()

    const result = await db.collection("settings").updateOne(
      { _id: "app_config" },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    )

    // Log the change for audit trail
    await db.collection("audit_logs").insertOne({
      timestamp: new Date(),
      action: "UPDATE_SETTINGS",
      changes: body,
      status: "SUCCESS",
    })

    return Response.json({ success: true, result }, { status: 200 })
  } catch (error) {
    console.error("Error saving settings:", error)

    // Log the error
    try {
      const { db } = await connectToDatabase()
      await db.collection("audit_logs").insertOne({
        timestamp: new Date(),
        action: "UPDATE_SETTINGS",
        status: "ERROR",
        error: error instanceof Error ? error.message : String(error),
      })
    } catch (logError) {
      console.error("Failed to log error:", logError)
    }

    const message = error instanceof Error ? error.message : "Failed to save settings"
    return Response.json({ error: message }, { status: 500 })
  }
}
