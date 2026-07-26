"use client"

import { CalendarDays, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

function isSameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

function formatLabel(date: Date) {
  const today = new Date()
  const prefix = isSameDay(date, today) ? "Hoy, " : ""
  const label = date.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })
  return prefix + label
}

interface DashboardHeaderProps {
  date: Date
  onPrevDay: () => void
  onNextDay: () => void
  onToday: () => void
  onRefresh: () => void
  refreshing?: boolean
}

export function DashboardHeader({ date, onPrevDay, onNextDay, onToday, onRefresh, refreshing }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground text-balance">
          Despacho de Ordenes
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Arrastra ordenes al calendario para asignarlas a tecnicos.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={onPrevDay}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Dia anterior</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-2 text-muted-foreground bg-transparent h-8" onClick={onToday}>
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="text-xs">{formatLabel(date)}</span>
        </Button>
        <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent" onClick={onNextDay}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Dia siguiente</span>
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button variant="outline" size="sm" className="gap-2 text-muted-foreground bg-transparent h-8" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline text-xs">Actualizar</span>
        </Button>
      </div>
    </div>
  )
}
