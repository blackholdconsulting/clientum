// components/Nav.tsx
'use client'

import Link from 'next/link'

export default function Nav() {
  return (
    <nav style={{ padding: '1rem 0', borderBottom: '1px solid #ddd' }}>
      <Link href="/dashboard" style={{ marginRight: 16 }}>📊 Dashboard</Link>
      <Link href="/clientes" style={{ marginRight: 16 }}>👥 Clientes</Link>
      <Link href="/facturas" style={{ marginRight: 16 }}>📄 Facturas</Link>
      <Link href="/contabilidad" style={{ marginRight: 16 }}>💰 Contabilidad</Link>
      <Link href="/chat" style={{ marginRight: 16 }}>💬 Chat IA</Link>
      <Link href="/employees" style={{ marginLeft: 32, fontWeight: 'bold' }}>👥 Empleados</Link>
    </nav>
  )
}
