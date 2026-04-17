import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Milk, LayoutDashboard, FileText } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Ovalo CMS',
  description: 'Milk delivery business management system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex bg-[var(--color-brand-navy)] text-slate-100`}>
        {/* Sidebar Nav */}
        <nav className="w-64 border-r border-white/10 glass flex flex-col">
          <div className="p-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 text-[var(--color-brand-teal)]">
              <Milk className="w-8 h-8" />
              Ovalo CMS
            </h1>
          </div>
          
          <div className="flex-1 px-4 space-y-2 mt-4">
            <Link 
              href="/" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            >
              <LayoutDashboard className="w-5 h-5" />
              Customers
            </Link>
            
            <Link 
              href="/report" 
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-slate-300 hover:text-white"
            >
              <FileText className="w-5 h-5" />
              Monthly Report
            </Link>
          </div>
          
          <div className="p-4 border-t border-white/10">
            <p className="text-sm text-slate-500">© 2026 Ovalo CMS</p>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--color-brand-teal)]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[var(--color-brand-coral)]/5 rounded-full blur-[100px] -z-10 pointer-events-none" />
          
          {children}
        </main>
      </body>
    </html>
  )
}
