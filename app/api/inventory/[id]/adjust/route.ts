import { NextResponse } from "next/server"
import { inventorySeed, type InventoryItem, type StockMovement } from "@/lib/data/inventory"

const items: InventoryItem[] = [...inventorySeed]

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = items.find((i) => i.id === id)
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const { type, quantity, location, reference, notes } = await req.json()
  if (!type || !quantity || !location) {
    return NextResponse.json({ error: "Campos requeridos: type, quantity, location" }, { status: 400 })
  }

  const movement: StockMovement = {
    id: `MOV-${Date.now()}`,
    date: new Date().toISOString().slice(0, 10),
    type,
    quantity: Number(quantity),
    location,
    reference: reference ?? "",
    user: "Admin",
    notes: notes ?? "",
  }

  item.movements.unshift(movement)

  // Update stock total
  const loc = item.locations.find((l) => l.name === location)
  if (type === "entrada" || type === "devolucion") {
    item.stockTotal += Number(quantity)
    if (loc) loc.quantity += Number(quantity)
  } else {
    item.stockTotal = Math.max(0, item.stockTotal - Number(quantity))
    if (loc) loc.quantity = Math.max(0, loc.quantity - Number(quantity))
  }

  return NextResponse.json({ item, movement })
}
