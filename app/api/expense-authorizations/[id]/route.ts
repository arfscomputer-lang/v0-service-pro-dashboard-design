import { NextRequest, NextResponse } from "next/server"
import { query, getOne, getWorkOrderById, createNotification } from "@/lib/db"

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { status, client_comment } = await req.json()

    if (!["aprobado", "rechazado"].includes(status)) {
      return NextResponse.json({ error: "Estado inválido" }, { status: 400 })
    }

    const existing = await getOne<any>(`SELECT * FROM expense_authorizations WHERE id = $1`, [id])
    if (!existing) {
      return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    }
    if (existing.status !== "pendiente") {
      return NextResponse.json({ error: "Esta autorización ya fue respondida" }, { status: 409 })
    }

    const result = await query(
      `UPDATE expense_authorizations
       SET status = $1, client_comment = $2, responded_at = NOW()
       WHERE id = $3 RETURNING *`,
      [status, client_comment || null, id]
    )
    const authorization = result.rows[0]

    const workOrder = await getWorkOrderById(existing.work_order_id)
    await createNotification({
      type: `expense_authorization_${status}`,
      message: `El cliente ${status === "aprobado" ? "aprobó" : "rechazó"} el gasto de ${existing.currency} ${existing.amount} en la orden ${workOrder?.orderId ?? ""}`,
    })

    return NextResponse.json({ authorization })
  } catch (error) {
    console.error("[v0] Expense authorization PUT error:", error)
    return NextResponse.json({ error: "Failed to update expense authorization" }, { status: 500 })
  }
}
