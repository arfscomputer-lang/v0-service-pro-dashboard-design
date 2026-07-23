'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import {
  Plus, X, Printer, DollarSign, Building2, FileText,
  Cog, HardHat, Receipt, ClipboardList, Trash2, Zap,
  Camera, FilePlus, Eye, Edit3, Save, Send, CheckCircle2,
  ChevronDown, Search, Lock, LockOpen, AlertTriangle, Upload, Loader2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { savePriceHistory } from '@/lib/price-history'
import { PriceHistoryHint } from '@/components/budget/price-history-hint'
import { RUBRO_DEFAULT_KIT, RUBRO_PREFIXES, RUBROS } from '@/lib/rubro-kits'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Item {
  id: number
  desc: string
  unit: string
  qty: number
  price: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  rif?: string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  VES: 36.5,
  PYG: 6800,
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  borrador:  { label: 'Borrador',  color: 'bg-gray-100 text-gray-700 border-gray-300' },
  enviado:   { label: 'Enviado',   color: 'bg-blue-100 text-blue-700 border-blue-300' },
  aceptado:  { label: 'Aceptado', color: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  rechazado: { label: 'Rechazado', color: 'bg-red-100 text-red-700 border-red-300' },
}

const DEFAULT_CONDITIONS = [
  'Forma de pago: 50% anticipo, 50% contra entrega.',
  'Tiempo de entrega de materiales: 5-10 días hábiles.',
  'Garantía de equipos: 1 año por defectos de fábrica.',
]

let _nextId = 200
function nid() { return ++_nextId }

function fmt(n: number, currency: string = 'USD') {
  const rate = EXCHANGE_RATES[currency] || 1
  const converted = n * rate
  const symbols: Record<string, string> = { USD: '$', VES: 'Bs.', PYG: '₲' }
  return `${symbols[currency] || '$'} ${converted.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function sumSection(items: Item[]) {
  return items.reduce((s, i) => s + i.qty * i.price, 0)
}

function rubroPrefix(rubro: string) {
  return RUBRO_PREFIXES[rubro] || 'PRE'
}

function makeNumero(rubro: string) {
  const ts = Date.now().toString().slice(-6)
  return `${rubroPrefix(rubro)}-${ts}`
}

// ── SectionTable ───────────────────────────────────────────────────────────────

interface SectionTableProps {
  title: string
  icon: LucideIcon
  items: Item[]
  setItems: (items: Item[]) => void
  color: string
  currency: 'USD' | 'VES' | 'PYG'
  catalogItems?: { nombre: string; precio?: number }[]
  readOnly?: boolean
}

function SectionTable({ title, icon: Icon, items, setItems, color, currency, catalogItems = [], readOnly = false }: SectionTableProps) {
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [searchText, setSearchText] = useState<Record<number, string>>({})
  const [editingPrice, setEditingPrice] = useState<Record<number, string>>({})

  const add = () => setItems([...items, { id: nid(), desc: '', unit: 'Und', qty: 1, price: 0 }])
  const remove = (id: number) => setItems(items.filter((i) => i.id !== id))
  const update = (id: number, field: string, val: any) =>
    setItems(items.map((i) => i.id === id ? { ...i, [field]: field === 'qty' || field === 'price' ? parseFloat(val) || 0 : val } : i))

  const handleSelectFromCatalog = (id: number, item: { nombre: string; precio?: number }) => {
    update(id, 'desc', item.nombre)
    if (item.precio) {
      update(id, 'price', item.precio)
      setEditingPrice((prev) => { const next = { ...prev }; delete next[id]; return next })
    }
    setOpenDropdown(null)
    setSearchText({ ...searchText, [id]: '' })
  }

  const getFiltered = (id: number) => {
    const search = searchText[id]?.toLowerCase() || ''
    return catalogItems.filter((item) => item.nombre.toLowerCase().includes(search))
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-6 py-3 flex items-center gap-3 text-white" style={{ backgroundColor: color }}>
        <Icon className="h-5 w-5 shrink-0 opacity-90" />
        <span className="font-semibold text-base flex-1 tracking-wide">{title}</span>
        <span className="text-xs font-medium opacity-75 bg-white/20 rounded-full px-2 py-0.5">{items.length} ítems</span>
        {readOnly && <Lock className="h-3.5 w-3.5 opacity-60" />}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {['#', 'Descripción', 'Und', 'Cant.', `P.Unit (${currency})`, `Total (${currency})`, ''].map((h, i) => (
                <th key={i} className="px-4 py-3 text-sm font-semibold text-left text-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-secondary/10'}>
                <td className="px-4 py-3 text-sm text-foreground">{idx + 1}</td>
                <td className="px-4 py-3 relative">
                  <div className="relative">
                    <Input
                      value={item.desc}
                      onChange={(e) => {
                        update(item.id, 'desc', e.target.value)
                        setSearchText({ ...searchText, [item.id]: e.target.value })
                      }}
                      onFocus={() => !readOnly && setOpenDropdown(item.id)}
                      onBlur={() => setTimeout(() => setOpenDropdown(null), 200)}
                      placeholder="Buscar o escribir..."
                      className="text-sm"
                      disabled={readOnly}
                    />
                    {openDropdown === item.id && catalogItems.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                        {getFiltered(item.id).length > 0 ? getFiltered(item.id).map((cat, i) => (
                          <button key={i} onMouseDown={() => handleSelectFromCatalog(item.id, cat)}
                            className="w-full text-left px-3 py-2 hover:bg-secondary text-sm border-b border-border last:border-b-0">
                            <div className="font-medium text-foreground">{cat.nombre}</div>
                            {cat.precio && <div className="text-xs text-muted-foreground">${cat.precio.toFixed(2)}</div>}
                          </button>
                        )) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">Sin coincidencias</div>
                        )}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Select value={item.unit} onValueChange={(v) => !readOnly && update(item.id, 'unit', v)} disabled={readOnly}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Und', 'Gbl', 'Mt', 'Ml', 'Kg', 'Rollo', 'Pack', 'Kit', 'Hora', 'Servicio', 'Libra', 'Punto'].map((u) => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3">
                  <Input type="number" min="0" value={item.qty}
                    onChange={(e) => update(item.id, 'qty', e.target.value)}
                    className="text-sm text-right" disabled={readOnly} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {currency === 'USD' ? '$' : currency === 'VES' ? 'Bs.' : '₲'}
                    </span>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={editingPrice[item.id] ?? (item.price * (EXCHANGE_RATES[currency] ?? 1)).toFixed(2)}
                      onFocus={() => {
                        setEditingPrice((prev) => ({
                          ...prev,
                          [item.id]: (item.price * (EXCHANGE_RATES[currency] ?? 1)).toFixed(2),
                        }))
                      }}
                      onChange={(e) => setEditingPrice((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      onBlur={(e) => {
                        const num = parseFloat(e.target.value.replace(',', '.').trim())
                        setEditingPrice((prev) => { const next = { ...prev }; delete next[item.id]; return next })
                        if (!isNaN(num) && num >= 0) {
                          const usd = num / (EXCHANGE_RATES[currency] ?? 1)
                          update(item.id, 'price', usd.toString())
                          savePriceHistory(item.desc, usd, 'USD')
                        }
                      }}
                      className="text-sm text-right" placeholder="0.00" disabled={readOnly} />
                  </div>
                  {!readOnly && currency !== 'USD' && item.price > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">USD: ${item.price.toFixed(2)}</div>
                  )}
                  {!readOnly && <PriceHistoryHint productName={item.desc} currency={currency}
                    onUsePrice={(price) => {
                      setEditingPrice((prev) => { const next = { ...prev }; delete next[item.id]; return next })
                      update(item.id, 'price', price.toString())
                    }} />}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-right text-foreground">
                  {fmt(item.qty * item.price, currency)}
                </td>
                <td className="px-4 py-3 text-center">
                  {!readOnly && (
                    <button onClick={() => remove(item.id)} className="text-destructive hover:bg-destructive/10 rounded p-1">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <div className="px-6 py-3 border-t border-border">
          <Button onClick={add} variant="outline" className="text-sm" style={{ borderColor: color, color }}>
            <Plus className="h-4 w-4 mr-2" />Agregar ítem
          </Button>
        </div>
      )}
    </div>
  )
}

// ── PrintPreview ───────────────────────────────────────────────────────────────

function PrintPreview({ company, project, rubro, equipment, materials, labor, taxRate, conditions, currency }: any) {
  const sub1 = sumSection(equipment)
  const sub2 = sumSection(materials)
  const sub3 = sumSection(labor)
  const subtotal = sub1 + sub2 + sub3
  const isPYG = currency === 'PYG'
  const tax = isPYG ? subtotal / 11 : (subtotal * taxRate) / 100
  const total = isPYG ? subtotal : subtotal + tax

  const renderTable = (title: string, items: Item[], color: string) => (
    <div>
      <div className="text-white px-6 py-2.5 font-bold text-sm" style={{ backgroundColor: color }}>{title}</div>
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-300">
            {['#', 'Descripción', 'Und', 'Cant.', 'P.Unit', 'Total'].map((h) => (
              <th key={h} className="px-4 py-2.5 text-left font-semibold text-gray-900">{h}</th>
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
              <td className="px-4 py-2 border-b border-gray-200 text-gray-900 text-right font-bold">{fmt(item.qty * item.price, currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="p-8 bg-white print:bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">PRESUPUESTO DE PROYECTO</h1>
        <p className="text-sm text-gray-600 mt-1">Rubro: {rubro} — Provisión de Materiales e Instalación</p>
        <div className="grid grid-cols-2 gap-8 border-b-2 border-gray-300 pb-6 mt-4">
          <div>
            {company.name && <p className="text-sm font-semibold text-gray-900">{company.name}</p>}
            {company.rif && <p className="text-xs text-gray-700">RIF: {company.rif}</p>}
            {company.address && <p className="text-xs text-gray-700">{company.address}</p>}
            {company.phone && <p className="text-xs text-gray-700">Tel: {company.phone}</p>}
            {company.email && <p className="text-xs text-gray-700">{company.email}</p>}
          </div>
          <div className="text-right">
            <table className="ml-auto text-sm">
              <tbody>
                {[['Nº:', project.number], ['Fecha:', project.date], ['Vigencia:', project.validity], ['Cliente:', project.client || '—'], ['Ubicación:', project.location || '—']].map(([k, v]) => (
                  <tr key={k}><td className="font-bold pr-3 text-gray-900">{k}</td><td className="text-gray-900">{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        {renderTable('1. EQUIPOS PRINCIPALES', equipment, '#1a1a2e')}
        {renderTable('2. MATERIALES DE INSTALACIÓN', materials, '#2d4a7a')}
        {renderTable('3. MANO DE OBRA E INSTALACIÓN', labor, '#3a6b5a')}
      </div>
      <div className="mt-8 border-2 border-gray-900">
        <div className="bg-gray-900 text-white px-6 py-3 font-bold">RESUMEN</div>
        <div className="divide-y divide-gray-200">
          {[['Equipos Principales', sub1], ['Materiales de Instalación', sub2], ['Mano de Obra', sub3]].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between px-6 py-2 text-sm">
              <span className="text-gray-900">{label}</span>
              <span className="text-gray-900 font-semibold">{fmt(value as number, currency)}</span>
            </div>
          ))}
          <div className="flex justify-between px-6 py-2 bg-gray-100 text-sm font-bold text-gray-900">
            <span>Subtotal</span><span>{fmt(subtotal, currency)}</span>
          </div>
          <div className="flex justify-between px-6 py-2 text-sm text-gray-900">
            <span>{isPYG ? 'IVA incluido (10%)' : `IVA (${taxRate}%)`}</span>
            <span className="font-semibold">{fmt(tax, currency)}</span>
          </div>
          <div className="flex justify-between px-6 py-3 bg-gray-900 text-white font-bold text-lg">
            <span>TOTAL ({currency})</span><span>{fmt(total, currency)}</span>
          </div>
        </div>
      </div>
      {conditions.length > 0 && (
        <div className="mt-8">
          <h3 className="font-bold text-sm text-gray-900 mb-3">CONDICIONES COMERCIALES</h3>
          <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
            {conditions.map((c: string, i: number) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}
      <div className="flex justify-around mt-16 text-xs text-center">
        <div><div className="border-t border-gray-900 pt-2 w-48">Firma y Sello de la Empresa</div></div>
        <div><div className="border-t border-gray-900 pt-2 w-48">Aceptado por el Cliente</div></div>
      </div>
    </div>
  )
}

// ── BudgetEditor (main export) ─────────────────────────────────────────────────

interface BudgetEditorProps {
  budgetId?: string
}

export function BudgetEditor({ budgetId }: BudgetEditorProps) {
  const router = useRouter()
  const isNew = !budgetId

  // — core state —
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [rubro, setRubro] = useState('CCTV')
  const [currency, setCurrency] = useState<'USD' | 'VES' | 'PYG'>('USD')
  const [status, setStatus] = useState('borrador')
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [saved, setSaved] = useState(false)
  const [reopening, setReopening] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const readOnly = status === 'aceptado'

  // — company & project —
  const [company, setCompany] = useState({ name: '', rif: '', address: '', phone: '', email: '' })
  const [project, setProject] = useState({
    number: makeNumero('CCTV'),
    date: new Date().toISOString().split('T')[0],
    validity: '15 días',
    client: '',
    location: '',
  })

  // — customer autocomplete —
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [customerQuery, setCustomerQuery] = useState('')
  const [showCustomerDrop, setShowCustomerDrop] = useState(false)
  const customerRef = useRef<HTMLDivElement>(null)

  // — items —
  const [equipment, setEquipment] = useState<Item[]>([])
  const [materials, setMaterials] = useState<Item[]>([])
  const [labor, setLabor] = useState<Item[]>([])
  const [taxRate, setTaxRate] = useState(16)
  const [conditions, setConditions] = useState(DEFAULT_CONDITIONS)

  // — PDF import —
  const [importingPdf, setImportingPdf] = useState(false)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  // — totals —
  const sub1 = sumSection(equipment)
  const sub2 = sumSection(materials)
  const sub3 = sumSection(labor)
  const subtotal = sub1 + sub2 + sub3
  const isPYG = currency === 'PYG'
  const tax = isPYG ? subtotal / 11 : (subtotal * taxRate) / 100
  const total = isPYG ? subtotal : subtotal + tax

  // ── Load customers ──────────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/customers')
      .then((r) => r.json())
      .then((d) => setCustomers(d.customers || []))
      .catch(() => {})
  }, [])

  // ── Load existing budget ────────────────────────────────────────────────────
  useEffect(() => {
    if (!budgetId) {
      // New budget: load CCTV default kit
      const kit = RUBRO_DEFAULT_KIT['CCTV']
      setEquipment(kit.equipos.map((i, idx) => ({ id: idx + 1, ...i })))
      setMaterials(kit.materiales.map((i, idx) => ({ id: idx + 1, ...i })))
      setLabor(kit.mano_de_obra.map((i, idx) => ({ id: idx + 1, ...i })))
      return
    }
    fetch(`/api/budgets/${budgetId}`)
      .then((r) => r.json())
      .then(({ budget }) => {
        if (!budget) return
        setRubro(budget.rubro)
        setStatus(budget.status)
        setCurrency(budget.currency)
        setTaxRate(Number(budget.tax_rate))
        setCompany(budget.company_data || { name: '', rif: '', address: '', phone: '', email: '' })
        setProject({
          number: budget.numero,
          date: budget.fecha?.slice(0, 10) || new Date().toISOString().split('T')[0],
          validity: budget.vigencia,
          client: budget.customer_name || '',
          location: budget.company_data?.location || '',
        })
        setCustomerId(budget.customer_id || null)
        setCustomerQuery(budget.customer_name || '')
        const s = budget.sections || {}
        setEquipment((s.equipos || []).map((i: any, idx: number) => ({ id: idx + 1, ...i })))
        setMaterials((s.materiales || []).map((i: any, idx: number) => ({ id: idx + 1, ...i })))
        setLabor((s.mano_de_obra || []).map((i: any, idx: number) => ({ id: idx + 1, ...i })))
        setConditions(budget.conditions || DEFAULT_CONDITIONS)
      })
      .catch(() => {})
  }, [budgetId])

  // ── Rubro change → load default kit ────────────────────────────────────────
  const handleRubroChange = (newRubro: string) => {
    if (newRubro === rubro) return
    const hasItems = equipment.length + materials.length + labor.length > 0
    if (hasItems && !confirm(`¿Cambiar rubro a "${newRubro}"? Se reemplazarán los ítems con la plantilla del rubro.`)) return
    setRubro(newRubro)
    setProject((p) => ({ ...p, number: makeNumero(newRubro) }))
    const kit = RUBRO_DEFAULT_KIT[newRubro]
    if (kit) {
      setEquipment(kit.equipos.map((i, idx) => ({ id: idx + 1, ...i })))
      setMaterials(kit.materiales.map((i, idx) => ({ id: idx + 1, ...i })))
      setLabor(kit.mano_de_obra.map((i, idx) => ({ id: idx + 1, ...i })))
    }
  }

  // ── Customer autocomplete ───────────────────────────────────────────────────
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerQuery.toLowerCase())
  ).slice(0, 8)

  const handleSelectCustomer = (c: Customer) => {
    setCustomerId(c.id)
    setCustomerQuery(c.name)
    setProject((p) => ({ ...p, client: c.name }))
    setShowCustomerDrop(false)
    // Auto-fill company fields with customer data
    setCompany({
      name: c.name,
      rif: c.rif || '',
      address: [c.address, c.city].filter(Boolean).join(', '),
      phone: c.phone || '',
      email: c.email,
    })
  }

  // ── Kit loading ─────────────────────────────────────────────────────────────
  const handleLoadKit = useCallback((kitItems: Array<{
    section: 'equipos' | 'materiales' | 'mano_de_obra'
    description: string
    unit: string
    quantity: number
    price: number
  }>) => {
    const base = { equipos: equipment, materiales: materials, mano_de_obra: labor }
    const maxId = (arr: Item[]) => Math.max(...arr.map((e) => e.id), 0)

    setEquipment([...equipment, ...kitItems.filter((i) => i.section === 'equipos').map((i, idx) => ({
      id: maxId(base.equipos) + idx + 1, desc: i.description, unit: i.unit, qty: i.quantity, price: i.price
    }))])
    setMaterials([...materials, ...kitItems.filter((i) => i.section === 'materiales').map((i, idx) => ({
      id: maxId(base.materiales) + idx + 1, desc: i.description, unit: i.unit, qty: i.quantity, price: i.price
    }))])
    setLabor([...labor, ...kitItems.filter((i) => i.section === 'mano_de_obra').map((i, idx) => ({
      id: maxId(base.mano_de_obra) + idx + 1, desc: i.description, unit: i.unit, qty: i.quantity, price: i.price
    }))])
  }, [equipment, materials, labor])

  // ── PDF import ──────────────────────────────────────────────────────────────
  const handleImportPdfClick = () => {
    if (readOnly) return
    pdfInputRef.current?.click()
  }

  const handleImportPdfFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (
      (equipment.length + materials.length + labor.length > 0) &&
      !confirm('Se agregarán los ítems detectados en el PDF a las listas actuales. ¿Continuar?')
    ) {
      return
    }

    setImportingPdf(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/budgets/extract-pdf', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) {
        alert(json.error || 'No se pudo extraer el presupuesto del PDF.')
        return
      }

      const data = json.data || {}
      const toItems = (arr: any[] | undefined, baseId: number) =>
        (arr || []).map((i, idx) => ({
          id: baseId + idx + 1,
          desc: i.desc || '',
          unit: i.unit || 'Und',
          qty: Number(i.qty) || 1,
          price: Number(i.price) || 0,
        }))

      const maxId = (arr: Item[]) => Math.max(...arr.map((e) => e.id), 0)
      setEquipment([...equipment, ...toItems(data.equipos, maxId(equipment))])
      setMaterials([...materials, ...toItems(data.materiales, maxId(materials))])
      setLabor([...labor, ...toItems(data.mano_de_obra, maxId(labor))])

      if (data.company) {
        setCompany((c) => ({
          name: data.company.name ?? c.name,
          rif: data.company.rif ?? c.rif,
          address: data.company.address ?? c.address,
          phone: data.company.phone ?? c.phone,
          email: data.company.email ?? c.email,
        }))
      }
      if (data.project) {
        setProject((p) => ({
          ...p,
          number: data.project.number ?? p.number,
          date: data.project.date ?? p.date,
          validity: data.project.validity ?? p.validity,
          location: data.project.location ?? p.location,
        }))
      }
      if (data.currency) setCurrency(data.currency)
      if (data.tax_rate !== undefined) setTaxRate(Number(data.tax_rate))
    } catch {
      alert('Error al importar el PDF.')
    } finally {
      setImportingPdf(false)
    }
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true)
    const payload = {
      customer_id: customerId,
      rubro,
      status,
      numero: project.number,
      fecha: project.date,
      vigencia: project.validity,
      company_data: { ...company, location: project.location },
      sections: { equipos: equipment, materiales: materials, mano_de_obra: labor },
      currency,
      tax_rate: taxRate,
      total,
      conditions,
    }
    try {
      const url = budgetId ? `/api/budgets/${budgetId}` : '/api/budgets'
      const method = budgetId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const { budget } = await res.json()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      if (isNew && budget?.id) router.push(`/presupuestos/${budget.id}`)
    } catch {
      alert('Error al guardar presupuesto.')
    } finally {
      setSaving(false)
    }
  }

  // ── Send to client ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!budgetId) { alert('Primero guarde el presupuesto.'); return }
    if (!confirm('¿Enviar este presupuesto al cliente? El estado cambiará a "Enviado".')) return
    setSending(true)
    try {
      await fetch(`/api/budgets/${budgetId}/send`, { method: 'POST' })
      setStatus('enviado')
    } catch {
      alert('Error al enviar presupuesto.')
    } finally {
      setSending(false)
    }
  }

  // ── Reopen ─────────────────────────────────────────────────────────────────
  const handleReopen = async () => {
    if (!budgetId) return
    const ok = confirm(
      '⚠️ Este presupuesto fue aceptado por el cliente.\n\n' +
      'Si lo reabrís, el estado volverá a "Borrador" y el cliente deberá aprobarlo nuevamente.\n\n' +
      '¿Confirmar?'
    )
    if (!ok) return
    setReopening(true)
    try {
      await fetch(`/api/budgets/${budgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'borrador' }),
      })
      setStatus('borrador')
    } catch {
      alert('Error al reabrir el presupuesto.')
    } finally {
      setReopening(false)
    }
  }

  // ── Print ───────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    window.print()
  }

  const stConfig = STATUS_CONFIG[status] || STATUS_CONFIG.borrador

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-card border-b border-border px-4 md:px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 flex-wrap md:flex-nowrap">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-foreground truncate">
                  {isNew ? 'Nuevo Presupuesto' : `Presupuesto ${project.number}`}
                </h1>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${stConfig.color}`}>{stConfig.label}</Badge>
              </div>
              <p className="text-xs text-muted-foreground hidden md:block">
                {isNew ? 'Seleccioná el rubro y completá los datos' : `Rubro: ${rubro}`}
              </p>
            </div>
          </div>

          {/* Rubro selector */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-secondary">
            <span className="text-xs text-muted-foreground font-medium mr-1">Rubro:</span>
            <Select value={rubro} onValueChange={handleRubroChange}>
              <SelectTrigger className="border-0 bg-transparent p-0 h-auto focus:ring-0 text-sm font-semibold w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RUBROS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1 md:gap-2 flex-wrap justify-end">
            {/* Currency */}
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-secondary border border-border">
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

            {/* Tab toggle */}
            <div className="flex items-center rounded-lg border border-border bg-secondary/50 p-0.5 gap-0.5">
              <Button onClick={() => setTab('edit')} variant={tab === 'edit' ? 'default' : 'ghost'} size="sm" className="gap-1.5 text-xs md:text-sm h-7 px-2 md:px-3">
                <Edit3 className="h-3.5 w-3.5" /><span className="hidden sm:inline">Editar</span>
              </Button>
              <Button onClick={() => setTab('preview')} variant={tab === 'preview' ? 'default' : 'ghost'} size="sm" className="gap-1.5 text-xs md:text-sm h-7 px-2 md:px-3">
                <Eye className="h-3.5 w-3.5" /><span className="hidden sm:inline">Vista previa</span>
              </Button>
            </div>

            {tab === 'preview' && <Button onClick={handlePrint} size="sm" className="gap-2 text-xs md:text-sm"><Printer className="h-4 w-4" /><span className="hidden md:inline">Imprimir</span></Button>}

            {readOnly ? (
              /* Locked — reopen button only */
              <Button onClick={handleReopen} variant="outline" size="sm" disabled={reopening}
                className="gap-1.5 text-xs md:text-sm border-amber-400 text-amber-700 hover:bg-amber-50">
                <LockOpen className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{reopening ? 'Reabriendo…' : 'Reabrir para edición'}</span>
              </Button>
            ) : (
              <>
                {/* Send */}
                {status !== 'enviado' && (
                  <Button onClick={handleSend} variant="outline" size="sm" disabled={sending || isNew} className="gap-1.5 text-xs md:text-sm border-blue-400 text-blue-600 hover:bg-blue-50">
                    <Send className="h-3.5 w-3.5" /><span className="hidden sm:inline">{sending ? 'Enviando…' : 'Enviar'}</span>
                  </Button>
                )}
                {/* Save */}
                <Button onClick={handleSave} size="sm" disabled={saving} className="gap-1.5 text-xs md:text-sm">
                  {saved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{saving ? 'Guardando…' : saved ? 'Guardado' : 'Guardar'}</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary bar */}
      {tab === 'edit' && (
        <div className="bg-card border-b border-border px-4 md:px-6 py-3 grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-3">
          {[
            { label: 'Equipos', value: sub1, color: '#1a1a2e' },
            { label: 'Materiales', value: sub2, color: '#2d4a7a' },
            { label: 'M. de Obra', value: sub3, color: '#3a6b5a' },
            { label: isPYG ? 'IVA incluido (10%)' : `IVA (${taxRate}%)`, value: tax, color: '#b45309' },
            { label: 'TOTAL', value: total, color: '#dc2626', bold: true },
          ].map(({ label, value, color, bold }, i) => (
            <div key={i} className="p-2 md:p-3 rounded-lg border-l-4 bg-secondary/30" style={{ borderColor: color }}>
              <div className="text-xs font-semibold text-muted-foreground uppercase">{label}</div>
              <div className={bold ? 'text-lg md:text-xl font-bold' : 'text-base md:text-lg font-semibold'} style={{ color }}>
                {fmt(value, currency)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Locked banner */}
      {readOnly && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 md:px-6 py-2.5 flex items-center gap-3">
          <Lock className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800 font-medium flex-1">
            Este presupuesto fue <strong>aceptado por el cliente</strong> y está en modo solo lectura.
          </p>
          <button onClick={handleReopen} disabled={reopening}
            className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-900 border border-amber-400 rounded-md px-2.5 py-1 hover:bg-amber-50 transition-colors disabled:opacity-50">
            <LockOpen className="h-3 w-3" />
            {reopening ? 'Reabriendo…' : 'Reabrir'}
          </button>
        </div>
      )}

      {/* Content */}
      <div className="px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto">
        {tab === 'edit' ? (
          <div className="space-y-6">
            {/* Company & Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-base text-foreground flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Datos del Cliente</h2>
                <div className="space-y-3">
                  <div><label className="text-xs md:text-sm font-medium text-foreground">Nombre</label>
                    <Input value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="Se autocompleta al seleccionar cliente" className="text-xs md:text-sm" disabled={readOnly} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-xs md:text-sm font-medium text-foreground">RIF / NIT</label>
                      <Input value={company.rif} onChange={(e) => setCompany({ ...company, rif: e.target.value })} placeholder="J-XXXXXXXX-X" className="text-xs md:text-sm" disabled={readOnly} /></div>
                    <div><label className="text-xs md:text-sm font-medium text-foreground">Teléfono</label>
                      <Input value={company.phone} onChange={(e) => setCompany({ ...company, phone: e.target.value })} placeholder="+58 XXX-XXXXXXX" className="text-xs md:text-sm" disabled={readOnly} /></div>
                  </div>
                  <div><label className="text-sm font-medium text-foreground">Dirección</label>
                    <Input value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} placeholder="Dirección completa" disabled={readOnly} /></div>
                  <div><label className="text-sm font-medium text-foreground">Email</label>
                    <Input value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} placeholder="correo@empresa.com" disabled={readOnly} /></div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-4">
                <h2 className="font-semibold text-base text-foreground flex items-center gap-2"><ClipboardList className="h-4 w-4 text-primary" /> Datos del Proyecto</h2>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-sm font-medium text-foreground">Nº Presupuesto</label>
                      <Input value={project.number} onChange={(e) => setProject({ ...project, number: e.target.value })} /></div>
                    <div><label className="text-sm font-medium text-foreground">Fecha</label>
                      <Input type="date" value={project.date} onChange={(e) => setProject({ ...project, date: e.target.value })} /></div>
                  </div>

                  {/* Customer autocomplete */}
                  <div>
                    <label className="text-sm font-medium text-foreground">Cliente</label>
                    <div className="relative">
                      <Input
                        value={customerQuery}
                        onChange={(e) => {
                          setCustomerQuery(e.target.value)
                          setShowCustomerDrop(true)
                          setCustomerId(null)
                        }}
                        onFocus={() => !readOnly && setShowCustomerDrop(true)}
                        onBlur={() => setShowCustomerDrop(false)}
                        placeholder="Buscar cliente en la base de datos..."
                        className="pr-8"
                        autoComplete="off"
                        disabled={readOnly}
                      />
                      <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      {showCustomerDrop && filteredCustomers.length > 0 && (
                        <div
                          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {filteredCustomers.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectCustomer(c)}
                              className="w-full text-left px-3 py-2.5 hover:bg-secondary text-sm border-b border-border last:border-b-0 transition-colors"
                            >
                              <div className="font-medium text-foreground">{c.name}</div>
                              <div className="text-xs text-muted-foreground">{c.email}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {showCustomerDrop && customers.length === 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-sm z-50 px-3 py-2 text-sm text-muted-foreground">
                          Cargando clientes…
                        </div>
                      )}
                    </div>
                    {customerId && (
                      <p className="text-xs text-emerald-600 mt-1">✓ Vinculado al cliente</p>
                    )}
                  </div>

                  <div><label className="text-sm font-medium text-foreground">Ubicación</label>
                    <Input value={project.location} onChange={(e) => setProject({ ...project, location: e.target.value })} placeholder="Ubicación del proyecto" disabled={readOnly} /></div>
                  <div><label className="text-sm font-medium text-foreground">Vigencia</label>
                    <Input value={project.validity} onChange={(e) => setProject({ ...project, validity: e.target.value })} placeholder="Ej: 15 días" /></div>
                </div>
              </div>
            </div>

            {/* Kit tools */}
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-lg text-foreground">Herramientas Rápidas</h2>
                <div className="flex items-center gap-2">
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleImportPdfFile}
                  />
                  <Button onClick={handleImportPdfClick} variant="outline" size="sm"
                    disabled={importingPdf || readOnly} className="gap-1.5">
                    {importingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {importingPdf ? 'Importando…' : 'Importar desde PDF'}
                  </Button>
                  <SaveKitDialog equipment={equipment} materials={materials} labor={labor}
                    onSave={() => window.dispatchEvent(new Event('customKitsUpdated'))} />
                  <Button onClick={() => {
                    if (confirm('¿Limpiar todos los ítems?')) {
                      setEquipment([]); setMaterials([]); setLabor([])
                    }
                  }} variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    Limpiar Todo
                  </Button>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Cargar Kit Predefinido</p>
                  <KitSelector rubro={rubro} onLoadKit={handleLoadKit} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Calcular Materiales Automáticos</p>
                  <MaterialCalculator equipment={equipment} materials={materials} onAddMaterials={setMaterials} />
                </div>
              </div>
            </div>

            {/* Section tables */}
            <SectionTable title="Equipos Principales" icon={Cog} items={equipment} setItems={setEquipment} color="#1a1a2e" currency={currency} readOnly={readOnly}
              catalogItems={CATALOGO_PRODUCTOS.equiposPrincipales.map((p) => ({ nombre: `${p.nombre} (${p.marca} ${p.modelo})`, precio: p.precio }))} />
            <SectionTable title="Materiales de Instalación" icon={Zap} items={materials} setItems={setMaterials} color="#2d4a7a" currency={currency} readOnly={readOnly}
              catalogItems={CATALOGO_PRODUCTOS.materialesInstalacion.map((p) => ({ nombre: `${p.nombre} (${p.marca})`, precio: p.precio }))} />
            <SectionTable title="Mano de Obra e Instalación" icon={HardHat} items={labor} setItems={setLabor} color="#3a6b5a" currency={currency} readOnly={readOnly} />

            {/* Tax & Conditions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-base text-foreground mb-4 flex items-center gap-2"><Receipt className="h-4 w-4 text-primary" /> Impuestos</h2>
                {isPYG ? (
                  <p className="text-sm text-muted-foreground">IVA incluido en precios (10%).</p>
                ) : (
                  <div><label className="text-sm font-medium text-foreground">Tasa IVA (%)</label>
                    <Input type="number" min="0" max="100" value={taxRate} onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)} /></div>
                )}
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-semibold text-base text-foreground mb-4 flex items-center gap-2"><FileText className="h-4 w-4 text-primary" /> Condiciones Comerciales</h2>
                <div className="space-y-2">
                  {conditions.map((c, i) => (
                    <div key={i} className="flex gap-2">
                      <Input value={c} onChange={(e) => setConditions(conditions.map((_, idx) => idx === i ? e.target.value : _))} className="text-sm" />
                      <Button onClick={() => setConditions(conditions.filter((_, idx) => idx !== i))} variant="ghost" size="sm"><X className="h-4 w-4" /></Button>
                    </div>
                  ))}
                  <Button onClick={() => setConditions([...conditions, ''])} variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />Agregar condición
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white text-gray-900 max-w-4xl mx-auto rounded-lg">
            <PrintPreview company={company} project={project} rubro={rubro} equipment={equipment} materials={materials} labor={labor} taxRate={taxRate} conditions={conditions} currency={currency} />
          </div>
        )}
      </div>

      {/* Hidden print target — rendered via portal so it's never clipped by the
          app shell's overflow-hidden containers when the browser paginates for print. */}
      {mounted && createPortal(
        <div id="print-area" style={{ position: 'fixed', top: 0, left: '-99999px' }} className="w-[800px] bg-white text-gray-900">
          <PrintPreview company={company} project={project} rubro={rubro} equipment={equipment} materials={materials} labor={labor} taxRate={taxRate} conditions={conditions} currency={currency} />
        </div>,
        document.body
      )}
    </>
  )
}
