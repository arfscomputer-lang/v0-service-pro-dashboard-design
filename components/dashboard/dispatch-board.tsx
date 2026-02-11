"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, MapPin } from "lucide-react"

type JobStatus = "pendiente" | "en_ruta" | "en_progreso" | "completado"

interface Job {
  id: string
  customer: string
  address: string
  type: string
  tech: string
  techInitials: string
  time: string
  status: JobStatus
}

const jobs: Job[] = [
  {
    id: "OT-1042",
    customer: "Maria Gonzalez",
    address: "Av. Reforma 450, Col. Centro",
    type: "Reparacion HVAC",
    tech: "Luis Hernandez",
    techInitials: "LH",
    time: "08:00 - 10:00",
    status: "completado",
  },
  {
    id: "OT-1043",
    customer: "Roberto Martinez",
    address: "Calle 5 de Mayo 220",
    type: "Instalacion Electrica",
    tech: "Ana Torres",
    techInitials: "AT",
    time: "09:30 - 11:30",
    status: "en_progreso",
  },
  {
    id: "OT-1044",
    customer: "Alejandra Ruiz",
    address: "Blvd. Insurgentes 890",
    type: "Mantenimiento Plomeria",
    tech: "Pedro Sanchez",
    techInitials: "PS",
    time: "10:00 - 12:00",
    status: "en_ruta",
  },
  {
    id: "OT-1045",
    customer: "Fernando Lopez",
    address: "Av. Universidad 1200",
    type: "Inspeccion Gas",
    tech: "Sofia Morales",
    techInitials: "SM",
    time: "11:00 - 12:30",
    status: "pendiente",
  },
  {
    id: "OT-1046",
    customer: "Laura Castillo",
    address: "Calle Juarez 340",
    type: "Reparacion HVAC",
    tech: "Luis Hernandez",
    techInitials: "LH",
    time: "13:00 - 15:00",
    status: "pendiente",
  },
  {
    id: "OT-1047",
    customer: "Diego Ramirez",
    address: "Av. Chapultepec 560",
    type: "Instalacion Panel Solar",
    tech: "Carlos Vega",
    techInitials: "CV",
    time: "14:00 - 17:00",
    status: "en_progreso",
  },
  {
    id: "OT-1048",
    customer: "Patricia Herrera",
    address: "Col. Roma Norte 78",
    type: "Reparacion Electrica",
    tech: "Ana Torres",
    techInitials: "AT",
    time: "15:30 - 17:00",
    status: "pendiente",
  },
]

const statusConfig: Record<
  JobStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  pendiente: {
    label: "Pendiente",
    variant: "outline",
    className: "border-warning text-warning bg-warning/10",
  },
  en_ruta: {
    label: "En Ruta",
    variant: "outline",
    className: "border-primary text-primary bg-primary/10",
  },
  en_progreso: {
    label: "En Progreso",
    variant: "outline",
    className: "border-chart-2 text-chart-2 bg-chart-2/10",
  },
  completado: {
    label: "Completado",
    variant: "outline",
    className: "border-success text-success bg-success/10",
  },
}

export function DispatchBoard() {
  return (
    <Card className="border border-border bg-card shadow-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-foreground">
            Tablero de Despacho en Vivo
          </CardTitle>
          <Badge variant="secondary" className="text-xs font-normal">
            {jobs.length} trabajos hoy
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-border">
            {jobs.map((job) => {
              const config = statusConfig[job.status]
              return (
                <div
                  key={job.id}
                  className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  {/* Status */}
                  <Badge
                    variant={config.variant}
                    className={`min-w-[100px] justify-center text-[11px] font-medium ${config.className}`}
                  >
                    {config.label}
                  </Badge>

                  {/* Customer & Job */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{job.id}</span>
                      <span className="text-sm font-medium text-foreground truncate">
                        {job.customer}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {job.address}
                      </span>
                    </div>
                  </div>

                  {/* Job Type */}
                  <span className="hidden lg:inline-block text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                    {job.type}
                  </span>

                  {/* Tech */}
                  <div className="hidden md:flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                        {job.techInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{job.tech}</span>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3.5 w-3.5" />
                    {job.time}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
