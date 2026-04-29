"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Database, Wifi, WifiOff, RefreshCw, Server, Table2, Users, Clock, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface DbStatus {
  connected: boolean
  latency?: number
  database?: string
  db_user?: string
  version?: string
  table_count?: number
  active_connections?: number
  host?: string
  error?: string
}

export default function BaseDatosPage() {
  const [status, setStatus] = useState<DbStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkStatus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/db/status")
      const data = await res.json()
      setStatus(data)
      setLastChecked(new Date())
    } catch {
      setStatus({ connected: false, error: "No se pudo conectar al servidor" })
      setLastChecked(new Date())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { checkStatus() }, [checkStatus])

  const latencyColor = (ms?: number) => {
    if (!ms) return "text-muted-foreground"
    if (ms < 100) return "text-emerald-600"
    if (ms < 300) return "text-amber-600"
    return "text-destructive"
  }

  const latencyLabel = (ms?: number) => {
    if (!ms) return "—"
    if (ms < 100) return "Excelente"
    if (ms < 300) return "Normal"
    return "Lento"
  }

  return (
    <main className="overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Base de Datos</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Estado de conexión y métricas de la base de datos
            </p>
          </div>
          <Button variant="outline" onClick={checkStatus} disabled={loading} className="gap-2">
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Verificar
          </Button>
        </div>

        {/* Connection Status Card */}
        <Card className={cn(
          "border-2 transition-colors",
          loading ? "border-border" :
          status?.connected ? "border-emerald-500/40 bg-emerald-500/5" : "border-destructive/40 bg-destructive/5"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                loading ? "bg-muted" :
                status?.connected ? "bg-emerald-500/15" : "bg-destructive/15"
              )}>
                {loading ? (
                  <Database className="h-7 w-7 text-muted-foreground animate-pulse" />
                ) : status?.connected ? (
                  <Wifi className="h-7 w-7 text-emerald-600" />
                ) : (
                  <WifiOff className="h-7 w-7 text-destructive" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-bold text-foreground">
                    {loading ? "Verificando..." : status?.connected ? "Conectado" : "Sin conexión"}
                  </h2>
                  {!loading && (
                    <Badge variant="outline" className={cn("text-[11px]",
                      status?.connected
                        ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                        : "bg-destructive/10 text-destructive border-destructive/20"
                    )}>
                      {status?.connected ? "Online" : "Offline"}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {loading ? "Estableciendo conexión con Neon PostgreSQL..." :
                   status?.connected ? `Neon PostgreSQL · ${status.host ?? ""}` :
                   status?.error ?? "Error de conexión"}
                </p>
                {lastChecked && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Última verificación: {lastChecked.toLocaleTimeString("es-ES")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
        {status?.connected && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Latencia</p>
                </div>
                <p className={cn("text-2xl font-bold", latencyColor(status.latency))}>
                  {status.latency}ms
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{latencyLabel(status.latency)}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Table2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tablas</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{status.table_count ?? "—"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">en schema public</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conexiones</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{status.active_connections ?? "—"}</p>
                <p className="text-xs text-muted-foreground mt-0.5">activas ahora</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estado</p>
                </div>
                <p className="text-2xl font-bold text-emerald-600">OK</p>
                <p className="text-xs text-muted-foreground mt-0.5">sin errores</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* DB Details */}
        {status?.connected && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Server className="h-4 w-4" />
                Detalles del Servidor
              </CardTitle>
              <CardDescription>Información de la instancia Neon PostgreSQL</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-border">
                {[
                  { label: "Base de datos", value: status.database },
                  { label: "Usuario", value: status.db_user },
                  { label: "Versión", value: status.version },
                  { label: "Host", value: status.host },
                  { label: "Proveedor", value: "Neon Serverless PostgreSQL" },
                  { label: "Región", value: "US East (AWS)" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5">
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium text-foreground font-mono">{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
