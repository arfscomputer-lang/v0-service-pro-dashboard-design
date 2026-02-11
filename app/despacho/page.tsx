import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DispatchCalendar } from "@/components/dashboard/dispatch-calendar"

export default function DespachoPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />

        <main className="flex flex-1 flex-col overflow-hidden p-4 gap-3">
          <DashboardHeader />

          <div className="flex-1 min-h-0">
            <DispatchCalendar />
          </div>
        </main>
      </div>
    </div>
  )
}
