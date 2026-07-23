import { NextRequest, NextResponse } from 'next/server'
import { updateBudget, createNotification } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const budget = await updateBudget(id, { status: 'enviado' })
    const customerId = (budget as any)?.customer_id
    const numero = (budget as any)?.numero
    if (customerId) {
      await createNotification({
        type: 'budget_sent',
        message: `Nuevo presupuesto ${numero} disponible para tu revisión`,
        budget_id: id,
        customer_id: customerId,
      })
    }
    return NextResponse.json({ budget })
  } catch (error) {
    console.error('[budgets/id/send] POST error:', error)
    return NextResponse.json({ error: 'Error al enviar presupuesto' }, { status: 500 })
  }
}
