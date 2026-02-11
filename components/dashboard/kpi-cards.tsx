"use client"

import {
  Briefcase,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Users,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const kpis = [
  {
    title: "Trabajos Activos",
    value: "24",
    trend: "+12%",
    trendUp: true,
    subtitle: "vs. ayer",
    icon: Briefcase,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    title: "Utilizacion de Tecnicos",
    value: "85%",
    trend: "+5%",
    trendUp: true,
    subtitle: "Capacidad operativa",
    icon: Users,
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    progress: 85,
  },
  {
    title: "Alertas Criticas",
    value: "3",
    trend: "Urgente",
    trendUp: false,
    subtitle: "Trabajos de emergencia sin asignar",
    icon: AlertTriangle,
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    isAlert: true,
  },
  {
    title: "Ingreso Est. Hoy",
    value: "$4,250",
    trend: "+8%",
    trendUp: true,
    subtitle: "vs. promedio semanal",
    icon: DollarSign,
    iconBg: "bg-success/10",
    iconColor: "text-success",
  },
]

export function KpiCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card
          key={kpi.title}
          className="border border-border bg-card shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {kpi.title}
                </p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className={`text-2xl font-bold ${kpi.isAlert ? "text-destructive" : "text-foreground"}`}>
                    {kpi.value}
                  </span>
                  {kpi.isAlert ? (
                    <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive">
                      {kpi.trend}
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                        kpi.trendUp ? "text-success" : "text-destructive"
                      }`}
                    >
                      {kpi.trendUp ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {kpi.trend}
                    </span>
                  )}
                </div>
                {kpi.progress !== undefined && (
                  <Progress value={kpi.progress} className="mt-3 h-2" />
                )}
                <p className="mt-2 text-xs text-muted-foreground">{kpi.subtitle}</p>
              </div>
              <div className={`rounded-lg p-2.5 ${kpi.iconBg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
