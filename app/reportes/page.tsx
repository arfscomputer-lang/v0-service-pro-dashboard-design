"use client"

import React from "react"
import { useState, useEffect } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Users,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  Loader,
} from "lucide-react"
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

interface ReportData {
  productivityData: any[]
  techRanking: any[]
  satisfactionData: any[]
  responseTimeData: any[]
}

const CHART_BLUE = "#2e5cb8"
const CHART_BLUE_LIGHT = "#6b8fd4"
const CHART_EMERALD = "#16a34a"
const CHART_AMBER = "#eab308"

export default function ReportesPage() {
  const [period, setPeriod] = useState<"semana" | "mes" | "trimestre">("semana")
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/reports/productivity?period=${period}`)
        if (!response.ok) throw new Error('Failed to fetch report data')
        const data = await response.json()
        setReportData(data)
        console.log('[v0] Loaded report data:', data)
      } catch (error) {
        console.error('[v0] Error loading reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [period])

  const periods = [
    { key: "semana" as const, label: "Ultima Semana" },
    { key: "mes" as const, label: "Ultimo Mes" },
    { key: "trimestre" as const, label: "Ultimo Trimestre" },
  ]

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        <SidebarNav />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopHeader />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Cargando reportes...</p>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const data = reportData || {
    productivityData: [],
    techRanking: [],
    satisfactionData: [],
    responseTimeData: [],
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6 gap-6 flex flex-col bg-content">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Reportes y Analitica</h1>
                <p className="text-sm text-muted-foreground">
                  Productividad, tiempos de respuesta y calificaciones del equipo.
                </p>
              </div>
            </div>
            {/* Period selector */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
              {periods.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPeriod(p.key)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                    period === p.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title="Trabajos Completados"
              value={data?.techRanking?.reduce((a: number, t: any) => a + (t.completadas || 0), 0) || "0"}
              change="+12%"
              trend="up"
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <KpiCard
              title="Tiempo Resp. Promedio"
              value={`${data?.responseTimeData?.[data.responseTimeData.length - 1]?.promedio || 0} min`}
              change="-8%"
              trend="up"
              icon={Clock}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <KpiCard
              title="Órdenes Pendientes"
              value={data?.productivityData?.reduce((a: number, d: any) => a + (d.pendientes || 0), 0) || "0"}
              change="+3%"
              trend="down"
              icon={AlertTriangle}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />
            <KpiCard
              title="Tasa Completación"
              value={(() => {
                const total = data?.productivityData?.reduce((a: number, d: any) => a + (d.total || 0), 0) || 0
                const completed = data?.productivityData?.reduce((a: number, d: any) => a + (d.completadas || 0), 0) || 0
                return total > 0 ? `${Math.round((completed / total) * 100)}%` : "0%"
              })()}
              change="+5%"
              trend="up"
              icon={TrendingUp}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Productivity bar chart */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Productividad por Semana
                </CardTitle>
                <p className="text-xs text-muted-foreground">Trabajos asignados vs completados</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={data.productivityData} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="pendientes" fill={CHART_BLUE_LIGHT} radius={[4, 4, 0, 0]} name="Pendientes" />
                    <Bar dataKey="completadas" fill={CHART_BLUE} radius={[4, 4, 0, 0]} name="Completadas" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: CHART_BLUE_LIGHT }} />
                    <span className="text-xs text-muted-foreground">Pendientes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: CHART_BLUE }} />
                    <span className="text-xs text-muted-foreground">Completadas</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Response time line chart */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Tiempo de Respuesta (min)
                </CardTitle>
                <p className="text-xs text-muted-foreground">Promedio diario vs objetivo de 25 min</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={data.responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" domain={[0, 60]} />
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value: any) => [`${value} min`, 'Promedio']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="promedio" 
                      stroke={CHART_BLUE} 
                      dot={{ fill: CHART_BLUE, r: 4 }} 
                      activeDot={{ r: 6 }} 
                      name="Promedio"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="promedio"
                      stroke={CHART_BLUE}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: CHART_BLUE }}
                      name="Promedio"
                    />
                    <Line
                      type="monotone"
                      dataKey="objetivo"
                      stroke={CHART_AMBER}
                      strokeDasharray="6 4"
                      strokeWidth={2}
                      dot={false}
                      name="Objetivo"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="h-0.5 w-4 rounded" style={{ backgroundColor: CHART_BLUE }} />
                    <span className="text-xs text-muted-foreground">Promedio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-0.5 w-4 rounded border-t-2 border-dashed" style={{ borderColor: CHART_AMBER }} />
                    <span className="text-xs text-muted-foreground">Objetivo</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second row: Pie + Ranking */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Customer satisfaction pie */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Satisfaccion del Cliente
                </CardTitle>
                <p className="text-xs text-muted-foreground">Distribucion de calificaciones</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.satisfactionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {data.satisfactionData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [`${value}`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                  {data.satisfactionData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      <span className="text-[11px] text-muted-foreground">{d.name} ({d.value})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Technician ranking */}
            <Card className="border border-border shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-sm font-semibold text-foreground">
                      Ranking de Tecnicos
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">Top 5 por rendimiento este periodo</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-border">
                    <CalendarDays className="h-3 w-3 mr-1" />
                    {periods.find((p) => p.key === period)?.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/50">
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground w-10">#</th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Tecnico</th>
                        <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Trabajos</th>
                        <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Calificacion</th>
                        <th className="px-4 py-2.5 text-center font-medium text-muted-foreground">Resp. Prom.</th>
                        <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Indice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.techRanking?.slice(0, 5).map((tech, i) => {
                        const index = Math.round(tech.tasa * 1.2)
                        const initials = tech.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                        return (
                          <tr key={tech.name} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3">
                              <span className={cn(
                                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                                i === 0 ? "bg-amber-100 text-amber-700" :
                                i === 1 ? "bg-gray-100 text-gray-600" :
                                i === 2 ? "bg-orange-100 text-orange-700" :
                                "bg-muted text-muted-foreground"
                              )}>
                                {i + 1}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                    {initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">{tech.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-semibold text-foreground">{tech.ordenes}</td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                <span className="font-medium text-foreground">{tech.completadas}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-foreground font-semibold">{tech.tasa}%</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-2 w-20 rounded-full bg-muted">
                                  <div
                                    className="h-2 rounded-full bg-primary"
                                    style={{ width: `${Math.min(100, tech.tasa)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-foreground">{tech.tasa}%</span>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

// ── KPI Card Sub-component ──────────────────────────────────

function KpiCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  iconBg,
  iconColor,
}: {
  title: string
  value: string
  change: string
  trend: "up" | "down"
  icon: React.ElementType
  iconBg: string
  iconColor: string
}) {
  const isPositive = trend === "up"
  return (
    <Card className="border border-border shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          <Badge
            variant="outline"
            className={cn(
              "gap-1 text-[10px] font-semibold border-0",
              isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {change}
          </Badge>
        </div>
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{title}</p>
      </CardContent>
    </Card>
  )
}
