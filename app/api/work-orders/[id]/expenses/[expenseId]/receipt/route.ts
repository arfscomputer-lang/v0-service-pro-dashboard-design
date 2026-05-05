import { NextRequest, NextResponse } from "next/server"
import { getMany } from "@/lib/db"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id, expenseId } = await params
    const rows = await getMany<any>(
      `SELECT receipt_data, receipt_name, receipt_type
       FROM work_order_expenses WHERE id = $1 AND work_order_id = $2`,
      [expenseId, id]
    )
    if (!rows.length || !rows[0].receipt_data) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 })
    }

    const { receipt_data, receipt_name, receipt_type } = rows[0]
    // Strip data URI prefix if present
    const base64 = receipt_data.includes(",") ? receipt_data.split(",")[1] : receipt_data
    const buffer = Buffer.from(base64, "base64")
    const mimeType = receipt_type || "application/octet-stream"

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${receipt_name || "comprobante"}"`,
        "Content-Length": String(buffer.length),
      },
    })
  } catch (error) {
    console.error("[v0] Receipt GET error:", error)
    return NextResponse.json({ error: "Failed to fetch receipt" }, { status: 500 })
  }
}
