import { NextResponse } from "next/server"
import { getInventoryItemById, updateInventoryItem, recordStockMovement } from "@/lib/db"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await getInventoryItemById(id)
    if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

    const { type, qty, from, to, reference, notes } = await req.json()
    const quantity = Number(qty)

    if (!type || !quantity) {
      return NextResponse.json({ error: "Campos requeridos: type, qty" }, { status: 400 })
    }

    // Record movement in DB
    const movement = await recordStockMovement({
      item_id: id,
      type,
      quantity,
      from_location: from ?? undefined,
      to_location: to ?? undefined,
      reference_id: reference ?? undefined,
      notes: notes ?? undefined,
    })

    // Update total_stock in DB
    const currentStock = (item as any).total_stock ?? 0
    let newStock = currentStock
    if (type === "entrada" || type === "devolucion") {
      newStock = currentStock + quantity
    } else if (type === "salida" || type === "ajuste") {
      newStock = Math.max(0, currentStock - quantity)
    }

    const updated = await updateInventoryItem(id, { total_stock: newStock })

    return NextResponse.json({ item: updated, movement })
  } catch (error) {
    console.error("[v0] Error adjusting inventory:", error)
    return NextResponse.json({ error: "Error al ajustar el inventario" }, { status: 500 })
  }
}
