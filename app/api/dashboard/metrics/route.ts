import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    // Get work order metrics
    const workOrdersResult = await query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'completada' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status IN ('en_ruta', 'en_sitio') THEN 1 ELSE 0 END) as in_progress
      FROM work_orders WHERE created_at >= NOW() - INTERVAL '30 days'`,
      []
    )

    // Get technician metrics
    const techniciansResult = await query(
      `SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'disponible' THEN 1 END) as available 
       FROM technicians`,
      []
    )

    // Get customer metrics
    const customersResult = await query(
      `SELECT COUNT(*) as total FROM customers`,
      []
    )

    // Get inventory low stock
    const inventoryResult = await query(
      `SELECT COUNT(*) as low_stock FROM inventory_items 
       WHERE total_stock <= min_threshold`,
      []
    )

    // Get recent orders
    const recentOrdersResult = await query(
      `SELECT id, order_id, status, priority, created_at 
       FROM work_orders 
       ORDER BY created_at DESC 
       LIMIT 5`,
      []
    )

    return NextResponse.json({
      workOrders: workOrdersResult.rows[0] || {},
      technicians: techniciansResult.rows[0] || {},
      customers: customersResult.rows[0] || {},
      inventory: inventoryResult.rows[0] || {},
      recentOrders: recentOrdersResult.rows || [],
    })
  } catch (error) {
    console.error('[v0] Dashboard metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
