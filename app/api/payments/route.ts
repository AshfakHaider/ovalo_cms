import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const paymentSchema = z.object({
  customerId: z.string(),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  date: z.string().or(z.date()).transform((val) => new Date(val)),
  note: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { customerId, amount, date, note } = paymentSchema.parse(body)

    const payment = await prisma.payment.create({
      data: {
        customerId,
        amount,
        paymentDate: date,
        note: note || '',
      }
    })

    return NextResponse.json(payment)
  } catch (error) {
    console.error('API Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}
