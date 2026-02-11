"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

type TechStatus = "disponible" | "ocupado" | "desconectado"

interface Technician {
  name: string
  initials: string
  role: string
  status: TechStatus
  currentJob?: string
}

const technicians: Technician[] = [
  {
    name: "Luis Hernandez",
    initials: "LH",
    role: "Especialista HVAC",
    status: "ocupado",
    currentJob: "OT-1042",
  },
  {
    name: "Ana Torres",
    initials: "AT",
    role: "Electricista Senior",
    status: "ocupado",
    currentJob: "OT-1043",
  },
  {
    name: "Pedro Sanchez",
    initials: "PS",
    role: "Plomero",
    status: "ocupado",
    currentJob: "OT-1044",
  },
  {
    name: "Sofia Morales",
    initials: "SM",
    role: "Inspectora de Gas",
    status: "disponible",
  },
  {
    name: "Carlos Vega",
    initials: "CV",
    role: "Paneles Solares",
    status: "ocupado",
    currentJob: "OT-1047",
  },
  {
    name: "Miguel Flores",
    initials: "MF",
    role: "Mantenimiento General",
    status: "desconectado",
  },
]

const statusConfig: Record<TechStatus, { label: string; color: string; dotColor: string }> = {
  disponible: {
    label: "Disponible",
    color: "text-success",
    dotColor: "bg-success",
  },
  ocupado: {
    label: "Ocupado",
    color: "text-destructive",
    dotColor: "bg-destructive",
  },
  desconectado: {
    label: "Desconectado",
    color: "text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
}

export function TechnicianStatus() {
  return (
    <Card className="border border-border bg-card shadow-sm h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Estado de Tecnicos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col px-0 pb-0">
        <ScrollArea className="flex-1">
          <div className="divide-y divide-border">
            {technicians.map((tech) => {
              const config = statusConfig[tech.status]
              return (
                <div
                  key={tech.name}
                  className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <div className="relative">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                        {tech.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                        config.dotColor
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{tech.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{tech.role}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn("text-xs font-medium", config.color)}>
                      {config.label}
                    </span>
                    {tech.currentJob && (
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {tech.currentJob}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Mini Map Placeholder */}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-secondary/80 p-4 flex flex-col items-center justify-center gap-2">
            <MapPin className="h-6 w-6 text-primary/60" />
            <span className="text-xs text-muted-foreground font-medium">
              Ubicaciones en Vivo
            </span>
            <div className="relative w-full h-24 rounded-md bg-muted/50 overflow-hidden">
              {/* Grid pattern for map feel */}
              <div className="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>
              {/* Simulated pins */}
              <div className="absolute top-4 left-6 h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
              <div className="absolute top-8 left-[45%] h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
              <div className="absolute top-12 right-8 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
              <div className="absolute bottom-4 left-[30%] h-2.5 w-2.5 rounded-full bg-destructive animate-pulse" />
              <div className="absolute top-6 right-[35%] h-2.5 w-2.5 rounded-full bg-warning animate-pulse" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
