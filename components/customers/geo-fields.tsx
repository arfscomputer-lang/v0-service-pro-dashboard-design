"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LocateFixed, Loader2 } from "lucide-react"

interface GeoFieldsProps {
  lat: number | null
  lng: number | null
  onChangeLat: (v: number | null) => void
  onChangeLng: (v: number | null) => void
}

export function GeoFields({ lat, lng, onChangeLat, onChangeLng }: GeoFieldsProps) {
  const [locating, setLocating] = useState(false)

  const handleGps = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChangeLat(Number(pos.coords.latitude.toFixed(6)))
        onChangeLng(Number(pos.coords.longitude.toFixed(6)))
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000 }
    )
  }

  return (
    <div className="gap-2 flex flex-col">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-muted-foreground">Geolocalizacion</Label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
          onClick={handleGps}
          disabled={locating}
        >
          {locating ? <Loader2 className="h-3 w-3 animate-spin" /> : <LocateFixed className="h-3 w-3" />}
          Usar mi GPS
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-[10px] text-muted-foreground">Latitud</Label>
          <Input
            type="number"
            step="0.000001"
            min={-90}
            max={90}
            value={lat ?? ""}
            onChange={(e) => onChangeLat(e.target.value === "" ? null : Number(e.target.value))}
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
            value={lng ?? ""}
            onChange={(e) => onChangeLng(e.target.value === "" ? null : Number(e.target.value))}
            placeholder="-99.1332"
            className="h-8 text-xs font-mono"
          />
        </div>
      </div>
    </div>
  )
}
