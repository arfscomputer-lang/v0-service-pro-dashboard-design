"use client"

import { Search, Bell, HelpCircle, Plus, Radio } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TopHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative flex items-center rounded-md border border-border bg-secondary px-3 py-2">
          <Search className="h-4 w-4 mr-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar orden, cliente o técnico..."
            className="flex-1 bg-transparent text-sm outline-none text-foreground"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 ml-6">
        {/* Live indicator */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 border border-emerald-200">
          <Radio className="h-3 w-3 text-emerald-600 animate-pulse" />
          <span className="text-[11px] font-medium text-emerald-700">En Vivo</span>
        </div>

        {/* Nueva Orden Button */}
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nueva Orden</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        {/* Help */}
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
