import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET() {
  try {
    const workOrdersResult = await query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'completada' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status IN ('en_ruta', 'en_sitio') THEN 1 ELSE 0 END) as in_progress
      FROM work_orders`,
      []
    )

    const techniciansResult = await query(
      `SELECT COUNT(*) as total, COUNT(CASE WHEN status = 'disponible' THEN 1 END) as available
       FROM technicians`,
      []
    )

    const customersResult = await query(
      `SELECT COUNT(*) as total FROM customers`,
      []
    )

    const inventoryResult = await query(
      `SELECT COUNT(*) as low_stock FROM inventory_items
       WHERE total_stock <= min_threshold`,
      []
    )

    const recentOrdersResult = await query(
      `SELECT id, order_id, status, priority, created_at
       FROM work_orders
       ORDER BY created_at DESC
       LIMIT 5`,
      []
    )

    // Budget metrics — wrapped in try/catch in case the table doesn't exist yet
    let budgetMetrics = { pending_approval: 0, monthly_total: 0, monthly_count: 0, monthly_accepted: 0 }
    try {
      const budgetResult = await query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'enviado') AS pending_approval,
           COALESCE(SUM(total) FILTER (
             WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
           ), 0) AS monthly_total,
           COUNT(*) FILTER (
             WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
           ) AS monthly_count,
           COUNT(*) FILTER (
             WHERE status = 'aceptado'
             AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
           ) AS monthly_accepted
         FROM budgets`,
        []
      )
      budgetMetrics = budgetResult.rows[0] || budgetMetrics
    } catch {
      // Table may not exist yet; return zeros
    }

    return NextResponse.json({
      workOrders: workOrdersResult.rows[0] || {},
      technicians: techniciansResult.rows[0] || {},
      customers: customersResult.rows[0] || {},
      inventory: inventoryResult.rows[0] || {},
      recentOrders: recentOrdersResult.rows || [],
      budgets: budgetMetrics,
    })
  } catch (error) {
    console.error('[v0] Dashboard metrics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}
