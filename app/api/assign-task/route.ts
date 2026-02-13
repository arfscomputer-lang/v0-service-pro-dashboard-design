import { NextResponse } from "next/server"
import { technicianProfiles } from "@/lib/data/technicians"

// POST /api/assign-task
// Body: { workOrderId, technicianId?, autoAssign?, requiredSpecialties?, latitude?, longitude? }
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { workOrderId, technicianId, autoAssign, requiredSpecialties, latitude, longitude } = body

    // Validation
    if (!workOrderId) {
      return NextResponse.json(
        { success: false, error: "Se requiere workOrderId" },
        { status: 400 }
      )
    }

    // Manual assignment
    if (technicianId) {
      const tech = technicianProfiles.find((t) => t.id === technicianId)
      if (!tech) {
        return NextResponse.json(
          { success: false, error: `Tecnico '${technicianId}' no encontrado` },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        assignment: {
          workOrderId,
          technicianId: tech.id,
          technicianName: tech.name,
          method: "manual",
          assignedAt: new Date().toISOString(),
        },
      })
    }

    // Auto-assignment based on proximity, skills, and workload
    if (autoAssign) {
      let candidates = technicianProfiles.filter((t) => t.status === "disponible")

      // Filter by required specialties
      if (requiredSpecialties?.length) {
        candidates = candidates.filter((t) =>
          requiredSpecialties.some((sp: string) => (t.specialties || []).includes(sp as any))
        )
      }

      if (candidates.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "No hay tecnicos disponibles con las especialidades requeridas",
          },
          { status: 409 }
        )
      }

      // Score each candidate: proximity (40%), workload (30%), rating (30%)
      const scored = candidates.map((tech) => {
        let proximityScore = 50 // default if no coordinates
        if (latitude && longitude) {
          const dist = haversine(latitude, longitude, tech.latitude, tech.longitude)
          proximityScore = Math.max(0, 100 - dist * 10) // 10km = 0 score
        }

        const workloadScore = Math.max(0, 100 - tech.completedJobs * 0.1)
        const ratingScore = (tech.rating / 5) * 100

        const totalScore = proximityScore * 0.4 + workloadScore * 0.3 + ratingScore * 0.3

        return { tech, totalScore, proximityScore, workloadScore, ratingScore }
      })

      scored.sort((a, b) => b.totalScore - a.totalScore)
      const best = scored[0]

      return NextResponse.json({
        success: true,
        assignment: {
          workOrderId,
          technicianId: best.tech.id,
          technicianName: best.tech.name,
          method: "auto",
          assignedAt: new Date().toISOString(),
          scoring: {
            proximityScore: Math.round(best.proximityScore),
            workloadScore: Math.round(best.workloadScore),
            ratingScore: Math.round(best.ratingScore),
            totalScore: Math.round(best.totalScore),
          },
          alternatives: scored.slice(1, 4).map((s) => ({
            technicianId: s.tech.id,
            technicianName: s.tech.name,
            totalScore: Math.round(s.totalScore),
          })),
        },
      })
    }

    return NextResponse.json(
      { success: false, error: "Debe especificar technicianId o autoAssign: true" },
      { status: 400 }
    )
  } catch (error) {
    console.error("[API] Error assigning task:", error)
    return NextResponse.json(
      { success: false, error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Haversine formula to calculate distance in km
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
