import { NextRequest, NextResponse } from "next/server"
import { completeMaintenanceExecution } from "@/lib/db"
import { calculateNextMaintenanceDate, AssetMaintenanceInfo } from "@/lib/maintenance"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      asset_id,            // e.g. "AC-001"
      asset_internal_id,   // UUID from assets.id
      customer_id,
      asset_name,
      completed_date,
      technician_name,
      notes,
      was_overdue,
      recurrence_type,
      interval_months,
    } = body

    if (!asset_id || !asset_internal_id || !customer_id || !completed_date) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: asset_id, asset_internal_id, customer_id, completed_date" },
        { status: 400 }
      )
    }

    // Calculate next maintenance date based on the completed execution
    const assetInfo: AssetMaintenanceInfo = {
      id: asset_internal_id,
      asset_id,
      name: asset_name,
      customer_id,
      has_maintenance_plan: true,
      recurrence_type,
      interval_months,
      last_maintenance_date: completed_date,
      next_maintenance_date: null,
      created_at: new Date().toISOString(),
    }

    const nextDate = calculateNextMaintenanceDate(assetInfo)

    const result = await completeMaintenanceExecution({
      asset_id,
      asset_internal_id,
      customer_id,
      asset_name,
      completed_date: new Date(completed_date),
      technician_name: technician_name || "Sin asignar",
      notes: notes || "",
      was_overdue: was_overdue || false,
      next_maintenance_date: nextDate,
    })

    return NextResponse.json({
      success: true,
      work_order: result,
      next_maintenance_date: nextDate?.toISOString() ?? null,
    })
  } catch (error) {
    console.error("[v0] Error completing maintenance execution:", error)
    return NextResponse.json(
      { error: "Failed to complete maintenance", details: String(error) },
      { status: 500 }
    )
  }
}
