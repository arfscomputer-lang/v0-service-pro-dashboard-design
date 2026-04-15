import { NextResponse } from "next/server"
import { getInventoryItemById } from "@/lib/db"

/**
 * POST /api/inventory/reorder
 * Simula una integracion con proveedor.
 * Recibe { itemId, quantity } y registra una orden de reabastecimiento.
 */
export async function POST(req: Request) {
  const { itemId, quantity } = await req.json()

  if (!itemId || !quantity) {
    return NextResponse.json({ error: "Campos requeridos: itemId, quantity" }, { status: 400 })
  }

  const item = await getInventoryItemById(itemId) as any
  if (!item) {
    return NextResponse.json({ error: "Articulo no encontrado" }, { status: 404 })
  }

  const supplierName = item.supplier_name ?? item.supplier?.name ?? "Proveedor desconocido"
  const unitCost = item.unit_cost ?? item.costUnit ?? 0

  const webhookPayload = {
    orderId: `PO-${Date.now()}`,
    supplier: supplierName,
    item: item.name,
    sku: item.sku,
    quantityOrdered: Number(quantity),
    unitCost,
    totalCost: Number(quantity) * unitCost,
    currency: "MXN",
    status: "enviada",
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json({
    message: `Orden de compra ${webhookPayload.orderId} creada para ${supplierName}`,
    order: webhookPayload,
  })
}
