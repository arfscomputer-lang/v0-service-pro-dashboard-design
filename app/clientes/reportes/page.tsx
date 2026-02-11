"use client"

import React from "react"

import { useMemo } from "react"
import Link from "next/link"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { useCustomers } from "@/lib/context/customers-context"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  UserCheck,
  UserX,
  BarChart3,
  Phone,
  Mail,
  MapPinned,
  StickyNote,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const CHART_PRIMARY = "#2e5cb8"
const CHART_SECONDARY = "#6b8fd4"
const CHART_EMERALD = "#16a34a"
const CHART_AMBER = "#eab308"
const CHART_RED = "#ef4444"

function formatCurrency(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n)
}

export default function CrmReportesPage() {
  const { customers } = useCustomers()

  const stats = useMemo(() => {
    const total = customers.length
    const vips = customers.filter((c) => c.tags.includes("VIP")).length
    const nuevos = customers.filter((c) => c.tags.includes("nuevo")).length
    const morosos = customers.filter((c) => c.tags.includes("moroso")).length
    const withNps = customers.filter((c) => c.nps != null)
    const avgNps = withNps.length ? withNps.reduce((a, c) => a + (c.nps ?? 0), 0) / withNps.length : 0
    const totalRevenue = customers.reduce((a, c) => a + c.totalSpent, 0)
    const totalClv = customers.reduce((a, c) => a + c.lifetimeValue, 0)
    const avgClv = total ? totalClv / total : 0

    // Retention: customers with > 1 service / total
    const retained = customers.filter((c) => c.services.length > 1).length
    const retentionRate = total ? (retained / total) * 100 : 0

    // Churn: morosos / total
    const churnRate = total ? (morosos / total) * 100 : 0

    // By type
    const byType = {
      residencial: customers.filter((c) => c.type === "residencial").length,
      comercial: customers.filter((c) => c.type === "comercial").length,
      industrial: customers.filter((c) => c.type === "industrial").length,
      gobierno: customers.filter((c) => c.type === "gobierno").length,
    }

    // Interaction breakdown
    const allInteractions = customers.flatMap((c) => c.interactions)
    const intByType = {
      llamada: allInteractions.filter((i) => i.type === "llamada").length,
      email: allInteractions.filter((i) => i.type === "email").length,
      visita: allInteractions.filter((i) => i.type === "visita").length,
      nota: allInteractions.filter((i) => i.type === "nota").length,
    }

    // Top 5 by CLV
    const topClv = [...customers]
      .sort((a, b) => b.lifetimeValue - a.lifetimeValue)
      .slice(0, 5)

    // NPS distribution
    const npsPromoters = withNps.filter((c) => (c.nps ?? 0) >= 9).length
    const npsPassives = withNps.filter((c) => (c.nps ?? 0) >= 7 && (c.nps ?? 0) < 9).length
    const npsDetractors = withNps.filter((c) => (c.nps ?? 0) < 7).length

    return {
      total, vips, nuevos, morosos, avgNps, totalRevenue, avgClv,
      retentionRate, churnRate, byType, intByType, topClv,
      npsPromoters, npsPassives, npsDetractors, totalInteractions: allInteractions.length,
    }
  }, [customers])

  const typeChartData = [
    { name: "Residencial", value: stats.byType.residencial, color: "#3b82f6" },
    { name: "Comercial", value: stats.byType.comercial, color: "#f59e0b" },
    { name: "Industrial", value: stats.byType.industrial, color: "#64748b" },
    { name: "Gobierno", value: stats.byType.gobierno, color: "#10b981" },
  ]

  const interactionChartData = [
    { name: "Llamadas", value: stats.intByType.llamada, color: "#3b82f6" },
    { name: "Emails", value: stats.intByType.email, color: "#f59e0b" },
    { name: "Visitas", value: stats.intByType.visita, color: "#10b981" },
    { name: "Notas", value: stats.intByType.nota, color: "#64748b" },
  ]

  const npsChartData = [
    { name: "Promotores (9-10)", value: stats.npsPromoters, color: CHART_EMERALD },
    { name: "Pasivos (7-8)", value: stats.npsPassives, color: CHART_AMBER },
    { name: "Detractores (0-6)", value: stats.npsDetractors, color: CHART_RED },
  ]

  // CLV bar chart for top 5
  const clvBarData = stats.topClv.map((c) => ({
    name: c.name.split(" ").slice(0, 2).join(" "),
    clv: c.lifetimeValue,
    spent: c.totalSpent,
  }))

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6 gap-6 flex flex-col bg-content">
          {/* Header */}
          <div>
            <Link href="/clientes" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3">
              <ArrowLeft className="h-4 w-4" /> Volver a Clientes
            </Link>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Reportes CRM</h1>
                <p className="text-sm text-muted-foreground">Retencion, CLV, churn y analisis de interacciones.</p>
              </div>
            </div>
          </div>

          {/* KPI Row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <KpiMini icon={Users} label="Total Clientes" value={String(stats.total)} color="bg-primary/10 text-primary" />
            <KpiMini icon={UserCheck} label="Tasa Retencion" value={`${stats.retentionRate.toFixed(0)}%`} color="bg-emerald-50 text-emerald-600" />
            <KpiMini icon={UserX} label="Tasa Churn" value={`${stats.churnRate.toFixed(0)}%`} color="bg-red-50 text-red-600" />
            <KpiMini icon={Star} label="NPS Promedio" value={stats.avgNps.toFixed(1)} color="bg-amber-50 text-amber-600" />
            <KpiMini icon={DollarSign} label="CLV Promedio" value={formatCurrency(stats.avgClv)} color="bg-emerald-50 text-emerald-600" />
            <KpiMini icon={DollarSign} label="Revenue Total" value={formatCurrency(stats.totalRevenue)} color="bg-primary/10 text-primary" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* NPS Distribution */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Distribucion NPS</CardTitle>
                <p className="text-xs text-muted-foreground">Clasificacion de clientes por puntaje NPS</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={npsChartData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                      {npsChartData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                  {npsChartData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-[11px] text-muted-foreground">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top 5 CLV */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Top 5 Clientes por CLV</CardTitle>
                <p className="text-xs text-muted-foreground">Valor lifetime vs gasto actual</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={clvBarData} layout="vertical" barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={100} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="clv" fill={CHART_PRIMARY} radius={[0, 4, 4, 0]} name="CLV" />
                    <Bar dataKey="spent" fill={CHART_SECONDARY} radius={[0, 4, 4, 0]} name="Gastado" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: CHART_PRIMARY }} />
                    <span className="text-xs text-muted-foreground">CLV Proyectado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: CHART_SECONDARY }} />
                    <span className="text-xs text-muted-foreground">Gastado Actual</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* By Type */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Clientes por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={typeChartData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                      {typeChartData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                  {typeChartData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-[11px] text-muted-foreground">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Interaction breakdown */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Interacciones por Tipo</CardTitle>
                <p className="text-xs text-muted-foreground">{stats.totalInteractions} interacciones totales</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={interactionChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Cantidad">
                      {interactionChartData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top customers table */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Clientes con Mayor Gasto</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {stats.topClv.map((c, i) => (
                    <Link key={c.id} href={`/clientes/${c.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                      <span className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        i === 0 ? "bg-amber-100 text-amber-700" :
                        i === 1 ? "bg-gray-100 text-gray-600" :
                        i === 2 ? "bg-orange-100 text-orange-700" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {i + 1}
                      </span>
                      <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">{c.initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground">{c.services.length} servicios</p>
                      </div>
                      <span className="text-xs font-bold text-foreground">{formatCurrency(c.totalSpent)}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

function KpiMini({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-4 flex flex-col items-center text-center gap-1">
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", color)}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="text-lg font-bold text-foreground">{value}</p>
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
      </CardContent>
    </Card>
  )
}
