'use client'

import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ClipboardList,
  Users,
  Package,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function DashboardMetrics() {
  const { data, isLoading, error } = useSWR('/api/dashboard/metrics', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  })

  const metrics = [
    {
      title: 'Órdenes Pendientes',
      value: data?.workOrders?.pending || 0,
      icon: ClipboardList,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'En Progreso',
      value: data?.workOrders?.in_progress || 0,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Técnicos Disponibles',
      value: data?.technicians?.available || 0,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Inventario Bajo',
      value: data?.inventory?.low_stock || 0,
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title} className="border border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <div className={`${metric.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{metric.value}</div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
