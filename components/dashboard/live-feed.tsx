"use client"

import React from "react"

import { useRealtimeStatus, type LiveEvent } from "@/hooks/use-realtime-status"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Radio,
  Navigation,
  MapPin,
  ClipboardList,
  CheckCircle2,
  Wifi,
  WifiOff,
} from "lucide-react"

const typeConfig: Record<
  LiveEvent["type"],
  { icon: React.ElementType; color: string; bg: string }
> = {
  status_change: { icon: Navigation, color: "text-blue-600", bg: "bg-blue-50" },
  location_update: { icon: MapPin, color: "text-emerald-600", bg: "bg-emerald-50" },
  new_order: { icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50" },
  completed: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 5) return "ahora"
  if (seconds < 60) return `hace ${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes}m`
  return `hace ${Math.floor(minutes / 60)}h`
}

export function LiveFeed() {
  const { events, isConnected, lastPing } = useRealtimeStatus()

  return (
    <Card className="border border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Radio className="h-4 w-4 text-primary animate-pulse" />
            Actividad en Tiempo Real
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "gap-1.5 text-[10px] font-medium border-0",
              isConnected
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[340px] overflow-y-auto">
          {events.map((event, i) => {
            const config = typeConfig[event.type]
            const Icon = config.icon
            return (
              <div
                key={event.id}
                className={cn(
                  "flex items-start gap-3 px-5 py-3 border-b border-border last:border-0 transition-colors",
                  i === 0 && "bg-primary/[0.02]"
                )}
              >
                <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                  <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                    {event.technicianInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold">{event.technicianName}</span>{" "}
                    <span className="text-muted-foreground">{event.message}</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {timeAgo(event.timestamp)}
                  </p>
                </div>
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg shrink-0", config.bg)}>
                  <Icon className={cn("h-3.5 w-3.5", config.color)} />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
