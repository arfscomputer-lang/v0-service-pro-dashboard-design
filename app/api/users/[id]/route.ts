import { sql } from "@vercel/postgres"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`
      SELECT id, email, name, role, status, created_at FROM users WHERE id = ${params.id}
    `

    const user = result.rows[0]

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, status } = await request.json()

    const result = await sql`
      UPDATE users
      SET name = COALESCE(${name}, name),
          status = COALESCE(${status}, status)
      WHERE id = ${params.id}
      RETURNING id, email, name, role, status
    `

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: result.rows[0] })
  } catch (error) {
    console.error("[v0] Update user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await sql`DELETE FROM users WHERE id = ${params.id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
