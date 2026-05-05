"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MobileHeader } from "@/components/technician/mobile-header"
import { BottomTabs } from "@/components/technician/bottom-tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScanLine, RefreshCw, CheckCircle, MapPin, Tag, Calendar, Cpu, Wrench } from "lucide-react"

interface ScannedAsset {
  id?: string
  asset_id?: string
  name?: string
  type?: string
  category?: string
  serial_number?: string
  brand?: string
  model?: string
  department?: string
  site_location?: string
  status?: string
  customer?: string
  lastService?: {
    last_technician_name?: string
    last_service_type?: string
    last_service_description?: string
    last_technician_notes?: string
    last_service_date?: string
  } | null
}

export default function EscanearPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animFrameRef = useRef<number>(0)
  const detectorRef = useRef<any>(null)

  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScannedAsset | null>(null)
  const [rawValue, setRawValue] = useState<string | null>(null)

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }, [])

  const handleDetected = useCallback(async (value: string) => {
    stopCamera()
    setRawValue(value)
    let parsed: ScannedAsset | null = null
    try {
      parsed = JSON.parse(value)
    } catch {
      setResult(null)
      return
    }
    setResult(parsed)
    // Fetch fresh data from API (includes lastService)
    const lookupId = parsed?.id ?? parsed?.asset_id
    if (lookupId) {
      try {
        const res = await fetch(`/api/assets/${lookupId}`)
        if (res.ok) {
          const fresh: ScannedAsset = await res.json()
          setResult(fresh)
        }
      } catch {
        // Keep QR data if API fails
      }
    }
  }, [stopCamera])

  const scanLoop = useCallback(async () => {
    if (!videoRef.current || !detectorRef.current) return
    const video = videoRef.current
    if (video.readyState >= 2) {
      try {
        const codes = await detectorRef.current.detect(video)
        if (codes.length > 0) {
          handleDetected(codes[0].rawValue)
          return
        }
      } catch {
        // ignore frame errors
      }
    }
    animFrameRef.current = requestAnimationFrame(scanLoop)
  }, [handleDetected])

  const startScanner = useCallback(async () => {
    setError(null)
    setResult(null)
    setRawValue(null)

    // Build detector
    if (!detectorRef.current) {
      try {
        if ("BarcodeDetector" in window) {
          detectorRef.current = new (window as any).BarcodeDetector({ formats: ["qr_code"] })
        } else {
          const { BarcodeDetector: Polyfill } = await import("barcode-detector/pure")
          detectorRef.current = new Polyfill({ formats: ["qr_code"] })
        }
      } catch {
        setError("Tu dispositivo no soporta el lector de QR.")
        return
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanning(true)
      animFrameRef.current = requestAnimationFrame(scanLoop)
    } catch {
      setError("No se pudo acceder a la cámara. Verifica los permisos.")
    }
  }, [scanLoop])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const reset = () => {
    setResult(null)
    setRawValue(null)
    setError(null)
    startScanner()
  }

  const statusColor: Record<string, string> = {
    activo: "bg-green-100 text-green-700",
    inactivo: "bg-gray-100 text-gray-600",
    mantenimiento: "bg-yellow-100 text-yellow-700",
    baja: "bg-red-100 text-red-700",
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      <MobileHeader title="Escanear QR" />

      <main className="flex-1 flex flex-col gap-4 p-4">
        {/* Camera / result area */}
        {!result ? (
          <div className="flex flex-col items-center gap-4">
            {/* Viewfinder */}
            <div className="relative w-full max-w-sm aspect-square rounded-2xl overflow-hidden bg-black shadow-xl">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
              {/* Corner markers */}
              {scanning && (
                <>
                  <span className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
                  <span className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
                  <span className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
                  <span className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
                  {/* Scan line animation */}
                  <span className="absolute inset-x-6 h-0.5 bg-primary/80 animate-scan" style={{ top: "50%" }} />
                </>
              )}
              {!scanning && !error && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ScanLine className="w-16 h-16 text-white/40" />
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center px-4">{error}</p>
            )}

            {!scanning ? (
              <Button onClick={startScanner} size="lg" className="w-full max-w-sm">
                <ScanLine className="mr-2 h-5 w-5" />
                Iniciar Escáner
              </Button>
            ) : (
              <Button variant="outline" onClick={stopCamera} size="lg" className="w-full max-w-sm">
                Detener
              </Button>
            )}

            <p className="text-xs text-muted-foreground text-center max-w-xs">
              Apunta la cámara al código QR del sticker del activo para ver su información.
            </p>
          </div>
        ) : (
          /* Result card */
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
              <CheckCircle className="h-5 w-5" />
              Activo identificado
            </div>

            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base leading-tight">{result.name ?? "Sin nombre"}</CardTitle>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {result.status && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[result.status] ?? "bg-muted text-muted-foreground"}`}>
                      {result.status}
                    </span>
                  )}
                  {result.type && (
                    <Badge variant="outline" className="text-xs">{result.type}</Badge>
                  )}
                  {result.category && (
                    <Badge variant="outline" className="text-xs">{result.category}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                {result.asset_id && (
                  <Row icon={<Tag className="h-4 w-4 text-muted-foreground" />} label="ID" value={result.asset_id} />
                )}
                {result.serial_number && (
                  <Row icon={<Cpu className="h-4 w-4 text-muted-foreground" />} label="Serie" value={result.serial_number} />
                )}
                {(result.brand || result.model) && (
                  <Row icon={<Cpu className="h-4 w-4 text-muted-foreground" />} label="Marca / Modelo" value={[result.brand, result.model].filter(Boolean).join(" — ")} />
                )}
                {result.department && (
                  <Row icon={<MapPin className="h-4 w-4 text-muted-foreground" />} label="Área" value={result.department} />
                )}
                {result.site_location && (
                  <Row icon={<MapPin className="h-4 w-4 text-muted-foreground" />} label="Ubicación" value={result.site_location} />
                )}
                {result.customer && (
                  <Row icon={<Calendar className="h-4 w-4 text-muted-foreground" />} label="Cliente" value={result.customer} />
                )}
              </CardContent>
            </Card>

            {/* Último servicio */}
            {result.lastService ? (
              <Card className="border-blue-200 bg-blue-50 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-blue-700 flex items-center gap-2">
                    <Wrench className="h-4 w-4" />
                    Último servicio registrado
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <Row icon={<Wrench className="h-4 w-4 text-blue-400" />} label="Técnico" value={result.lastService.last_technician_name ?? 'Sin asignar'} />
                  <Row icon={<Tag className="h-4 w-4 text-blue-400" />} label="Tarea" value={result.lastService.last_service_description ?? result.lastService.last_service_type ?? '—'} />
                  {result.lastService.last_technician_notes && (
                    <Row icon={<Tag className="h-4 w-4 text-blue-400" />} label="Notas" value={result.lastService.last_technician_notes} />
                  )}
                  {result.lastService.last_service_date && (
                    <Row icon={<Calendar className="h-4 w-4 text-blue-400" />} label="Fecha" value={new Date(result.lastService.last_service_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })} />
                  )}
                </CardContent>
              </Card>
            ) : result.lastService === null ? (
              <Card className="bg-muted/40 shadow-sm">
                <CardContent className="py-3 text-xs text-muted-foreground text-center">
                  Sin servicios completados aún
                </CardContent>
              </Card>
            ) : null}

            <Button variant="outline" onClick={reset} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Escanear otro
            </Button>

            {rawValue && !result.name && (
              <Card className="bg-muted/50">
                <CardContent className="py-3 text-xs text-muted-foreground break-all">
                  {rawValue}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      <BottomTabs />
    </div>
  )
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{value}</span>
      </div>
    </div>
  )
}
