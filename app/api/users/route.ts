import { NextResponse } from "next/server"
import { listUsers, createUser } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    const users = await listUsers(role || undefined)

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[v0] Get users error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { email, password, name, role, customer_id } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Hash password with bcryptjs (12 salt rounds)
    const hashed = await bcrypt.hash(password, 12)

    // Create user with hashed password
    const user = await createUser({
      email,
      password_hash: hashed,
      name,
      role,
      customer_id,
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Create user error:", error)

    if (error.message?.includes("duplicate")) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
