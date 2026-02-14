import { NextRequest, NextResponse } from "next/server"
import { getWorkOrderById, updateWorkOrder, deleteWorkOrder } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const workOrder = await getWorkOrderById(params.id)
    if (!workOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 })
    }
    return NextResponse.json({ data: workOrder }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching work order:", error)
    return NextResponse.json({ error: "Failed to fetch work order" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const workOrder = await updateWorkOrder(params.id, body)
    if (!workOrder) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 })
    }
    console.log("[v0] Updated work order:", params.id)
    return NextResponse.json({ data: workOrder }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error updating work order:", error)
    return NextResponse.json({ error: "Failed to update work order" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteWorkOrder(params.id)
    console.log("[v0] Deleted work order:", params.id)
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error deleting work order:", error)
    return NextResponse.json({ error: "Failed to delete work order" }, { status: 500 })
  }
}
