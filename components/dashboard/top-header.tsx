"use client"

import { Search, Plus, Bell, HelpCircle, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function TopHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar Orden #, Cliente o Tecnico..."
          className="pl-10 pr-16 bg-secondary border-border"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden select-none items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          <span className="text-xs">{"Ctrl"}</span>K
        </kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Live status indicator */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200">
          <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-700">En Vivo</span>
        </div>

        <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Orden</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-destructive p-0 text-[10px] text-destructive-foreground">
            5
          </Badge>
          <span className="sr-only">Notificaciones</span>
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Ayuda</span>
        </Button>
      </div>
    </header>
  )
}
