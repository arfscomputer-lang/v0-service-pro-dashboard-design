"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Mail, Smartphone, CheckCircle2, ClipboardList, UserCheck, AlertTriangle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotifSetting {
  id: string
  label: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
}

const defaultSettings: NotifSetting[] = [
  { id: "new_order", label: "Nueva orden de trabajo", description: "Cuando se crea una nueva orden en el sistema", email: true, push: true, sms: false },
  { id: "order_assigned", label: "Orden asignada a técnico", description: "Cuando se asigna o reasigna una orden", email: true, push: true, sms: false },
  { id: "order_completed", label: "Orden completada", description: "Cuando un técnico marca la orden como completada", email: true, push: false, sms: false },
  { id: "order_overdue", label: "Orden vencida", description: "Cuando una orden supera su fecha programada sin completar", email: true, push: true, sms: true },
  { id: "maintenance_due", label: "Mantenimiento próximo", description: "Alerta cuando un activo tiene mantenimiento en los próximos 7 días", email: true, push: true, sms: false },
  { id: "maintenance_overdue", label: "Mantenimiento vencido", description: "Cuando un plan de mantenimiento está vencido", email: true, push: true, sms: true },
  { id: "tech_available", label: "Técnico disponible", description: "Cuando un técnico cambia su estado a disponible", email: false, push: false, sms: false },
  { id: "new_customer", label: "Nuevo cliente registrado", description: "Cuando se agrega un cliente nuevo al sistema", email: true, push: false, sms: false },
]

const eventIcons: Record<string, typeof Bell> = {
  new_order: ClipboardList,
  order_assigned: UserCheck,
  order_completed: CheckCircle2,
  order_overdue: AlertTriangle,
  maintenance_due: Clock,
  maintenance_overdue: AlertTriangle,
  tech_available: UserCheck,
  new_customer: CheckCircle2,
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
        checked ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <span className={cn(
        "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
        checked ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  )
}

export default function NotificacionesPage() {
  const [settings, setSettings] = useState<NotifSetting[]>(defaultSettings)
  const [saved, setSaved] = useState(false)

  const toggle = (id: string, channel: "email" | "push" | "sms") => {
    setSettings(prev => prev.map(s => s.id === id ? { ...s, [channel]: !s[channel] } : s))
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const channels = [
    { key: "email" as const, label: "Email", icon: Mail },
    { key: "push" as const, label: "App", icon: Bell },
    { key: "sms" as const, label: "SMS", icon: Smartphone },
  ]

  return (
    <main className="overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configurá qué eventos generan alertas y por qué canal
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            {saved ? <CheckCircle2 className="h-4 w-4" /> : null}
            {saved ? "Guardado" : "Guardar cambios"}
          </Button>
        </div>

        {/* Channel legend */}
        <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-muted/30">
          {channels.map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center gap-2 text-sm">
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{label}</span>
            </div>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">Activá o desactivá cada canal por evento</span>
        </div>

        {/* Settings table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Eventos del Sistema</CardTitle>
            <CardDescription>Controlá las notificaciones para cada tipo de evento</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {settings.map(setting => {
                const Icon = eventIcons[setting.id] ?? Bell
                return (
                  <div key={setting.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/20 transition-colors">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">{setting.description}</p>
                    </div>
                    <div className="flex items-center gap-5 shrink-0">
                      {channels.map(({ key, icon: ChanIcon }) => (
                        <div key={key} className="flex flex-col items-center gap-1.5">
                          <ChanIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          <Toggle checked={setting[key]} onChange={() => toggle(setting.id, key)} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {channels.map(({ key, label, icon: Icon }) => {
            const active = settings.filter(s => s[key]).length
            return (
              <Card key={key}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xl font-bold text-foreground">{active}</p>
                      <p className="text-xs text-muted-foreground">via {label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
