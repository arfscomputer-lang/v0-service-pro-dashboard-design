import { NextRequest, NextResponse } from "next/server"
import { getMaintenancePlans, autoGenerateWorkOrdersFromOccurrences } from "@/lib/db"
import { getMaintenanceStatus, daysUntilMaintenance, AssetMaintenanceInfo } from "@/lib/maintenance"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customer_id = searchParams.get("customer_id") || undefined
    const search = searchParams.get("search") || undefined

    // Auto-generate work orders for occurrences within the next 30 days
    autoGenerateWorkOrdersFromOccurrences({ customer_id }).catch((e) =>
      console.error("[v0] autoGenerate error:", e)
    )

    const assets = await getMaintenancePlans({ customer_id, search }) as (AssetMaintenanceInfo & {
      customer_name: string
      brand: string
      model: string
      site_location: string | null
    })[]

    const enriched = assets.map((a) => ({
      ...a,
      maintenance_status: getMaintenanceStatus(a, 30),
      days_until: daysUntilMaintenance(a.next_maintenance_date),
    }))

    const vencido = enriched.filter(a => a.maintenance_status === 'vencido')
    const proximo = enriched.filter(a => a.maintenance_status === 'proximo')
    const al_dia = enriched.filter(a => a.maintenance_status === 'al_dia')
    const sin_plan = enriched.filter(a => a.maintenance_status === 'sin_plan')

    // Cumplimiento: activos al día vs total con plan y fecha definida
    const totalConFecha = enriched.filter(a => a.next_maintenance_date)
    const cumplimiento = totalConFecha.length > 0
      ? Math.round((al_dia.length / totalConFecha.length) * 100)
      : 0

    return NextResponse.json({
      plans: enriched,
      groups: { vencido, proximo, al_dia, sin_plan },
      summary: {
        total: enriched.length,
        vencido: vencido.length,
        proximo: proximo.length,
        al_dia: al_dia.length,
        cumplimiento,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching maintenance plans:", error)
    return NextResponse.json(
      { error: "Failed to fetch maintenance plans", details: String(error) },
      { status: 500 }
    )
  }
}
