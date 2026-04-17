"use client"

import { useState } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { Download, FileText, AlertCircle } from 'lucide-react'
import { exportToPDF, exportToCSV, ExportDataRow } from '@/lib/export'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function ReportPage() {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  const { data: reportData, error } = useSWR(`/api/report/dues?month=${selectedMonth}&year=${selectedYear}`, fetcher)

  if (error) return <div className="text-[var(--color-brand-coral)]">Failed to load report.</div>
  
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  const handleExportPDF = () => {
    if (!reportData) return
    const exportData: ExportDataRow[] = reportData.map((row: any) => ({
      month: selectedMonth,
      year: selectedYear,
      customerName: row.name,
      quantity: Number(row.currentMonthQty),
      billAmount: Number(row.currentMonthBill),
      paymentReceived: Number(row.totalPaid), 
      closingDue: Number(row.due)
    }))
    exportToPDF(exportData)
  }

  const handleExportCSV = () => {
    if (!reportData) return
    const exportData: ExportDataRow[] = reportData.map((row: any) => ({
      month: selectedMonth,
      year: selectedYear,
      customerName: row.name,
      quantity: Number(row.currentMonthQty),
      billAmount: Number(row.currentMonthBill),
      paymentReceived: Number(row.totalPaid),
      closingDue: Number(row.due)
    }))
    exportToCSV(exportData)
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--color-brand-teal)]" />
            Monthly Dues Report
          </h1>
          <p className="text-slate-400">Overview of customers with pending balances.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-brand-teal)]"
            suppressHydrationWarning
          >
            {months.map(m => (
              <option key={m} value={m} className="bg-[#0D0F1A]">
                {new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[var(--color-brand-teal)]"
            suppressHydrationWarning
          >
            {years.map(y => (
              <option key={y} value={y} className="bg-[#0D0F1A]">{y}</option>
            ))}
          </select>

          <button 
            onClick={handleExportCSV}
            className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
          >
            CSV
          </button>
          <button 
            onClick={handleExportPDF}
            className="bg-[var(--color-brand-teal)] text-[#0D0F1A] hover:bg-[#00c9a7] px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(0,229,190,0.3)]"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </header>

      {!reportData ? (
         <div className="text-slate-400 animate-pulse">Loading report...</div>
      ) : reportData.length === 0 ? (
        <div className="glass p-12 rounded-3xl text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">All Clear!</h3>
          <p className="text-slate-400">No customers have pending dues.</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass overflow-hidden rounded-3xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-slate-300 text-sm">
                  <th className="p-4 rounded-tl-2xl">Customer</th>
                  <th className="p-4">Current Mth Qty</th>
                  <th className="p-4">Current Mth Bill</th>
                  <th className="p-4">Total Billed</th>
                  <th className="p-4">Total Paid</th>
                  <th className="p-4 rounded-tr-2xl text-[var(--color-brand-coral)]">Total Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reportData.map((row: any, i: number) => (
                  <tr key={row.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium text-white">{row.name}</td>
                    <td className="p-4 text-slate-300">{Number(row.currentMonthQty).toFixed(2)} L</td>
                    <td className="p-4 text-slate-300">৳{Number(row.currentMonthBill).toFixed(2)}</td>
                    <td className="p-4 text-slate-300">৳{Number(row.totalBilled).toFixed(2)}</td>
                    <td className="p-4 text-slate-300">৳{Number(row.totalPaid).toFixed(2)}</td>
                    <td className="p-4 font-bold text-[var(--color-brand-coral)]">
                      ৳{Number(row.due).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-white/5 border-t border-white/10 font-bold">
                <tr>
                  <td className="p-4 text-white">Total</td>
                  <td className="p-4 text-slate-300">
                    {reportData.reduce((sum: number, r: any) => sum + Number(r.currentMonthQty), 0).toFixed(2)} L
                  </td>
                  <td className="p-4 text-slate-300">
                    ৳{reportData.reduce((sum: number, r: any) => sum + Number(r.currentMonthBill), 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-slate-300">
                    ৳{reportData.reduce((sum: number, r: any) => sum + Number(r.totalBilled), 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-slate-300">
                    ৳{reportData.reduce((sum: number, r: any) => sum + Number(r.totalPaid), 0).toFixed(2)}
                  </td>
                  <td className="p-4 text-[var(--color-brand-coral)]">
                    ৳{reportData.reduce((sum: number, r: any) => sum + Number(r.due), 0).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
