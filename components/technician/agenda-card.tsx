"use client"

import React, { useState, useRef, useEffect, useMemo } from "react"
import {
  Navigation, LogIn, CheckCircle2, MapPin, Wrench, Phone,
  ChevronDown, ChevronUp, AlertTriangle, Camera, ImagePlus, Timer,
  X, MessageCircle, Lightbulb, Loader2,
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
  hasMessaging?: boolean
  technicianStartedAt?: string | null
  technicianCompletedAt?: string | null
  technicianNotes?: string | null
}

interface AgendaCardProps {
  job: AgendaJob
  onAction: (jobId: string, action: "start_travel" | "check_in" | "complete") => void
  isActive: boolean
}

const priorityConfig: Record<string, { label: string; className: string; icon?: React.ReactNode }> = {
  alta:  { label: "Urgente", className: "bg-red-100 text-red-700 border-red-200", icon: <AlertTriangle className="h-3 w-3" /> },
  media: { label: "Media",   className: "bg-amber-100 text-amber-700 border-amber-200" },
  baja:  { label: "Normal",  className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
}

const statusConfig: Record<JobStatus, { label: string; className: string; dotColor: string }> = {
  pendiente:  { label: "Pendiente",  className: "text-muted-foreground", dotColor: "bg-muted-foreground" },
  en_viaje:   { label: "En Viaje",   className: "text-blue-600",         dotColor: "bg-blue-500" },
  en_sitio:   { label: "En Sitio",   className: "text-amber-600",        dotColor: "bg-amber-500" },
  completado: { label: "Completado", className: "text-emerald-600",      dotColor: "bg-emerald-500" },
}

function formatSeconds(secs: number): string {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function useElapsedTimer(running: boolean, initialSecs: number) {
  const [seconds, setSeconds] = useState(initialSecs)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [running])

  return { seconds, display: formatSeconds(seconds) }
}

function PhotoSection({
  label, sublabel, savedPhotos, newPhotos, onAdd, onRemoveNew, fileRef, blocked,
}: {
  label: string
  sublabel: string
  savedPhotos: string[]
  newPhotos: string[]
  onAdd: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveNew: (i: number) => void
  fileRef: React.RefObject<HTMLInputElement | null>
  blocked: boolean
}) {
  const total = savedPhotos.length + newPhotos.length
  const missing = total === 0 && blocked

  return (
    <div className={cn(
      "rounded-xl bg-muted/50 border p-3 mb-3",
      missing ? "border-destructive/50 bg-destructive/5" : "border-border"
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Camera className="h-4 w-4 text-primary" />
          {label}
          <span className={cn("text-xs", total === 0 ? "text-destructive" : "text-emerald-600")}>
            {sublabel}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{total} foto{total !== 1 ? "s" : ""}</span>
      </div>

      {(savedPhotos.length > 0 || newPhotos.length > 0) && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {savedPhotos.map((photo, i) => (
            <div key={`s${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={photo} alt={`${label} guardada ${i + 1}`} className="h-full w-full object-cover" />
            </div>
          ))}
          {newPhotos.map((photo, i) => (
            <div key={`n${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={photo} alt={`${label} ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onRemoveNew(i)}
                className="absolute top-1 right-1 h-5 w-5 rounded-full bg-foreground/60 text-background flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" capture="environment" multiple onChange={onAdd} className="hidden" />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
      >
        <ImagePlus className="h-4 w-4" />
        Tomar o subir foto
      </button>
      {missing && (
        <p className="text-xs text-destructive mt-1.5 text-center font-medium">
          ⚠ Requerido — adjuntá al menos 1 foto para continuar
        </p>
      )}
    </div>
  )
}

export function AgendaCard({ job, onAction, isActive }: AgendaCardProps) {
  const [expanded, setExpanded] = useState(isActive)

  // Photos: saved in DB vs newly added by user
  const [savedBeforePhotos, setSavedBeforePhotos] = useState<string[]>([])
  const [savedAfterPhotos, setSavedAfterPhotos] = useState<string[]>([])
  const [newBeforePhotos, setNewBeforePhotos] = useState<string[]>([])
  const [newAfterPhotos, setNewAfterPhotos] = useState<string[]>([])
  const [photosLoaded, setPhotosLoaded] = useState(false)

  const beforePhotos = [...savedBeforePhotos, ...newBeforePhotos]
  const afterPhotos = [...savedAfterPhotos, ...newAfterPhotos]

  // Timer — initialize from DB timestamps on mount
  const initialSecs = useMemo(() => {
    if (!job.technicianStartedAt) return 0
    const end = job.technicianCompletedAt
      ? new Date(job.technicianCompletedAt).getTime()
      : Date.now()
    return Math.max(0, Math.floor((end - new Date(job.technicianStartedAt).getTime()) / 1000))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // intentionally only on mount

  const [timerRunning, setTimerRunning] = useState(
    job.status === "en_sitio" && !!job.technicianStartedAt
  )
  const timer = useElapsedTimer(timerRunning, initialSecs)

  const [startedAtLabel, setStartedAtLabel] = useState<string | null>(
    job.technicianStartedAt
      ? new Date(job.technicianStartedAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })
      : null
  )

  // Suggestions textarea
  const [suggestions, setSuggestions] = useState(job.technicianNotes || "")

  // UI state
  const [saving, setSaving] = useState(false)
  const [tryCheckIn, setTryCheckIn] = useState(false)
  const [tryComplete, setTryComplete] = useState(false)

  const beforeRef = useRef<HTMLInputElement>(null)
  const afterRef = useRef<HTMLInputElement>(null)

  const pr = priorityConfig[job.priority]
  const st = statusConfig[job.status]
  const isCompleted = job.status === "completado"
  const isOnSite = job.status === "en_sitio"

  // Load saved photos from DB when card is expanded
  useEffect(() => {
    if (!expanded || photosLoaded) return
    if (job.status !== "en_sitio" && job.status !== "completado") {
      setPhotosLoaded(true)
      return
    }
    fetch(`/api/work-orders/${job.id}/photos`)
      .then((r) => r.json())
      .then((data) => {
        setSavedBeforePhotos(data.before || [])
        setSavedAfterPhotos(data.after || [])
      })
      .catch(() => {})
      .finally(() => setPhotosLoaded(true))
  }, [expanded, photosLoaded, job.id, job.status])

  function addPhoto(e: React.ChangeEvent<HTMLInputElement>, target: "before" | "after") {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const data = ev.target.result as string
          if (target === "before") setNewBeforePhotos((p) => [...p, data])
          else setNewAfterPhotos((p) => [...p, data])
        }
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ""
  }

  async function uploadPhotos(photos: string[], type: "before" | "after") {
    await Promise.all(
      photos.map((data) =>
        fetch(`/api/work-orders/${job.id}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photo_type: type, data }),
        })
      )
    )
  }

  async function handleStartTravel() {
    setSaving(true)
    try {
      await fetch(`/api/work-orders/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "en_ruta" }),
      })
      onAction(job.id, "start_travel")
    } catch {} finally {
      setSaving(false)
    }
  }

  async function handleCheckIn() {
    setTryCheckIn(true)
    if (beforePhotos.length === 0) return
    setSaving(true)
    try {
      if (newBeforePhotos.length > 0) await uploadPhotos(newBeforePhotos, "before")
      const now = new Date().toISOString()
      await fetch(`/api/work-orders/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "en_sitio", technician_started_at: now }),
      })
      setSavedBeforePhotos((p) => [...p, ...newBeforePhotos])
      setNewBeforePhotos([])
      setStartedAtLabel(new Date(now).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }))
      setTimerRunning(true)
      onAction(job.id, "check_in")
    } catch {} finally {
      setSaving(false)
    }
  }

  async function handleComplete() {
    setTryComplete(true)
    if (afterPhotos.length === 0) return
    setSaving(true)
    try {
      if (newAfterPhotos.length > 0) await uploadPhotos(newAfterPhotos, "after")
      const now = new Date().toISOString()
      await fetch(`/api/work-orders/${job.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completada",
          technician_completed_at: now,
          technician_notes: suggestions || null,
        }),
      })
      setSavedAfterPhotos((p) => [...p, ...newAfterPhotos])
      setNewAfterPhotos([])
      setTimerRunning(false)
      onAction(job.id, "complete")
    } catch {} finally {
      setSaving(false)
    }
  }

  return (
    <div className={cn(
      "bg-card border rounded-xl shadow-sm transition-all duration-200 overflow-hidden",
      isActive && !isCompleted && "border-primary ring-2 ring-primary/20 shadow-md",
      isCompleted && "opacity-70 border-border",
      !isActive && !isCompleted && "border-border"
    )}>
      {/* Header */}
      <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-start gap-3 p-4 text-left">
        <div className={cn("flex flex-col items-center justify-center rounded-lg px-2.5 py-2 min-w-[56px]", isCompleted ? "bg-emerald-50" : "bg-primary/5")}>
          <span className={cn("text-base font-bold leading-none", isCompleted ? "text-emerald-600" : "text-primary")}>
            {job.scheduledTime.split(":")[0]}:{job.scheduledTime.split(":")[1]}
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground">{job.estimatedDuration}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-muted-foreground">{job.orderId}</span>
            <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", pr.className)}>
              {pr.icon}{pr.label}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-foreground truncate">{job.customer}</p>
          <p className="text-xs text-muted-foreground truncate flex items-center gap-1 mt-0.5">
            <Wrench className="h-3 w-3 shrink-0" />{job.type}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <div className={cn("flex items-center gap-1.5 text-xs font-medium", st.className)}>
            <span className={cn("h-2 w-2 rounded-full animate-pulse", st.dotColor)} />{st.label}
          </div>
          {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border px-4 pb-4">
          <div className="flex flex-col gap-2 py-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <span className="text-sm text-foreground">{job.address}</span>
            </div>
            {job.phone && (
              <a href={`tel:${job.phone}`} className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                <Phone className="h-4 w-4 shrink-0" />{job.phone}
              </a>
            )}
          </div>

          {job.notes && (
            <div className="rounded-lg bg-muted/60 px-3 py-2 mb-3">
              <p className="text-xs text-muted-foreground font-medium mb-0.5">Notas:</p>
              <p className="text-sm text-foreground">{job.notes}</p>
            </div>
          )}

          {/* Timer — shown when on-site or completed */}
          {(isOnSite || isCompleted) && (
            <div className="rounded-xl bg-muted/50 border border-border p-3 mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Timer className="h-4 w-4 text-primary" />
                Registro de Tiempo
                {startedAtLabel && (
                  <span className="text-xs font-normal text-muted-foreground">inicio: {startedAtLabel}</span>
                )}
              </div>
              <div className="flex items-center justify-center">
                <div className={cn("font-mono text-3xl font-bold tabular-nums tracking-wider", timerRunning ? "text-primary" : "text-foreground")}>
                  {timer.display}
                </div>
              </div>
              {isCompleted && (
                <p className="text-center text-xs text-muted-foreground mt-1">Tiempo total registrado</p>
              )}
            </div>
          )}

          {/* Photo sections */}
          {(isOnSite || isCompleted) && (
            <PhotoSection
              label="Foto ANTES"
              sublabel={isCompleted ? "" : "(obligatorio)"}
              savedPhotos={savedBeforePhotos}
              newPhotos={newBeforePhotos}
              onAdd={(e) => addPhoto(e, "before")}
              onRemoveNew={(i) => setNewBeforePhotos((p) => p.filter((_, x) => x !== i))}
              fileRef={beforeRef}
              blocked={false}
            />
          )}

          {(isOnSite || isCompleted) && (
            <PhotoSection
              label="Foto DESPUÉS"
              sublabel={isOnSite ? "(obligatorio para completar)" : ""}
              savedPhotos={savedAfterPhotos}
              newPhotos={newAfterPhotos}
              onAdd={(e) => addPhoto(e, "after")}
              onRemoveNew={(i) => setNewAfterPhotos((p) => p.filter((_, x) => x !== i))}
              fileRef={afterRef}
              blocked={tryComplete}
            />
          )}

          {/* Suggestions */}
          {(isOnSite || isCompleted) && (
            <div className="rounded-xl bg-muted/50 border border-border p-3 mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Sugerencias y Mejoras
              </div>
              <textarea
                value={suggestions}
                onChange={(e) => setSuggestions(e.target.value)}
                disabled={isCompleted}
                placeholder="Describe cualquier sugerencia o mejora encontrada..."
                className="w-full px-3 py-2 text-sm rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none disabled:opacity-60"
                rows={3}
              />
            </div>
          )}

          {job.hasMessaging && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 mb-3">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Mensajería activa con el cliente</span>
            </div>
          )}

          {/* Action buttons */}
          {!isCompleted && (
            <div className="flex flex-col gap-2.5 pt-1">
              {job.status === "pendiente" && (
                <Button size="lg" disabled={saving}
                  className="w-full h-14 text-base font-semibold gap-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                  onClick={handleStartTravel}>
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
                  Iniciar Viaje
                </Button>
              )}

              {job.status === "en_viaje" && (
                <div className="flex flex-col gap-2">
                  <PhotoSection
                    label="Foto ANTES"
                    sublabel="(obligatorio para registrar llegada)"
                    savedPhotos={savedBeforePhotos}
                    newPhotos={newBeforePhotos}
                    onAdd={(e) => addPhoto(e, "before")}
                    onRemoveNew={(i) => setNewBeforePhotos((p) => p.filter((_, x) => x !== i))}
                    fileRef={beforeRef}
                    blocked={tryCheckIn}
                  />
                  <Button size="lg" disabled={saving}
                    className={cn(
                      "w-full h-14 text-base font-semibold gap-3 rounded-xl shadow-lg",
                      beforePhotos.length > 0
                        ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/25"
                        : "bg-muted text-muted-foreground"
                    )}
                    onClick={handleCheckIn}>
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
                    Registrar Llegada
                  </Button>
                </div>
              )}

              {job.status === "en_sitio" && (
                <Button size="lg" disabled={saving}
                  className={cn(
                    "w-full h-14 text-base font-semibold gap-3 rounded-xl shadow-lg",
                    afterPhotos.length > 0
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/25"
                      : "bg-muted text-muted-foreground"
                  )}
                  onClick={handleComplete}>
                  {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                  Completar Trabajo
                </Button>
              )}

              {(job.status === "pendiente" || job.status === "en_viaje") && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <MapPin className="h-4 w-4 text-primary" />Abrir en Google Maps
                </a>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="flex flex-col items-center gap-1 py-3 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
              <span className="text-sm font-semibold">Trabajo completado</span>
              {startedAtLabel && <span className="text-xs text-muted-foreground">Inicio: {startedAtLabel}</span>}
              {(savedBeforePhotos.length + savedAfterPhotos.length) > 0 && (
                <span className="text-xs text-muted-foreground">
                  {savedBeforePhotos.length} foto{savedBeforePhotos.length !== 1 ? "s" : ""} antes · {savedAfterPhotos.length} foto{savedAfterPhotos.length !== 1 ? "s" : ""} después
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
