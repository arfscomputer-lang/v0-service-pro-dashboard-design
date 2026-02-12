"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
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
  PieChart,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useAuth, type UserRole } from "@/lib/context/auth-context"

interface NavItem {
  icon: typeof LayoutDashboard
  label: string
  href: string
  /** Which roles can see this item. Omit = admin only. */
  roles: UserRole[]
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Panel Principal", href: "/", roles: ["admin", "supervisor"] },
  { icon: CalendarClock, label: "Agenda (Despacho)", href: "/despacho", roles: ["admin", "supervisor"] },
  { icon: ClipboardList, label: "Ordenes de Trabajo", href: "/ordenes", roles: ["admin", "supervisor"] },
  { icon: Users, label: "Tecnicos", href: "/tecnicos", roles: ["admin"] },
  { icon: UserCircle, label: "Clientes", href: "/clientes", roles: ["admin", "supervisor"] },
  { icon: PieChart, label: "Reportes CRM", href: "/clientes/reportes", roles: ["admin"] },
  { icon: Package, label: "Inventario", href: "/inventario", roles: ["admin", "supervisor"] },
  { icon: BarChart3, label: "Reportes", href: "/reportes", roles: ["admin", "supervisor"] },
  { icon: FileText, label: "Facturas", href: "/facturas", roles: ["admin"] },
  { icon: Smartphone, label: "Vista Tecnico", href: "/tecnico/agenda", roles: ["admin", "tecnico"] },
  { icon: Settings, label: "Configuracion", href: "/configuracion", roles: ["admin"] },
]

const roleLabels: Record<UserRole, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  tecnico: "Tecnico",
  cliente: "Cliente",
}

export function SidebarNav() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/"
    }
    if (href === "/ordenes" && pathname.startsWith("/orden")) {
      return true
    }
    return pathname.startsWith(href)
  }

  const visibleItems = user
    ? navItems.filter((item) => item.roles.includes(user.role))
    : []

  function handleLogout() {
    logout()
    router.replace("/login")
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
          <Link href={user ? "/" : "/login"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary">
            <Wrench className="h-5 w-5 text-sidebar-primary-foreground" />
          </Link>
          {!collapsed && (
            <Link href={user ? "/" : "/login"} className="text-lg font-bold tracking-tight text-sidebar-primary-foreground">
              ServicePro
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {visibleItems.map((item) => {
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

        {/* User profile + logout */}
        <div className="border-t border-sidebar-border px-3 py-4 space-y-2">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src="/placeholder.svg" alt={user?.name ?? ""} />
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
                {user?.initials ?? "??"}
              </AvatarFallback>
            </Avatar>
            {!collapsed && user && (
              <div className="flex flex-col overflow-hidden flex-1 min-w-0">
                <span className="truncate text-sm font-medium text-sidebar-primary-foreground">
                  {user.name}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {roleLabels[user.role]}
                </span>
              </div>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleLogout}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/60 hover:bg-destructive/20 hover:text-destructive transition-colors",
                  collapsed && "justify-center"
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && <span>Cerrar Sesion</span>}
              </button>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right" className="bg-foreground text-background">
                Cerrar Sesion
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}
