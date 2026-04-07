import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const result = await query(
      `SELECT id, name, email, role, status, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`,
      []
    )

    console.log('[v0] Users fetched:', result.rows.length)

    return NextResponse.json({
      data: result.rows,
      count: result.rows.length,
    })
  } catch (error) {
    console.error('[v0] Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
