import { NextRequest, NextResponse } from 'next/server'
import { getSessionByToken, deleteSession, getOne } from '@/lib/db'

interface SessionRow {
  id: string
  email: string
  name: string
  role: string
  status: string
  customer_id: string | null
  [key: string]: unknown
}

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      // No token provided - return null session (user not logged in)
      return NextResponse.json({
        success: true,
        user: null,
      })
    }

    const sessionData = await getSessionByToken(token) as SessionRow | null

    if (!sessionData) {
      return NextResponse.json({
        success: true,
        user: null,
      })
    }

    let technicianId: string | null = null
    if (sessionData.role === 'tecnico') {
      const tech = await getOne<{ id: string }>(
        'SELECT id FROM technicians WHERE email = $1 LIMIT 1',
        [sessionData.email]
      )
      technicianId = tech?.id ?? null
    }

    return NextResponse.json({
      success: true,
      user: {
        id: sessionData.user_id || sessionData.id,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role,
        status: sessionData.status,
        customerId: sessionData.customer_id ?? null,
        technicianId,
      },
    })
  } catch (error) {
    console.error('[v0] Error validating session:', error)
    return NextResponse.json({
      success: true,
      user: null,
    })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 400 }
      )
    }

    await deleteSession(token)
    
    return NextResponse.json({
      success: true,
      message: 'Session deleted',
    })
  } catch (error) {
    console.error('[v0] Error deleting session:', error)
    return NextResponse.json(
      { error: 'Error deleting session' },
      { status: 500 }
    )
  }
}
