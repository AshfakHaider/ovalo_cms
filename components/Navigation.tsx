"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Milk, LayoutDashboard, FileText, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navItems = [
  { name: 'Customers', href: '/', icon: LayoutDashboard },
  { name: 'Monthly Report', href: '/report', icon: FileText },
]

export function Navigation({ 
  mobile = false, 
  onClose 
}: { 
  mobile?: boolean, 
  onClose?: () => void 
}) {
  const pathname = usePathname()

  const content = (
    <div className={`flex flex-col h-full ${mobile ? '' : 'w-64 border-r border-white/10 glass'}`}>
      <div className="p-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--color-brand-teal)]">
          <Milk className="w-8 h-8" />
          Ovalo CMS
        </h1>
        {mobile && (
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>
      
      <div className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href}
              href={item.href} 
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? 'bg-[var(--color-brand-teal)]/10 text-[var(--color-brand-teal)] shadow-[inset_0_0_20px_rgba(0,229,190,0.05)]' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
      
      <div className="p-6 border-t border-white/10">
        <p className="text-xs text-slate-500 font-medium">© 2026 OVALO BUSINESS</p>
      </div>
    </div>
  )

  if (mobile) return content

  return (
    <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 z-40">
      {content}
    </aside>
  )
}

export function MobileNav({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 w-[280px] bg-[#0D0F1A] border-r border-white/10 z-50 lg:hidden shadow-2xl"
          >
            <Navigation mobile onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export function TopBar({ onOpenMenu }: { onOpenMenu: () => void }) {
  return (
    <header className="lg:hidden h-16 border-b border-white/10 bg-[#0D0F1A]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 text-[var(--color-brand-teal)]">
        <Milk className="w-6 h-6" />
        <span className="font-bold">OVALO</span>
      </div>
      
      <button 
        onClick={onOpenMenu}
        className="p-2 -mr-2 rounded-xl hover:bg-white/10 text-slate-300"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span className="w-full h-0.5 bg-current rounded-full" />
          <span className="w-2/3 h-0.5 bg-current rounded-full" />
          <span className="w-full h-0.5 bg-current rounded-full" />
        </div>
      </button>
    </header>
  )
}
