"use client"

import { MobileHeader } from "@/components/technician/mobile-header"
import { BottomTabs } from "@/components/technician/bottom-tabs"
import { ClipboardList } from "lucide-react"

export default function HistorialPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 pb-24 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <ClipboardList className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-bold text-foreground">Historial de Trabajos</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          Aqui podras consultar todas tus ordenes completadas y el registro de actividades anteriores.
        </p>
      </div>
      <BottomTabs />
    </div>
  )
}
