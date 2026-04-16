import { NextRequest, NextResponse } from "next/server"
import { getAssets, createAsset } from "@/lib/db"

export async function GET() {
  try {
    const result = await getAssets()
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("[v0] Error fetching assets:", error)
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[v0] Creating asset with data:', body)
    
    const result = await createAsset({
      asset_id: body.asset_id,
      name: body.name,
      description: body.description,
      brand: body.brand,
      model: body.model,
      serial_number: body.serial_number,
      year_manufactured: body.year_manufactured,
      asset_type: body.asset_type,
      category: body.category,
      status: body.status || 'active',
      criticality: body.criticality || 'medium',
      customer_id: body.customer_id,
      location: body.location,
      capacity: body.capacity,
      has_maintenance_plan: body.has_maintenance_plan || false,
      recurrence_type: body.recurrence_type,
      recurrence_months: body.recurrence_months,
      recurrence_hours: body.recurrence_hours,
      recurrence_cycles: body.recurrence_cycles,
      hours_threshold: body.hours_threshold,
      estimated_service_time: body.estimated_service_time,
    })

    console.log('[v0] Asset created result:', result)
    
    if (!result.rows || !result.rows[0]) {
      console.error('[v0] No rows returned from create asset')
      return NextResponse.json({ error: "Failed to create asset - no rows returned" }, { status: 500 })
    }

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating asset:", error)
    return NextResponse.json({ error: "Failed to create asset", details: String(error) }, { status: 500 })
  }
}
