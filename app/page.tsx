"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Plus, User, Search } from 'lucide-react'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function CustomersPage() {
  const { data: customers, error, mutate } = useSWR('/api/customers', fetcher)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')

  // Form states
  const [name, setName] = useState('')
  const [rate, setRate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Opt update
    const newCustomer = {
      customer_id: 'temp-' + Date.now(),
      name,
      total_billed: 0,
      total_paid: 0,
      due: 0,
    }
    mutate([...(customers || []), newCustomer], false)

    await fetch('/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, ratePerLitre: Number(rate) })
    })

    setIsModalOpen(false)
    setName('')
    setRate('')
    setLoading(false)
    mutate()
  }

  const filteredCustomers = customers?.filter((c: any) => 
    c.name.toLowerCase().includes(search.toLowerCase())
  ) || []

  return (
    <div className="max-w-6xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Customers</h1>
          <p className="text-slate-400">Manage your milk delivery clients and balances.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-[var(--color-brand-teal)] text-[#0D0F1A] hover:bg-[#00c9a7] px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(0,229,190,0.3)] hover:shadow-[0_0_30px_rgba(0,229,190,0.5)]"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </header>

      <div className="mb-8 relative max-w-md">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full glass bg-transparent rounded-full py-3 pl-12 pr-6 text-white placeholder-slate-400 focus:outline-none focus:border-[var(--color-brand-teal)] transition-colors"
          suppressHydrationWarning
        />
      </div>

      {error && <div className="text-[var(--color-brand-coral)]">Failed to load customers.</div>}
      {!customers && !error && <div className="text-slate-400 animate-pulse">Loading...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredCustomers.map((customer: any, i: number) => (
            <motion.div
              key={customer.customer_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              layout
            >
              <Link href={`/customers/${customer.customer_id}`}>
                <div className="glass hover:bg-white/10 p-6 rounded-2xl transition-all cursor-pointer h-full group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-white/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6 text-slate-300 group-hover:text-white" />
                    </div>
                    
                    <StatusBadge due={Number(customer.due)} />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-white mb-4">{customer.name}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-500 mb-1">Total Billed</p>
                      <p className="text-slate-300 font-medium">৳{Number(customer.total_billed).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-1">Total Paid</p>
                      <p className="text-slate-300 font-medium">৳{Number(customer.total_paid).toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Customer Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass bg-[#0D0F1A]/90 p-8 rounded-3xl w-full max-w-md relative z-10 border border-white/border shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">New Customer</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-teal)] transition-colors"
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Rate per Litre (৳)</label>
                  <input  
                    type="number" 
                    step="0.01"
                    required
                    value={rate}
                    onChange={e => setRate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-teal)] transition-colors"
                    suppressHydrationWarning
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl hover:bg-white/10 text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-[var(--color-brand-teal)] text-[#0D0F1A] font-medium hover:bg-[#00c9a7] transition-colors shadow-[0_0_15px_rgba(0,229,190,0.3)]"
                  >
                    {loading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StatusBadge({ due }: { due: number }) {
  if (due <= 0) {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] border border-[var(--color-brand-teal)]/20 shadow-[0_0_10px_rgba(0,229,190,0.1)]">
        Settled
      </span>
    )
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--color-brand-coral)]/10 text-[var(--color-brand-coral)] border border-[var(--color-brand-coral)]/20 shadow-[0_0_10px_rgba(255,71,87,0.1)]">
      Due: ৳{due.toFixed(2)}
    </span>
  )
}
