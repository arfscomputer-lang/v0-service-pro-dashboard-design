"use client"

import React from "react"

import { CheckCircle2, XCircle, Clock, Wrench, CalendarDays } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface HistoryEntry {
  orderId: string
  date: string
  type: string
  technician: string
  status: "completada" | "cancelada" | "pendiente"
  duration: string
  summary: string
}

const history: HistoryEntry[] = [
  {
    orderId: "OT-0987",
    date: "15 Jun 2025",
    type: "Mantenimiento Preventivo",
    technician: "Luis Hernandez",
    status: "completada",
    duration: "1.5 hrs",
    summary: "Limpieza de filtros, verificacion de niveles de refrigerante y calibracion del termostato. Sistema funcionando correctamente.",
  },
  {
    orderId: "OT-0834",
    date: "02 Ene 2025",
    type: "Reparacion HVAC",
    technician: "Ana Torres",
    status: "completada",
    duration: "3 hrs",
    summary: "Reemplazo del motor del ventilador interior. Se detecto desgaste en rodamientos. Pieza reemplazada bajo garantia.",
  },
  {
    orderId: "OT-0756",
    date: "18 Ago 2024",
    type: "Inspeccion General",
    technician: "Pedro Sanchez",
    status: "completada",
    duration: "1 hr",
    summary: "Inspeccion anual del sistema de climatizacion completo. Sin anomalias detectadas. Se recomendo cambio de filtros en 6 meses.",
  },
  {
    orderId: "OT-0698",
    date: "05 Mar 2024",
    type: "Emergencia - Fuga de Gas",
    technician: "Sofia Morales",
    status: "completada",
    duration: "4 hrs",
    summary: "Fuga detectada en la tuberia de cobre del sistema split. Se reparo con soldadura de plata y se recargo refrigerante.",
  },
  {
    orderId: "OT-0612",
    date: "10 Nov 2023",
    type: "Instalacion Inicial",
    technician: "Carlos Vega",
    status: "completada",
    duration: "8 hrs",
    summary: "Instalacion de unidad central HVAC Carrier 24ACC636. Incluye ductos, termostato digital y primera carga de refrigerante.",
  },
  {
    orderId: "OT-0590",
    date: "28 Oct 2023",
    type: "Pre-instalacion / Evaluacion",
    technician: "Luis Hernandez",
    status: "cancelada",
    duration: "---",
    summary: "Visita de evaluacion cancelada por el cliente. Se reprogramo para el 10 de noviembre.",
  },
]

const statusConfig: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
  completada: {
    icon: <CheckCircle2 className="h-4 w-4" />,
    label: "Completada",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelada: {
    icon: <XCircle className="h-4 w-4" />,
    label: "Cancelada",
    className: "bg-red-50 text-red-700 border-red-200",
  },
  pendiente: {
    icon: <Clock className="h-4 w-4" />,
    label: "Pendiente",
    className: "bg-amber-50 text-amber-700 border-amber-200",
  },
}

export function TabSiteHistory() {
  return (
    <div className="flex flex-col gap-4">
      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          icon={<Wrench className="h-4 w-4 text-primary" />}
          label="Total Visitas"
          value={history.length.toString()}
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          label="Completadas"
          value={history.filter((h) => h.status === "completada").length.toString()}
        />
        <StatCard
          icon={<CalendarDays className="h-4 w-4 text-primary" />}
          label="Primera Visita"
          value="Oct 2023"
        />
        <StatCard
          icon={<Clock className="h-4 w-4 text-primary" />}
          label="Horas Totales"
          value="18 hrs"
        />
      </div>

      {/* History list */}
      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Historial de Visitas al Sitio
          </h3>
        </div>

        <div className="divide-y divide-border">
          {history.map((entry) => {
            const st = statusConfig[entry.status]
            return (
              <div
                key={entry.orderId}
                className="flex items-start gap-4 px-5 py-4 hover:bg-secondary/30 transition-colors"
              >
                {/* Status icon */}
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    entry.status === "completada"
                      ? "bg-emerald-100 text-emerald-600"
                      : entry.status === "cancelada"
                        ? "bg-red-100 text-red-600"
                        : "bg-amber-100 text-amber-600"
                  }`}
                >
                  {st.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-primary font-mono">{entry.orderId}</span>
                    <span className="text-sm font-semibold text-foreground">{entry.type}</span>
                    <Badge variant="outline" className={`text-[10px] ${st.className}`}>
                      {st.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                    {entry.summary}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {entry.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      {entry.technician}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {entry.duration}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-lg font-bold text-foreground">{value}</span>
      </div>
    </div>
  )
}
