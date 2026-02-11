import { NextResponse } from "next/server"

// POST /api/schedule-service — Schedule a service from CRM
// Integrates with FSM work orders
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerId, serviceType, technicianId, scheduledDate } = body

    if (!customerId || !serviceType) {
      return NextResponse.json(
        { error: "customerId and serviceType are required" },
        { status: 400 }
      )
    }

    // Simulate FSM work order creation
    const workOrder = {
      orderId: `OT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      customerId,
      serviceType,
      technicianId: technicianId ?? null,
      scheduledDate: scheduledDate ?? new Date().toISOString().slice(0, 10),
      status: "pendiente",
      createdAt: new Date().toISOString(),
    }

    // In production: POST to FSM API -> /workorders
    // await fetch(FSM_API_URL + "/workorders", { method: "POST", body: JSON.stringify(workOrder) })

    return NextResponse.json({ workOrder }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}
