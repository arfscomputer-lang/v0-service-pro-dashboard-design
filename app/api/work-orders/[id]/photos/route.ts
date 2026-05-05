import { NextRequest, NextResponse } from "next/server"
import { query, getMany } from "@/lib/db"

let tableEnsured = false
async function ensureTable() {
  if (tableEnsured) return
  await query(`
    CREATE TABLE IF NOT EXISTS work_order_photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      work_order_id UUID NOT NULL,
      photo_type TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `).catch(() => {})
  await query(`CREATE INDEX IF NOT EXISTS idx_wop_order ON work_order_photos(work_order_id, photo_type)`).catch(() => {})
  tableEnsured = true
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTable()
    const { id } = await params
    const rows = await getMany<any>(
      `SELECT photo_type, data FROM work_order_photos WHERE work_order_id = $1 ORDER BY created_at ASC`,
      [id]
    )
    const before = rows.filter((r) => r.photo_type === "before").map((r) => r.data)
    const after  = rows.filter((r) => r.photo_type === "after").map((r) => r.data)
    return NextResponse.json({ before, after })
  } catch (error) {
    console.error("[v0] Photos GET error:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTable()
    const { id } = await params
    const { photo_type, data } = await req.json()

    if (!photo_type || !data) {
      return NextResponse.json({ error: "Missing photo_type or data" }, { status: 400 })
    }
    if (!["before", "after"].includes(photo_type)) {
      return NextResponse.json({ error: "photo_type must be 'before' or 'after'" }, { status: 400 })
    }

    await query(
      `INSERT INTO work_order_photos (work_order_id, photo_type, data) VALUES ($1, $2, $3)`,
      [id, photo_type, data]
    )

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Photos POST error:", error)
    return NextResponse.json({ error: "Failed to save photo", details: String(error) }, { status: 500 })
  }
}
