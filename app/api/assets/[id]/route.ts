import { NextRequest, NextResponse } from "next/server"
import { getAssetById, updateAsset, deleteAsset, updateAssetMaintenanceDates } from "@/lib/db"
import { calculateNextMaintenanceDate, AssetMaintenanceInfo } from "@/lib/maintenance"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const asset = await getAssetById(id)
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }
    return NextResponse.json(asset)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    console.log("[v0] PUT /api/assets/[id] - id:", id)

    const asset = await getAssetById(id)
    console.log("[v0] getAssetById result:", asset ? "found" : "NOT FOUND")
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    const updated = await updateAsset(id, body)
    console.log("[v0] updateAsset result:", updated ? "updated" : "FAILED")
    if (!updated) {
      return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
    }

    // Recalculate next_maintenance_date if plan changed
    if (updated.has_maintenance_plan) {
      const nextDate = calculateNextMaintenanceDate(updated as AssetMaintenanceInfo)
      if (nextDate) {
        const withDates = await updateAssetMaintenanceDates(updated.id, nextDate)
        if (withDates) return NextResponse.json(withDates)
      }
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const asset = await getAssetById(id)
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    await deleteAsset(id)
    return NextResponse.json({ message: "Asset deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
  }
}
