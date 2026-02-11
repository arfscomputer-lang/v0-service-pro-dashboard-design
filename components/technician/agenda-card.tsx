"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Navigation,
  LogIn,
  CheckCircle2,
  Clock,
  MapPin,
  Wrench,
  Phone,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Camera,
  ImagePlus,
  Timer,
  Play,
  Square,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type JobStatus = "pendiente" | "en_viaje" | "en_sitio" | "completado"

export interface AgendaJob {
  id: string
  orderId: string
  customer: string
  phone: string
  address: string
  type: string
  priority: "alta" | "media" | "baja"
  scheduledTime: string
  estimatedDuration: string
  notes: string
  status: JobStatus
}

interface AgendaCardProps {
  job: AgendaJob
  onAction: (jobId: string, action: "start_travel" | "check_in" | "complete") => void
  isActive: boolean
}

const priorityConfig: Record<
  string,
  { label: string; className: string; icon?: React.ReactNode }
> = {
  alta: {
    label: "Urgente",
    className: "bg-red-100 text-red-700 border-red-200",
    icon: <AlertTriangle className="h-3 w-3" />,
  },
  media: {
    label: "Media",
    className: "bg-amber-100 text-amber-700 border-amber-200",
  },
  baja: {
    label: "Normal",
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
}

const statusConfig: Record<
  JobStatus,
  { label: string; className: string; dotColor: string }
> = {
  pendiente: {
    label: "Pendiente",
    className: "text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
  en_viaje: {
    label: "En Viaje",
    className: "text-blue-600",
    dotColor: "bg-blue-500",
  },
  en_sitio: {
    label: "En Sitio",
    className: "text-amber-600",
    dotColor: "bg-amber-500",
  },
  completado: {
    label: "Completado",
    className: "text-emerald-600",
    dotColor: "bg-emerald-500",
  },
}

// ── Elapsed Timer Hook ─────────────────────────────────────

function useElapsedTimer(running: boolean) {
  const [seconds, setSeconds] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const display = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`

  return { seconds, display, reset: () => setSeconds(0) }
}

// ── Component ──────────────────────────────────────────────

export function AgendaCard({ job, onAction, isActive }: AgendaCardProps) {
  const [expanded, setExpanded] = useState(isActive)
  const [photos, setPhotos] = useState<string[]>([])
  const [timerRunning, setTimerRunning] = useState(false)
  const [totalTime, setTotalTime] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const timer = useElapsedTimer(timerRunning)

  const pr = priorityConfig[job.priority]
  const st = statusConfig[job.status]
  const isCompleted = job.status === "completado"
  const isOnSite = job.status === "en_sitio"

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos((prev) => [...prev, ev.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    }
    // reset input
    if (fileRef.current) fileRef.current.value = ""
  }

  function handleRemovePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  function handleComplete() {
    if (timerRunning) {
      setTimerRunning(false)
      setTotalTime(timer.display)
    }
    onAction(job.id, "complete")
  }

  return (
    <div
      className={cn(
        "bg-card border rounded-xl shadow-sm transition-all duration-200 overflow-hidden",
        isActive && !isCompleted && "border-primary ring-2 ring-primary/20 shadow-md",
        isCompleted && "opacity-70 border-border",
        !isActive && !isCompleted && "border-border"
      )}
    >
      {/* Card header (always visible) */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-4 text-left"
      >
        {/* Time pill */}
        <div
          className={cn(
            "flex flex-col items-center justify-center rounded-lg px-2.5 py-2 min-w-[56px]",
            isCompleted ? "bg-emerald-50" : "bg-primary/5"
          )}
        >
          <span
            className={cn(
              "text-base font-bold leading-none",
              isCompleted ? "text-emerald-600" : "text-primary"
            )}
          >
            {job.scheduledTime.split(":")[0]}:{job.scheduledTime.split(":")[1]}
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground">
            {job.estimatedDuration}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-muted-foreground">
              {job.orderId}
            </span>
            <Badge
              variant="outline"
              className={cn("text-[10px] px-1.5 py-0", pr.className)}
            >
              {pr.icon}
              {pr.label}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-foreground truncate">
            {job.customer}
          </p>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
            <Wrench className="h-3 w-3 shrink-0" />
            {job.type}
          </p>
        </div>

        {/* Status + chevron */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium",
              st.className
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full animate-pulse",
                st.dotColor
              )}
            />
            {st.label}
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          {/* Address & phone row */}
          <div className="flex flex-col gap-2 py-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <span className="text-sm text-foreground">{job.address}</span>
            </div>
            <a
              href={`tel:${job.phone}`}
              className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
            >
              <Phone className="h-4 w-4 shrink-0" />
              {job.phone}
            </a>
          </div>

          {/* Notes */}
          {job.notes && (
            <div className="rounded-lg bg-muted/60 px-3 py-2 mb-3">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">
                Notas:
              </p>
              <p className="text-sm text-foreground">{job.notes}</p>
            </div>
          )}

          {/* Timer (visible when on site or completed) */}
          {(isOnSite || isCompleted) && (
            <div className="rounded-xl bg-muted/50 border border-border p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Timer className="h-4 w-4 text-primary" />
                  Registro de Tiempo
                </div>
                {isOnSite && (
                  <button
                    type="button"
                    onClick={() => setTimerRunning(!timerRunning)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                      timerRunning
                        ? "bg-red-100 text-red-700"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    {timerRunning ? (
                      <>
                        <Square className="h-3 w-3" /> Detener
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" /> Iniciar
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="flex items-center justify-center">
                <div
                  className={cn(
                    "font-mono text-3xl font-bold tabular-nums tracking-wider",
                    timerRunning ? "text-primary" : "text-foreground"
                  )}
                >
                  {totalTime || timer.display}
                </div>
              </div>
              {isCompleted && totalTime && (
                <p className="text-center text-xs text-muted-foreground mt-1">
                  Tiempo total registrado
                </p>
              )}
            </div>
          )}

          {/* Photo upload (visible when on site or completed) */}
          {(isOnSite || isCompleted) && (
            <div className="rounded-xl bg-muted/50 border border-border p-3 mb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Camera className="h-4 w-4 text-primary" />
                  Evidencia Fotografica
                </div>
                <span className="text-xs text-muted-foreground">
                  {photos.length} foto{photos.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Photo grid */}
              {photos.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {photos.map((photo, i) => (
                    <div
                      key={`photo-${i}`}
                      className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                    >
                      <img
                        src={photo || "/placeholder.svg"}
                        alt={`Evidencia ${i + 1}`}
                        className="h-full w-full object-cover"
                        crossOrigin="anonymous"
                      />
                      {isOnSite && (
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(i)}
                          className="absolute top-1 right-1 h-5 w-5 rounded-full bg-foreground/60 text-background flex items-center justify-center hover:bg-foreground/80 transition-colors"
                          aria-label={`Eliminar foto ${i + 1}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Upload button */}
              {isOnSite && (
                <>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                    aria-label="Subir foto"
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                  >
                    <ImagePlus className="h-5 w-5" />
                    Tomar o Subir Foto
                  </button>
                </>
              )}
            </div>
          )}

          {/* Action buttons */}
          {!isCompleted && (
            <div className="flex flex-col gap-2.5 pt-1">
              {job.status === "pendiente" && (
                <Button
                  size="lg"
                  className="w-full h-14 text-base font-semibold gap-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                  onClick={() => onAction(job.id, "start_travel")}
                >
                  <Navigation className="h-5 w-5" />
                  Iniciar Viaje
                </Button>
              )}
              {job.status === "en_viaje" && (
                <Button
                  size="lg"
                  className="w-full h-14 text-base font-semibold gap-3 rounded-xl bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-500/25"
                  onClick={() => onAction(job.id, "check_in")}
                >
                  <LogIn className="h-5 w-5" />
                  Registrar Llegada
                </Button>
              )}
              {job.status === "en_sitio" && (
                <Button
                  size="lg"
                  className="w-full h-14 text-base font-semibold gap-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/25"
                  onClick={handleComplete}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Completar Trabajo
                </Button>
              )}

              {/* Secondary: Navigate with maps */}
              {(job.status === "pendiente" || job.status === "en_viaje") && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <MapPin className="h-4 w-4 text-primary" />
                  Abrir en Google Maps
                </a>
              )}
            </div>
          )}

          {/* Completed state */}
          {isCompleted && (
            <div className="flex flex-col items-center gap-1 py-3 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
              <span className="text-sm font-semibold">Trabajo completado</span>
              {totalTime && (
                <span className="text-xs text-muted-foreground">
                  Tiempo: {totalTime}
                </span>
              )}
              {photos.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {photos.length} foto{photos.length !== 1 ? "s" : ""} de evidencia
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
