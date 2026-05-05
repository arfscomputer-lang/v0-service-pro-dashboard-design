import { NextRequest, NextResponse } from "next/server"
import { query, getMany } from "@/lib/db"

async function ensureReadAt() {
  await query(`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ`).catch(() => {})
}

export async function GET(req: NextRequest) {
  try {
    await ensureReadAt()
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("user_id")
    if (!userId) return NextResponse.json({ error: "user_id required" }, { status: 400 })

    const rows = await getMany<any>(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [userId]
    )
    const unread = rows.filter((r) => !r.read_at).length
    return NextResponse.json({ data: rows, unread })
  } catch (error) {
    console.error("[v0] Notifications GET error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureReadAt()
    const { user_id, id } = await req.json()
    if (id) {
      await query(`UPDATE notifications SET read_at = NOW() WHERE id = $1`, [id])
    } else if (user_id) {
      await query(`UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL`, [user_id])
    }
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Notifications PATCH error:", error)
    return NextResponse.json({ error: "Failed to mark as read" }, { status: 500 })
  }
}
