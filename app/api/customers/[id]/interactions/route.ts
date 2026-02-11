import { NextResponse } from "next/server"
import { customerSeed } from "@/lib/data/customers"

// POST /api/customers/:id/interactions — Add interaction
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = customerSeed.find((c) => c.id === id)
  if (!customer) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 })
  }

  try {
    const body = await req.json()
    const { type, direction, summary, agent } = body

    if (!type || !summary) {
      return NextResponse.json({ error: "type and summary are required" }, { status: 400 })
    }

    const interaction = {
      id: `int-${Date.now()}`,
      type,
      direction: direction ?? "saliente",
      date: new Date().toISOString().slice(0, 10),
      summary,
      agent: agent ?? "Sistema",
    }

    return NextResponse.json({ interaction }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}
