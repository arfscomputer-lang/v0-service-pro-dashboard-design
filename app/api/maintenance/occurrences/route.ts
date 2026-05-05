import { NextRequest, NextResponse } from "next/server"
import { getMaintenanceOccurrences } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const asset_id = searchParams.get("asset_id") ?? undefined
    const customer_id = searchParams.get("customer_id") ?? undefined
    const status = searchParams.get("status") ?? undefined
    const from = searchParams.get("from") ?? undefined
    const to = searchParams.get("to") ?? undefined

    const occurrences = await getMaintenanceOccurrences({ asset_id, customer_id, status, from, to })

    return NextResponse.json({ occurrences, total: occurrences.length })
  } catch (error) {
    console.error("[v0] Error fetching maintenance occurrences:", error)
    return NextResponse.json({ error: "Failed to fetch occurrences", details: String(error) }, { status: 500 })
  }
}
