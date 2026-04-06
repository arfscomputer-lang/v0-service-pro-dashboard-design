import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'mes'

    // Calculate date range
    let daysAgo = 30
    if (period === 'semana') daysAgo = 7
    if (period === 'trimestre') daysAgo = 90

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)
    const startDateStr = startDate.toISOString().split('T')[0]

    // Get customer metrics
    const customerStatsResult = await query(
      `SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'activo' THEN 1 END) as active_customers,
        COUNT(CASE WHEN status = 'inactivo' THEN 1 END) as inactive_customers
      FROM customers`,
      []
    )

    // Get customer type distribution
    const customerTypeResult = await query(
      `SELECT 
        type,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'activo' THEN 1 END) as active
      FROM customers
      GROUP BY type`,
      []
    )

    // Get revenue metrics
    const revenueResult = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as orders,
        SUM(1) as value
      FROM work_orders
      WHERE DATE(created_at) >= $1::date
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [startDateStr]
    )

    // Get top customers by order count
    const topCustomersResult = await query(
      `SELECT 
        c.id,
        c.name,
        COUNT(wo.id) as order_count,
        MAX(wo.created_at) as last_order
      FROM customers c
      LEFT JOIN work_orders wo ON c.id = wo.customer_id
      GROUP BY c.id, c.name
      ORDER BY order_count DESC
      LIMIT 10`,
      []
    )

    // Get satisfaction by customer type
    const satisfactionResult = await query(
      `SELECT 
        c.type,
        COUNT(wo.id) as total_orders,
        SUM(CASE WHEN wo.status = 'completada' THEN 1 ELSE 0 END) as completed_orders
      FROM customers c
      LEFT JOIN work_orders wo ON c.id = wo.customer_id AND DATE(wo.created_at) >= $1::date
      GROUP BY c.type`,
      [startDateStr]
    )

    // Format data
    const stats = {
      totalCustomers: parseInt(customerStatsResult.rows[0]?.total_customers) || 0,
      activeCustomers: parseInt(customerStatsResult.rows[0]?.active_customers) || 0,
      inactiveCustomers: parseInt(customerStatsResult.rows[0]?.inactive_customers) || 0,
    }

    const customerTypeData = customerTypeResult.rows.map(row => ({
      type: row.type.charAt(0).toUpperCase() + row.type.slice(1),
      total: parseInt(row.count) || 0,
      activos: parseInt(row.active) || 0,
    }))

    const revenueData = revenueResult.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      ordenes: parseInt(row.orders) || 0,
    }))

    const topCustomers = topCustomersResult.rows.map(row => ({
      name: row.name,
      ordenes: parseInt(row.order_count) || 0,
      ultimaOrden: row.last_order ? new Date(row.last_order).toLocaleDateString('es-ES') : 'N/A',
    }))

    const satisfactionByType = satisfactionResult.rows.map(row => ({
      type: row.type.charAt(0).toUpperCase() + row.type.slice(1),
      total: parseInt(row.total_orders) || 0,
      completadas: parseInt(row.completed_orders) || 0,
      tasa: row.total_orders > 0 ? Math.round((parseInt(row.completed_orders) / parseInt(row.total_orders)) * 100) : 0,
    }))

    console.log('[v0] Customer report generated for period:', period)

    return NextResponse.json({
      stats,
      customerTypeData,
      revenueData,
      topCustomers,
      satisfactionByType,
      period,
    })
  } catch (error) {
    console.error('[v0] Customer reports API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer reports', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
