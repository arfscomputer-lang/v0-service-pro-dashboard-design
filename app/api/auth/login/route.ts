import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { getUserByEmail } from "@/lib/db"

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
    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, (user as any).password_hash)

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      )
    }

    // Return user data
    return NextResponse.json({
      user: {
        id: (user as any).id,
        email: (user as any).email,
        name: (user as any).name,
        role: (user as any).role,
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
