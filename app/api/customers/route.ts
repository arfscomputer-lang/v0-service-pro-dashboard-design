import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"

// GET /api/customers — List all customers from database
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const q = searchParams.get("q")?.toLowerCase()

    let query = "SELECT * FROM customers WHERE 1=1"
    const params: any[] = []

    if (type) {
      query += ` AND type = $${params.length + 1}`
      params.push(type)
    }

    if (q) {
      query += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1} OR phone ILIKE $${params.length + 1})`
      params.push(`%${q}%`, `%${q}%`, `%${q}%`)
    }

    query += " ORDER BY name ASC"

    const result = await sql.query(query, params)

    return NextResponse.json({ customers: result.rows, total: result.rows.length })
  } catch (error) {
    console.error("[v0] Get customers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/customers — Create a new customer in database
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, address, city, lat, lng, type } = body

    if (!name || !email || !type) {
      return NextResponse.json(
        { error: "name, email, and type are required" },
        { status: 400 }
      )
    }

    const result = await sql`
      INSERT INTO customers (name, email, phone, address, city, lat, lng, type)
      VALUES (${name}, ${email}, ${phone || null}, ${address || null}, ${city || null}, 
              ${lat || null}, ${lng || null}, ${type})
      RETURNING *
    `

    return NextResponse.json({ customer: result.rows[0] }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Create customer error:", error)

    if (error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
