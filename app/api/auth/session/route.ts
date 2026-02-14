import { NextRequest, NextResponse } from 'next/server'
import { getSessionByToken, deleteSession } from '@/lib/db'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        { error: 'No session token provided' },
        { status: 401 }
      )
    }

    const session = await getSessionByToken(token)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: session.id,
        email: session.email,
        name: session.name,
        role: session.role,
        status: session.status,
      },
    })
  } catch (error) {
    console.error('[v0] Error validating session:', error)
    return NextResponse.json(
      { error: 'Error validating session' },
      { status: 500 }
    )
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
