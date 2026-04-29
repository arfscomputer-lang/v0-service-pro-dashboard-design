import { NextRequest, NextResponse } from "next/server"
import { getAssetsWithMaintenancePlan, createPreventiveWorkOrder } from "@/lib/db"
import {
  calculateNextMaintenanceDate,
  getMaintenanceStatus,
  generatePreventiveOrderId,
  AssetMaintenanceInfo,
} from "@/lib/maintenance"

export async function POST(req: NextRequest) {
  try {
    const { customer_id } = await req.json()

    if (!customer_id) {
      return NextResponse.json({ error: "customer_id is required" }, { status: 400 })
    }

    const assets = await getAssetsWithMaintenancePlan(customer_id) as AssetMaintenanceInfo[]

    let generated = 0
    let skipped = 0
    const created: string[] = []

    for (const asset of assets) {
      const status = getMaintenanceStatus(asset, 7)

      // Only generate orders for assets that are overdue or due within 7 days
      if (status !== 'vencido' && status !== 'proximo') {
        skipped++
        continue
      }

      const scheduledDate = asset.next_maintenance_date
        ? new Date(asset.next_maintenance_date)
        : new Date()

      const orderId = generatePreventiveOrderId(asset)

      const order = await createPreventiveWorkOrder({
        order_id: orderId,
        customer_id: asset.customer_id,
        asset_id: asset.asset_id,
        asset_name: asset.name,
        scheduled_date: scheduledDate,
      })

      if (order) {
        generated++
        created.push(asset.name)
      } else {
        skipped++ // already had a pending order
      }
    }

    return NextResponse.json({
      message: `${generated} orden(es) generada(s), ${skipped} omitida(s)`,
      generated,
      skipped,
      created,
    })
  } catch (error) {
    console.error("[v0] Error generating maintenance orders:", error)
    return NextResponse.json(
      { error: "Failed to generate maintenance orders", details: String(error) },
      { status: 500 }
    )
  }
}

// GET: returns assets with their maintenance status for a customer
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customer_id = searchParams.get("customer_id")

    if (!customer_id) {
      return NextResponse.json({ error: "customer_id is required" }, { status: 400 })
    }

    const assets = await getAssetsWithMaintenancePlan(customer_id) as AssetMaintenanceInfo[]

    const withStatus = assets.map((asset) => ({
      ...asset,
      maintenance_status: getMaintenanceStatus(asset, 7),
      next_maintenance_date_calculated: calculateNextMaintenanceDate(asset)?.toISOString() ?? null,
    }))

    const overdue = withStatus.filter(a => a.maintenance_status === 'vencido')
    const upcoming = withStatus.filter(a => a.maintenance_status === 'proximo')
    const upToDate = withStatus.filter(a => a.maintenance_status === 'al_dia')

    return NextResponse.json({
      assets: withStatus,
      summary: {
        total: assets.length,
        overdue: overdue.length,
        upcoming: upcoming.length,
        up_to_date: upToDate.length,
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching maintenance status:", error)
    return NextResponse.json({ error: "Failed to fetch maintenance status" }, { status: 500 })
  }
}
