import { ClipboardList, Clock, MapPin, CheckCircle2 } from "lucide-react"

interface DaySummaryProps {
  totalJobs: number
  completed: number
  pendingHours: number
  nextAddress: string
}

export function DaySummary({ totalJobs, completed, pendingHours, nextAddress }: DaySummaryProps) {
  const progress = totalJobs > 0 ? Math.round((completed / totalJobs) * 100) : 0

  return (
    <div className="bg-card border border-border rounded-xl p-4 mx-4 mt-4 shadow-sm">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Progreso del Dia
        </span>
        <span className="text-xs font-bold text-primary">{progress}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted mb-4">
        <div
          className="h-2 rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/60 py-2.5">
          <ClipboardList className="h-4 w-4 text-primary" />
          <span className="text-lg font-bold text-foreground">{totalJobs}</span>
          <span className="text-[10px] text-muted-foreground font-medium">Trabajos</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/60 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <span className="text-lg font-bold text-foreground">{completed}</span>
          <span className="text-[10px] text-muted-foreground font-medium">Completados</span>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-lg bg-muted/60 py-2.5">
          <Clock className="h-4 w-4 text-warning" />
          <span className="text-lg font-bold text-foreground">{pendingHours}h</span>
          <span className="text-[10px] text-muted-foreground font-medium">Restantes</span>
        </div>
      </div>

      {/* Next stop */}
      {nextAddress && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-primary uppercase tracking-wide">
              Siguiente Parada
            </span>
            <p className="text-xs text-foreground truncate">{nextAddress}</p>
          </div>
        </div>
      )}
    </div>
  )
}
