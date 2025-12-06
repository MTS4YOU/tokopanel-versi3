import { MongoClient, Db } from "mongodb"
import { NextResponse } from "next/server"

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = parseInt(searchParams.get("skip") || "0")

    const { db } = await connectToDatabase()
    const logs = await db
      .collection<any>("audit_logs")
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .toArray()

    const total = await db.collection<any>("audit_logs").countDocuments()

    return NextResponse.json(
      {
        logs,
        total,
        limit,
        skip,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error fetching audit logs:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch audit logs"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
