import { NextRequest, NextResponse } from 'next/server'
import { listNotifications, countUnreadNotifications, markAllNotificationsRead } from '@/lib/db'

export async function GET(req: NextRequest) {
  const unread = req.nextUrl.searchParams.get('unread') === 'true'
  const countOnly = req.nextUrl.searchParams.get('count') === 'true'

  if (countOnly) {
    const count = await countUnreadNotifications()
    return NextResponse.json({ count })
  }

  const notifications = await listNotifications(unread)
  return NextResponse.json({ notifications })
}

export async function PATCH() {
  await markAllNotificationsRead()
  return NextResponse.json({ ok: true })
}
