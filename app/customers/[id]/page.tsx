"use client"

import { useState, use } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ArrowLeft, Trash2, DollarSign, Calendar, Droplet, Clock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getCustomerLedger } from '@/lib/ledger'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: customer, mutate } = useSWR(`/api/customers/${id}`, fetcher)

  const [delMonth, setDelMonth] = useState<number>(new Date().getMonth() + 1)
  const [delYear, setDelYear] = useState<number>(new Date().getFullYear())
  const [qty, setQty] = useState('')

  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0])
  const [payNote, setPayNote] = useState('')

  if (!customer) return <div className="text-slate-400 animate-pulse">Loading...</div>

  // Ledger calc
  const ledger = getCustomerLedger(customer.deliveries || [], customer.payments || [])

  const handleAddDelivery = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/deliveries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: id, month: delMonth, year: delYear, quantityLitres: Number(qty) })
    })
    setQty('')
    mutate()
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId: id, amount: Number(payAmount), date: payDate, note: payNote })
    })
    setPayAmount('')
    setPayNote('')
    mutate()
  }

  const handleDeletePayment = async (paymentId: string) => {
    await fetch(`/api/payments/${paymentId}`, { method: 'DELETE' })
    mutate()
  }

  const handleDeleteCustomer = async () => {
    if (window.confirm('Are you sure you want to delete this customer? All data will be lost.')) {
      await fetch(`/api/customers/${id}`, { method: 'DELETE' })
      router.push('/')
    }
  }

  // Generate 12 months for current year grid
  const currentYear = new Date().getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-10">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Customers
          </Link>
          <button 
            onClick={handleDeleteCustomer}
            className="text-[var(--color-brand-coral)] hover:bg-[var(--color-brand-coral)]/10 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-[var(--color-brand-coral)]/20"
          >
            <Trash2 className="w-4 h-4" />
            Delete Customer
          </button>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{customer.name}</h1>
            <p className="text-slate-400">Rate: ৳{Number(customer.ratePerLitre).toFixed(2)} / Litre</p>
          </div>
          <div className="text-right glass p-4 rounded-2xl">
            <p className="text-sm text-slate-400 mb-1">Total Due</p>
            <p className={`text-3xl font-bold ${ledger.totalDue > 0 ? 'text-[var(--color-brand-coral)]' : 'text-[var(--color-brand-teal)]'}`}>
              ৳{ledger.totalDue.toFixed(2)}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Forms */}
        <div className="space-y-8 lg:col-span-1">
          {/* Add Delivery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass p-6 rounded-3xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Droplet className="w-5 h-5 text-[var(--color-brand-teal)]" />
              Add Delivery
            </h3>
            <form onSubmit={handleAddDelivery} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Month</label>
                  <select 
                    value={delMonth} onChange={e => setDelMonth(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white"
                    suppressHydrationWarning
                  >
                    {months.map(m => <option key={m} value={m} className="bg-[#0D0F1A]">{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Year</label>
                  <input type="number" value={delYear} onChange={e => setDelYear(Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white" suppressHydrationWarning />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Quantity (Litres)</label>
                <input type="number" step="0.5" required value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" suppressHydrationWarning />
              </div>
              <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl py-2 transition-colors font-medium">Save Delivery</button>
            </form>
          </motion.div>

          {/* Add Payment */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-3xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[var(--color-brand-teal)]" />
              Record Payment
            </h3>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Amount (৳)</label>
                <input type="number" step="0.01" required value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white form-input" suppressHydrationWarning />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Date</label>
                <input type="date" required value={payDate} onChange={e => setPayDate(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" suppressHydrationWarning />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Note (optional)</label>
                <input type="text" value={payNote} onChange={e => setPayNote(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white" suppressHydrationWarning />
              </div>
              <button type="submit" className="w-full bg-[var(--color-brand-teal)] text-[#0D0F1A] rounded-xl py-2 transition-colors font-semibold shadow-[0_0_15px_rgba(0,229,190,0.2)]">Submit Payment</button>
            </form>
          </motion.div>
        </div>

        {/* Right Column: Grids & Timeline */}
        <div className="space-y-8 lg:col-span-2">
          
          {/* Month Grid */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 rounded-3xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              {currentYear} Monthly Ledger
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {months.map(m => {
                const monthData = ledger.runningBalance.find(b => b.month === m && b.year === currentYear)
                
                return (
                  <div key={m} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between hover:bg-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-slate-400 font-medium">{new Date(2000, m - 1).toLocaleString('default', { month: 'short' })}</span>
                      {monthData && (
                        <div className={`w-2 h-2 rounded-full ${
                          monthData.status === 'cleared' ? 'bg-[var(--color-brand-teal)] shadow-[0_0_8px_rgba(0,229,190,0.8)]' : 
                          monthData.status === 'partial' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]' : 
                          'bg-[var(--color-brand-coral)] shadow-[0_0_8px_rgba(255,71,87,0.8)]'
                        }`} />
                      )}
                    </div>
                    {monthData ? (
                      <div className="mt-2">
                        <p className="text-lg font-bold text-white">৳{monthData.billed.toFixed(2)}</p>
                        <p className="text-xs text-slate-500 mt-1">Paid: ৳{monthData.paid.toFixed(2)}</p>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center h-full text-slate-600 text-sm">No data</div>
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>

          {/* Payment History Timeline */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-8 rounded-3xl">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              Payment History
            </h3>
            
            {customer.payments && customer.payments.length > 0 ? (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                {customer.payments.map((payment: any, i: number) => (
                  <div key={payment.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 bg-[#0D0F1A] text-[var(--color-brand-teal)] shadow-[0_0_10px_rgba(0,229,190,0.2)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] glass p-4 rounded-2xl">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-white">৳{Number(payment.amount).toFixed(2)}</span>
                        <span className="text-xs text-slate-400">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                      </div>
                      {payment.note && <p className="text-sm text-slate-500">{payment.note}</p>}
                      <button 
                        onClick={() => handleDeletePayment(payment.id)} 
                        className="text-xs text-[var(--color-brand-coral)] mt-2 hover:underline opacity-50 hover:opacity-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No payments recorded yet.</p>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  )
}
