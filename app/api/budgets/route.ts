import { NextRequest, NextResponse } from 'next/server'
import { listBudgets, createBudget } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rubro = searchParams.get('rubro') ?? undefined
    const status = searchParams.get('status') ?? undefined
    const customer_id = searchParams.get('customer_id') ?? undefined

    const budgets = await listBudgets({ rubro, status, customer_id })
    return NextResponse.json({ budgets })
  } catch (error) {
    console.error('[budgets] GET error:', error)
    return NextResponse.json({ error: 'Error al obtener presupuestos' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    if (!body.rubro || !body.numero || !body.fecha) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const budget = await createBudget(body)
    return NextResponse.json({ budget }, { status: 201 })
  } catch (error) {
    console.error('[budgets] POST error:', error)
    return NextResponse.json({ error: 'Error al crear presupuesto' }, { status: 500 })
  }
}
