import { NextRequest, NextResponse } from "next/server"
import { query, getMany } from "@/lib/db"

let tableEnsured = false
async function ensureTable() {
  if (tableEnsured) return
  await query(`
    CREATE TABLE IF NOT EXISTS work_order_expenses (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      work_order_id UUID NOT NULL,
      category      TEXT NOT NULL,
      description   TEXT NOT NULL,
      amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_by    TEXT NOT NULL DEFAULT '',
      receipt_data  TEXT,
      receipt_name  TEXT,
      receipt_type  TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `).catch(() => {})
  await query(
    `CREATE INDEX IF NOT EXISTS idx_woe_order ON work_order_expenses(work_order_id)`
  ).catch(() => {})
  // Add receipt columns if table already existed without them
  await query(`ALTER TABLE work_order_expenses ADD COLUMN IF NOT EXISTS receipt_data TEXT`).catch(() => {})
  await query(`ALTER TABLE work_order_expenses ADD COLUMN IF NOT EXISTS receipt_name TEXT`).catch(() => {})
  await query(`ALTER TABLE work_order_expenses ADD COLUMN IF NOT EXISTS receipt_type TEXT`).catch(() => {})
  tableEnsured = true
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTable()
    const { id } = await params
    const rows = await getMany<any>(
      `SELECT id, category, description, amount, created_by, created_at,
              receipt_name, receipt_type,
              CASE WHEN receipt_data IS NOT NULL THEN true ELSE false END AS has_receipt
       FROM work_order_expenses WHERE work_order_id = $1 ORDER BY created_at ASC`,
      [id]
    )
    const total = rows.reduce((sum: number, r: any) => sum + parseFloat(r.amount), 0)
    return NextResponse.json({ expenses: rows, total })
  } catch (error) {
    console.error("[v0] Expenses GET error:", error)
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTable()
    const { id } = await params
    const { category, description, amount, created_by, receipt_data, receipt_name, receipt_type } = await req.json()

    if (!category || !description || amount == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const CATEGORIES = ["mano_de_obra", "repuestos", "traslado", "terceros", "otros"]
    if (!CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    const rows = await getMany<any>(
      `INSERT INTO work_order_expenses
         (work_order_id, category, description, amount, created_by, receipt_data, receipt_name, receipt_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, category, description, amount, created_by, created_at,
                 receipt_name, receipt_type,
                 CASE WHEN receipt_data IS NOT NULL THEN true ELSE false END AS has_receipt`,
      [id, category, description, amount, created_by || "", receipt_data || null, receipt_name || null, receipt_type || null]
    )
    return NextResponse.json({ expense: rows[0] }, { status: 201 })
  } catch (error) {
    console.error("[v0] Expenses POST error:", error)
    return NextResponse.json({ error: "Failed to save expense" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await ensureTable()
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const expenseId = searchParams.get("expense_id")

    if (!expenseId) {
      return NextResponse.json({ error: "Missing expense_id" }, { status: 400 })
    }

    await query(
      `DELETE FROM work_order_expenses WHERE id = $1 AND work_order_id = $2`,
      [expenseId, id]
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Expenses DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete expense" }, { status: 500 })
  }
}
