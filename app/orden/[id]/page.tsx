"use client"

import { use, useState } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { OrderHeader } from "@/components/work-order/order-header"
import { CustomerSidebar } from "@/components/work-order/customer-sidebar"
import { TabDetails } from "@/components/work-order/tab-details"
import { TabPartsLabor } from "@/components/work-order/tab-parts-labor"
import { TabSiteHistory } from "@/components/work-order/tab-site-history"
import { TabPhotos } from "@/components/work-order/tab-photos"
import {
  FileText,
  Package,
  History,
  Camera,
} from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "detalles", label: "Detalles", icon: FileText },
  { id: "partes", label: "Refacciones y Mano de Obra", icon: Package },
  { id: "historial", label: "Historial del Sitio", icon: History },
  { id: "fotos", label: "Fotos", icon: Camera },
]

const customerData = {
  name: "Maria Gonzalez",
  company: "Corporativo Alfa S.A. de C.V.",
  phone: "+52 55 1234 5678",
  email: "maria.gonzalez@corpalfa.com.mx",
  address: "Av. Reforma 450, Col. Centro, CDMX",
  since: "2023",
  totalOrders: 12,
  rating: 4.8,
}

const technicianData = {
  name: "Luis Hernandez",
  initials: "LH",
  role: "Especialista HVAC",
  phone: "+52 55 9876 5432",
}

export default function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState("detalles")

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <SidebarNav />

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Order Header */}
        <OrderHeader
          orderId={`#${id}`}
          status="en_progreso"
          priority="alta"
          createdAt="11 de Febrero, 2026 a las 08:30"
        />

        {/* Content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Center: Tabs + Content */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Tab bar */}
            <div className="border-b border-border bg-card px-6">
              <nav className="flex gap-0" aria-label="Pestanas de orden de trabajo">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    )}
                    aria-selected={activeTab === tab.id}
                    role="tab"
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-6 bg-content" role="tabpanel">
              {activeTab === "detalles" && <TabDetails />}
              {activeTab === "partes" && <TabPartsLabor />}
              {activeTab === "historial" && <TabSiteHistory />}
              {activeTab === "fotos" && <TabPhotos />}
            </div>
          </div>

          {/* Right Sidebar: Customer + Map */}
          <CustomerSidebar
            customer={customerData}
            technician={technicianData}
          />
        </div>
      </div>
    </div>
  )
}
