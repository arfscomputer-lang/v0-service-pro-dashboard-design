import { NextResponse } from "next/server"
import { technicianProfiles } from "@/lib/data/technicians"

// POST /api/sync
// Bidirectional sync endpoint for FSM integration
// In a real app: pulls new work orders from FSM and pushes technician updates

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { direction, data } = body

    if (direction === "pull") {
      // Simulate pulling work orders from external FSM
      return NextResponse.json({
        success: true,
        direction: "pull",
        syncedAt: new Date().toISOString(),
        workOrders: [
          {
            id: "OT-EXT-001",
            customer: "Cliente Externo 1",
            type: "Mantenimiento",
            status: "pendiente",
            source: "fsm_external",
          },
        ],
        message: "Se recibieron 1 ordenes nuevas del sistema FSM externo",
      })
    }

    if (direction === "push") {
      // Simulate pushing technician updates to external FSM
      const techUpdates = technicianProfiles.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        latitude: t.latitude,
        longitude: t.longitude,
        lastSync: new Date().toISOString(),
      }))

      return NextResponse.json({
        success: true,
        direction: "push",
        syncedAt: new Date().toISOString(),
        techniciansUpdated: techUpdates.length,
        message: `Se sincronizaron ${techUpdates.length} actualizaciones de tecnicos al sistema FSM`,
      })
    }

    return NextResponse.json(
      { success: false, error: "Se requiere direction: 'pull' | 'push'" },
      { status: 400 }
    )
  } catch (error) {
    console.error("[API] Sync error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error de sincronizacion",
        retryAfterMs: 5000,
        message: "El sistema reintentara automaticamente en 5 segundos",
      },
      { status: 503 }
    )
  }
}
