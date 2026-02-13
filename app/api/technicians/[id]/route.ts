import { NextResponse } from "next/server"
import { getTechnicianById, updateTechnician, deleteTechnician } from "@/lib/db"

// GET /api/technicians/:id
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tech = await getTechnicianById(id)
    if (!tech) {
      return NextResponse.json({ success: false, error: "Tecnico no encontrado" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: tech })
  } catch (error) {
    console.error("[API] Error fetching technician:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT /api/technicians/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const tech = await updateTechnician(id, body)
    if (!tech) {
      return NextResponse.json({ success: false, error: "Tecnico no encontrado" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: tech })
  } catch (error) {
    console.error("[API] Error updating technician:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE /api/technicians/:id
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteTechnician(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[API] Error deleting technician:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
