import { NextRequest, NextResponse } from 'next/server'
import { createWorkOrder, getNextWorkOrderId } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      customerId,
      locationId,
      address,
      city,
      type,
      priority,
      description,
      scheduledDate,
      scheduledTime,
      technicianId,
    } = body

    if (!type || !address || !city) {
      return NextResponse.json(
        { error: 'Missing required fields: type, address, city' },
        { status: 400 }
      )
    }

    const orderId = await getNextWorkOrderId()

    const workOrder = await createWorkOrder({
      order_id: orderId,
      type,
      description: description || '',
      status: 'pendiente',
      priority: priority || 'normal',
      address,
      city,
      scheduled_date: scheduledDate || '',
      scheduled_time: scheduledTime || '',
      customer_id: customerId || locationId || undefined,
      technician_id: technicianId || undefined,
    })

    console.log('[v0] Work order created in database:', workOrder.id)
    return NextResponse.json(
      {
        success: true,
        orderId: workOrder.orderId,
        message: 'Orden creada exitosamente',
        data: workOrder,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error creating work order:', error)
    return NextResponse.json(
      { error: 'Error al crear la orden de trabajo' },
      { status: 500 }
    )
  }
}
