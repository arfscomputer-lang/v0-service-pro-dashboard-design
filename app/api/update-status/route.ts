import { NextResponse } from "next/server"

// PUT /api/update-status
// Body: { workOrderId, technicianId, status, latitude?, longitude?, notes?, photos? }
const validStatuses = ["pendiente", "asignado", "en_viaje", "en_sitio", "completado", "cancelado"]

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { workOrderId, technicianId, status, latitude, longitude, notes, timestamp } = body

    // Validation
    if (!workOrderId || !status) {
      return NextResponse.json(
        { success: false, error: "Se requieren workOrderId y status" },
        { status: 400 }
      )
    }

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Estado invalido: '${status}'. Estados validos: ${validStatuses.join(", ")}`,
        },
        { status: 400 }
      )
    }

    // In a real app, this would update the database and broadcast via WebSocket
    const update = {
      workOrderId,
      technicianId: technicianId || null,
      status,
      previousStatus: "en_sitio", // mock
      updatedAt: timestamp || new Date().toISOString(),
      location: latitude && longitude ? { latitude, longitude } : null,
      notes: notes || null,
    }

    // Log for real-time sync simulation
    console.log("[API] Status update:", JSON.stringify(update))

    return NextResponse.json({
      success: true,
      update,
      message: `Orden ${workOrderId} actualizada a estado: ${status}`,
    })
  } catch (error) {
    console.error("[API] Error updating status:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
