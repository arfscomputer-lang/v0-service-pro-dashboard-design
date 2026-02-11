"use client"

import React, { useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  MapPin,
  Navigation,
  ExternalLink,
  Pencil,
  Check,
  X,
  Loader2,
  Copy,
  LocateFixed,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EditableGeoMapProps {
  lat: number | null
  lng: number | null
  address: string
  city: string
  onSave: (lat: number | null, lng: number | null) => void
}

export function EditableGeoMap({ lat, lng, address, city, onSave }: EditableGeoMapProps) {
  const [editing, setEditing] = useState(false)
  const [draftLat, setDraftLat] = useState(lat?.toString() ?? "")
  const [draftLng, setDraftLng] = useState(lng?.toString() ?? "")
  const [locating, setLocating] = useState(false)
  const [copied, setCopied] = useState(false)

  const hasCoords = lat != null && lng != null

  const startEdit = () => {
    setDraftLat(lat?.toString() ?? "")
    setDraftLng(lng?.toString() ?? "")
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
  }

  const saveEdit = () => {
    const parsedLat = draftLat.trim() ? Number.parseFloat(draftLat) : null
    const parsedLng = draftLng.trim() ? Number.parseFloat(draftLng) : null

    if (parsedLat != null && (Number.isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90)) return
    if (parsedLng != null && (Number.isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180)) return

    onSave(parsedLat, parsedLng)
    setEditing(false)
  }

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = Number(pos.coords.latitude.toFixed(6))
        const newLng = Number(pos.coords.longitude.toFixed(6))
        setDraftLat(newLat.toString())
        setDraftLng(newLng.toString())
        // If not in edit mode, save directly
        if (!editing) {
          onSave(newLat, newLng)
        }
        setLocating(false)
      },
      () => {
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }, [editing, onSave])

  const copyCoords = useCallback(() => {
    if (!hasCoords) return
    navigator.clipboard.writeText(`${lat}, ${lng}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [lat, lng, hasCoords])

  const mapsUrl = hasCoords
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : `https://www.google.com/maps/search/${encodeURIComponent(address + ", " + city)}`

  const osmEmbedUrl = hasCoords
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng! - 0.006},${lat! - 0.004},${lng! + 0.006},${lat! + 0.004}&layer=mapnik&marker=${lat},${lng}`
    : null

  return (
    <Card className="border border-border shadow-sm overflow-hidden">
      {/* Map preview */}
      <div className="h-[200px] relative bg-muted">
        {osmEmbedUrl ? (
          <iframe
            title="Ubicacion del cliente"
            src={osmEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-muted to-secondary relative">
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 19px, currentColor 19px, currentColor 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, currentColor 19px, currentColor 20px)",
              }}
            />
            <MapPin className="h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground font-medium">Sin coordenadas registradas</p>
          </div>
        )}

        {/* Quick action buttons overlaying the map */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-card/90 text-foreground shadow-sm border border-border hover:bg-card transition-colors"
            title="Abrir en Google Maps"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            type="button"
            onClick={handleGeolocate}
            disabled={locating}
            className="flex h-8 w-8 items-center justify-center rounded-md bg-card/90 text-foreground shadow-sm border border-border hover:bg-card transition-colors disabled:opacity-50"
            title="Obtener mi ubicacion actual"
          >
            {locating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LocateFixed className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Address + Coordinates */}
      <CardContent className="p-3 gap-3 flex flex-col">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground leading-relaxed">{address}</p>
            <p className="text-xs text-muted-foreground">{city}</p>
          </div>
        </div>

        {/* Coordinates display / editor */}
        {!editing ? (
          <div className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              {hasCoords ? (
                <button
                  type="button"
                  onClick={copyCoords}
                  className="text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                  title="Copiar coordenadas"
                >
                  {lat?.toFixed(6)}, {lng?.toFixed(6)}
                  {copied ? (
                    <Check className="h-3 w-3 text-success" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-40" />
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-muted-foreground italic">Sin coordenadas</span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
              onClick={startEdit}
            >
              <Pencil className="h-3 w-3" /> Editar
            </Button>
          </div>
        ) : (
          <div className="gap-2 flex flex-col rounded-lg border border-border p-3 bg-muted/30">
            <div className="flex items-center gap-2">
              <Navigation className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground">Editar Coordenadas</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] text-muted-foreground">Latitud</Label>
                <Input
                  type="number"
                  step="0.000001"
                  min={-90}
                  max={90}
                  value={draftLat}
                  onChange={(e) => setDraftLat(e.target.value)}
                  placeholder="19.4326"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-[10px] text-muted-foreground">Longitud</Label>
                <Input
                  type="number"
                  step="0.000001"
                  min={-180}
                  max={180}
                  value={draftLng}
                  onChange={(e) => setDraftLng(e.target.value)}
                  placeholder="-99.1332"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs gap-1 flex-1 text-muted-foreground"
                onClick={handleGeolocate}
                disabled={locating}
              >
                {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <LocateFixed className="h-3 w-3" />}
                Usar mi GPS
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={cancelEdit}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                className="h-7 px-3 text-xs gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={saveEdit}
              >
                <Check className="h-3 w-3" /> Guardar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
