import { NextResponse } from "next/server"
import { inventorySeed, type InventoryItem } from "@/lib/data/inventory"

const items: InventoryItem[] = [...inventorySeed]

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = items.find((i) => i.id === id)
  if (!item) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  return NextResponse.json(item)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const idx = items.findIndex((i) => i.id === id)
  if (idx === -1) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  const body = await req.json()
  items[idx] = { ...items[idx], ...body }
  return NextResponse.json(items[idx])
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const idx = items.findIndex((i) => i.id === id)
  if (idx === -1) return NextResponse.json({ error: "No encontrado" }, { status: 404 })
  items.splice(idx, 1)
  return NextResponse.json({ ok: true })
}
