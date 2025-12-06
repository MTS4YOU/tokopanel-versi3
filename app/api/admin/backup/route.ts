import { MongoClient, Db } from "mongodb"

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

    // Fetch current settings
    const settings = await db.collection<any>("settings").findOne({ _id: "app_config" })

    if (!settings) {
      return Response.json({ error: "No settings found to backup" }, { status: 404 })
    }

    // Create backup record
    const backup = {
      _id: `backup_${Date.now()}`,
      settings,
      createdAt: new Date(),
    }

    await db.collection<any>("backups").insertOne(backup)

    // Log the action
    await db.collection<any>("audit_logs").insertOne({
      timestamp: new Date(),
      action: "CREATE_BACKUP",
      backupId: backup._id,
      status: "SUCCESS",
    })

    return Response.json(
      {
        success: true,
        message: "Backup berhasil dibuat",
        backupId: backup._id,
        createdAt: backup.createdAt,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error creating backup:", error)
    const message = error instanceof Error ? error.message : "Failed to create backup"
    return Response.json({ error: message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { backupId } = body

    if (!backupId) {
      return Response.json({ error: "Backup ID diperlukan" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find backup
    const backup = await db.collection<any>("backups").findOne({ _id: backupId })

    if (!backup) {
      return Response.json({ error: "Backup tidak ditemukan" }, { status: 404 })
    }

    // Restore settings
    const restoreResult = await db.collection<any>("settings").updateOne(
      { _id: "app_config" },
      { $set: backup.settings },
      { upsert: true }
    )

    // Log the action
    await db.collection<any>("audit_logs").insertOne({
      timestamp: new Date(),
      action: "RESTORE_BACKUP",
      backupId,
      status: "SUCCESS",
    })

    return Response.json(
      {
        success: true,
        message: "Settings berhasil dipulihkan dari backup",
        backupId,
        restoredAt: new Date(),
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Error restoring backup:", error)
    const message = error instanceof Error ? error.message : "Failed to restore backup"
    return Response.json({ error: message }, { status: 500 })
  }
}
