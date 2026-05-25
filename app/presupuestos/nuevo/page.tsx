'use client'

import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { BudgetEditor } from '@/components/budget/budget-editor'

export default function NuevoPresupuestoPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <main className="flex-1 overflow-auto">
        <BudgetEditor />
      </main>
    </div>
  )
}
