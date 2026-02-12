import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"

// GET /api/customers/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await sql`SELECT * FROM customers WHERE id = ${id}`

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ customer: result.rows[0] })
  } catch (error) {
    console.error("[v0] Get customer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/customers/:id — Update customer
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { name, email, phone, address, city, lat, lng, nps_score, rating } =
      body

    const result = await sql`
      UPDATE customers
      SET name = COALESCE(${name}, name),
          email = COALESCE(${email}, email),
          phone = COALESCE(${phone}, phone),
          address = COALESCE(${address}, address),
          city = COALESCE(${city}, city),
          lat = COALESCE(${lat}, lat),
          lng = COALESCE(${lng}, lng),
          nps_score = COALESCE(${nps_score}, nps_score),
          rating = COALESCE(${rating}, rating)
      WHERE id = ${id}
      RETURNING *
    `

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ customer: result.rows[0] })
  } catch (error) {
    console.error("[v0] Update customer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/customers/:id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`DELETE FROM customers WHERE id = ${id}`
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("[v0] Delete customer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
