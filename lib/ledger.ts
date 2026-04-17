import { Delivery, Payment } from '@prisma/client'

export type MonthStatus = 'cleared' | 'partial' | 'unpaid'

export interface MonthBalance {
  month: number
  year: number
  billed: number
  paid: number
  balance: number
  paidFromTotal: number // Amount of paid that was allocated to this specific month's bill
  status: MonthStatus
}

export interface DueBreakdown {
  month: number
  year: number
  unpaidAmount: number
}

export interface LedgerResult {
  runningBalance: MonthBalance[]
  dueBreakdown: DueBreakdown[]
  totalDue: number
}

export function getCustomerLedger(deliveries: Delivery[], payments: Payment[]): LedgerResult {
  // 1. Group deliveries by month/year to calculate total billed per month
  const billsMap = new Map<string, { month: number; year: number; billed: number }>()

  deliveries.forEach(d => {
    const key = `${d.year}-${d.month}`
    const billed = Number(d.quantityLitres) * Number(d.rateAtTime)
    
    if (!billsMap.has(key)) {
      billsMap.set(key, { month: d.month, year: d.year, billed: 0 })
    }
    billsMap.get(key)!.billed += billed
  })

  // Sort bills chronologically
  const sortedBills = Array.from(billsMap.values()).sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year
    return a.month - b.month
  })

  // Total payment pool
  let remainingPayment = payments.reduce((sum, p) => sum + Number(p.amount), 0)

  // 2. FIFO Allocation
  const runningBalance: MonthBalance[] = []
  const dueBreakdown: DueBreakdown[] = []
  let cumulativeBalance = 0

  for (const bill of sortedBills) {
    let allocatedPayment = 0

    if (remainingPayment >= bill.billed) {
      // Fully cleared
      allocatedPayment = bill.billed
      remainingPayment -= bill.billed
    } else if (remainingPayment > 0) {
      // Partially cleared
      allocatedPayment = remainingPayment
      remainingPayment = 0
    }

    const unpaidForMonth = bill.billed - allocatedPayment
    let status: MonthStatus = 'unpaid'
    if (unpaidForMonth === 0) status = 'cleared'
    else if (allocatedPayment > 0) status = 'partial'

    cumulativeBalance += (bill.billed - allocatedPayment)

    runningBalance.push({
      month: bill.month,
      year: bill.year,
      billed: bill.billed,
      paid: allocatedPayment, // This isn't exactly the payment *made* that month, but payment *allocated* to this bill
      balance: cumulativeBalance,
      paidFromTotal: allocatedPayment,
      status
    })

    if (unpaidForMonth > 0) {
      dueBreakdown.push({
        month: bill.month,
        year: bill.year,
        unpaidAmount: unpaidForMonth
      })
    }
  }

  // Determine total due (could be negative if overpaid)
  const totalBilled = sortedBills.reduce((sum, b) => sum + b.billed, 0)
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const totalDue = totalBilled - totalPaid

  return {
    runningBalance,
    dueBreakdown,
    totalDue
  }
}
