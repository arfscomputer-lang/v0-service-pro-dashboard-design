import { NextRequest, NextResponse } from 'next/server'
import { listBudgetKits, createBudgetKit } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rubro = searchParams.get('rubro') ?? undefined
    const kits = await listBudgetKits(rubro)
    return NextResponse.json({ kits })
  } catch (error) {
    console.error('[budget-kits] GET error:', error)
    return NextResponse.json({ error: 'Error al obtener kits' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.rubro || !body.name || !body.sections) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }
    const kit = await createBudgetKit(body)
    return NextResponse.json({ kit }, { status: 201 })
  } catch (error) {
    console.error('[budget-kits] POST error:', error)
    return NextResponse.json({ error: 'Error al crear kit' }, { status: 500 })
  }
}
