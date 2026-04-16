import { NextRequest, NextResponse } from "next/server"
import { getAssetById, updateAsset, deleteAsset, getSessionByToken } from "@/lib/db"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    const asset = await getAssetById(params.id)

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Check authorization
    let session = null
    if (token) {
      session = await getSessionByToken(token)
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.role
    const userCustomerId = session.customer_id

    // Users can only see their own customer's assets (unless admin/supervisor)
    if (userRole !== "admin" && userRole !== "supervisor") {
      if (asset.customer_id !== userCustomerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    return NextResponse.json(asset)
  } catch (error) {
    console.error("[v0] Error fetching asset:", error)
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    const body = await req.json()

    const asset = await getAssetById(params.id)
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Check authorization
    let session = null
    if (token) {
      session = await getSessionByToken(token)
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.role
    const userCustomerId = session.customer_id

    // Users can only update their own customer's assets
    if (userRole !== "admin" && userRole !== "supervisor") {
      if (asset.customer_id !== userCustomerId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    const updated = await updateAsset(params.id, body)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("[v0] Error updating asset:", error)
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")

    const asset = await getAssetById(params.id)
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 })
    }

    // Check authorization
    let session = null
    if (token) {
      session = await getSessionByToken(token)
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.role

    // Only admin/supervisor can delete
    if (userRole !== "admin" && userRole !== "supervisor") {
      return NextResponse.json({ error: "Unauthorized - only admins can delete assets" }, { status: 403 })
    }

    await deleteAsset(params.id)
    return NextResponse.json({ message: "Asset deleted" })
  } catch (error) {
    console.error("[v0] Error deleting asset:", error)
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 })
  }
}
