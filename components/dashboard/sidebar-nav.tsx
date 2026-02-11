"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  CalendarClock,
  ClipboardList,
  Users,
  UserCircle,
  Package,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { icon: LayoutDashboard, label: "Panel Principal", active: true },
  { icon: CalendarClock, label: "Agenda (Despacho)", active: false },
  { icon: ClipboardList, label: "Ordenes de Trabajo", active: false },
  { icon: Users, label: "Tecnicos", active: false },
  { icon: UserCircle, label: "Clientes", active: false },
  { icon: Package, label: "Inventario", active: false },
  { icon: FileText, label: "Facturas", active: false },
  { icon: Settings, label: "Configuracion", active: false },
]

export function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Wrench className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight text-sidebar-primary-foreground">
              ServicePro
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item, index) => {
            const isActive = index === activeIndex
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-foreground text-background">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="px-3 py-2">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* User profile */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src="/placeholder.svg" alt="Carlos Rodriguez" />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                CR
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-primary-foreground">
                  Carlos Rodriguez
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  Administrador
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </TooltipProvider>
  )
}
