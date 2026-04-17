"use client"

import { useState } from 'react'
import { Navigation, MobileNav, TopBar } from './Navigation'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--color-brand-navy)]">
      <TopBar onOpenMenu={() => setIsMenuOpen(true)} />
      <MobileNav isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      <Navigation />
      
      <main className="flex-1 lg:pl-64 min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto relative min-h-screen">
          {/* Background glows */}
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-[var(--color-brand-teal)]/5 rounded-full blur-[80px] md:blur-[100px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 md:w-96 h-64 md:h-96 bg-[var(--color-brand-coral)]/5 rounded-full blur-[80px] md:blur-[100px] -z-10 pointer-events-none" />
          
          {children}
        </div>
      </main>
    </div>
  )
}
