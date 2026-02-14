import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createUser, getUserByEmail } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("[v0] Create user request body:", body)
    const { email, password, name, role, customer_id } = body

    // Validation
    if (!email || !password || !name || !role) {
      console.error("[v0] Missing fields:", { email: !!email, password: !!password, name: !!name, role: !!role })
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name, role' },
        { status: 400 }
      )
    }

    const validRoles = ['admin', 'supervisor', 'tecnico', 'cliente']
    if (!validRoles.includes(role)) {
      console.error("[v0] Invalid role:", role)
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if user already exists
    console.log("[v0] Checking if user exists:", email)
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      console.error("[v0] User already exists:", email)
      return NextResponse.json(
        { error: 'El usuario con este email ya existe' },
        { status: 409 }
      )
    }

    // Hash password
    console.log("[v0] Hashing password...")
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    // Create user
    console.log("[v0] Creating user in database...")
    const newUser = await createUser({
      email,
      password_hash,
      name,
      role: role as 'admin' | 'supervisor' | 'tecnico' | 'cliente',
      customer_id: customer_id || undefined,
    })

    console.log('[v0] User created successfully:', newUser.id)

    // Return user without password_hash
    const { password_hash: _, ...userWithoutPassword } = newUser
    return NextResponse.json(
      {
        success: true,
        user: userWithoutPassword,
        message: 'Usuario creado exitosamente',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[v0] Error creating user:', error)
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
    console.error('[v0] Error details:', errorMessage)
    return NextResponse.json(
      { error: `Error al crear el usuario: ${errorMessage}` },
      { status: 500 }
    )
  }
}
