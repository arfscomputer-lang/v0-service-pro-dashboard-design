import { NextRequest, NextResponse } from "next/server"
import { getAssets, getAssetsByCustomer, createAsset, updateAssetMaintenanceDates } from "@/lib/db"
import { calculateNextMaintenanceDate, AssetMaintenanceInfo } from "@/lib/maintenance"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customer_id")

    let assets

    if (customerId) {
      assets = await getAssetsByCustomer(customerId)
    } else {
      assets = await getAssets()
    }

    return NextResponse.json({ assets, total: assets.length })
  } catch (error) {
    console.error("[v0] Error fetching assets:", error)
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.asset_id || !body.name || !body.serial_number || !body.customer_id || !body.type || !body.category) {
      return NextResponse.json(
        { error: "Missing required fields: asset_id, name, serial_number, customer_id, type, category" },
        { status: 400 }
      )
    }

    const asset = await createAsset({
      asset_id: body.asset_id,
      name: body.name,
      customer_id: body.customer_id,
      type: body.type,
      category: body.category,
      serial_number: body.serial_number,
      status: body.status || 'activo',
      criticality: body.criticality || 'medio',
      description: body.description || null,
      brand: body.brand || '',
      model: body.model || '',
      year_manufactured: body.year_manufactured,
      site_location: body.site_location,
      capacity: body.capacity,
      has_maintenance_plan: body.has_maintenance_plan || false,
      recurrence_type: body.recurrence_type,
      interval_months: body.interval_months,
      interval_hours: body.interval_hours,
      interval_cycles: body.interval_cycles,
      hours_threshold_alert: body.hours_threshold_alert,
    })

    if (!asset) {
      return NextResponse.json({ error: "Failed to create asset" }, { status: 500 })
    }

    // Auto-calculate next_maintenance_date if asset has a maintenance plan
    if (asset.has_maintenance_plan) {
      const nextDate = calculateNextMaintenanceDate(asset as AssetMaintenanceInfo)
      if (nextDate) {
        const updated = await updateAssetMaintenanceDates(asset.id, nextDate)
        if (updated) return NextResponse.json(updated, { status: 201 })
      }
    }

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating asset:", error)
    return NextResponse.json({ error: "Failed to create asset", details: String(error) }, { status: 500 })
  }
}
