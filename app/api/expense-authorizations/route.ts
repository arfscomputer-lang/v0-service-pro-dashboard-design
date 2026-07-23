import { NextRequest, NextResponse } from "next/server"
import { query, getMany, getWorkOrderById, createNotification } from "@/lib/db"

let tableEnsured = false
async function ensureTable() {
  if (tableEnsured) return
  await query(`
    CREATE TABLE IF NOT EXISTS expense_authorizations (
      id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      work_order_id  UUID NOT NULL,
      customer_id    UUID,
      description    TEXT NOT NULL,
      amount         NUMERIC(12,2) NOT NULL DEFAULT 0,
      currency       TEXT NOT NULL DEFAULT 'USD',
      status         TEXT NOT NULL DEFAULT 'pendiente',
      client_comment TEXT,
      created_by     TEXT NOT NULL DEFAULT '',
      created_at     TIMESTAMPTZ DEFAULT NOW(),
      responded_at   TIMESTAMPTZ
    )
  `).catch(() => {})
  await query(`CREATE INDEX IF NOT EXISTS idx_expauth_order ON expense_authorizations(work_order_id)`).catch(() => {})
  await query(`CREATE INDEX IF NOT EXISTS idx_expauth_customer ON expense_authorizations(customer_id)`).catch(() => {})
  tableEnsured = true
}

export async function GET(req: NextRequest) {
  try {
    await ensureTable()
    const { searchParams } = new URL(req.url)
    const workOrderId = searchParams.get("work_order_id")
    const customerId = searchParams.get("customer_id")

    const conditions: string[] = []
    const params: any[] = []
    if (workOrderId) { params.push(workOrderId); conditions.push(`ea.work_order_id = $${params.length}`) }
    if (customerId) { params.push(customerId); conditions.push(`ea.customer_id = $${params.length}`) }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : ""
    const rows = await getMany<any>(
      `SELECT ea.*, wo.order_id AS work_order_number
       FROM expense_authorizations ea
       LEFT JOIN work_orders wo ON wo.id = ea.work_order_id
       ${where}
       ORDER BY ea.created_at DESC`,
      params
    )
    return NextResponse.json({ authorizations: rows })
  } catch (error) {
    console.error("[v0] Expense authorizations GET error:", error)
    return NextResponse.json({ error: "Failed to fetch expense authorizations" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable()
    const { work_order_id, description, amount, currency, created_by } = await req.json()

    if (!work_order_id || !description || amount == null) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const workOrder = await getWorkOrderById(work_order_id)
    if (!workOrder) {
      return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 })
    }
    if (!workOrder.customerId) {
      return NextResponse.json({ error: "La orden no tiene un cliente vinculado" }, { status: 409 })
    }

    const rows = await getMany<any>(
      `INSERT INTO expense_authorizations (work_order_id, customer_id, description, amount, currency, created_by)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [work_order_id, workOrder.customerId, description, amount, currency || "USD", created_by || ""]
    )
    const authorization = rows[0]

    await createNotification({
      type: "expense_authorization_requested",
      message: `Se requiere tu autorización de gasto para la orden ${workOrder.orderId}: ${description} (${currency || "USD"} ${amount})`,
      customer_id: workOrder.customerId,
    })

    return NextResponse.json({ authorization }, { status: 201 })
  } catch (error) {
    console.error("[v0] Expense authorizations POST error:", error)
    return NextResponse.json({ error: "Failed to create expense authorization" }, { status: 500 })
  }
}
