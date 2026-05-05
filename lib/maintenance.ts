// Tipos de recurrencia soportados
export type RecurrenceType = 'mensual' | 'trimestral' | 'semestral' | 'anual' | 'por_uso' | 'mixta'

export interface AssetMaintenanceInfo {
  id: string
  asset_id: string
  name: string
  customer_id: string
  has_maintenance_plan: boolean
  recurrence_type: string | null
  interval_months: number | null
  last_maintenance_date: string | null
  next_maintenance_date: string | null
  created_at: string
}

// Mapeo de recurrence_type a meses
const RECURRENCE_MONTHS: Record<string, number> = {
  mensual: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12,
}

/**
 * Calcula la próxima fecha de mantenimiento dado un activo.
 * Si no hay last_maintenance_date, usa created_at como base.
 */
export function calculateNextMaintenanceDate(asset: AssetMaintenanceInfo): Date | null {
  if (!asset.has_maintenance_plan) return null

  const recurrence = asset.recurrence_type as RecurrenceType
  if (!recurrence || recurrence === 'por_uso' || recurrence === 'mixta') return null

  const months = asset.interval_months ?? RECURRENCE_MONTHS[recurrence]
  if (!months) return null

  const baseDate = asset.last_maintenance_date
    ? new Date(asset.last_maintenance_date)
    : new Date(asset.created_at)

  const next = new Date(baseDate)
  next.setMonth(next.getMonth() + months)
  return next
}

/**
 * Determina el estado de mantenimiento de un activo.
 * Retorna: 'vencido' | 'proximo' | 'al_dia' | 'sin_plan'
 */
export function getMaintenanceStatus(
  asset: AssetMaintenanceInfo,
  daysAheadAlert: number = 7
): 'vencido' | 'proximo' | 'al_dia' | 'sin_plan' {
  if (!asset.has_maintenance_plan) return 'sin_plan'
  if (!asset.next_maintenance_date) return 'sin_plan'

  const now = new Date()
  const nextDate = new Date(asset.next_maintenance_date)
  const alertDate = new Date()
  alertDate.setDate(alertDate.getDate() + daysAheadAlert)

  if (nextDate < now) return 'vencido'
  if (nextDate <= alertDate) return 'proximo'
  return 'al_dia'
}

/**
 * Genera un ID único para una orden de trabajo preventiva.
 */
export function generatePreventiveOrderId(asset: AssetMaintenanceInfo): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `PREV-${asset.asset_id.toUpperCase()}-${year}${month}`
}

/**
 * Formatea una fecha para mostrar al usuario.
 */
export function formatMaintenanceDate(dateStr: string | null): string {
  if (!dateStr) return 'No definida'
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Calcula cuántos días faltan (o pasaron) para el mantenimiento.
 * Negativo = ya venció, positivo = días restantes.
 */
export function daysUntilMaintenance(dateStr: string | null): number | null {
  if (!dateStr) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const next = new Date(dateStr)
  next.setHours(0, 0, 0, 0)
  return Math.round((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Genera las próximas N fechas de ocurrencia a partir del next_maintenance_date del activo.
 */
export function generateOccurrenceDates(asset: AssetMaintenanceInfo, count = 6): Date[] {
  if (!asset.has_maintenance_plan) return []
  const months = asset.interval_months ?? RECURRENCE_MONTHS[asset.recurrence_type ?? '']
  if (!months || months <= 0) return []

  const baseDate = asset.next_maintenance_date
    ? new Date(asset.next_maintenance_date)
    : calculateNextMaintenanceDate(asset)
  if (!baseDate) return []

  const dates: Date[] = []
  for (let i = 0; i < count; i++) {
    const d = new Date(baseDate)
    d.setMonth(d.getMonth() + months * i)
    dates.push(d)
  }
  return dates
}
