import { NextResponse } from 'next/server'
import { getNextWorkOrderId } from '@/lib/db'

export async function GET() {
  try {
    const nextId = await getNextWorkOrderId()
    return NextResponse.json({ nextId })
  } catch (error) {
    console.error('[v0] Error generating work order ID:', error)
    return NextResponse.json({ error: 'Failed to generate work order ID' }, { status: 500 })
  }
}
