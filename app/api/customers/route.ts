import { NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  ratePerLitre: z.number().min(0, 'Rate must be positive'),
})

export async function GET() {
  const customersData = await prisma.customer.findMany({
    include: {
      deliveries: true,
      payments: true,
    }
  })
  
  // Fixed type error for Vercel build
  const customers = customersData.map((c: any) => {
    const totalBilled = c.deliveries.reduce((sum: number, d: any) => sum + (Number(d.quantityLitres) * Number(d.rateAtTime)), 0)
    const totalPaid = c.payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0)
    
    return {
      customer_id: c.id,
      name: c.name,
      total_billed: totalBilled,
      total_paid: totalPaid,
      due: totalBilled - totalPaid
    }
  })
  
  return NextResponse.json(customers)
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, ratePerLitre } = customerSchema.parse(body)

    const customer = await prisma.customer.create({
      data: {
        name,
        ratePerLitre,
      }
    })

    return NextResponse.json(customer)
  } catch (error) {
    console.error('API Error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
