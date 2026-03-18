import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[v0] Creating work order with data:', body)

    const {
      customerId,
      locationId,
      address,
      city,
      type,
      priority,
      description,
    } = body

    // Validate required fields
    if (!customerId || !locationId || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // TODO: In a real app, save to database
    // For now, we'll just return a success response
    const orderId = `OT-${Date.now()}`

    return NextResponse.json(
      {
        success: true,
        orderId,
        message: 'Orden creada exitosamente',
        data: {
          id: orderId,
          customerId,
          locationId,
          address,
          city,
          type,
          priority,
          description,
          status: 'pendiente',
          createdAt: new Date().toISOString(),
        },
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
