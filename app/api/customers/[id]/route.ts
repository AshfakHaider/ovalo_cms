import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      deliveries: {
        orderBy: [
          { year: 'asc' },
          { month: 'asc' }
        ]
      },
      payments: {
        orderBy: { paymentDate: 'asc' }
      }
    }
  })

  if (!customer) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(customer)
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    // Note: Schema has onDelete: Cascade, so deleting customer deletes related records
    await prisma.customer.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 })
  }
}
