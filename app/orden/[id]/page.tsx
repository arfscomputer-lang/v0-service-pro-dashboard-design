"use client"

import { use, useState, useMemo } from "react"
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
import { useWorkOrders } from "@/lib/context/work-orders-context"

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
  const { workOrders, updateWorkOrder } = useWorkOrders()
  const [activeTab, setActiveTab] = useState("detalles")
  const [editOpen, setEditOpen] = useState(false)

  const workOrder = useMemo(() => workOrders.find((wo) => wo.id === id), [workOrders, id])

  const orderData: OrderFormData = workOrder
    ? {
        status: workOrder.status as any,
        priority: workOrder.priority as any,
        type: workOrder.type,
        category: workOrder.type,
        scheduledDate: workOrder.scheduledDate,
        scheduledTime: workOrder.scheduledTime,
        estimatedDuration: "2 horas",
        slaDeadline: `${workOrder.scheduledDate} - 18:00`,
        equipment: "Unidad Central HVAC",
        serialNumber: "SN-887432-AC",
        warranty: "Vigente hasta Mar 2027",
        description: workOrder.description,
        customerName: "Cliente",
        customerCompany: "",
        customerPhone: "",
        customerEmail: "",
        customerAddress: workOrder.address,
        technicianName: "Sin asignar",
        technicianRole: "Especialista",
        technicianPhone: "",
      }
    : {
        status: "pendiente",
        priority: "normal",
        type: "",
        category: "",
        scheduledDate: "",
        scheduledTime: "",
        estimatedDuration: "",
        slaDeadline: "",
        equipment: "",
        serialNumber: "",
        warranty: "",
        description: "",
        customerName: "",
        customerCompany: "",
        customerPhone: "",
        customerEmail: "",
        customerAddress: "",
        technicianName: "",
        technicianRole: "",
        technicianPhone: "",
      }

  const handleSave = async (data: OrderFormData) => {
    if (!workOrder) return
    try {
      console.log("[v0] Saving work order:", workOrder.id, "with data:", JSON.stringify({type: data.type, description: data.description, status: data.status, priority: data.priority}))
      await updateWorkOrder(workOrder.id, {
        type: data.type,
        description: data.description,
        status: data.status,
        priority: data.priority,
      })
      console.log("[v0] Work order saved successfully")
      setEditOpen(false)
    } catch (error) {
      console.error("[v0] Error saving work order:", error)
    }
  }

  const handleStatusChange = async (status: OrderFormData["status"]) => {
    if (!workOrder) return
    try {
      console.log("[v0] Changing status to:", status)
      await updateWorkOrder(workOrder.id, { status })
      console.log("[v0] Status changed successfully")
    } catch (error) {
      console.error("[v0] Error updating status:", error)
    }
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
