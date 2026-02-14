"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { MobileHeader } from "@/components/technician/mobile-header"
import { DaySummary } from "@/components/technician/day-summary"
import { AgendaCard, type AgendaJob, type JobStatus } from "@/components/technician/agenda-card"
import { BottomTabs } from "@/components/technician/bottom-tabs"
import { CalendarDays } from "lucide-react"

const initialJobs: AgendaJob[] = []

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

  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    setFormattedDate(
      new Date().toLocaleDateString("es-MX", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    )
  }, [])

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
