"use client"

import {
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  User,
  Building,
  Clock,
  Star,
  Wrench,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface CustomerSidebarProps {
  customer: {
    name: string
    company: string
    phone: string
    email: string
    address: string
    since: string
    totalOrders: number
    rating: number
  }
  technician: {
    name: string
    initials: string
    role: string
    phone: string
  }
}

export function CustomerSidebar({ customer, technician }: CustomerSidebarProps) {
  return (
    <aside className="flex w-[340px] shrink-0 flex-col gap-0 border-l border-border bg-card overflow-y-auto">
      {/* Customer Contact Card */}
      <div className="p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Informacion del Cliente
        </h3>

        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{customer.name}</p>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building className="h-3 w-3 shrink-0" />
              <span className="truncate">{customer.company}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={`tel:${customer.phone}`}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-secondary group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Phone className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Telefono</span>
              <span className="font-medium text-foreground">{customer.phone}</span>
            </div>
          </a>

          <a
            href={`mailto:${customer.email}`}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm transition-colors hover:bg-secondary group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-muted-foreground">Correo</span>
              <span className="font-medium text-foreground truncate">{customer.email}</span>
            </div>
          </a>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center rounded-lg bg-secondary px-2 py-2.5">
            <User className="mb-1 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Cliente desde</span>
            <span className="text-xs font-semibold text-foreground">{customer.since}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary px-2 py-2.5">
            <Wrench className="mb-1 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Ordenes</span>
            <span className="text-xs font-semibold text-foreground">{customer.totalOrders}</span>
          </div>
          <div className="flex flex-col items-center rounded-lg bg-secondary px-2 py-2.5">
            <Star className="mb-1 h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Valoracion</span>
            <span className="text-xs font-semibold text-foreground">{customer.rating}/5</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Assigned Technician */}
      <div className="p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Tecnico Asignado
        </h3>
        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {technician.initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-0.5 min-w-0">
            <p className="text-sm font-semibold text-foreground">{technician.name}</p>
            <p className="text-xs text-muted-foreground">{technician.role}</p>
          </div>
        </div>
        <a
          href={`tel:${technician.phone}`}
          className="mt-2 flex items-center gap-2 text-xs text-primary hover:underline"
        >
          <Phone className="h-3 w-3" />
          {technician.phone}
        </a>
      </div>

      <Separator />

      {/* Map Placeholder */}
      <div className="p-5">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ubicacion del Sitio
        </h3>
        <div className="relative overflow-hidden rounded-xl border border-border bg-secondary">
          {/* Map area */}
          <div className="relative h-[200px] w-full bg-[#e8ecf4]">
            {/* Grid pattern to simulate a map */}
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(220 13% 85%)" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#mapGrid)" />
              {/* Roads */}
              <line x1="0" y1="80" x2="100%" y2="80" stroke="hsl(220 13% 78%)" strokeWidth="3" />
              <line x1="0" y1="140" x2="100%" y2="140" stroke="hsl(220 13% 78%)" strokeWidth="2" />
              <line x1="120" y1="0" x2="120" y2="100%" stroke="hsl(220 13% 78%)" strokeWidth="3" />
              <line x1="220" y1="0" x2="220" y2="100%" stroke="hsl(220 13% 78%)" strokeWidth="2" />
              {/* Major intersection */}
              <rect x="115" y="75" width="10" height="10" rx="1" fill="hsl(220 13% 75%)" />
            </svg>

            {/* Pin marker */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-lg">
                  <MapPin className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="h-2 w-0.5 bg-primary" />
                <div className="h-1.5 w-3 rounded-full bg-foreground/20 blur-[1px]" />
              </div>
            </div>

            {/* Pulse ring */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="h-12 w-12 animate-ping rounded-full bg-primary/20" />
            </div>
          </div>

          {/* Address bar */}
          <div className="flex items-center justify-between border-t border-border bg-card px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="text-xs font-medium text-foreground truncate">{customer.address}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-primary">
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="sr-only">Abrir en Google Maps</span>
            </Button>
          </div>
        </div>

        {/* Quick directions */}
        <div className="mt-3 flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs bg-transparent">
            <Clock className="h-3.5 w-3.5" />
            <span>25 min en auto</span>
          </Button>
          <Button size="sm" className="flex-1 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            <MapPin className="h-3.5 w-3.5" />
            <span>Indicaciones</span>
          </Button>
        </div>
      </div>
    </aside>
  )
}
