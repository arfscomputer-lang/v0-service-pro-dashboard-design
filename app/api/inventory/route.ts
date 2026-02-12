import { NextResponse } from "next/server"
import { inventorySeed, type InventoryItem } from "@/lib/data/inventory"

// In-memory store — replace with DB in production
const items: InventoryItem[] = [...inventorySeed]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")?.toLowerCase() ?? ""
  const category = searchParams.get("category") ?? ""
  const location = searchParams.get("location") ?? ""
  const lowStock = searchParams.get("lowStock") === "true"

  let result = items

  if (q) {
    result = result.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.sku.toLowerCase().includes(q) ||
        i.barcode.toLowerCase().includes(q)
    )
  }
  if (category) result = result.filter((i) => i.category === category)
  if (location) result = result.filter((i) => i.locations.some((l) => l.name.toLowerCase().includes(location.toLowerCase())))
  if (lowStock) result = result.filter((i) => i.stockTotal <= i.minStock)

  return NextResponse.json({ items: result, total: result.length })
}

export async function POST(req: Request) {
  const body = await req.json()
  const newItem: InventoryItem = {
    ...body,
    id: `INV-${String(items.length + 1).padStart(3, "0")}`,
    movements: [],
  }
  items.push(newItem)
  return NextResponse.json(newItem, { status: 201 })
}
