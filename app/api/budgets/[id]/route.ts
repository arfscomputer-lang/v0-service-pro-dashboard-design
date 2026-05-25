import { NextRequest, NextResponse } from 'next/server'
import { getBudgetById, updateBudget, deleteBudget, createNotification } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const budget = await getBudgetById(id)
    if (!budget) return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    return NextResponse.json({ budget })
  } catch (error) {
    console.error('[budgets/id] GET error:', error)
    return NextResponse.json({ error: 'Error al obtener presupuesto' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const existing = await getBudgetById(id)
    const budget = await updateBudget(id, body)

    // Notify admin when client changes status
    if (body.status && existing && body.status !== (existing as any).status) {
      const numero = (existing as any).numero
      const messages: Record<string, string> = {
        aceptado:  `El cliente aceptó el presupuesto ${numero}`,
        rechazado: `El cliente rechazó el presupuesto ${numero}`,
        devuelto:  `El presupuesto ${numero} fue devuelto para revisión`,
      }
      if (messages[body.status]) {
        await createNotification({ type: `budget_${body.status}`, message: messages[body.status], budget_id: id })
      }
    }

    return NextResponse.json({ budget })
  } catch (error) {
    console.error('[budgets/id] PUT error:', error)
    return NextResponse.json({ error: 'Error al actualizar presupuesto' }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await deleteBudget(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[budgets/id] DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar presupuesto' }, { status: 500 })
  }
}
