'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Plus, Bell, HelpCircle } from 'lucide-react'
import { NewOrderDialog } from '@/components/work-orders/new-order-dialog'

const PAGE_TITLES: Record<string, string> = {
  '/': 'Panel Principal',
  '/despacho': 'Agenda y Despacho',
  '/ordenes': 'Órdenes de Trabajo',
  '/tecnicos': 'Técnicos',
  '/clientes': 'Clientes',
  '/clientes/reportes': 'Reportes CRM',
  '/inventario': 'Inventario',
  '/presupuestos': 'Presupuestos',
  '/reportes': 'Reportes',
  '/facturas': 'Facturas',
  '/activos': 'Gestión de Activos',
  '/mantenimiento': 'Mantenimiento',
  '/configuracion': 'Configuración',
}

export function TopHeader() {
  const pathname = usePathname()
  const pageTitle = PAGE_TITLES[pathname] ?? PAGE_TITLES[Object.keys(PAGE_TITLES).find(k => k !== '/' && pathname.startsWith(k)) ?? ''] ?? 'ServicePro'
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)

  return (
    <header className="border-b border-border bg-background sticky top-0 z-40">
      <div className="px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{pageTitle}</h1>

        <div className="flex items-center gap-4">
          <Button className="gap-2" onClick={() => setOrderDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nueva Orden
          </Button>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon">
            <HelpCircle className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <NewOrderDialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen} />
    </header>
  )
}
