import { sql } from "@vercel/postgres"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    let result
    if (role) {
      result = await sql`
        SELECT id, email, name, role, status, created_at FROM users 
        WHERE role = ${role} ORDER BY created_at DESC
      `
    } else {
      result = await sql`
        SELECT id, email, name, role, status, created_at FROM users 
        ORDER BY created_at DESC
      `
    }

    return NextResponse.json({ users: result.rows })
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

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Create user
    const result = await sql`
      INSERT INTO users (email, password_hash, name, role, customer_id, status)
      VALUES (${email}, ${passwordHash}, ${name}, ${role}, ${customer_id || null}, 'activo')
      RETURNING id, email, name, role, status
    `

    return NextResponse.json({ user: result.rows[0] }, { status: 201 })
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
