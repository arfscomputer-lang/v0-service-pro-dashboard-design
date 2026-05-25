'use client'

import { use } from 'react'
import { SidebarNav } from '@/components/dashboard/sidebar-nav'
import { BudgetEditor } from '@/components/budget/budget-editor'

export default function PresupuestoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <main className="flex-1 overflow-auto">
        <BudgetEditor budgetId={id} />
      </main>
    </div>
  )
}
