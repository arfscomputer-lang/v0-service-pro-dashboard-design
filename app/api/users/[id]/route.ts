import { NextResponse } from "next/server"
import { getUserById, query } from "@/lib/db"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getUserById(id)

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { name, status } = await request.json()

    const result = await query(
      `UPDATE users SET name = COALESCE($1, name), status = COALESCE($2, status) WHERE id = $3 RETURNING *`,
      [name, status, id]
    )

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
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await query(`DELETE FROM users WHERE id = $1`, [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete user error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
