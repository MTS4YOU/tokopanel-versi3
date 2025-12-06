import { MongoClient, Db } from "mongodb"

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const uri = process.env.MONGODB_URI || ""
  const client = new MongoClient(uri)
  await client.connect()

  const db = client.db("admin_settings")
  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function GET() {
  try {
    const { db } = await connectToDatabase()
    const settings = await db.collection("settings").findOne({ _id: "app_config" })

    return Response.json(settings || {}, { status: 200 })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return Response.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { db } = await connectToDatabase()

    const result = await db.collection("settings").updateOne(
      { _id: "app_config" },
      { $set: body },
      { upsert: true }
    )

    return Response.json({ success: true, result }, { status: 200 })
  } catch (error) {
    console.error("Error saving settings:", error)
    return Response.json({ error: "Failed to save settings" }, { status: 500 })
  }
}
