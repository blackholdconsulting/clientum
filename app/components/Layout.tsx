// clientum/components/Layout.tsx
'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

export default function SidebarLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav style={{ width: 240, padding: 20, borderRight: '1px solid #ddd' }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          <li style={{ margin: '8px 0' }}>
            <Link href="/dashboard">📊 Dashboard</Link>
          </li>
          <li style={{ margin: '8px 0' }}>
            <Link href="/clientes">👥 Clientes</Link>
          </li>
          <li style={{ margin: '8px 0' }}>
            <Link href="/facturas">📄 Facturas</Link>
          </li>
          <li style={{ margin: '8px 0' }}>
            <Link href="/contabilidad">💰 Contabilidad</Link>
          </li>
          <li style={{ margin: '8px 0' }}>
            <Link href="/chat">💬 Chat IA</Link>
          </li>
          <li style={{ margin: '16px 0 8px', borderTop: '1px solid #eee', paddingTop: 8 }}>
            <strong>RRHH</strong>
          </li>
          <li style={{ margin: '8px 0' }}>
            <Link href="/employees">👥 Empleados</Link>
          </li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: 20 }}>{children}</main>
    </div>
  )
}
