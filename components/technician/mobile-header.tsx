"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Bell, Menu, X, LogOut, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useAuth } from "@/lib/context/auth-context"

const quickLinks = [
  { label: "Mi Agenda", href: "/tecnico/agenda" },
  { label: "Historial", href: "/tecnico/historial" },
  { label: "Mensajes", href: "/tecnico/mensajes" },
  { label: "Mi Perfil", href: "/tecnico/perfil" },
]

interface Notification {
  id: string
  type: string
  title: string
  body: string
  created_at: string
  read_at: string | null
}

export function MobileHeader() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const initials = user ? `${user.name.split(" ")[0][0]}${user.name.split(" ").slice(-1)[0][0]}` : "SP"

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return
    try {
      const res = await fetch(`/api/notifications?user_id=${user.id}`)
      if (!res.ok) return
      const json = await res.json()
      setNotifications(json.data || [])
      setUnread(json.unread ?? 0)
    } catch {}
  }, [user?.id])

  useEffect(() => {
    fetchNotifications()
    pollRef.current = setInterval(fetchNotifications, 30000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [fetchNotifications])

  async function openBell() {
    setBellOpen(true)
    setMenuOpen(false)
    if (unread > 0 && user?.id) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.id }),
        })
        setUnread(0)
        setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
      } catch {}
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-card px-4 py-3 border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { setMenuOpen(!menuOpen); setBellOpen(false) }}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">SP</span>
            </div>
            <span className="text-base font-bold text-foreground">ServicePro</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
            aria-label="Notificaciones"
            onClick={openBell}
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Notification panel */}
      <div
        className={cn(
          "fixed inset-x-0 top-[57px] z-30 bg-card border-b border-border shadow-lg transition-all duration-200 ease-in-out",
          bellOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Notificaciones</span>
          </div>
          <button type="button" onClick={() => setBellOpen(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-72 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
              <CheckCheck className="h-7 w-7 mb-2 opacity-30" />
              <p className="text-xs">Sin notificaciones</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "px-4 py-3 border-b border-border last:border-0",
                  !n.read_at ? "bg-primary/5" : ""
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className={cn("text-sm font-medium", !n.read_at ? "text-foreground" : "text-muted-foreground")}>
                    {n.title}
                  </p>
                  {!n.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                </div>
                {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  {new Date(n.created_at).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={cn(
          "fixed inset-x-0 top-[57px] z-30 bg-card border-b border-border shadow-lg transition-all duration-200 ease-in-out",
          menuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <nav className="flex flex-col p-3 gap-1">
          {user && (
            <div className="px-4 py-2 mb-1 border-b border-border">
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-[11px] text-muted-foreground">{user.email}</p>
            </div>
          )}
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border mt-1 pt-1">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false)
                logout()
              }}
              className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesion
            </button>
          </div>
        </nav>
      </div>

      {/* Overlay — closes both panels */}
      {(menuOpen || bellOpen) && (
        <div
          className="fixed inset-0 z-20 bg-foreground/20"
          onClick={() => { setMenuOpen(false); setBellOpen(false) }}
          onKeyDown={(e) => e.key === "Escape" && (setMenuOpen(false) || setBellOpen(false))}
          role="button"
          tabIndex={-1}
          aria-label="Cerrar panel"
        />
      )}
    </>
  )
}
