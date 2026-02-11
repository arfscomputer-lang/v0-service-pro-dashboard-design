"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"
import type { InventoryItem, ItemCategory } from "@/lib/data/inventory"

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: Partial<InventoryItem>) => void
  initialData?: InventoryItem | null
}

const categories: { value: ItemCategory; label: string }[] = [
  { value: "refaccion", label: "Refaccion" },
  { value: "herramienta", label: "Herramienta" },
  { value: "consumible", label: "Consumible" },
  { value: "equipo", label: "Equipo" },
  { value: "material", label: "Material" },
]

function getEmpty(): Partial<InventoryItem> {
  return {
    sku: "",
    barcode: "",
    name: "",
    description: "",
    category: "refaccion",
    unit: "pieza",
    totalStock: 0,
    minStock: 5,
    maxStock: 50,
    costUnit: 0,
    priceUnit: 0,
    isActive: true,
    locations: [],
    movements: [],
    supplier: { id: "", name: "", phone: "", email: "", leadTimeDays: 3, lastOrderDate: "" },
    imageUrl: "",
  }
}

export function ItemFormDialog({ open, onClose, onSave, initialData }: Props) {
  const [form, setForm] = useState(getEmpty())

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...initialData } : getEmpty())
    }
  }, [open, initialData])

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }))
  const setSup = (key: string, value: unknown) =>
    setForm((prev) => ({ ...prev, supplier: { ...prev.supplier!, [key]: value } }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(form)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden">
        <DialogTitle className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-border">
          <span className="text-base font-semibold text-foreground">
            {initialData ? "Editar Articulo" : "Nuevo Articulo"}
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogTitle>

        <ScrollArea className="max-h-[70vh]">
          <form className="flex flex-col gap-5 p-6" onSubmit={handleSubmit}>
            {/* Name + SKU */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Nombre *</Label>
                <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} required className="bg-card" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">SKU *</Label>
                <Input value={form.sku ?? ""} onChange={(e) => set("sku", e.target.value)} required className="bg-card font-mono" />
              </div>
            </div>

            {/* Barcode + Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Codigo de Barras</Label>
                <Input value={form.barcode ?? ""} onChange={(e) => set("barcode", e.target.value)} className="bg-card font-mono" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Categoria *</Label>
                <Select value={form.category} onValueChange={(v) => set("category", v)}>
                  <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Descripcion</Label>
              <Textarea rows={2} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} className="bg-card resize-none" />
            </div>

            {/* Unit + Min + Max */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Unidad</Label>
                <Select value={form.unit ?? "pieza"} onValueChange={(v) => set("unit", v)}>
                  <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pieza">Pieza</SelectItem>
                    <SelectItem value="kg">Kilogramo</SelectItem>
                    <SelectItem value="litro">Litro</SelectItem>
                    <SelectItem value="metro">Metro</SelectItem>
                    <SelectItem value="rollo">Rollo</SelectItem>
                    <SelectItem value="cilindro">Cilindro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Stock Minimo</Label>
                <Input type="number" min={0} value={form.minStock ?? 0} onChange={(e) => set("minStock", Number(e.target.value))} className="bg-card" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Stock Maximo</Label>
                <Input type="number" min={0} value={form.maxStock ?? 0} onChange={(e) => set("maxStock", Number(e.target.value))} className="bg-card" />
              </div>
            </div>

            {/* Cost + Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Costo Unitario (MXN)</Label>
                <Input type="number" min={0} step="0.01" value={form.costUnit ?? 0} onChange={(e) => set("costUnit", Number(e.target.value))} className="bg-card" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">Precio Venta (MXN)</Label>
                <Input type="number" min={0} step="0.01" value={form.priceUnit ?? 0} onChange={(e) => set("priceUnit", Number(e.target.value))} className="bg-card" />
              </div>
            </div>

            {/* Supplier */}
            <div className="rounded-lg border border-border p-4 flex flex-col gap-3 bg-muted/30">
              <p className="text-xs font-semibold text-muted-foreground">Proveedor</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] text-muted-foreground">Nombre</Label>
                  <Input value={form.supplier?.name ?? ""} onChange={(e) => setSup("name", e.target.value)} className="h-8 text-xs bg-card" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] text-muted-foreground">Email</Label>
                  <Input type="email" value={form.supplier?.email ?? ""} onChange={(e) => setSup("email", e.target.value)} className="h-8 text-xs bg-card" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] text-muted-foreground">Telefono</Label>
                  <Input value={form.supplier?.phone ?? ""} onChange={(e) => setSup("phone", e.target.value)} className="h-8 text-xs bg-card" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-[10px] text-muted-foreground">Tiempo de Entrega (dias)</Label>
                  <Input type="number" min={1} value={form.supplier?.leadTimeDays ?? 3} onChange={(e) => setSup("leadTimeDays", Number(e.target.value))} className="h-8 text-xs bg-card" />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" className="bg-primary text-primary-foreground">{initialData ? "Guardar Cambios" : "Agregar Articulo"}</Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
