"use client"

import { use, useState } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { OrderHeader } from "@/components/work-order/order-header"
import { CustomerSidebar } from "@/components/work-order/customer-sidebar"
import { TabDetails } from "@/components/work-order/tab-details"
import { TabPartsLabor } from "@/components/work-order/tab-parts-labor"
import { TabSiteHistory } from "@/components/work-order/tab-site-history"
import { TabPhotos } from "@/components/work-order/tab-photos"
import { OrderEditSheet } from "@/components/work-order/order-edit-sheet"
import type { OrderFormData } from "@/components/work-order/order-edit-sheet"
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

function getInitialData(): OrderFormData {
  return {
    status: "en_progreso",
    priority: "alta",
    type: "Reparacion HVAC",
    category: "Climatizacion",
    scheduledDate: "11 de Febrero, 2026",
    scheduledTime: "09:00 - 11:00",
    estimatedDuration: "2 horas",
    slaDeadline: "11 de Febrero, 2026 - 18:00",
    equipment: "Unidad Central HVAC - Modelo Carrier 24ACC636",
    serialNumber: "SN-887432-AC",
    warranty: "Vigente hasta Mar 2027",
    description:
      "El cliente reporta que la unidad central de aire acondicionado no enfria adecuadamente. La temperatura del termostato no coincide con la temperatura real de la habitacion. Se escucha un ruido inusual al encender el compresor. Ultima revision realizada hace 8 meses.",
    customerName: "Maria Gonzalez",
    customerCompany: "Corporativo Alfa S.A. de C.V.",
    customerPhone: "+52 55 1234 5678",
    customerEmail: "maria.gonzalez@corpalfa.com.mx",
    customerAddress: "Av. Reforma 450, Col. Centro, CDMX",
    technicianName: "Luis Hernandez",
    technicianRole: "Especialista HVAC",
    technicianPhone: "+52 55 9876 5432",
  }
}

export default function WorkOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState("detalles")
  const [editOpen, setEditOpen] = useState(false)
  const [orderData, setOrderData] = useState<OrderFormData>(getInitialData)

  const handleSave = (data: OrderFormData) => {
    setOrderData(data)
  }

  const handleStatusChange = (status: OrderFormData["status"]) => {
    setOrderData((prev) => ({ ...prev, status }))
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />

      <div className="flex flex-1 flex-col overflow-hidden">
        <OrderHeader
          orderId={`#${id}`}
          status={orderData.status}
          priority={orderData.priority}
          createdAt="11 de Febrero, 2026 a las 08:30"
          onEdit={() => setEditOpen(true)}
          onStatusChange={handleStatusChange}
        />

        <div className="flex flex-1 overflow-hidden">
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
              {activeTab === "detalles" && (
                <TabDetails
                  orderInfo={{
                    type: orderData.type,
                    category: orderData.category,
                    scheduledDate: orderData.scheduledDate,
                    scheduledTime: orderData.scheduledTime,
                    estimatedDuration: orderData.estimatedDuration,
                    slaDeadline: orderData.slaDeadline,
                    equipment: orderData.equipment,
                    serialNumber: orderData.serialNumber,
                    warranty: orderData.warranty,
                  }}
                  description={orderData.description}
                />
              )}
              {activeTab === "partes" && <TabPartsLabor />}
              {activeTab === "historial" && <TabSiteHistory />}
              {activeTab === "fotos" && <TabPhotos />}
            </div>
          </div>

          <CustomerSidebar
            customer={{
              name: orderData.customerName,
              company: orderData.customerCompany,
              phone: orderData.customerPhone,
              email: orderData.customerEmail,
              address: orderData.customerAddress,
              since: "2023",
              totalOrders: 12,
              rating: 4.8,
            }}
            technician={{
              name: orderData.technicianName,
              initials: orderData.technicianName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2),
              role: orderData.technicianRole,
              phone: orderData.technicianPhone,
            }}
          />
        </div>
      </div>

      {/* Edit Sheet */}
      <OrderEditSheet
        open={editOpen}
        onClose={() => setEditOpen(false)}
        data={orderData}
        onSave={handleSave}
        orderId={`#${id}`}
      />
    </div>
  )
}
