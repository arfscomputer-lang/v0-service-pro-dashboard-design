import { NextResponse } from "next/server"
import { customerSeed } from "@/lib/data/customers"

// GET /api/customers — List all customers (optionally filter by type, tag, search)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const type = searchParams.get("type")
  const tag = searchParams.get("tag")
  const q = searchParams.get("q")?.toLowerCase()

  let list = [...customerSeed]

  if (type) list = list.filter((c) => c.type === type)
  if (tag) list = list.filter((c) => c.tags.includes(tag as never))
  if (q) {
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    )
  }

  return NextResponse.json({ customers: list, total: list.length })
}

// POST /api/customers — Create a new customer
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, address, city, type } = body

    if (!name || !email) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 })
    }

    // In a real app, save to DB. For now, return the created customer shape.
    const newCustomer = {
      id: `cli-${Date.now()}`,
      name,
      initials: name
        .split(" ")
        .filter(Boolean)
        .map((w: string) => w[0]?.toUpperCase() ?? "")
        .slice(0, 2)
        .join(""),
      email,
      phone: phone ?? "",
      address: address ?? "",
      city: city ?? "CDMX",
      type: type ?? "residencial",
      tags: ["nuevo"],
      nps: null,
      preferredSchedule: "",
      notes: "",
      createdAt: new Date().toISOString().slice(0, 10),
      interactions: [],
      services: [],
      totalSpent: 0,
      lifetimeValue: 0,
    }

    return NextResponse.json({ customer: newCustomer }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }
}
