import { NextResponse } from "next/server"
import { listCustomers, createCustomer } from "@/lib/db"

// GET /api/customers
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const q = searchParams.get("q")?.toLowerCase()

    let customers = await listCustomers()

    if (type) {
      customers = customers.filter((c: any) => c.type === type)
    }

    if (q) {
      customers = customers.filter(
        (c: any) =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.phone?.includes(q)
      )
    }

    return NextResponse.json({ customers, total: customers.length })
  } catch (error) {
    console.error("[v0] Get customers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/customers
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

    const customer = await createCustomer({
      name,
      email,
      phone,
      address,
      city,
      lat,
      lng,
      type,
    })

    return NextResponse.json({ customer }, { status: 201 })
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
