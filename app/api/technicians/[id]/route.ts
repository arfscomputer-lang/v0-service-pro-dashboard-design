import { NextResponse } from "next/server"
import { technicianProfiles } from "@/lib/data/technicians"

// GET /api/technicians/:id
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tech = technicianProfiles.find((t) => t.id === id)

    if (!tech) {
      return NextResponse.json(
        { success: false, error: `Tecnico con ID '${id}' no encontrado` },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: tech })
  } catch (error) {
    console.error("[API] Error fetching technician:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
