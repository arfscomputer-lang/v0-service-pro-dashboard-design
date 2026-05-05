"use client"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/technician/mobile-header"
import { BottomTabs } from "@/components/technician/bottom-tabs"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, CheckCircle2, Clock, MapPin, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"
import { authenticatedFetch } from "@/lib/authenticated-fetch"
import { cn } from "@/lib/utils"

export default function HistorialPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.technicianId) { setLoading(false); return }
    authenticatedFetch("/api/work-orders")
      .then((r) => r.json())
      .then((json) => {
        const all: any[] = json.data || json.workOrders || []
        setOrders(
          all.filter((o) =>
            (o.technician_id === user.technicianId || o.technicianId === user.technicianId) &&
            (o.status === "completada" || o.status === "cancelada")
          )
        )
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [user?.technicianId])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader />

      <div className="px-4 pt-4 pb-2">
        <h1 className="text-lg font-bold text-foreground">Historial de Trabajos</h1>
        <p className="text-sm text-muted-foreground">{orders.length} órdenes completadas</p>
      </div>

      <div className="flex-1 px-4 pb-24 space-y-3 mt-3">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Cargando historial...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
            <ClipboardList className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">Sin historial todavía</p>
          </div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="font-mono text-xs text-muted-foreground">{o.order_id || o.orderId}</span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{o.type}</p>
                </div>
                <Badge variant="outline" className={cn("text-[10px] shrink-0",
                  o.status === "completada" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                    : "bg-muted text-muted-foreground")}>
                  {o.status === "completada" ? "Completada" : "Cancelada"}
                </Badge>
              </div>
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3 shrink-0" />{o.address}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3 shrink-0" />
                  {o.scheduled_date || o.scheduledDate}
                </div>
              </div>
              {o.description && (
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{o.description}</p>
              )}
            </div>
          ))
        )}
      </div>

      <BottomTabs />
    </div>
  )
}
