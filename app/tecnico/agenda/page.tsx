"use client"

import { useState, useCallback, useMemo } from "react"
import { MobileHeader } from "@/components/technician/mobile-header"
import { DaySummary } from "@/components/technician/day-summary"
import { AgendaCard, type AgendaJob, type JobStatus } from "@/components/technician/agenda-card"
import { BottomTabs } from "@/components/technician/bottom-tabs"
import { CalendarDays } from "lucide-react"

const initialJobs: AgendaJob[] = [
  {
    id: "job-1",
    orderId: "OT-1042",
    customer: "Empresa Alfa S.A.",
    phone: "+52 55 1234 5678",
    address: "Av. Reforma 450, Col. Centro, CDMX",
    type: "Reparacion HVAC - Unidad Central",
    priority: "alta",
    scheduledTime: "08:00",
    estimatedDuration: "2h",
    notes: "El cliente reporta fuga de refrigerante en la unidad del 3er piso. Llevar kit de deteccion de fugas.",
    status: "completado",
  },
  {
    id: "job-2",
    orderId: "OT-1045",
    customer: "Roberto Martinez",
    phone: "+52 55 9876 5432",
    address: "Calle 5 de Mayo 220, Col. Juarez, CDMX",
    type: "Mantenimiento Preventivo HVAC",
    priority: "media",
    scheduledTime: "10:30",
    estimatedDuration: "1.5h",
    notes: "Mantenimiento programado trimestral. Incluye limpieza de filtros y revision de gas.",
    status: "en_sitio",
  },
  {
    id: "job-3",
    orderId: "OT-1048",
    customer: "Maria Gonzalez",
    phone: "+52 55 5555 1234",
    address: "Av. Universidad 1200, Col. Del Valle, CDMX",
    type: "Inspeccion de Gas - Certificacion",
    priority: "alta",
    scheduledTime: "13:00",
    estimatedDuration: "1h",
    notes: "Inspeccion requerida para renovacion de certificado. Acceso por recepcion.",
    status: "pendiente",
  },
  {
    id: "job-4",
    orderId: "OT-1051",
    customer: "Fernando Lopez",
    phone: "+52 55 4321 8765",
    address: "Col. Roma Norte 78, Int. 4B, CDMX",
    type: "Reparacion Electrica",
    priority: "media",
    scheduledTime: "15:00",
    estimatedDuration: "2h",
    notes: "Cortocircuito intermitente en el panel principal. El cliente estara disponible a partir de las 14:30.",
    status: "pendiente",
  },
  {
    id: "job-5",
    orderId: "OT-1054",
    customer: "Diego Ramirez",
    phone: "+52 55 6789 0123",
    address: "Av. Chapultepec 560, Piso 2, CDMX",
    type: "Instalacion Panel Solar",
    priority: "baja",
    scheduledTime: "17:00",
    estimatedDuration: "1.5h",
    notes: "Primera fase de instalacion. Verificar que el material ya esta en sitio.",
    status: "pendiente",
  },
]

function getNextStatus(current: JobStatus): JobStatus {
  const flow: Record<string, JobStatus> = {
    pendiente: "en_viaje",
    en_viaje: "en_sitio",
    en_sitio: "completado",
  }
  return flow[current] || current
}

export default function TechnicianAgendaPage() {
  const [jobs, setJobs] = useState<AgendaJob[]>(initialJobs)

  const handleAction = useCallback(
    (jobId: string, _action: "start_travel" | "check_in" | "complete") => {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === jobId
            ? { ...job, status: getNextStatus(job.status) }
            : job
        )
      )
    },
    []
  )

  // Find the first non-completed job as the "active" one
  const activeJobId = useMemo(() => {
    const active = jobs.find(
      (j) => j.status === "en_viaje" || j.status === "en_sitio"
    )
    if (active) return active.id
    const nextPending = jobs.find((j) => j.status === "pendiente")
    return nextPending?.id ?? null
  }, [jobs])

  const completedCount = jobs.filter((j) => j.status === "completado").length
  const pendingHours = jobs
    .filter((j) => j.status !== "completado")
    .reduce((sum, j) => {
      const h = Number.parseFloat(j.estimatedDuration)
      return sum + (Number.isNaN(h) ? 0 : h)
    }, 0)

  const nextJob = jobs.find((j) => j.status !== "completado")

  // Separate into upcoming and completed
  const upcomingJobs = jobs.filter((j) => j.status !== "completado")
  const completedJobs = jobs.filter((j) => j.status === "completado")

  const today = new Date()
  const formattedDate = today.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader />

      {/* Date header */}
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

      {/* Job cards list */}
      <div className="flex-1 px-4 py-4 pb-24">
        {/* Upcoming / active */}
        {upcomingJobs.length > 0 && (
          <div className="mb-4">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Proximos Trabajos ({upcomingJobs.length})
            </h2>
            <div className="flex flex-col gap-3">
              {upcomingJobs.map((job) => (
                <AgendaCard
                  key={job.id}
                  job={job}
                  onAction={handleAction}
                  isActive={job.id === activeJobId}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completedJobs.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Completados ({completedJobs.length})
            </h2>
            <div className="flex flex-col gap-3">
              {completedJobs.map((job) => (
                <AgendaCard
                  key={job.id}
                  job={job}
                  onAction={handleAction}
                  isActive={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomTabs />
    </div>
  )
}
