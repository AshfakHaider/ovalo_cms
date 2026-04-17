import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    
    const monthParam = searchParams.get('month')
    const yearParam = searchParams.get('year')

    const currentMonth = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1
    const currentYear = yearParam ? parseInt(yearParam) : new Date().getFullYear()

    const customersData = await prisma.customer.findMany({
      include: {
        deliveries: true,
        payments: true,
      }
    })

    const report = []

    for (const customer of customersData) {
      const totalBilled = customer.deliveries.reduce((sum, d) => sum + (Number(d.quantityLitres) * Number(d.rateAtTime)), 0)
      const totalPaid = customer.payments.reduce((sum, p) => sum + Number(p.amount), 0)
      const due = totalBilled - totalPaid

      if (due > 0) {
        const currentMonthDeliveries = customer.deliveries.filter(d => d.month === currentMonth && d.year === currentYear)
        const currentMonthQty = currentMonthDeliveries.reduce((sum, d) => sum + Number(d.quantityLitres), 0)
        const currentMonthBill = currentMonthDeliveries.reduce((sum, d) => sum + (Number(d.quantityLitres) * Number(d.rateAtTime)), 0)

        report.push({
          id: customer.id,
          name: customer.name,
          totalBilled,
          totalPaid,
          due,
          currentMonthQty,
          currentMonthBill
        })
      }
    }

    report.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json(report)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch dues report' }, { status: 500 })
  }
}
