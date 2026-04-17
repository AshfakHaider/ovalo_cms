import prisma from './prisma'

// The shape of our database (for backwards compatibility during migration)
export interface DBType {
  customers: any[];
  deliveries: any[];
  payments: any[];
}

/**
 * Helper to get all data from Supabase via Prisma.
 * Note: This is an expensive operation for a SQL DB and should be avoided in production.
 * We keep it for compatibility with existing code that expects the whole DB at once.
 */
export async function getDb(): Promise<DBType> {
  const [customers, deliveries, payments] = await Promise.all([
    prisma.customer.findMany(),
    prisma.delivery.findMany(),
    prisma.payment.findMany()
  ]);

  return {
    customers: customers.map(c => ({
      ...c,
      ratePerLitre: Number(c.ratePerLitre)
    })),
    deliveries: deliveries.map(d => ({
      ...d,
      quantityLitres: Number(d.quantityLitres),
      rateAtTime: Number(d.rateAtTime)
    })),
    payments: payments.map(p => ({
      ...p,
      amount: Number(p.amount)
    }))
  };
}

/**
 * Placeholder for saveDb. In a REAL Prisma setup, we should use specific 
 * Prisma actions (create, update, delete) in the API routes.
 * This is left here to prevent immediate breakage, but it will throw an error 
 * to encourage refactoring.
 */
export async function saveDb(data: DBType): Promise<void> {
  console.warn('saveDb is deprecated. Use direct Prisma calls instead.')
  // We don't implement full DB replacement in Prisma easily/safely.
}
