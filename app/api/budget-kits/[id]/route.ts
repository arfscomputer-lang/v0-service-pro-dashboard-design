import { NextRequest, NextResponse } from 'next/server'
import { deleteBudgetKit } from '@/lib/db'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    await deleteBudgetKit(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[budget-kits/id] DELETE error:', error)
    return NextResponse.json({ error: 'Error al eliminar kit' }, { status: 500 })
  }
}
