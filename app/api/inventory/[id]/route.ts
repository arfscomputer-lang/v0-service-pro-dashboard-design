import { NextResponse } from "next/server"
import { getInventoryItemById, updateInventoryItem, deleteInventoryItem } from "@/lib/db"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const item = await getInventoryItemById(id)
    if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    return NextResponse.json({ item })
  } catch (error) {
    console.error("[v0] Error fetching inventory item:", error)
    return NextResponse.json({ error: "Error al obtener el item" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const item = await updateInventoryItem(id, body)
    if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
    console.log("[v0] Updated inventory item in DB:", id)
    return NextResponse.json({ item })
  } catch (error) {
    console.error("[v0] Error updating inventory item:", error)
    return NextResponse.json({ error: "Error al actualizar el item" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await deleteInventoryItem(id)
    console.log("[v0] Deleted inventory item from DB:", id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Error deleting inventory item:", error)
    return NextResponse.json({ error: "Error al eliminar el item" }, { status: 500 })
  }
}
