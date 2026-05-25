import { NextRequest, NextResponse } from 'next/server'
import { markNotificationRead } from '@/lib/db'

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await markNotificationRead(id)
  return NextResponse.json({ ok: true })
}
