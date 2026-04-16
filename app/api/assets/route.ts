import { NextRequest, NextResponse } from "next/server"
import { getAssets, getAssetsByCustomer, createAsset } from "@/lib/db"

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
        { error: "asset_id, name, serial_number, customer_id, type, and category are required" },
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
      status: body.status || 'active',
      criticality: body.criticality || 'medium',
      description: body.description,
      brand: body.brand,
      model: body.model,
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

    return NextResponse.json(asset, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating asset:", error)
    return NextResponse.json({ error: "Failed to create asset", details: String(error) }, { status: 500 })
  }
}
