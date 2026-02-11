"use client"

import { useState } from "react"
import { Bell, Menu, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

const quickLinks = [
  { label: "Mi Agenda", href: "/tecnico/agenda" },
  { label: "Panel Admin", href: "/" },
  { label: "Mis Ordenes", href: "/ordenes" },
]

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-card px-4 py-3 border-b border-border shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
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
          <Button variant="ghost" size="icon" className="relative text-muted-foreground" aria-label="Notificaciones">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              2
            </span>
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
              LH
            </AvatarFallback>
          </Avatar>
        </div>
      </header>

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
        </nav>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-20 bg-foreground/20"
          onClick={() => setMenuOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMenuOpen(false)}
          role="button"
          tabIndex={-1}
          aria-label="Cerrar menu"
        />
      )}
    </>
  )
}
