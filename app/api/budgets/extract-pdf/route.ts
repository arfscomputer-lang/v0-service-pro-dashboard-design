import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const EXTRACT_TOOL: Anthropic.Tool = {
  name: 'extract_budget',
  description: 'Extrae los datos estructurados de un presupuesto a partir de su texto.',
  input_schema: {
    type: 'object',
    properties: {
      company: {
        type: 'object',
        description: 'Datos del cliente/empresa a quien se dirige el presupuesto.',
        properties: {
          name: { type: 'string' },
          rif: { type: 'string' },
          address: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
        },
      },
      project: {
        type: 'object',
        properties: {
          number: { type: 'string', description: 'Número o folio del presupuesto' },
          date: { type: 'string', description: 'Fecha en formato YYYY-MM-DD' },
          validity: { type: 'string', description: 'Vigencia, ej: "15 días"' },
          location: { type: 'string' },
        },
      },
      currency: { type: 'string', enum: ['USD', 'VES', 'PYG'] },
      tax_rate: { type: 'number', description: 'Tasa de IVA en porcentaje, ej 16' },
      equipos: {
        type: 'array',
        description: 'Equipos principales / hardware',
        items: {
          type: 'object',
          properties: {
            desc: { type: 'string' },
            unit: { type: 'string' },
            qty: { type: 'number' },
            price: { type: 'number', description: 'Precio unitario en la moneda detectada' },
          },
          required: ['desc', 'qty', 'price'],
        },
      },
      materiales: {
        type: 'array',
        description: 'Materiales de instalación',
        items: {
          type: 'object',
          properties: {
            desc: { type: 'string' },
            unit: { type: 'string' },
            qty: { type: 'number' },
            price: { type: 'number' },
          },
          required: ['desc', 'qty', 'price'],
        },
      },
      mano_de_obra: {
        type: 'array',
        description: 'Mano de obra / instalación / servicios',
        items: {
          type: 'object',
          properties: {
            desc: { type: 'string' },
            unit: { type: 'string' },
            qty: { type: 'number' },
            price: { type: 'number' },
          },
          required: ['desc', 'qty', 'price'],
        },
      },
    },
    required: ['equipos', 'materiales', 'mano_de_obra'],
  },
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY no está configurada en el servidor' },
      { status: 500 }
    )
  }

  const formData = await req.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const base64 = buffer.toString('base64')

    const anthropic = new Anthropic()
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 4096,
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'tool', name: 'extract_budget' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: { type: 'base64', media_type: 'application/pdf', data: base64 },
            },
            {
              type: 'text',
              text:
                'Extrae los datos de este presupuesto en el formato estructurado del tool. ' +
                'Clasifica cada línea en equipos (hardware/equipos principales), materiales ' +
                '(insumos de instalación) o mano_de_obra (servicios/instalación/mano de obra). ' +
                'Si un campo no aparece en el documento, omítelo.',
            },
          ],
        },
      ],
    })

    const toolUse = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    )
    if (!toolUse) {
      return NextResponse.json({ error: 'No se pudo interpretar el presupuesto' }, { status: 422 })
    }

    return NextResponse.json({ data: toolUse.input })
  } catch (error) {
    console.error('[v0] Error extracting budget PDF:', error)
    return NextResponse.json({ error: 'Error al procesar el PDF' }, { status: 500 })
  }
}
