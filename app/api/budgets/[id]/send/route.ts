import { NextRequest, NextResponse } from 'next/server'
import { updateBudget } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const budget = await updateBudget(id, { status: 'enviado' })
    return NextResponse.json({ budget })
  } catch (error) {
    console.error('[budgets/id/send] POST error:', error)
    return NextResponse.json({ error: 'Error al enviar presupuesto' }, { status: 500 })
  }
}
