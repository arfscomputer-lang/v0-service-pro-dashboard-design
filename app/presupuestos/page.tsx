'use client'

import { useState, useCallback } from 'react'
import { Plus, X, Printer, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CATALOGO_PRODUCTOS } from '@/lib/catalogo-cctv'
import { KitSelector } from '@/components/budget/kit-selector'
import { MaterialCalculator } from '@/components/budget/material-calculator'
import { SaveKitDialog } from '@/components/budget/save-kit-dialog'
import { savePriceHistory, getHistoricalPrice } from '@/lib/price-history'
import { PriceHistoryHint } from '@/components/budget/price-history-hint'

// Currency exchange rates (example rates - in production, fetch from API)
const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  VES: 36.5, // Venezuelan Bolívares
  PYG: 6800, // Paraguayan Guaraní
}

const INITIAL_COMPANY = {
  name: '',
  rif: '',
  address: '',
  phone: '',
  email: '',
}

const INITIAL_PROJECT = {
  number: `CCTV-${String(Math.floor(Math.random() * 900) + 100)}`,
  date: new Date().toISOString().split('T')[0],
  validity: '15 días',
  client: '',
  location: '',
}

const DEFAULT_EQUIPMENT = CATALOGO_PRODUCTOS.equiposPrincipales
  .slice(0, 5)
  .map((producto, idx) => ({
    id: idx + 1,
    desc: `${producto.nombre} (${producto.marca} ${producto.modelo})`,
    unit: 'Und',
    qty: 0,
    price: 0,
  }))

const DEFAULT_MATERIALS = CATALOGO_PRODUCTOS.materialesInstalacion
  .slice(0, 5)
  .map((producto, idx) => ({
    id: idx + 1,
    desc: `${producto.nombre} (${producto.marca})`,
    unit: 'Und',
    qty: 0,
    price: 0,
  }))

const DEFAULT_LABOR = [
  { id: 1, desc: 'Instalación cableado estructurado', unit: 'Gbl', qty: 1, price: 200 },
  { id: 2, desc: 'Montaje y fijación de cámaras', unit: 'Gbl', qty: 1, price: 160 },
]

const DEFAULT_CONDITIONS = [
  'Forma de pago: 50% anticipo, 50% contra entrega e instalación.',
  'Tiempo de entrega de materiales: 5-10 días hábiles.',
  'Garantía de equipos: 1 año por defectos de fábrica.',
]

function fmt(n: number, currency: string = 'USD') {
  const rate = EXCHANGE_RATES[currency] || 1
  const converted = n * rate
  const symbols: Record<string, string> = { USD: '$', VES: 'Bs.', PYG: '₲' }
  const symbol = symbols[currency] || '$'
  return `${symbol} ${converted.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function sumSection(items: any[]) {
  return items.reduce((s, i) => s + i.qty * i.price, 0)
}

let _id = 100
function nid() {
  return ++_id
}

interface Item {
  id: number
  desc: string
  unit: string
  qty: number
  price: number
}

interface SectionTableProps {
  title: string
  icon: string
  items: Item[]
  setItems: (items: Item[]) => void
  color: string
  currency: 'USD' | 'VES' | 'PYG'
  catalogItems?: { nombre: string; precio?: number }[]
}

function SectionTable({ title, icon, items, setItems, color, currency, catalogItems = [] }: SectionTableProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [searchText, setSearchText] = useState<Record<number, string>>({})
  const [editingPrice, setEditingPrice] = useState<Record<number, string>>({})

  const add = () =>
    setItems([...items, { id: nid(), desc: '', unit: 'Und', qty: 1, price: 0 }])
  const remove = (id: number) => setItems(items.filter((i) => i.id !== id))
  const update = (id: number, field: string, val: any) =>
    setItems(
      items.map((i) =>
        i.id === id
          ? {
              ...i,
              [field]: field === 'qty' || field === 'price' ? parseFloat(val) || 0 : val,
            }
          : i
      )
    )

  const handleSelectFromCatalog = (id: number, item: { nombre: string; precio?: number }) => {
    update(id, 'desc', item.nombre)
    if (item.precio) update(id, 'price', item.precio)
    setOpenDropdown(null)
    setSearchText({ ...searchText, [id]: '' })
  }

  const getFilteredCatalog = (id: number) => {
    const search = searchText[id]?.toLowerCase() || ''
    return catalogItems.filter((item) => item.nombre.toLowerCase().includes(search))
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div
        className="px-6 py-4 flex items-center gap-3 text-white"
        style={{ backgroundColor: color }}
      >
        <span className="text-xl">{icon}</span>
        <span className="font-bold text-lg flex-1">{title}</span>
        <span className="text-sm opacity-90">{items.length} ítems</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {['#', 'Descripción', 'Und', 'Cant.', `P.Unit (${currency})`, `Total (${currency})`, ''].map(
                (h, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 text-sm font-semibold text-left text-foreground"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                className={idx % 2 === 0 ? 'bg-background' : 'bg-secondary/10'}
              >
                <td className="px-4 py-3 text-sm text-foreground">{idx + 1}</td>
                <td className="px-4 py-3 relative">
                  <div className="relative">
                    <Input
                      value={item.desc}
                      onChange={(e) => {
                        update(item.id, 'desc', e.target.value)
                        setSearchText({ ...searchText, [item.id]: e.target.value })
                      }}
                      onFocus={() => setOpenDropdown(item.id)}
                      placeholder="Buscar o escribir..."
                      className="text-sm"
                    />
                    {openDropdown === item.id && catalogItems.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                        {getFilteredCatalog(item.id).length > 0 ? (
                          getFilteredCatalog(item.id).map((cat, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectFromCatalog(item.id, cat)}
                              className="w-full text-left px-3 py-2 hover:bg-secondary text-sm border-b border-border last:border-b-0"
                            >
                              <div className="font-medium text-foreground">{cat.nombre}</div>
                              {cat.precio && <div className="text-xs text-muted-foreground">${cat.precio.toFixed(2)}</div>}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">Sin coincidencias</div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Select value={item.unit} onValueChange={(v) => update(item.id, 'unit', v)}>
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Und', 'Gbl', 'Mt', 'Ml', 'Kg'].map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Input
                    type="number"
                    min="0"
                    value={item.qty}
                    onChange={(e) => update(item.id, 'qty', e.target.value)}
                    className="text-sm text-right"
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {currency === 'USD' ? '$' : currency === 'VES' ? 'Bs.' : '₲'}
                    </span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={editingPrice[item.id] !== undefined ? editingPrice[item.id] : (item.price * EXCHANGE_RATES[currency]).toFixed(2)}
                      onChange={(e) => {
                        setEditingPrice({ ...editingPrice, [item.id]: e.target.value })
                      }}
                      onBlur={(e) => {
                        const inputValue = e.target.value.trim()
                        if (inputValue === '') {
                          update(item.id, 'price', '0')
                        } else {
                          const numValue = parseFloat(inputValue)
                          if (!isNaN(numValue) && numValue >= 0) {
                            const convertedValue = numValue / EXCHANGE_RATES[currency]
                            update(item.id, 'price', convertedValue.toString())
                            // Guardar en historial de precios
                            savePriceHistory(item.desc, convertedValue, 'USD')
                          }
                        }
                        setEditingPrice({ ...editingPrice, [item.id]: undefined })
                      }}
                      className="text-sm text-right"
                      placeholder="0.00"
                    />
                  </div>
                  {currency !== 'USD' && item.price > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      USD: ${item.price.toFixed(2)}
                    </div>
                  )}
                  <PriceHistoryHint 
                    productName={item.desc}
                    currency={currency}
                    onUsePrice={(price) => {
                      const convertedPrice = price * EXCHANGE_RATES[currency]
                      setEditingPrice({ ...editingPrice, [item.id]: convertedPrice.toFixed(2) })
                      update(item.id, 'price', price.toString())
                    }}
                  />
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-right text-foreground">
                  {fmt(item.qty * item.price, currency)}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => remove(item.id)}
                    className="text-destructive hover:bg-destructive/10 rounded p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t border-border">
        <Button
          onClick={add}
          variant="outline"
          className="text-sm"
          style={{ borderColor: color, color }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar ítem
        </Button>
      </div>
    </div>
  )
}

export default function PresupuestosPage() {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [currency, setCurrency] = useState<'USD' | 'VES' | 'PYG'>('USD')
  const [company, setCompany] = useState(INITIAL_COMPANY)
  const [project, setProject] = useState(INITIAL_PROJECT)
  const [equipment, setEquipment] = useState(DEFAULT_EQUIPMENT)
  const [materials, setMaterials] = useState(DEFAULT_MATERIALS)
  const [labor, setLabor] = useState(DEFAULT_LABOR)
  const [taxRate, setTaxRate] = useState(16)
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS)

  const sub1 = sumSection(equipment)
  const sub2 = sumSection(materials)
  const sub3 = sumSection(labor)
  const subtotal = sub1 + sub2 + sub3
  const tax = (subtotal * taxRate) / 100
  const total = subtotal + tax

  const handlePrint = () => {
    const printContent = document.getElementById('print-area')
    if (!printContent) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!DOCTYPE html><html><head><title>Presupuesto CCTV - ${project.number}</title>
      <style>body{margin:0;font-family:system-ui,sans-serif}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style>
      </head><body>${printContent.innerHTML}</body></html>`)
    win.document.close()
    setTimeout(() => {
      win.print()
    }, 400)
  }

  const handleNew = () => {
    if (!confirm('¿Crear nuevo presupuesto? Se perderán los datos actuales.')) return
    setCompany(INITIAL_COMPANY)
    setProject({
      ...INITIAL_PROJECT,
      number: `CCTV-${String(Math.floor(Math.random() * 900) + 100)}`,
    })
    setEquipment([])
    setMaterials([])
    setLabor([])
    setTaxRate(16)
    setConditions(DEFAULT_CONDITIONS)
    setTab('edit')
  }

  const handleLoadKit = useCallback((kitItems: Array<{
    section: 'equipos' | 'materiales' | 'mano_de_obra'
    description: string
    unit: string
    quantity: number
    price: number
  }>) => {
    const equipmentItems = kitItems.filter(i => i.section === 'equipos').map((i, idx) => ({
      id: Math.max(...equipment.map(e => e.id), 0) + idx + 1,
      desc: i.description,
      unit: i.unit,
      qty: i.quantity,
      price: i.price
    }))
    
    const materialItems = kitItems.filter(i => i.section === 'materiales').map((i, idx) => ({
      id: Math.max(...materials.map(m => m.id), 0) + idx + 1,
      desc: i.description,
      unit: i.unit,
      qty: i.quantity,
      price: i.price
    }))
    
    const laborItems = kitItems.filter(i => i.section === 'mano_de_obra').map((i, idx) => ({
      id: Math.max(...labor.map(l => l.id), 0) + idx + 1,
      desc: i.description,
      unit: i.unit,
      qty: i.quantity,
      price: i.price
    }))

    setEquipment([...equipment, ...equipmentItems])
    setMaterials([...materials, ...materialItems])
    setLabor([...labor, ...laborItems])
  }, [equipment, materials, labor])

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-4 md:px-6 py-3 md:py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4 flex-wrap md:flex-nowrap">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-foreground truncate">CCTV Presupuestos</h1>
              <p className="text-xs text-muted-foreground hidden md:block">Generador de presupuestos</p>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-end">
            <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg bg-secondary border border-border">
              <DollarSign className="h-4 w-4 text-muted-foreground shrink-0" />
              <Select value={currency} onValueChange={(val) => setCurrency(val as 'USD' | 'VES' | 'PYG')}>
                <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 text-xs md:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="VES">VES</SelectItem>
                  <SelectItem value="PYG">PYG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleNew} variant="outline" size="sm" className="text-xs md:text-sm">
              Nuevo
            </Button>
            <Button
              onClick={() => setTab('edit')}
              variant={tab === 'edit' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs md:text-sm"
            >
              Editar
            </Button>
            <Button
              onClick={() => setTab('preview')}
              variant={tab === 'preview' ? 'default' : 'ghost'}
              size="sm"
              className="text-xs md:text-sm"
            >
              Vista previa
            </Button>
            {tab === 'preview' && (
              <Button onClick={handlePrint} size="sm" className="gap-2 text-xs md:text-sm">
                <Printer className="h-4 w-4" />
                <span className="hidden md:inline">Imprimir</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Bar */}
      {tab === 'edit' && (
        <div className="bg-card border-b border-border px-4 md:px-6 py-3 grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
          {[
            { label: 'Equipos', value: sub1, color: '#1a1a2e' },
            { label: 'Materiales', value: sub2, color: '#2d4a7a' },
            { label: 'M. de Obra', value: sub3, color: '#3a6b5a' },
            { label: `IVA (${taxRate}%)`, value: tax, color: '#b45309' },
            { label: 'TOTAL', value: total, color: '#dc2626', bold: true },
          ].map(({ label, value, color, bold }, i) => (
            <div
              key={i}
              className="p-2 md:p-3 rounded-lg border-l-4 bg-secondary/30"
              style={{ borderColor: color }}
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase">{label}</div>
              <div
                className={bold ? 'text-lg md:text-xl font-bold' : 'text-base md:text-lg font-semibold'}
                style={{ color }}
              >
                {fmt(value, currency)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto">
        {tab === 'edit' ? (
          <div className="space-y-6">
            {/* Company & Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
                <h2 className="font-bold text-base md:text-lg text-foreground">🏢 Datos de la Empresa</h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs md:text-sm font-medium text-foreground">Nombre</label>
                    <Input
                      value={company.name}
                      onChange={(e) => setCompany({ ...company, name: e.target.value })}
                      placeholder="Nombre de su empresa"
                      className="text-xs md:text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs md:text-sm font-medium text-foreground">RIF / NIT</label>
                      <Input
                        value={company.rif}
                        onChange={(e) => setCompany({ ...company, rif: e.target.value })}
                        placeholder="J-XXXXXXXX-X"
                        className="text-xs md:text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs md:text-sm font-medium text-foreground">Teléfono</label>
                      <Input
                        value={company.phone}
                        onChange={(e) => setCompany({ ...company, phone: e.target.value })}
                        placeholder="+58 XXX-XXXXXXX"
                        className="text-xs md:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Dirección</label>
                    <Input
                      value={company.address}
                      onChange={(e) => setCompany({ ...company, address: e.target.value })}
                      placeholder="Dirección completa"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input
                      value={company.email}
                      onChange={(e) => setCompany({ ...company, email: e.target.value })}
                      placeholder="correo@empresa.com"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h2 className="font-bold text-lg text-foreground">📋 Datos del Proyecto</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground">Nº Presupuesto</label>
                      <Input
                        value={project.number}
                        onChange={(e) => setProject({ ...project, number: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Fecha</label>
                      <Input
                        type="date"
                        value={project.date}
                        onChange={(e) => setProject({ ...project, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Cliente</label>
                    <Input
                      value={project.client}
                      onChange={(e) => setProject({ ...project, client: e.target.value })}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Ubicación</label>
                    <Input
                      value={project.location}
                      onChange={(e) => setProject({ ...project, location: e.target.value })}
                      placeholder="Ubicación del proyecto"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Vigencia</label>
                    <Input
                      value={project.validity}
                      onChange={(e) => setProject({ ...project, validity: e.target.value })}
                      placeholder="Ej: 15 días"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Kit Selector and Material Calculator */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-foreground">Herramientas Rápidas</h2>
                <div className="flex items-center gap-2">
                  <SaveKitDialog
                    equipment={equipment}
                    materials={materials}
                    labor={labor}
                    onSave={() => {
                      // Refresh kit selector by reloading customKits
                      window.dispatchEvent(new Event('customKitsUpdated'))
                    }}
                  />
                  <Button
                    onClick={() => {
                      if (confirm('¿Limpiar todos los items (equipos, materiales y mano de obra)?')) {
                        setEquipment([])
                        setMaterials([])
                        setLabor([])
                      }
                    }}
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    Limpiar Todo
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Cargar Kit Predefinido</p>
                  <KitSelector onLoadKit={handleLoadKit} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Calcular Materiales Automáticos</p>
                  <MaterialCalculator 
                    equipment={equipment}
                    materials={materials}
                    onAddMaterials={setMaterials}
                  />
                </div>
              </div>
            </div>
            <SectionTable
              title="Equipos Principales"
              icon="⚙️"
              items={equipment}
              setItems={setEquipment}
              color="#1a1a2e"
              currency={currency}
              catalogItems={CATALOGO_PRODUCTOS.equiposPrincipales.map(p => ({ 
                nombre: `${p.nombre} (${p.marca} ${p.modelo})`, 
                precio: p.precio 
              }))}
            />
            <SectionTable
              title="Materiales de Instalación"
              icon="🔧"
              items={materials}
              setItems={setMaterials}
              color="#2d4a7a"
              currency={currency}
              catalogItems={CATALOGO_PRODUCTOS.materialesInstalacion.map(p => ({ 
                nombre: `${p.nombre} (${p.marca})`, 
                precio: p.precio 
              }))}
            />
            <SectionTable
              title="Mano de Obra"
              icon="👷"
              items={labor}
              setItems={setLabor}
              color="#3a6b5a"
              currency={currency}
              catalogItems={[]}
            />

            {/* Tax & Conditions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-bold text-lg text-foreground mb-4">💰 Impuestos</h2>
                <div>
                  <label className="text-sm font-medium text-foreground">Tasa IVA (%)</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-bold text-lg text-foreground mb-4">📝 Condiciones</h2>
                <div className="space-y-2">
                  {conditions.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <Input
                        value={c}
                        onChange={(e) =>
                          setConditions(
                            conditions.map((_, idx) => (idx === i ? e.target.value : _))
                          )
                        }
                        className="text-sm"
                      />
                      <Button
                        onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    onClick={() => setConditions([...conditions, ''])}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar condición
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div id="print-area" className="bg-white text-gray-900 max-w-4xl mx-auto rounded-lg">
            <PrintPreview
              company={company}
              project={project}
              equipment={equipment}
              materials={materials}
              labor={labor}
              taxRate={taxRate}
              conditions={conditions}
              currency={currency}
            />
          </div>
        )}
      </div>
    </main>
  )
}

function PrintPreview({
  company,
  project,
  equipment,
  materials,
  labor,
  taxRate,
  conditions,
  currency,
}: any) {
  const sub1 = sumSection(equipment)
  const sub2 = sumSection(materials)
  const sub3 = sumSection(labor)
  const subtotal = sub1 + sub2 + sub3
  const tax = (subtotal * taxRate) / 100
  const total = subtotal + tax

  const renderTable = (title: string, items: Item[], color: string) => (
    <div>
      <div
        className="text-white px-6 py-2.5 font-bold text-sm"
        style={{ backgroundColor: color }}
      >
        {title}
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-300">
            {['#', 'Descripción', 'Und', 'Cant.', 'P.Unit', 'Total'].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-900">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-2 border-b border-gray-200 text-gray-700">{idx + 1}</td>
              <td className="px-4 py-2 border-b border-gray-200 text-gray-900">{item.desc}</td>
              <td className="px-4 py-2 border-b border-gray-200 text-gray-700 text-center">{item.unit}</td>
              <td className="px-4 py-2 border-b border-gray-200 text-gray-700 text-right">{item.qty}</td>
              <td className="px-4 py-2 border-b border-gray-200 text-gray-900 text-right font-semibold">{fmt(item.price, currency)}</td>
              <td className="px-4 py-2 border-b border-gray-200 text-gray-900 text-right font-bold">
                {fmt(item.qty * item.price, currency)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-gray-900">PRESUPUESTO DE PROYECTO</h1>
          <p className="text-sm text-gray-600 mt-1">Provisión de Materiales e Instalación — Sistema CCTV</p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 border-b-2 border-gray-300 pb-6">
          {/* Left: Company Info */}
          <div>
            <div className="mb-4">
              <h2 className="font-bold text-sm text-gray-900 mb-2">Empresa</h2>
              {company.name && <p className="text-sm font-semibold text-gray-900">{company.name}</p>}
              {company.rif && <p className="text-xs text-gray-700">RIF: {company.rif}</p>}
              {company.address && <p className="text-xs text-gray-700">{company.address}</p>}
              {company.phone && <p className="text-xs text-gray-700">Tel: {company.phone}</p>}
              {company.email && <p className="text-xs text-gray-700">{company.email}</p>}
            </div>
          </div>
          
          {/* Right: Project Info - Aligned Right */}
          <div className="text-right">
            <table className="ml-auto text-sm">
              <tbody>
                <tr>
                  <td className="font-bold pr-3 text-gray-900">Nº:</td>
                  <td className="text-gray-900">{project.number}</td>
                </tr>
                <tr>
                  <td className="font-bold pr-3 text-gray-900">Fecha:</td>
                  <td className="text-gray-900">{project.date}</td>
                </tr>
                <tr>
                  <td className="font-bold pr-3 text-gray-900">Vigencia:</td>
                  <td className="text-gray-900">{project.validity}</td>
                </tr>
                <tr>
                  <td className="font-bold pr-3 text-gray-900">Cliente:</td>
                  <td className="text-gray-700">{project.client || '—'}</td>
                </tr>
                <tr>
                  <td className="font-bold pr-3 text-gray-900">Ubicación:</td>
                  <td className="text-gray-700">{project.location || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="space-y-6">
        {renderTable('1. EQUIPOS PRINCIPALES', equipment, '#1a1a2e')}
        {renderTable('2. MATERIALES DE INSTALACIÓN', materials, '#2d4a7a')}
        {renderTable('3. MANO DE OBRA E INSTALACIÓN', labor, '#3a6b5a')}
      </div>

      {/* Summary Section */}
      <div className="mt-8 border-2 border-gray-900">
        <div className="bg-gray-900 text-white px-6 py-3 font-bold">RESUMEN</div>
        <div className="divide-y divide-gray-200">
          {[
            ['Equipos Principales', sub1],
            ['Materiales de Instalación', sub2],
            ['Mano de Obra', sub3],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between px-6 py-2 text-sm">
              <span className="text-gray-900">{label}</span>
              <span className="text-gray-900 font-semibold">{fmt(value as number, currency)}</span>
            </div>
          ))}
          <div className="flex justify-between px-6 py-2 bg-gray-100 text-sm font-bold text-gray-900">
            <span>Subtotal</span>
            <span>{fmt(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between px-6 py-2 text-sm text-gray-900">
            <span>IVA ({taxRate}%)</span>
            <span className="font-semibold">{fmt(tax, currency)}</span>
          </div>
          <div className="flex justify-between px-6 py-3 bg-gray-900 text-white font-bold text-lg">
            <span>TOTAL ({currency})</span>
            <span>{fmt(total, currency)}</span>
          </div>
        </div>
      </div>

      {/* Conditions Section */}
      {conditions.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-sm text-gray-900 mb-3">CONDICIONES COMERCIALES</h3>
          <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
            {conditions.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-around mt-16 text-xs text-center">
        <div>
          <div className="border-t border-gray-900 pt-2 w-48">Firma y Sello de la Empresa</div>
        </div>
        <div>
          <div className="border-t border-gray-900 pt-2 w-48">Aceptado por el Cliente</div>
        </div>
      </div>
    </div>
  )
}
