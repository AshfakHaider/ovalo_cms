// In-memory mock database for testing without PostgreSQL
export const mockData = {
  customers: [
    {
      id: 'mock-1',
      name: 'John Doe Dairy',
      ratePerLitre: 1.5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'mock-2',
      name: 'Jane Smith Bakery',
      ratePerLitre: 1.4,
      createdAt: new Date().toISOString()
    }
  ],
  deliveries: [
    {
      id: 'del-1',
      customerId: 'mock-1',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      quantityLitres: 100,
      rateAtTime: 1.5,
      createdAt: new Date().toISOString()
    },
    {
      id: 'del-2',
      customerId: 'mock-2',
      month: new Date().getMonth(), // Last month
      year: new Date().getFullYear(),
      quantityLitres: 50,
      rateAtTime: 1.4,
      createdAt: new Date().toISOString()
    }
  ],
  payments: [
    {
      id: 'pay-1',
      customerId: 'mock-1',
      amount: 50,
      paymentDate: new Date().toISOString(),
      note: 'Advance',
      createdAt: new Date().toISOString()
    }
  ]
}
