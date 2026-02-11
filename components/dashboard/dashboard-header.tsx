"use client"

import { CalendarDays, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

export function DashboardHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Resumen de Operaciones
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitorea trabajos, tecnicos e ingresos en tiempo real.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" className="gap-2 text-muted-foreground bg-transparent">
          <CalendarDays className="h-4 w-4" />
          <span>Hoy, 11 Feb 2026</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-2 text-muted-foreground bg-transparent">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
      </div>
    </div>
  )
}
