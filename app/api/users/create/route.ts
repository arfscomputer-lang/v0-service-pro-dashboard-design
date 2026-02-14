import { NextRequest, NextResponse } from 'next/server'
import * as bcrypt from 'bcryptjs'
import { createUser, getUserByEmail } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, name, role, customer_id } = body

    // Validation
    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, name, role' },
        { status: 400 }
      )
    }

    const validRoles = ['admin', 'supervisor', 'tecnico', 'cliente']
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario con este email ya existe' },
        { status: 409 }
      )
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    // Create user
    const newUser = await createUser({
      email,
      password_hash,
      name,
      role: role as 'admin' | 'supervisor' | 'tecnico' | 'cliente',
      customer_id: customer_id || undefined,
    })

    console.log('[v0] User created:', newUser.id)

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
    return NextResponse.json(
      { error: 'Error al crear el usuario' },
      { status: 500 }
    )
  }
}
