'use client'

import useSWR from 'swr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const statusColors: Record<string, { bg: string; text: string }> = {
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  en_ruta: { bg: 'bg-blue-100', text: 'text-blue-800' },
  en_sitio: { bg: 'bg-purple-100', text: 'text-purple-800' },
  completada: { bg: 'bg-green-100', text: 'text-green-800' },
  cancelada: { bg: 'bg-red-100', text: 'text-red-800' },
}

const priorityColors: Record<string, string> = {
  baja: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  alta: 'bg-red-100 text-red-800',
}

export function RecentOrders() {
  const { data, isLoading } = useSWR('/api/dashboard/metrics', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  })

  return (
    <Card className="border border-border col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Órdenes Recientes</CardTitle>
        <CardDescription>Últimas 5 órdenes de trabajo</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {isLoading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </>
          ) : data?.recentOrders && data.recentOrders.length > 0 ? (
            data.recentOrders.map((order: any) => (
              <Link key={order.id} href={`/ordenes/${order.id}`}>
                <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">{order.order_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('es-MX')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${
                        priorityColors[order.priority] ||
                        priorityColors['normal']
                      }`}
                    >
                      {order.priority}
                    </Badge>
                    <Badge
                      className={`${
                        statusColors[order.status]?.bg ||
                        statusColors['pendiente'].bg
                      } ${
                        statusColors[order.status]?.text ||
                        statusColors['pendiente'].text
                      }`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay órdenes recientes
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
