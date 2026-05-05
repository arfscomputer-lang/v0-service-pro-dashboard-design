"use client"

import { useState, useEffect } from "react"
import { MobileHeader } from "@/components/technician/mobile-header"
import { BottomTabs } from "@/components/technician/bottom-tabs"
import { Badge } from "@/components/ui/badge"
import { Loader2, User, Mail, Phone, MapPin, Wrench, Award, Star, Calendar } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"
import { cn } from "@/lib/utils"

export default function PerfilPage() {
  const { user } = useAuth()
  const [tech, setTech] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.email) { setLoading(false); return }
    fetch(`/api/technicians?q=${encodeURIComponent(user.email)}`)
      .then((r) => r.json())
      .then((json) => {
        const list: any[] = json.data || []
        const match = list.find((t) => t.email === user.email)
        setTech(match || null)
      })
      .catch(() => setTech(null))
      .finally(() => setLoading(false))
  }, [user?.email])

  const initials = user?.name
    ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
    : "??"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileHeader />

      <div className="flex-1 pb-24">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Cargando perfil...</span>
          </div>
        ) : (
          <div className="px-4 pt-6 space-y-4">
            {/* Avatar + nombre */}
            <div className="flex flex-col items-center gap-3 pb-4 border-b border-border">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold shadow-lg">
                {initials}
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-foreground">{user?.name}</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {tech?.role || "Técnico"}
                </p>
                {tech?.status && (
                  <Badge variant="outline" className={cn("mt-2 text-xs",
                    tech.status === "disponible" ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                      : "bg-muted text-muted-foreground")}>
                    {tech.status}
                  </Badge>
                )}
              </div>
            </div>

            {/* Info de contacto */}
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <h2 className="text-sm font-semibold text-foreground">Información de Contacto</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 shrink-0" />{user?.email}
                </div>
                {tech?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" />{tech.phone}
                  </div>
                )}
                {tech?.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />{tech.address}
                  </div>
                )}
                {tech?.join_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 shrink-0" />
                    Desde {new Date(tech.join_date).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                  </div>
                )}
              </div>
            </div>

            {/* Estadísticas */}
            {tech && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Completadas", value: tech.total_jobs ?? "—", icon: Wrench, color: "text-primary" },
                  { label: "Rating", value: tech.avg_rating ? `${Number(tech.avg_rating).toFixed(1)} ★` : "N/A", icon: Star, color: "text-amber-500" },
                  { label: "Resp. promedio", value: tech.avg_response_min ? `${tech.avg_response_min} min` : "N/A", icon: Calendar, color: "text-emerald-600" },
                ].map((s) => (
                  <div key={s.label} className="bg-card border border-border rounded-xl p-3 flex flex-col items-center gap-1">
                    <s.icon className={cn("h-5 w-5", s.color)} />
                    <p className="text-base font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground text-center">{s.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Capacidades técnicas */}
            {tech?.specialties && tech.specialties.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">Capacidades Técnicas</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tech.specialties.map((s: string) => (
                    <Badge key={s} variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Titulaciones y certificaciones */}
            {tech?.certifications && tech.certifications.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Award className="h-4 w-4 text-amber-500" />
                  <h2 className="text-sm font-semibold text-foreground">Titulaciones y Certificaciones</h2>
                </div>
                <div className="space-y-3">
                  {tech.certifications.map((cert: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
                        <Award className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{cert.name}</p>
                        {cert.issuer && <p className="text-xs text-muted-foreground">{cert.issuer}</p>}
                        {(cert.date || cert.expires) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {cert.date && `Emitido: ${cert.date}`}
                            {cert.expires && ` · Vence: ${cert.expires}`}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Si no hay datos del técnico en la tabla */}
            {!tech && !loading && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-center">
                <User className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">Perfil técnico no encontrado</p>
                <p className="text-xs mt-1 opacity-60">Pedile al administrador que complete tu perfil técnico</p>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomTabs />
    </div>
  )
}
