import { NextResponse } from "next/server"
import { listInventoryItems, createInventoryItem, query } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.toLowerCase() ?? ""
    const category = searchParams.get("category") ?? ""
    const lowStock = searchParams.get("lowStock") === "true"

    let items = await listInventoryItems()

    if (q) {
      items = items.filter(
        (i: any) =>
          i.name?.toLowerCase().includes(q) ||
          i.sku?.toLowerCase().includes(q)
      )
    }

    if (category) {
      items = items.filter((i: any) => i.category === category)
    }

    if (lowStock) {
      items = items.filter((i: any) => (i.total_stock || 0) <= (i.min_threshold || 10))
    }

    return NextResponse.json({ items, total: items.length })
  } catch (error) {
    console.error("[v0] Get inventory error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { sku, name, category, description, unit_cost, min_threshold } = body

    if (!sku || !name || !category || !unit_cost) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const item = await createInventoryItem({
      sku,
      name,
      category,
      description,
      unit_cost,
      min_threshold,
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Create inventory error:", error)

    if (error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "SKU already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
