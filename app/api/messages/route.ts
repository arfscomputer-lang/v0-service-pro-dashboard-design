import { NextRequest, NextResponse } from "next/server"
import { query, getMany } from "@/lib/db"

async function ensureTable() {
  await query(`
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      thread_key TEXT NOT NULL,
      tech_user_id TEXT NOT NULL,
      tech_name TEXT NOT NULL,
      target_role TEXT NOT NULL,
      from_user_id TEXT NOT NULL,
      from_name TEXT NOT NULL,
      from_role TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `)
  await query(`CREATE INDEX IF NOT EXISTS idx_messages_thread ON messages(thread_key, created_at)`)
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable()
    const { searchParams } = new URL(req.url)
    const threadKey = searchParams.get("thread_key")
    const techUserId = searchParams.get("tech_user_id")
    const targetRole = searchParams.get("target_role")

    if (threadKey) {
      const rows = await getMany<any>(
        `SELECT * FROM messages WHERE thread_key = $1 ORDER BY created_at ASC`,
        [threadKey]
      )
      return NextResponse.json({ data: rows })
    }

    if (techUserId && targetRole) {
      const key = `${techUserId}_${targetRole}`
      const rows = await getMany<any>(
        `SELECT * FROM messages WHERE thread_key = $1 ORDER BY created_at ASC`,
        [key]
      )
      return NextResponse.json({ data: rows })
    }

    // Admin/supervisor: list all threads with last message
    const rows = await getMany<any>(`
      SELECT DISTINCT ON (thread_key)
        thread_key, tech_user_id, tech_name, target_role,
        text AS last_message, created_at AS last_at
      FROM messages
      ORDER BY thread_key, created_at DESC
    `)
    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error("[v0] Messages GET error:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const { tech_user_id, tech_name, target_role, from_user_id, from_name, from_role, text } = await req.json()

    if (!tech_user_id || !target_role || !from_user_id || !text?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const thread_key = `${tech_user_id}_${target_role}`
    const result = await query(
      `INSERT INTO messages (thread_key, tech_user_id, tech_name, target_role, from_user_id, from_name, from_role, text)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [thread_key, tech_user_id, tech_name || "Técnico", target_role, from_user_id, from_name || "Usuario", from_role || "tecnico", text.trim()]
    )

    // Notify the recipient: if admin/supervisor sent → notify the tech; if tech sent → no push needed (admin polls)
    if (from_role === "admin" || from_role === "supervisor") {
      await query(
        `ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ`
      ).catch(() => {})
      await query(
        `INSERT INTO notifications (user_id, type, title, body, reference_id)
         VALUES ($1, 'mensaje', $2, $3, $4)`,
        [tech_user_id, `Mensaje de ${from_name}`, text.trim().slice(0, 100), thread_key]
      ).catch(() => {})
    }

    return NextResponse.json({ data: result.rows[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Messages POST error:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
