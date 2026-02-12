import { NextResponse } from "next/server"
import { getCustomerById, updateCustomer, deleteCustomer } from "@/lib/db"

// GET /api/customers/:id
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const customer = await getCustomerById(id)

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ customer })
  } catch (error) {
    console.error("[v0] Get customer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/customers/:id
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const customer = await updateCustomer(id, body)

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ customer })
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
    await deleteCustomer(id)
    return NextResponse.json({ success: true, id })
  } catch (error) {
    console.error("[v0] Delete customer error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
