"use client"

import React from "react"

import {
  CalendarDays,
  Clock,
  Wrench,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Circle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface TimelineEvent {
  time: string
  label: string
  description: string
  completed: boolean
}

const orderInfo = {
  type: "Reparacion HVAC",
  category: "Climatizacion",
  scheduledDate: "11 de Febrero, 2026",
  scheduledTime: "09:00 - 11:00",
  estimatedDuration: "2 horas",
  slaDeadline: "11 de Febrero, 2026 - 18:00",
  equipment: "Unidad Central HVAC - Modelo Carrier 24ACC636",
  serialNumber: "SN-887432-AC",
  warranty: "Vigente hasta Mar 2027",
}

const description =
  "El cliente reporta que la unidad central de aire acondicionado no enfria adecuadamente. La temperatura del termostato no coincide con la temperatura real de la habitacion. Se escucha un ruido inusual al encender el compresor. Ultima revision realizada hace 8 meses."

const checklist: { label: string; done: boolean }[] = [
  { label: "Confirmacion de cita con el cliente", done: true },
  { label: "Verificacion de refacciones necesarias", done: true },
  { label: "Revision del equipo de seguridad", done: true },
  { label: "Diagnostico inicial del sistema", done: false },
  { label: "Reparacion o reemplazo de componentes", done: false },
  { label: "Pruebas de funcionamiento post-reparacion", done: false },
  { label: "Firma de conformidad del cliente", done: false },
]

const timeline: TimelineEvent[] = [
  {
    time: "08:30",
    label: "Orden Creada",
    description: "Creada por Carlos Rodriguez desde el panel de despacho.",
    completed: true,
  },
  {
    time: "08:45",
    label: "Tecnico Asignado",
    description: "Luis Hernandez fue asignado como tecnico responsable.",
    completed: true,
  },
  {
    time: "09:02",
    label: "En Camino",
    description: "El tecnico salio de la oficina central hacia el sitio.",
    completed: true,
  },
  {
    time: "09:28",
    label: "Llego al Sitio",
    description: "El tecnico confirmo su llegada a la ubicacion del cliente.",
    completed: true,
  },
  {
    time: "---",
    label: "Trabajo en Progreso",
    description: "Diagnostico y reparacion en curso.",
    completed: false,
  },
  {
    time: "---",
    label: "Trabajo Completado",
    description: "Pendiente de finalizacion.",
    completed: false,
  },
]

export function TabDetails() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Left column */}
      <div className="flex flex-col gap-6">
        {/* Order Information */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Informacion de la Orden
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <InfoField icon={<Wrench className="h-3.5 w-3.5" />} label="Tipo de Servicio" value={orderInfo.type} />
            <InfoField icon={<Wrench className="h-3.5 w-3.5" />} label="Categoria" value={orderInfo.category} />
            <InfoField icon={<CalendarDays className="h-3.5 w-3.5" />} label="Fecha Programada" value={orderInfo.scheduledDate} />
            <InfoField icon={<Clock className="h-3.5 w-3.5" />} label="Horario" value={orderInfo.scheduledTime} />
            <InfoField icon={<Clock className="h-3.5 w-3.5" />} label="Duracion Estimada" value={orderInfo.estimatedDuration} />
            <InfoField icon={<AlertTriangle className="h-3.5 w-3.5" />} label="Limite SLA" value={orderInfo.slaDeadline} />
          </div>

          <Separator className="my-4" />

          {/* Equipment info */}
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Equipo
          </h4>
          <div className="rounded-lg bg-secondary p-3 flex flex-col gap-1.5">
            <p className="text-sm font-medium text-foreground">{orderInfo.equipment}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>N/S: {orderInfo.serialNumber}</span>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                {orderInfo.warranty}
              </Badge>
            </div>
          </div>
        </section>

        {/* Description */}
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-3 text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Descripcion del Problema
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </section>

        {/* Checklist */}
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Lista de Verificacion
            </h3>
            <span className="text-xs text-muted-foreground">
              {checklist.filter((c) => c.done).length}/{checklist.length} completados
            </span>
          </div>
          {/* Progress bar */}
          <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(checklist.filter((c) => c.done).length / checklist.length) * 100}%` }}
            />
          </div>
          <ul className="flex flex-col gap-2">
            {checklist.map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-sm">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-border" />
                )}
                <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Right column: Timeline */}
      <div className="flex flex-col gap-6">
        <section className="rounded-xl border border-border bg-card p-5">
          <h3 className="mb-5 text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Linea de Tiempo
          </h3>
          <ol className="relative border-l-2 border-border ml-2">
            {timeline.map((event, i) => (
              <li key={i} className="mb-6 ml-6 last:mb-0">
                {/* Dot */}
                <span
                  className={`absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    event.completed
                      ? "border-primary bg-primary"
                      : "border-border bg-card"
                  }`}
                >
                  {event.completed && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                  )}
                </span>
                <div className="flex items-center gap-2 mb-0.5">
                  <time className="text-xs font-mono font-semibold text-primary">
                    {event.time}
                  </time>
                  <span className="text-sm font-semibold text-foreground">{event.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}
