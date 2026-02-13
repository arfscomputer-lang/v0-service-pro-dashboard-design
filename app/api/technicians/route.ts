import { NextResponse } from "next/server"
import { listTechnicians, createTechnician } from "@/lib/db"

// GET /api/technicians
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const specialty = searchParams.get("specialty")
    const q = searchParams.get("q")?.toLowerCase()

    let result = await listTechnicians()

    if (status) {
      result = result.filter((t: any) => t.status === status)
    }
    if (specialty) {
      result = result.filter((t: any) => (t.specialties || []).includes(specialty))
    }
    if (q) {
      result = result.filter(
        (t: any) =>
          t.name.toLowerCase().includes(q) ||
          t.role.toLowerCase().includes(q) ||
          t.email.toLowerCase().includes(q)
      )
    }

    return NextResponse.json({ success: true, count: result.length, data: result })
  } catch (error) {
    console.error("[API] Error fetching technicians:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST /api/technicians
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, phone, role, specialties, certifications, address, lat, lng } = body

    if (!name || !email) {
      return NextResponse.json({ success: false, error: "Nombre y email son requeridos" }, { status: 400 })
    }

    const tech = await createTechnician({ name, email, phone, role, specialties, certifications, address, lat, lng })
    return NextResponse.json({ success: true, data: tech }, { status: 201 })
  } catch (error) {
    console.error("[API] Error creating technician:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
