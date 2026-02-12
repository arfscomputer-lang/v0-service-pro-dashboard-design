import { NextResponse } from "next/server"
import { inventorySeed } from "@/lib/data/inventory"

/**
 * POST /api/inventory/reorder
 * Simula una integracion con proveedor (Shopify, webhook personalizado).
 * Recibe { itemId, quantity } y registra una orden de reabastecimiento.
 * En produccion esto dispararia un webhook al proveedor.
 */
export async function POST(req: Request) {
  const { itemId, quantity } = await req.json()

  if (!itemId || !quantity) {
    return NextResponse.json({ error: "Campos requeridos: itemId, quantity" }, { status: 400 })
  }

  const item = inventorySeed.find((i) => i.id === itemId)
  if (!item) {
    return NextResponse.json({ error: "Articulo no encontrado" }, { status: 404 })
  }

  // Simulate webhook payload to supplier
  const webhookPayload = {
    orderId: `PO-${Date.now()}`,
    supplier: item.supplier.name,
    supplierSku: item.supplier.sku,
    item: item.name,
    sku: item.sku,
    quantityOrdered: Number(quantity),
    unitCost: item.supplier.unitCost,
    totalCost: Number(quantity) * item.supplier.unitCost,
    currency: "MXN",
    estimatedDelivery: new Date(Date.now() + item.supplier.leadTimeDays * 86400000).toISOString().slice(0, 10),
    webhookUrl: item.supplier.apiEndpoint,
    status: "enviada",
    createdAt: new Date().toISOString(),
  }

  // In production: await fetch(item.supplier.apiEndpoint, { method: "POST", body: JSON.stringify(webhookPayload) })

  return NextResponse.json({
    message: `Orden de compra ${webhookPayload.orderId} creada para ${item.supplier.name}`,
    order: webhookPayload,
  })
}
