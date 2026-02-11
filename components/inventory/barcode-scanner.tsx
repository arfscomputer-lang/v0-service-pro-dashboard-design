"use client"

import React from "react"
import { BarcodeDetector } from "barcode-detector"; // Import BarcodeDetector

import { useState, useRef, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, X, ScanBarcode, Keyboard } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onScan: (code: string) => void
}

export function BarcodeScanner({ open, onOpenChange, onScan }: Props) {
  const [mode, setMode] = useState<"camera" | "manual">("manual")
  const [manualCode, setManualCode] = useState("")
  const [cameraError, setCameraError] = useState("")
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop()
      }
      streamRef.current = null
    }
    setScanning(false)
  }, [])

  const startCamera = useCallback(async () => {
    setCameraError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setScanning(true)
      }
    } catch {
      setCameraError("No se pudo acceder a la camara. Usa el modo manual.")
      setMode("manual")
    }
  }, [])

  // Start/stop camera when mode changes
  useEffect(() => {
    if (open && mode === "camera") {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [open, mode, startCamera, stopCamera])

  // Simple barcode detection using BarcodeDetector API (available in Chrome/Edge)
  useEffect(() => {
    if (!scanning || !videoRef.current) return

    let running = true

    // Check if BarcodeDetector is available
    if (!BarcodeDetector) { // Use BarcodeDetector from import
      // Fallback: no native barcode detection, user can pause and type
      return
    }

    const detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "code_128", "code_39", "qr_code"] })

    const interval = setInterval(async () => {
      if (!running || !videoRef.current) return
      try {
        const barcodes = await detector.detect(videoRef.current)
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue
          if (code) {
            onScan(code)
            onOpenChange(false)
          }
        }
      } catch {
        // ignore detection errors
      }
    }, 300)

    return () => {
      running = false
      clearInterval(interval)
    }
  }, [scanning, onScan, onOpenChange])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualCode.trim()) {
      onScan(manualCode.trim())
      setManualCode("")
      onOpenChange(false)
    }
  }

  // Reset on close
  useEffect(() => {
    if (!open) {
      setManualCode("")
      setCameraError("")
      setMode("manual")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Escanear Codigo de Barras</DialogTitle>

        {/* Mode tabs */}
        <div className="flex border-b border-border">
          <button
            type="button"
            onClick={() => setMode("manual")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2",
              mode === "manual"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Keyboard className="h-4 w-4" />
            Manual
          </button>
          <button
            type="button"
            onClick={() => setMode("camera")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2",
              mode === "camera"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <Camera className="h-4 w-4" />
            Camara
          </button>
        </div>

        <div className="p-6">
          {mode === "manual" ? (
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
              <div className="flex items-center justify-center py-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <ScanBarcode className="h-8 w-8 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Ingresa el codigo de barras o SKU del producto manualmente.
              </p>
              <Input
                autoFocus
                placeholder="Ej: 7501234560010 o FLT-HEPA-14x20"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="text-center font-mono text-base"
              />
              <Button type="submit" disabled={!manualCode.trim()} className="bg-primary text-primary-foreground">
                Buscar
              </Button>
            </form>
          ) : (
            <div className="flex flex-col gap-4">
              {cameraError ? (
                <div className="flex flex-col items-center gap-3 py-8">
                  <X className="h-10 w-10 text-destructive" />
                  <p className="text-sm text-destructive text-center">{cameraError}</p>
                </div>
              ) : (
                <>
                  <div className="relative rounded-lg overflow-hidden bg-foreground/5 aspect-[4/3]">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    {/* Scan overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-3/4 h-1/3 border-2 border-primary rounded-lg relative">
                        <div className="absolute top-0 left-0 w-6 h-6 border-t-[3px] border-l-[3px] border-primary rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-6 h-6 border-t-[3px] border-r-[3px] border-primary rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-[3px] border-l-[3px] border-primary rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-[3px] border-r-[3px] border-primary rounded-br-lg" />
                        {/* Animated scan line */}
                        <div className="absolute left-2 right-2 h-0.5 bg-primary/80 animate-pulse top-1/2" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Apunta la camara al codigo de barras del producto. La deteccion es automatica.
                  </p>
                </>
              )}
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </DialogContent>
    </Dialog>
  )
}
