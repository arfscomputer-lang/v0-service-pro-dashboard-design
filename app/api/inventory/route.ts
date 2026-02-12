import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.toLowerCase() ?? ""
    const category = searchParams.get("category") ?? ""
    const lowStock = searchParams.get("lowStock") === "true"

    let query = "SELECT * FROM inventory_items WHERE 1=1"
    const params: any[] = []

    if (q) {
      query += ` AND (name ILIKE $${params.length + 1} OR sku ILIKE $${params.length + 1})`
      params.push(`%${q}%`, `%${q}%`)
    }

    if (category) {
      query += ` AND category = $${params.length + 1}`
      params.push(category)
    }

    if (lowStock) {
      query += ` AND total_stock <= min_threshold`
    }

    query += " ORDER BY name ASC"

    const result = await sql.query(query, params)
    return NextResponse.json({ items: result.rows, total: result.rows.length })
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

    const result = await sql`
      INSERT INTO inventory_items (sku, name, category, description, unit_cost, min_threshold)
      VALUES (${sku}, ${name}, ${category}, ${description || null}, ${unit_cost}, ${min_threshold || 10})
      RETURNING *
    `

    return NextResponse.json({ item: result.rows[0] }, { status: 201 })
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
