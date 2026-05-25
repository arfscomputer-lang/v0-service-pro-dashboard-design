import { NextRequest, NextResponse } from 'next/server'
import { getBudgetComments, createBudgetComment, getBudgetById, updateBudget, createNotification } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const comments = await getBudgetComments(id)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('[budgets/id/comments] GET error:', error)
    return NextResponse.json({ error: 'Error al obtener comentarios' }, { status: 500 })
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { author, text } = await req.json()
    if (!text?.trim()) {
      return NextResponse.json({ error: 'El comentario no puede estar vacío' }, { status: 400 })
    }
    const comment = await createBudgetComment({
      budget_id: id,
      author: author || 'Cliente',
      text: text.trim(),
    })

    // Auto-advance status to en_revision and notify admin
    const budget = await getBudgetById(id)
    if (budget && (budget as any).status === 'enviado') {
      await updateBudget(id, { status: 'en_revision' })
      await createNotification({
        type: 'budget_commented',
        message: `El cliente dejó un comentario en el presupuesto ${(budget as any).numero}`,
        budget_id: id,
      })
    }

    return NextResponse.json({ comment, newStatus: 'en_revision' }, { status: 201 })
  } catch (error) {
    console.error('[budgets/id/comments] POST error:', error)
    return NextResponse.json({ error: 'Error al agregar comentario' }, { status: 500 })
  }
}
