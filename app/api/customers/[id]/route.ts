import { NextResponse } from "next/server"
import { customerSeed } from "@/lib/data/customers"

// GET /api/customers/:id
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = customerSeed.find((c) => c.id === id)
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 })
  }
  return NextResponse.json({ customer })
}

// PUT /api/customers/:id — Update customer
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = customerSeed.find((c) => c.id === id)
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const updated = { ...customer, ...body }
    return NextResponse.json({ customer: updated })
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}

// DELETE /api/customers/:id
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const index = customerSeed.findIndex((c) => c.id === id)
  if (index === -1) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 })
  }
  return NextResponse.json({ success: true, id })
}
