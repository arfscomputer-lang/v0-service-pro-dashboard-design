"use client"

import { useState, useCallback } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DispatchCalendar } from "@/components/dashboard/dispatch-calendar"
import { useWorkOrders } from "@/lib/context/work-orders-context"

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function DespachoPage() {
  const [date, setDate] = useState(() => startOfDay(new Date()))
  const [refreshKey, setRefreshKey] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const { refetch } = useWorkOrders()

  const addDays = (n: number) =>
    setDate((prev) => {
      const next = new Date(prev)
      next.setDate(next.getDate() + n)
      return next
    })

  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      await refetch()
    } finally {
      setRefreshing(false)
      setRefreshKey((k) => k + 1)
    }
  }, [refetch])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />

        <main className="flex flex-1 flex-col overflow-hidden p-4 gap-3 bg-content">
          <DashboardHeader
            date={date}
            onPrevDay={() => addDays(-1)}
            onNextDay={() => addDays(1)}
            onToday={() => setDate(startOfDay(new Date()))}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

          <div className="flex-1 min-h-0">
            <DispatchCalendar date={date} key={refreshKey} />
          </div>
        </main>
      </div>
    </div>
  )
}
