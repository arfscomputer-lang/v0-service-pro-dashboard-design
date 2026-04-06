import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'semana'

    // Calculate date range based on period
    let daysAgo = 7
    if (period === 'mes') daysAgo = 30
    if (period === 'trimestre') daysAgo = 90

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysAgo)
    const startDateStr = startDate.toISOString().split('T')[0]

    // Get productivity data by day
    const productivityResult = await query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completada' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'pendiente' THEN 1 ELSE 0 END) as pending
      FROM work_orders
      WHERE DATE(created_at) >= $1::date
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [startDateStr]
    )

    // Get technician ranking with actual stats
    const techRankingResult = await query(
      `SELECT 
        t.id,
        t.name,
        COUNT(wo.id) as total_orders,
        SUM(CASE WHEN wo.status = 'completada' THEN 1 ELSE 0 END) as completed_orders
      FROM technicians t
      LEFT JOIN work_orders wo ON wo.technician_id = t.id AND DATE(wo.created_at) >= $1::date
      GROUP BY t.id, t.name
      HAVING COUNT(wo.id) > 0
      ORDER BY completed_orders DESC
      LIMIT 10`,
      [startDateStr]
    )

    // Get work order status distribution
    const statusResult = await query(
      `SELECT 
        status,
        COUNT(*) as count
      FROM work_orders
      WHERE DATE(created_at) >= $1::date
      GROUP BY status`,
      [startDateStr]
    )

    // Get response time metrics - calculate average time between creation and completion
    const responseTimeResult = await query(
      `SELECT 
        DATE(created_at) as date,
        ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/3600)::numeric, 1) as avg_response_hours
      FROM work_orders
      WHERE DATE(created_at) >= $1::date AND status = 'completada'
      GROUP BY DATE(created_at)
      ORDER BY date ASC`,
      [startDateStr]
    )

    // Format productivity data for chart
    const productivityData = productivityResult.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      completadas: parseInt(row.completed) || 0,
      pendientes: parseInt(row.pending) || 0,
      total: parseInt(row.total) || 0,
    }))

    // Format technician ranking
    const techRanking = techRankingResult.rows.map(row => ({
      name: row.name,
      ordenes: parseInt(row.total_orders) || 0,
      completadas: parseInt(row.completed_orders) || 0,
      tasa: row.total_orders > 0 ? Math.round((parseInt(row.completed_orders) / parseInt(row.total_orders)) * 100) : 0,
    }))

    // Format satisfaction data (status distribution)
    const satisfactionData = statusResult.rows.map((row, idx) => {
      const statusMap: Record<string, string> = {
        'pendiente': 'Pendiente',
        'completada': 'Completada',
        'en_ruta': 'En ruta',
        'en_sitio': 'En sitio',
        'cancelada': 'Cancelada',
      }
      const colors = ['#16a34a', '#2e5cb8', '#f97316', '#eab308', '#ef4444']
      return {
        name: statusMap[row.status] || row.status,
        value: parseInt(row.count) || 0,
        color: colors[idx % colors.length],
      }
    })

    // Format response time data
    const responseTimeData = responseTimeResult.rows.map(row => ({
      date: new Date(row.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      promedio: Math.max(0, Math.round(parseFloat(row.avg_response_hours) * 60)) || 0,
    }))

    console.log('[v0] Productivity report generated for period:', period, '- Orders:', productivityData.length)

    return NextResponse.json({
      productivityData,
      techRanking,
      satisfactionData,
      responseTimeData,
      period,
    })
  } catch (error) {
    console.error('[v0] Reports API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
