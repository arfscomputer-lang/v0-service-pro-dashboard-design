import { NextRequest, NextResponse } from "next/server"
import { listWorkOrders, createWorkOrder } from "@/lib/db"

export async function GET() {
  try {
    const workOrders = await listWorkOrders()
    return NextResponse.json({ data: workOrders }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching work orders:", error)
    return NextResponse.json({ error: "Failed to fetch work orders" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { order_id, type, description, status, priority, address, city, scheduled_date, scheduled_time } = body

    if (!order_id || !type || !status || !priority) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const workOrder = await createWorkOrder({
      order_id,
      type,
      description,
      status,
      priority,
      address,
      city,
      scheduled_date,
      scheduled_time,
    })

    console.log("[v0] Created work order:", workOrder.id)
    return NextResponse.json({ data: workOrder }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating work order:", error)
    return NextResponse.json({ error: "Failed to create work order" }, { status: 500 })
  }
}
