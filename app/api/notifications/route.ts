import { NextRequest, NextResponse } from 'next/server'
import {
  listNotifications,
  countUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  listUserNotifications,
  markUserNotificationsRead,
} from '@/lib/db'

export async function GET(req: NextRequest) {
  // Technician per-user notifications (components/technician/mobile-header.tsx)
  const userId = req.nextUrl.searchParams.get('user_id')
  if (userId) {
    const rows = await listUserNotifications(userId)
    const unread = rows.filter((r: any) => !r.read_at).length
    return NextResponse.json({ data: rows, unread })
  }

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
  const body = await req.json().catch(() => ({} as Record<string, unknown>))

  if (body.id) {
    await markNotificationRead(String(body.id))
    return NextResponse.json({ success: true })
  }
  if (body.user_id) {
    await markUserNotificationsRead(String(body.user_id))
    return NextResponse.json({ success: true })
  }

  const customerId = req.nextUrl.searchParams.get('customer_id') || undefined
  await markAllNotificationsRead(customerId)
  return NextResponse.json({ ok: true })
}
