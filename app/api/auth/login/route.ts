import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Get user from database
    const result = await sql`
      SELECT id, email, password_hash, name, role, status FROM users WHERE email = ${email}
    `

    const user = result.rows[0]

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Check password (using bcryptjs for client-side hashing in demo; in production use argon2)
    const passwordMatch = await bcrypt.compare(password, user.password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    if (user.status !== "activo") {
      return NextResponse.json(
        { error: "User account is inactive" },
        { status: 403 }
      )
    }

    // Return user data (in production, use JWT tokens)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
