"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Smartphone,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { icon: LayoutDashboard, label: "Panel Principal", href: "/" },
  { icon: CalendarClock, label: "Agenda (Despacho)", href: "/despacho" },
  { icon: ClipboardList, label: "Ordenes de Trabajo", href: "/ordenes" },
  { icon: Users, label: "Tecnicos", href: "/tecnicos" },
  { icon: UserCircle, label: "Clientes", href: "/clientes" },
  { icon: Package, label: "Inventario", href: "/inventario" },
  { icon: BarChart3, label: "Reportes", href: "/reportes" },
  { icon: FileText, label: "Facturas", href: "/facturas" },
  { icon: Smartphone, label: "Vista Tecnico", href: "/tecnico/agenda" },
  { icon: Settings, label: "Configuracion", href: "/configuracion" },
]

export function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/"
    }
    // /orden/[id] should highlight "Ordenes de Trabajo"
    if (href === "/ordenes" && pathname.startsWith("/orden")) {
      return true
    }
    return pathname.startsWith(href)
  }

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
          <Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Wrench className="h-5 w-5 text-sidebar-primary-foreground" />
          </Link>
          {!collapsed && (
            <Link href="/" className="text-lg font-bold tracking-tight text-sidebar-primary-foreground">
              ServicePro
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(item.href)
            return (
              <Tooltip key={item.label}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
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
