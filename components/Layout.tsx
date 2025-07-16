// components/Layout.tsx
import Link from 'next/link'
import { ReactNode } from 'react'

interface SidebarLayoutProps {
  children: ReactNode
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
        <h2 className="text-2xl font-bold mb-6">Clientum</h2>
        <nav className="flex flex-col space-y-2">
          <Link href="/dashboard" className="hover:underline">
            📊 Dashboard
          </Link>
          <Link href="/clientes" className="hover:underline">
            👥 Clientes
          </Link>
          <Link href="/facturas" className="hover:underline">
            📄 Facturas
          </Link>
          <Link href="/contabilidad" className="hover:underline">
            📊 Contabilidad
          </Link>
          {/* Nuevo enlace al Chat IA */}
          <Link href="/chat" className="hover:underline">
            💬 Chat IA
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
