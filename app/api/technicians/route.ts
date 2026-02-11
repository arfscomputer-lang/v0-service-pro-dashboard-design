import { NextResponse } from "next/server"
import { technicianProfiles } from "@/lib/data/technicians"
import type { TechStatus, TechSpecialty } from "@/lib/data/technicians"

// GET /api/technicians
// Query params: ?status=disponible&specialty=HVAC&q=Luis
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as TechStatus | null
    const specialty = searchParams.get("specialty") as TechSpecialty | null
    const query = searchParams.get("q")?.toLowerCase()

    let result = [...technicianProfiles]

    if (status) {
      result = result.filter((t) => t.status === status)
    }

    if (specialty) {
      result = result.filter((t) => t.specialties.includes(specialty))
    }

    if (query) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.role.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query)
      )
    }

    return NextResponse.json({
      success: true,
      count: result.length,
      data: result.map((t) => ({
        id: t.id,
        name: t.name,
        email: t.email,
        phone: t.phone,
        role: t.role,
        specialties: t.specialties,
        status: t.status,
        rating: t.rating,
        completedJobs: t.completedJobs,
        avgResponseMin: t.avgResponseMin,
        latitude: t.latitude,
        longitude: t.longitude,
        address: t.address,
        availability: t.availability,
      })),
    })
  } catch (error) {
    console.error("[API] Error fetching technicians:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}
