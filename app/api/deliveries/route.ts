import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const deliverySchema = z.object({
  customerId: z.string(),
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
  quantityLitres: z.number().min(0, 'Quantity must be positive'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerId, month, year, quantityLitres } = deliverySchema.parse(body)

    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    })
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const delivery = await prisma.delivery.create({
      data: {
        customerId,
        month,
        year,
        quantityLitres,
        rateAtTime: customer.ratePerLitre,
      }
    })

    return NextResponse.json(delivery)
  } catch (error) {
    console.error('API Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create delivery' }, { status: 500 })
  }
}
