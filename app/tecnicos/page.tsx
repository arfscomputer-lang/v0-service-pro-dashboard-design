"use client"

import { useState } from "react"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { TopHeader } from "@/components/dashboard/top-header"
import { TechTable } from "@/components/technicians/tech-table"
import { TechFormDialog } from "@/components/technicians/tech-form-dialog"
import type { TechFormData } from "@/components/technicians/tech-form-dialog"
import { DeleteTechDialog } from "@/components/technicians/delete-tech-dialog"
import { useTechnicians } from "@/lib/context/technicians-context"
import type { TechnicianProfile } from "@/lib/data/technicians"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus } from "lucide-react"

export default function TecnicosPage() {
  const { technicians, addTech, updateTech, deleteTech, updateStatus } = useTechnicians()
  const [formOpen, setFormOpen] = useState(false)
  const [editingTech, setEditingTech] = useState<TechnicianProfile | null>(null)
  const [deletingTech, setDeletingTech] = useState<TechnicianProfile | null>(null)

  function handleCreate() {
    setEditingTech(null)
    setFormOpen(true)
  }

  function handleEdit(tech: TechnicianProfile) {
    setEditingTech(tech)
    setFormOpen(true)
  }

  function handleSave(data: TechFormData) {
    if (editingTech) {
      updateTech(editingTech.id, data)
    } else {
      addTech(data)
    }
  }

  function handleConfirmDelete() {
    if (deletingTech) {
      deleteTech(deletingTech.id)
      setDeletingTech(null)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader />
        <main className="flex flex-1 flex-col overflow-y-auto p-6 gap-5 bg-content">
          {/* Page header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Registro de Tecnicos</h1>
                <p className="text-sm text-muted-foreground">
                  Gestion de perfiles, especialidades y disponibilidad del equipo de campo.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2">
                <Badge variant="outline" className="rounded-full text-xs font-medium">
                  {technicians.length} técnicos
                </Badge>
                <Badge variant="outline" className="rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                  {technicians.filter((t) => t.status === "disponible").length} disponibles
                </Badge>
              </div>
              <Button onClick={handleCreate} className="gap-2">
                <Plus className="h-4 w-4" />
                Nuevo Tecnico
              </Button>
            </div>
          </div>

          {/* Table */}
          <TechTable
            technicians={technicians}
            onEdit={handleEdit}
            onDelete={setDeletingTech}
            onStatusChange={updateStatus}
          />
        </main>
      </div>

      {/* Dialogs */}
      <TechFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tech={editingTech}
        onSave={handleSave}
      />
      <DeleteTechDialog
        open={!!deletingTech}
        onOpenChange={(open) => !open && setDeletingTech(null)}
        techName={deletingTech?.name ?? ""}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
