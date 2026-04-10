import { NextRequest, NextResponse } from 'next/server'
import { getSessionByToken, deleteSession } from '@/lib/db'
import crypto from 'crypto'

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

    const session = await getSessionByToken(token)
    
    if (!session || !session.rows || session.rows.length === 0) {
      return NextResponse.json({
        success: true,
        user: null,
      })
    }

    const sessionData = session.rows[0]
    return NextResponse.json({
      success: true,
      user: {
        id: sessionData.user_id || sessionData.id,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role,
        status: sessionData.status,
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
