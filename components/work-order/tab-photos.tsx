"use client"

import { useState } from "react"
import {
  Camera,
  Upload,
  X,
  ZoomIn,
  Download,
  Clock,
  Tag,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Photo {
  id: string
  label: string
  category: "antes" | "durante" | "despues" | "evidencia"
  timestamp: string
  takenBy: string
  description: string
}

const photos: Photo[] = [
  {
    id: "foto-1",
    label: "Unidad exterior - Vista frontal",
    category: "antes",
    timestamp: "09:30",
    takenBy: "Luis Hernandez",
    description: "Estado de la unidad exterior antes de iniciar la reparacion.",
  },
  {
    id: "foto-2",
    label: "Panel de control - Codigo de error",
    category: "evidencia",
    timestamp: "09:35",
    takenBy: "Luis Hernandez",
    description: "Pantalla mostrando codigo de error E3: falla en sensor de temperatura.",
  },
  {
    id: "foto-3",
    label: "Capacitor danado",
    category: "evidencia",
    timestamp: "09:50",
    takenBy: "Luis Hernandez",
    description: "Capacitor de arranque con deformacion visible, reemplazo necesario.",
  },
  {
    id: "foto-4",
    label: "Filtros sucios extraidos",
    category: "durante",
    timestamp: "10:15",
    takenBy: "Luis Hernandez",
    description: "Filtros HEPA con acumulacion excesiva de polvo. 8 meses sin cambio.",
  },
  {
    id: "foto-5",
    label: "Instalacion de filtros nuevos",
    category: "durante",
    timestamp: "10:30",
    takenBy: "Luis Hernandez",
    description: "Colocacion de filtros HEPA nuevos modelo 20x25.",
  },
  {
    id: "foto-6",
    label: "Capacitor nuevo instalado",
    category: "durante",
    timestamp: "10:45",
    takenBy: "Ana Torres",
    description: "Capacitor 35/5 MFD nuevo correctamente conectado y asegurado.",
  },
  {
    id: "foto-7",
    label: "Verificacion de cableado",
    category: "durante",
    timestamp: "11:00",
    takenBy: "Ana Torres",
    description: "Revision del cableado del compresor. Conexiones en buen estado.",
  },
  {
    id: "foto-8",
    label: "Lectura de temperatura final",
    category: "despues",
    timestamp: "11:20",
    takenBy: "Luis Hernandez",
    description: "Termometro mostrando 22C, coincidente con el termostato. Sistema calibrado.",
  },
]

const categoryConfig: Record<string, { label: string; className: string }> = {
  antes: { label: "Antes", className: "bg-amber-50 text-amber-700 border-amber-200" },
  durante: { label: "Durante", className: "bg-blue-50 text-blue-700 border-blue-200" },
  despues: { label: "Despues", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  evidencia: { label: "Evidencia", className: "bg-red-50 text-red-700 border-red-200" },
}

const bgColors = [
  "bg-slate-200",
  "bg-zinc-300",
  "bg-stone-200",
  "bg-gray-200",
  "bg-slate-300",
  "bg-zinc-200",
  "bg-stone-300",
  "bg-gray-300",
]

export function TabPhotos() {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [filter, setFilter] = useState<string>("todas")

  const filtered = filter === "todas" ? photos : photos.filter((p) => p.category === filter)

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "todas" ? "default" : "outline"}
            size="sm"
            className={`text-xs ${filter === "todas" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setFilter("todas")}
          >
            Todas ({photos.length})
          </Button>
          {Object.entries(categoryConfig).map(([key, cfg]) => {
            const count = photos.filter((p) => p.category === key).length
            return (
              <Button
                key={key}
                variant={filter === key ? "default" : "outline"}
                size="sm"
                className={`text-xs ${filter === key ? "bg-primary text-primary-foreground" : ""}`}
                onClick={() => setFilter(key)}
              >
                {cfg.label} ({count})
              </Button>
            )
          })}
        </div>

        <Button size="sm" className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
          <Upload className="h-3.5 w-3.5" />
          Subir Foto
        </Button>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((photo, i) => {
          const cat = categoryConfig[photo.category]
          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => setSelectedPhoto(photo)}
              className="group relative overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:shadow-md hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* Image placeholder */}
              <div className={`relative aspect-[4/3] ${bgColors[i % bgColors.length]} flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-2 text-muted-foreground/40">
                  <Camera className="h-8 w-8" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Foto {i + 1}</span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 group-hover:bg-foreground/40 transition-colors">
                  <ZoomIn className="h-6 w-6 text-card opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Category badge */}
                <Badge
                  variant="outline"
                  className={`absolute left-2 top-2 text-[9px] backdrop-blur-sm ${cat.className}`}
                >
                  {cat.label}
                </Badge>
              </div>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs font-semibold text-foreground truncate">{photo.label}</p>
                <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {photo.timestamp}
                  </span>
                  <span className="truncate">{photo.takenBy}</span>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 backdrop-blur-sm"
          role="dialog"
          aria-label={`Vista ampliada: ${selectedPhoto.label}`}
        >
          <div className="relative mx-4 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <ImageIcon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-semibold text-foreground truncate">{selectedPhoto.label}</span>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${categoryConfig[selectedPhoto.category].className}`}>
                  {categoryConfig[selectedPhoto.category].label}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Descargar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Cerrar</span>
                </Button>
              </div>
            </div>

            {/* Image area */}
            <div className="flex flex-1 items-center justify-center bg-secondary p-8">
              <div className="flex h-64 w-full items-center justify-center rounded-xl bg-muted">
                <div className="flex flex-col items-center gap-3 text-muted-foreground/50">
                  <Camera className="h-12 w-12" />
                  <span className="text-sm font-medium">Vista ampliada</span>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="border-t border-border px-5 py-3">
              <p className="text-sm text-foreground mb-1">{selectedPhoto.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {selectedPhoto.timestamp}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {selectedPhoto.takenBy}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
