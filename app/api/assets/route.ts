import { NextRequest, NextResponse } from "next/server"
import { getAssets, getAssetsByCustomer, createAsset } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const customerId = searchParams.get("customer_id")

    let assets

    if (customerId) {
      // Get assets for specific customer
      assets = await getAssetsByCustomer(customerId)
    } else {
      // Get all assets (admin/supervisor will see all, clients should request their own)
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

    // Validate required fields
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

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.role
    const userCustomerId = session.customer_id

    let assets

    if (customerId) {
      // Specific customer requested
      if (userRole !== "admin" && userRole !== "supervisor") {
        // Regular users can only see their own customer's assets
        if (customerId !== userCustomerId) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
        }
      }
      assets = await getAssetsByCustomer(customerId)
    } else {
      // No customer filter
      if (userRole === "admin" || userRole === "supervisor") {
        // Admins/supervisors see all assets
        assets = await getAssets()
      } else if (userRole === "cliente" && userCustomerId) {
        // Clients see only their own assets
        assets = await getAssetsByCustomer(userCustomerId)
      } else {
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

    // Get session
    let session = null
    if (token) {
      session = await getSessionByToken(token)
    }

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate required fields
    if (!body.asset_id || !body.name || !body.serial_number || !body.customer_id || !body.type || !body.category) {
      return NextResponse.json(
        { error: "asset_id, name, serial_number, customer_id, type, and category are required" },
        { status: 400 }
      )
    }

    const userRole = session.role
    const userCustomerId = session.customer_id

    // Authorization: only admin/supervisor can create for any customer
    // Regular users can only create for their own customer
    if (userRole !== "admin" && userRole !== "supervisor") {
      if (body.customer_id !== userCustomerId) {
        return NextResponse.json(
          { error: "Unauthorized - cannot create asset for other customers" },
          { status: 403 }
        )
      }
    }

    const newAsset = await createAsset({
      asset_id: body.asset_id,
      name: body.name,
      customer_id: body.customer_id,
      type: body.type,
      category: body.category,
      serial_number: body.serial_number,
      status: body.status,
      criticality: body.criticality,
      description: body.description,
      brand: body.brand,
      model: body.model,
      year_manufactured: body.year_manufactured,
      site_location: body.site_location,
      capacity: body.capacity,
      has_maintenance_plan: body.has_maintenance_plan,
      recurrence_type: body.recurrence_type,
      interval_months: body.interval_months,
      interval_hours: body.interval_hours,
      interval_cycles: body.interval_cycles,
      hours_threshold_alert: body.hours_threshold_alert,
    })

    return NextResponse.json(newAsset, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating asset:", error)
    return NextResponse.json({ error: "Failed to create asset", details: String(error) }, { status: 500 })
  }
}
