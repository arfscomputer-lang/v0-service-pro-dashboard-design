import { NextRequest, NextResponse } from "next/server"
import { getAssetById, updateAsset, deleteAsset } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const asset = await getAssetById(params.id)
    
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error("[v0] Error fetching asset:", error)
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json()

    // Get current asset to verify existence
    const asset = await getAssetById(params.id)
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    const updated = await updateAsset(params.id, body)
    if (!updated) {
      return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[v0] Error updating asset:", error)
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const asset = await getAssetById(params.id)
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    await deleteAsset(params.id)
    return NextResponse.json({ message: "Asset deleted" })
  } catch (error) {
    console.error("[v0] Error deleting asset:", error)
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
  }
}

