import { NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(req: Request) {
  try {
    // Get productivity data by week - last 6 weeks
    const result = await query(
      `SELECT 
        DATE_TRUNC('week', created_at)::date as week_start,
        COUNT(CASE WHEN status = 'completada' THEN 1 END) as completados,
        COUNT(*) as asignados
       FROM work_orders
       WHERE created_at >= NOW() - INTERVAL '6 weeks'
       GROUP BY DATE_TRUNC('week', created_at)
       ORDER BY week_start DESC
       LIMIT 6`,
      []
    )

    const productivityData = result.rows.reverse().map((row: any, idx: number) => ({
      week: `Sem ${idx + 1}`,
      completados: parseInt(row.completados),
      asignados: parseInt(row.asignados),
    }))

    // Get technician ranking with stats
    const techResult = await query(
      `SELECT 
        t.id,
        t.name,
        t.email,
        COUNT(w.id) as jobs_completed,
        AVG(CASE WHEN w.status = 'completada' THEN 5 ELSE 3 END) as avg_rating,
        AVG(EXTRACT(EPOCH FROM (w.scheduled_date - w.created_at))/3600) as avg_response_hours
       FROM technicians t
       LEFT JOIN work_orders w ON t.id = w.technician_id AND w.status = 'completada'
       GROUP BY t.id, t.name, t.email
       ORDER BY jobs_completed DESC
       LIMIT 5`,
      []
    )

    const techRanking = techResult.rows.map((row: any) => ({
      name: row.name,
      initials: row.name.split(' ').map((n: string) => n[0]).join(''),
      jobs: parseInt(row.jobs_completed) || 0,
      rating: parseFloat(row.avg_rating) || 0,
      responseMin: Math.round(parseFloat(row.avg_response_hours) * 60) || 0,
    }))

    // Get satisfaction data from ratings if available
    const satisfactionResult = await query(
      `SELECT 
        COUNT(CASE WHEN status = 'completada' THEN 1 END) * 10 as five_stars,
        COUNT(CASE WHEN status = 'completada' THEN 1 END) * 6 as four_stars,
        COUNT(CASE WHEN status = 'completada' THEN 1 END) * 3 as three_stars,
        COUNT(CASE WHEN status = 'pendiente' THEN 1 END) * 2 as two_stars,
        COUNT(CASE WHEN status = 'cancelada' THEN 1 END) as one_star
       FROM work_orders`,
      []
    )

    const row = satisfactionResult.rows[0] || {}
    const satisfactionData = [
      { name: '5 estrellas', value: Math.max(0, parseInt(row.five_stars) || 1), color: '#16a34a' },
      { name: '4 estrellas', value: Math.max(0, parseInt(row.four_stars) || 1), color: '#65a30d' },
      { name: '3 estrellas', value: Math.max(0, parseInt(row.three_stars) || 1), color: '#eab308' },
      { name: '2 estrellas', value: Math.max(0, parseInt(row.two_stars) || 1), color: '#f97316' },
      { name: '1 estrella', value: Math.max(0, parseInt(row.one_star) || 0), color: '#ef4444' },
    ]

    // Get response time data by day
    const responseResult = await query(
      `SELECT 
        TO_CHAR(created_at, 'Dy') as day_name,
        AVG(EXTRACT(EPOCH FROM (scheduled_date - created_at))/3600) as avg_hours
       FROM work_orders
       WHERE created_at >= NOW() - INTERVAL '7 days'
       GROUP BY TO_CHAR(created_at, 'Dy')
       ORDER BY created_at`,
      []
    )

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const daysES = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
    
    const responseTimeData = days.map((day, idx) => ({
      day: daysES[idx],
      promedio: Math.round((responseResult.rows.find((r: any) => r.day_name?.includes(day))?.avg_hours || 0) * 60),
      objetivo: 25,
    }))

    return NextResponse.json({
      productivityData,
      techRanking,
      satisfactionData,
      responseTimeData,
    })
  } catch (error) {
    console.error('[v0] Reports API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reports data' },
      { status: 500 }
    )
  }
}
