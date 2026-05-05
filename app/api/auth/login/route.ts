import { NextRequest, NextResponse } from 'next/server'
import { getOne, createSession, query } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Get user from database
    const user = await getOne<any>(
      'SELECT id, email, name, password_hash, role, customer_id, status FROM users WHERE email = $1',
      [email]
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (user.status !== 'activo') {
      return NextResponse.json(
        { error: 'User account is not active' },
        { status: 401 }
      )
    }

    // Compare passwords
    const passwordValid = await bcrypt.compare(password, user.password_hash)

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Create session in database
    const token = crypto.randomBytes(32).toString('hex')
    const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    
    await createSession({
      user_id: user.id,
      token,
      expires_at,
    })

    let technicianId: string | null = null
    if (user.role === 'tecnico') {
      const tech = await getOne<{ id: string }>(
        'SELECT id FROM technicians WHERE email = $1 LIMIT 1',
        [user.email]
      )
      technicianId = tech?.id ?? null
    }

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerId: user.customer_id,
        technicianId,
        initials: user.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      },
    })
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
