import { NextRequest, NextResponse } from "next/server"
import { listWorkOrders, createWorkOrder } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const technicianId = searchParams.get("technician_id") || undefined
    const workOrders = await listWorkOrders(technicianId)
    return NextResponse.json({ workOrders, data: workOrders }, { status: 200 })
  } catch (error) {
    console.error("[v0] Error fetching work orders:", error)
    return NextResponse.json({ error: "Failed to fetch work orders" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { 
      order_id, 
      type, 
      description, 
      status, 
      priority, 
      address, 
      city, 
      scheduled_date, 
      scheduled_time,
      customer_id,
      technician_id
    } = body

    // Strict validation: all required fields must be non-empty strings (not null, not empty)
    const errors = []
    
    if (!order_id || typeof order_id !== 'string' || order_id.trim() === '') {
      errors.push('order_id is required and must be non-empty string')
    }
    if (!type || typeof type !== 'string' || type.trim() === '') {
      errors.push('type is required and must be non-empty string')
    }
    if (!status || typeof status !== 'string' || status.trim() === '') {
      errors.push('status is required and must be non-empty string')
    }
    if (!priority || typeof priority !== 'string' || priority.trim() === '') {
      errors.push('priority is required and must be non-empty string')
    }
    if (address === null || address === undefined || (typeof address === 'string' && address.trim() === '')) {
      errors.push('address is required and must be non-empty string')
    }
    if (city === null || city === undefined || (typeof city === 'string' && city.trim() === '')) {
      errors.push('city is required and must be non-empty string')
    }

    if (errors.length > 0) {
      console.error('[v0] API Strict Validation FAILED:', errors)
      console.error('[v0] Received body:', JSON.stringify(body, null, 2))
      return NextResponse.json(
        { error: `Validation failed: ${errors.join(' | ')}` },
        { status: 400 }
      )
    }

    const workOrder = await createWorkOrder({
      order_id: order_id.trim(),
      type: type.trim(),
      description: description?.trim() || '',
      status: status.trim(),
      priority: priority.trim(),
      address: address.trim(),
      city: city.trim(),
      scheduled_date,
      scheduled_time,
      customer_id,
      technician_id,
    })

    console.log('[v0] Work order created successfully:', workOrder.id)
    return NextResponse.json({ data: workOrder }, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating work order:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Server error: ${message}` }, { status: 500 })
  }
}
