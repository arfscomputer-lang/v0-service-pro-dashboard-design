import { NextRequest, NextResponse } from "next/server"
import { getAssets, getAssetsByCustomer, createAsset, getSessionByToken } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customer_id")

    // Get session to check user role and permissions
    let session = null
    if (token) {
      session = await getSessionByToken(token)
    }

    const userRole = session?.rows?.[0]?.role || "guest"
    const userCustomerId = session?.rows?.[0]?.customer_id

    let assets = []

    // Determine which assets to return based on role
    if (customerId) {
      // Specific customer requested
      if (userRole !== "admin" && userRole !== "supervisor") {
        // Regular users/clients can only see their own customer's assets
        if (customerId !== userCustomerId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
      }
      const result = await getAssetsByCustomer(customerId)
      assets = result.rows
    } else {
      // No customer filter specified
      if (userRole === "admin" || userRole === "supervisor") {
        // Admins/supervisors see all assets
        const result = await getAssets()
        assets = result.rows
      } else if (userRole === "cliente" && userCustomerId) {
        // Clients see only their own assets
        const result = await getAssetsByCustomer(userCustomerId)
        assets = result.rows
      } else {
        // No permission
        assets = []
      }
    }

    return NextResponse.json({ assets, total: assets.length })
  } catch (error) {
    console.error("[v0] Error fetching assets:", error)
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    const body = await req.json()

    // Validate required fields
    if (!body.asset_id || !body.name || !body.serial_number || !body.customer_id || !body.type || !body.category) {
      return NextResponse.json(
        { error: "asset_id, name, serial_number, customer_id, type, and category are required" },
        { status: 400 }
      )
    }

    // Get session to verify permissions
    let session = null
    if (token) {
      session = await getSessionByToken(token)
    }

    const userRole = session?.rows?.[0]?.role || "guest"
    const userCustomerId = session?.rows?.[0]?.customer_id

    // Authorization: only admin/supervisor can create for any customer
    // Regular users can only create for their own customer
    if (userRole !== "admin" && userRole !== "supervisor") {
      if (body.customer_id !== userCustomerId) {
        return NextResponse.json({ error: "Unauthorized - cannot create asset for other customers" }, { status: 403 })
      }
    }

    const result = await createAsset({
      asset_id: body.asset_id,
      name: body.name,
      description: body.description,
      brand: body.brand,
      model: body.model,
      serial_number: body.serial_number,
      year_manufactured: body.year_manufactured,
      type: body.type,
      category: body.category,
      status: body.status || "active",
      criticality: body.criticality || "medium",
      customer_id: body.customer_id,
      site_location: body.site_location,
      capacity: body.capacity,
      has_maintenance_plan: body.has_maintenance_plan || false,
      recurrence_type: body.recurrence_type,
      interval_months: body.interval_months,
      interval_hours: body.interval_hours,
      interval_cycles: body.interval_cycles,
      hours_threshold_alert: body.hours_threshold_alert,
    })

    if (!result.rows || !result.rows[0]) {
      return NextResponse.json({ error: "Failed to create asset" }, { status: 500 })
    }

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating asset:", error)
    return NextResponse.json({ error: "Failed to create asset", details: String(error) }, { status: 500 })
  }
}
