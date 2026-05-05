"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { MobileHeader } from "@/components/technician/mobile-header"
import { DaySummary } from "@/components/technician/day-summary"
import { AgendaCard, type AgendaJob, type JobStatus } from "@/components/technician/agenda-card"
import { BottomTabs } from "@/components/technician/bottom-tabs"
import { CalendarDays, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"
import { authenticatedFetch } from "@/lib/authenticated-fetch"

function mapOrderToJob(order: any): AgendaJob {
  const priorityMap: Record<string, "alta" | "media" | "baja"> = {
    urgente: "alta", alta: "alta", normal: "media", baja: "baja",
  }
  const statusMap: Record<string, JobStatus> = {
    pendiente: "pendiente", asignada: "pendiente",
    en_ruta: "en_viaje", en_sitio: "en_sitio", completada: "completado", cancelada: "completado",
  }
  return {
    id: order.id,
    orderId: order.order_id || order.orderId || "",
    customer: order.customer_name || order.customerId || "Cliente",
    phone: order.customer_phone || "",
    address: order.address || "",
    type: order.type || "",
    priority: priorityMap[order.priority] ?? "media",
    scheduledTime: order.scheduled_time || order.scheduledTime || "08:00",
    estimatedDuration: "2h",
    notes: order.description || "",
    status: statusMap[order.status] ?? "pendiente",
    technicianStartedAt: order.technicianStartedAt || order.technician_started_at || null,
    technicianCompletedAt: order.technicianCompletedAt || order.technician_completed_at || null,
    technicianNotes: order.technicianNotes || order.technician_notes || null,
  }
}

export default function TechnicianAgendaPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<AgendaJob[]>([])
  const [loading, setLoading] = useState(true)
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
    )
  }, [])

  const loadJobs = useCallback(async () => {
    if (!user?.technicianId) return
    try {
      const res = await authenticatedFetch("/api/work-orders")
      if (!res.ok) throw new Error()
      const json = await res.json()
      const all: any[] = json.data || json.workOrders || []
      const mine = all.filter((o) => o.technician_id === user.technicianId || o.technicianId === user.technicianId)
      setJobs(mine.map(mapOrderToJob))
    } catch {
      setJobs([])
    }
  }, [user?.technicianId])

  useEffect(() => {
    if (!user?.technicianId) { setLoading(false); return }
    loadJobs().finally(() => setLoading(false))
  }, [user?.technicianId, loadJobs])

  const handleAction = useCallback(
    (_jobId: string, _action: "start_travel" | "check_in" | "complete") => {
      // Re-fetch from DB so status + timestamps are in sync
      loadJobs()
    },
    [loadJobs]
  )

  const activeJobId = useMemo(() => {
    const active = jobs.find((j) => j.status === "en_viaje" || j.status === "en_sitio")
    if (active) return active.id
    return jobs.find((j) => j.status === "pendiente")?.id ?? null
  }, [jobs])

  const completedCount = jobs.filter((j) => j.status === "completado").length
  const pendingHours = jobs
    .filter((j) => j.status !== "completado")
    .reduce((sum, j) => sum + (parseFloat(j.estimatedDuration) || 0), 0)

  const nextJob = jobs.find((j) => j.status !== "completado")
  const upcomingJobs = jobs.filter((j) => j.status !== "completado")
  const completedJobs = jobs.filter((j) => j.status === "completado")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader />

      <div className="flex items-center justify-between px-4 pt-4">
        <div>
          <h1 className="text-lg font-bold text-foreground">Agenda de Hoy</h1>
          <p className="text-sm text-muted-foreground capitalize">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-primary">{jobs.length} trabajos</span>
        </div>
      </div>

      <DaySummary
        totalJobs={jobs.length}
        completed={completedCount}
        pendingHours={pendingHours}
        nextAddress={nextJob?.address ?? ""}
      />

      <div className="flex-1 px-4 py-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Cargando órdenes...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-center">
            <CalendarDays className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">No tenés órdenes asignadas hoy</p>
            <p className="text-xs mt-1 opacity-60">Las órdenes asignadas aparecerán aquí</p>
          </div>
        ) : (
          <>
            {upcomingJobs.length > 0 && (
              <div className="mb-4">
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Próximos Trabajos ({upcomingJobs.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {upcomingJobs.map((job) => (
                    <AgendaCard key={job.id} job={job} onAction={handleAction} isActive={job.id === activeJobId} />
                  ))}
                </div>
              </div>
            )}
            {completedJobs.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Completados ({completedJobs.length})
                </h2>
                <div className="flex flex-col gap-3">
                  {completedJobs.map((job) => (
                    <AgendaCard key={job.id} job={job} onAction={handleAction} isActive={false} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomTabs />
    </div>
  )
}
