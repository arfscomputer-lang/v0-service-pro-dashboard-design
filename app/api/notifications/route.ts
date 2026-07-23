import { NextRequest, NextResponse } from 'next/server'
import { listNotifications, countUnreadNotifications, markAllNotificationsRead } from '@/lib/db'

export async function GET(req: NextRequest) {
  const unread = req.nextUrl.searchParams.get('unread') === 'true'
  const countOnly = req.nextUrl.searchParams.get('count') === 'true'
  const customerId = req.nextUrl.searchParams.get('customer_id') || undefined

  if (countOnly) {
    const count = await countUnreadNotifications(customerId)
    return NextResponse.json({ count })
  }

  const notifications = await listNotifications(unread, customerId)
  return NextResponse.json({ notifications })
}

export async function PATCH(req: NextRequest) {
  const customerId = req.nextUrl.searchParams.get('customer_id') || undefined
  await markAllNotificationsRead(customerId)
  return NextResponse.json({ ok: true })
}
