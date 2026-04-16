import { NextRequest, NextResponse } from "next/server"
import { getMaintenanceHistoryByAsset } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ asset_id: string }> }
) {
  try {
    const { asset_id } = await params

    if (!asset_id) {
      return NextResponse.json({ error: "asset_id is required" }, { status: 400 })
    }

    const history = await getMaintenanceHistoryByAsset(asset_id)

    return NextResponse.json({ history })
  } catch (error) {
    console.error("[v0] Error fetching maintenance history:", error)
    return NextResponse.json(
      { error: "Failed to fetch maintenance history", details: String(error) },
      { status: 500 }
    )
  }
}
