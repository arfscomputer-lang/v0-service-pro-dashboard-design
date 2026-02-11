import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { DispatchBoard } from "@/components/dashboard/dispatch-board"
import { TechnicianStatus } from "@/components/dashboard/technician-status"

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <TopHeader />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            {/* Dashboard Header */}
            <DashboardHeader />

            {/* KPI Cards */}
            <KpiCards />

            {/* Split View: Dispatch Board + Technician Status */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <DispatchBoard />
              </div>
              <div className="lg:col-span-1">
                <TechnicianStatus />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
