"use client"

import React, { use, useState, useCallback, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { CustomerFormDialog } from "@/components/customers/customer-form-dialog"
import { EditableGeoMap } from "@/components/customers/editable-geo-map"
import { useCustomers } from "@/lib/context/customers-context"
import type { Customer, InteractionType, InteractionDirection, CustomerTag } from "@/lib/data/customers"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Star,
  PhoneIncoming,
  PhoneOutgoing,
  MailOpen,
  Send,
  MapPinned,
  StickyNote,
  ExternalLink,
  TrendingUp,
  DollarSign,
  ClipboardList,
  Users,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ── Helpers ──────────────────────────────────────────────

const tagColors: Record<CustomerTag, string> = {
  VIP: "bg-amber-100 text-amber-700 border-amber-300",
  nuevo: "bg-sky-100 text-sky-700 border-sky-300",
  frecuente: "bg-emerald-100 text-emerald-700 border-emerald-300",
  moroso: "bg-red-100 text-red-700 border-red-300",
  corporativo: "bg-indigo-100 text-indigo-700 border-indigo-300",
}

const typeLabels: Record<string, string> = {
  residencial: "Residencial",
  comercial: "Comercial",
  industrial: "Industrial",
  gobierno: "Gobierno",
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n)
}

const interactionIcons: Record<InteractionType, { icon: typeof Phone; color: string }> = {
  llamada: { icon: Phone, color: "text-blue-600 bg-blue-50" },
  email: { icon: Mail, color: "text-amber-600 bg-amber-50" },
  visita: { icon: MapPinned, color: "text-emerald-600 bg-emerald-50" },
  nota: { icon: StickyNote, color: "text-slate-600 bg-slate-50" },
}

const tabs = [
  { id: "perfil", label: "Perfil" },
  { id: "interacciones", label: "Interacciones" },
  { id: "servicios", label: "Historial de Servicios" },
  { id: "campanas", label: "Campanas CRM" },
] as const

type TabId = typeof tabs[number]["id"]

// ── Page ─────────────────────────────────────────────────

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { getCustomer, updateCustomer, deleteCustomer, addInteraction, deleteInteraction, addTag, removeTag, autoVip } = useCustomers()

  const customer = getCustomer(id)
  const [activeTab, setActiveTab] = useState<TabId>("perfil")
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [interactionOpen, setInteractionOpen] = useState(false)

  // Interaction form
  const [intType, setIntType] = useState<InteractionType>("llamada")
  const [intDir, setIntDir] = useState<InteractionDirection>("entrante")
  const [intSummary, setIntSummary] = useState("")
  const [intAgent, setIntAgent] = useState("Carlos Rodriguez")

  if (!customer) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <SidebarNav />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopHeader />
          <main className="flex flex-1 flex-col items-center justify-center bg-content">
            <p className="text-muted-foreground">Cliente no encontrado.</p>
            <Link href="/clientes" className="text-primary text-sm mt-2 hover:underline">Volver al directorio</Link>
          </main>
        </div>
      </div>
    )
  }

  const c = {
    ...customer,
    tags: customer.tags || [],
    interactions: customer.interactions || [],
    services: customer.services || [],
    totalSpent: customer.totalSpent ?? 0,
    lifetimeValue: customer.lifetimeValue ?? 0,
    createdAt: customer.createdAt ?? "",
    preferredSchedule: customer.preferredSchedule ?? "",
    notes: customer.notes ?? "",
  }
  const completedServices = c.services.filter((s) => s.status === "completado").length
  const avgRating = c.services.filter((s) => s.rating != null).reduce((a, s) => a + (s.rating ?? 0), 0) / (c.services.filter((s) => s.rating != null).length || 1)

  const handleSaveInteraction = () => {
    if (!intSummary.trim()) return
    addInteraction(c.id, {
      type: intType,
      direction: intDir,
      date: new Date().toISOString().slice(0, 10),
      summary: intSummary.trim(),
      agent: intAgent,
    })
    setIntSummary("")
    setInteractionOpen(false)
    // Auto-VIP check after adding interaction
    autoVip(c.id)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />

        <main className="flex flex-1 flex-col overflow-hidden bg-content">
          {/* Back + Header */}
          <div className="px-6 py-4 bg-card border-b border-border">
            <Link href="/clientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
              <ArrowLeft className="h-4 w-4" /> Volver al directorio
            </Link>

            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14 shrink-0">
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {c.initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold text-foreground">{c.name}</h1>
                  <Badge variant="outline" className="text-xs">{typeLabels[c.type]}</Badge>
                  {(c.tags || []).map((tag) => (
                    <Badge key={tag} variant="outline" className={cn("text-[10px]", tagColors[tag])}>
                      {tag}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{c.id} &middot; Alta: {c.createdAt}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={() => setFormOpen(true)}>
                  <Pencil className="h-3.5 w-3.5" /> Editar
                </Button>
                <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive bg-transparent" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </Button>
              </div>
            </div>
          </div>

          {/* Content: Left tabs + Right sidebar */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left section */}
            <div className="flex flex-1 flex-col overflow-hidden">
              {/* Tab bar */}
              <div className="flex gap-1 px-6 pt-3 pb-0 bg-content" role="tablist">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={cn(
                      "px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border border-b-0",
                      activeTab === t.id
                        ? "bg-card text-foreground border-border"
                        : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:bg-card/50"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <ScrollArea className="flex-1 bg-card border-t border-border">
                <div className="p-6">
                  {/* ── Perfil ── */}
                  {activeTab === "perfil" && (
                    <div className="gap-6 flex flex-col">
                      {/* Contact info */}
                      <Card className="border border-border shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold">Informacion de Contacto</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                              <Mail className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Correo</p>
                              <a href={`mailto:${c.email}`} className="text-sm font-medium text-foreground hover:text-primary">{c.email}</a>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                              <Phone className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Telefono</p>
                              <a href={`tel:${c.phone}`} className="text-sm font-medium text-foreground hover:text-primary">{c.phone}</a>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                              <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Direccion</p>
                              <p className="text-sm font-medium text-foreground">{c.address}, {c.city}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                              <Clock className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Horario Preferido</p>
                              <p className="text-sm font-medium text-foreground">{c.preferredSchedule || "Sin preferencia"}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tags management */}
                      <Card className="border border-border shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold">Etiquetas de Segmentacion</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {(["VIP", "nuevo", "frecuente", "moroso", "corporativo"] as CustomerTag[]).map((tag) => {
                              const active = (c.tags || []).includes(tag)
                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  onClick={() => active ? removeTag(c.id, tag) : addTag(c.id, tag)}
                                  className={cn(
                                    "rounded-full px-3 py-1 text-xs font-medium border transition-colors",
                                    active ? tagColors[tag] : "bg-secondary text-muted-foreground border-border hover:bg-muted"
                                  )}
                                >
                                  {tag}
                                </button>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Notes */}
                      <Card className="border border-border shadow-sm">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm font-semibold">Notas Internas</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                            {c.notes || "Sin notas."}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* ── Interacciones ── */}
                  {activeTab === "interacciones" && (
                    <div className="gap-4 flex flex-col">
                      <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-foreground">Historial de Interacciones ({c.interactions.length})</h2>
                        <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setInteractionOpen(true)}>
                          <Plus className="h-4 w-4" /> Nueva Interaccion
                        </Button>
                      </div>

                      {c.interactions.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center">No hay interacciones registradas.</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {c.interactions.map((int) => {
                            const ic = interactionIcons[int.type]
                            const Icon = ic.icon
                            return (
                              <Card key={int.id} className="border border-border shadow-sm">
                                <CardContent className="p-4 flex items-start gap-3">
                                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", ic.color)}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <Badge variant="outline" className="text-[10px] capitalize">{int.type}</Badge>
                                      <Badge variant="outline" className="text-[10px]">
                                        {int.direction === "entrante" ? <PhoneIncoming className="h-2.5 w-2.5 mr-1" /> : <PhoneOutgoing className="h-2.5 w-2.5 mr-1" />}
                                        {int.direction}
                                      </Badge>
                                      <span className="text-[11px] text-muted-foreground">{int.date}</span>
                                    </div>
                                    <p className="text-sm text-foreground mt-1.5 leading-relaxed">{int.summary}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Agente: {int.agent}</p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                                    onClick={() => deleteInteraction(c.id, int.id)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Servicios ── */}
                  {activeTab === "servicios" && (
                    <div className="gap-4 flex flex-col">
                      <h2 className="text-sm font-semibold text-foreground">Historial de Servicios ({c.services.length})</h2>

                      {c.services.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-8 text-center">No hay servicios registrados.</p>
                      ) : (
                        <div className="rounded-lg border border-border overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                                <th className="text-left px-4 py-2.5 font-semibold">Orden</th>
                                <th className="text-left px-4 py-2.5 font-semibold">Fecha</th>
                                <th className="text-left px-4 py-2.5 font-semibold">Tipo</th>
                                <th className="text-left px-4 py-2.5 font-semibold">Tecnico</th>
                                <th className="text-left px-4 py-2.5 font-semibold">Estado</th>
                                <th className="text-right px-4 py-2.5 font-semibold">Calif.</th>
                                <th className="text-right px-4 py-2.5 font-semibold">Monto</th>
                              </tr>
                            </thead>
                            <tbody>
                              {c.services.map((s) => (
                                <tr key={s.orderId} className="border-t border-border hover:bg-muted/20">
                                  <td className="px-4 py-3">
                                    <Link href={`/orden/${s.orderId}`} className="text-primary font-medium hover:underline">
                                      {s.orderId}
                                    </Link>
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground">{s.date}</td>
                                  <td className="px-4 py-3">{s.type}</td>
                                  <td className="px-4 py-3 text-muted-foreground">{s.technicianName}</td>
                                  <td className="px-4 py-3">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[10px]",
                                        s.status === "completado" ? "bg-emerald-50 text-emerald-700 border-emerald-300" :
                                        s.status === "pendiente" ? "bg-amber-50 text-amber-700 border-amber-300" :
                                        "bg-red-50 text-red-700 border-red-300"
                                      )}
                                    >
                                      {s.status}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {s.rating != null ? (
                                      <span className="flex items-center justify-end gap-1">
                                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" /> {s.rating}
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">--</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-right font-medium">{s.amount > 0 ? formatCurrency(s.amount) : "--"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Campanas CRM ── */}
                  {activeTab === "campanas" && (
                    <div className="gap-5 flex flex-col">
                      <h2 className="text-sm font-semibold text-foreground">Automatizaciones y Campanas</h2>

                      <Card className="border border-border shadow-sm">
                        <CardContent className="p-5 gap-4 flex flex-col">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                              <Bell className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">Recordatorio Mto. Preventivo</p>
                              <p className="text-xs text-muted-foreground">Se envia email automatico cada 6 meses desde la ultima visita.</p>
                            </div>
                            <Badge variant="outline" className="ml-auto bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">Activo</Badge>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
                              <Send className="h-5 w-5 text-sky-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">Encuesta de Satisfaccion</p>
                              <p className="text-xs text-muted-foreground">Envio automatico post-servicio para medir NPS.</p>
                            </div>
                            <Badge variant="outline" className="ml-auto bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">Activo</Badge>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                              <DollarSign className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">Recordatorio de Pago</p>
                              <p className="text-xs text-muted-foreground">Notificacion automatica a los 15, 30 y 45 dias de factura pendiente.</p>
                            </div>
                            <Badge variant="outline" className={cn("ml-auto text-[10px]", (c.tags || []).includes("moroso") ? "bg-red-50 text-red-700 border-red-300" : "bg-muted text-muted-foreground border-border")}>
                              {(c.tags || []).includes("moroso") ? "Activo" : "Inactivo"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                              <TrendingUp className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground">Auto-Promocion VIP</p>
                              <p className="text-xs text-muted-foreground">Marca como VIP automaticamente despues de 3 servicios completados.</p>
                            </div>
                            <Badge variant="outline" className={cn("ml-auto text-[10px]", completedServices >= 3 ? "bg-amber-50 text-amber-700 border-amber-300" : "bg-muted text-muted-foreground border-border")}>
                              {completedServices >= 3 ? `Aplicado (${completedServices} servicios)` : `${completedServices}/3 servicios`}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Right sidebar */}
            <aside className="hidden lg:flex w-[320px] flex-col border-l border-border bg-card overflow-y-auto">
              <div className="p-5 gap-5 flex flex-col">
                {/* KPI cards */}
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Metricas del Cliente</h3>

                <div className="grid grid-cols-2 gap-3">
                  <Card className="border border-border shadow-sm">
                    <CardContent className="p-3 flex flex-col items-center text-center">
                      <DollarSign className="h-5 w-5 text-emerald-600 mb-1" />
                      <p className="text-lg font-bold text-foreground">{formatCurrency(c.totalSpent)}</p>
                      <p className="text-[10px] text-muted-foreground">Total Gastado</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border shadow-sm">
                    <CardContent className="p-3 flex flex-col items-center text-center">
                      <TrendingUp className="h-5 w-5 text-primary mb-1" />
                      <p className="text-lg font-bold text-foreground">{formatCurrency(c.lifetimeValue)}</p>
                      <p className="text-[10px] text-muted-foreground">Valor CLV</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border shadow-sm">
                    <CardContent className="p-3 flex flex-col items-center text-center">
                      <ClipboardList className="h-5 w-5 text-amber-600 mb-1" />
                      <p className="text-lg font-bold text-foreground">{c.services.length}</p>
                      <p className="text-[10px] text-muted-foreground">Servicios</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-border shadow-sm">
                    <CardContent className="p-3 flex flex-col items-center text-center">
                      <Star className="h-5 w-5 text-amber-500 mb-1" />
                      <p className="text-lg font-bold text-foreground">{c.nps != null ? c.nps : "--"}</p>
                      <p className="text-[10px] text-muted-foreground">NPS</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Satisfaction */}
                <Card className="border border-border shadow-sm">
                  <CardContent className="p-4">
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2">Satisfaccion Promedio</h4>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={cn(
                            "h-5 w-5",
                            s <= Math.round(avgRating) ? "text-amber-500 fill-amber-500" : "text-muted-foreground/30"
                          )}
                        />
                      ))}
                      <span className="text-sm font-semibold text-foreground ml-1">{avgRating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Basado en {c.services.filter((s) => s.rating != null).length} calificaciones</p>
                  </CardContent>
                </Card>

                {/* Editable Geolocation Map */}
                <EditableGeoMap
                  lat={c.lat}
                  lng={c.lng}
                  address={c.address}
                  city={c.city}
                  onSave={(newLat, newLng) => updateCustomer(c.id, { lat: newLat, lng: newLng })}
                />

                {/* Quick actions */}
                <div className="gap-2 flex flex-col">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Acciones Rapidas</h3>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground bg-transparent" asChild>
                    <Link href={`/ordenes?cliente=${c.id}`}>
                      <ClipboardList className="h-4 w-4" /> Crear Orden de Trabajo
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground bg-transparent" onClick={() => setInteractionOpen(true)}>
                    <Plus className="h-4 w-4" /> Registrar Interaccion
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground bg-transparent" asChild>
                    <a href={`mailto:${c.email}`}>
                      <MailOpen className="h-4 w-4" /> Enviar Correo
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground bg-transparent" asChild>
                    <a href={`tel:${c.phone}`}>
                      <Phone className="h-4 w-4" /> Llamar
                    </a>
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Edit dialog */}
      <CustomerFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={(data) => updateCustomer(c.id, data)}
        initialData={c}
      />

      {/* Delete dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminara permanentemente a <strong>{c.name}</strong>. Esta accion no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                deleteCustomer(c.id)
                router.push("/clientes")
              }}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add interaction dialog */}
      <Dialog open={interactionOpen} onOpenChange={setInteractionOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Nueva Interaccion</DialogTitle>
          </DialogHeader>
          <div className="gap-4 flex flex-col">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Tipo</Label>
                <Select value={intType} onValueChange={(v) => setIntType(v as InteractionType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="llamada">Llamada</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="visita">Visita</SelectItem>
                    <SelectItem value="nota">Nota</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Direccion</Label>
                <Select value={intDir} onValueChange={(v) => setIntDir(v as InteractionDirection)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entrante">Entrante</SelectItem>
                    <SelectItem value="saliente">Saliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Agente</Label>
              <Input value={intAgent} onChange={(e) => setIntAgent(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Resumen *</Label>
              <Textarea rows={3} value={intSummary} onChange={(e) => setIntSummary(e.target.value)} placeholder="Describe la interaccion..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInteractionOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveInteraction} disabled={!intSummary.trim()} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
