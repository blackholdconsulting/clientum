// app/dashboard/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Dashboard – Clientum',
}

export default function DashboardPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Contenido principal */}
      <main style={{ flex: 1, padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          📊 Dashboard
        </h1>
        <p style={{ marginBottom: '1.5rem' }}>
          Bienvenido a Clientum. Desde aquí podrás navegar a todas las secciones:
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: 1.6 }}>
            <li><Link href="/clientes">👥 Clientes</Link></li>
            <li><Link href="/facturas">📄 Facturas</Link></li>
            <li><Link href="/contabilidad">💰 Contabilidad</Link></li>
            <li><Link href="/chat">💬 Chat IA</Link></li>
            <li><Link href="/employees">👥 Empleados</Link></li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>🔍 Resumen Rápido</h2>
          <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: 1.6 }}>
            <li>Total clientes: …</li>
            <li>Facturas pendientes: …</li>
            <li>Balance mensual: …</li>
          </ul>
        </section>
      </main>

      {/* Sidebar derecho */}
      <aside
        style={{
          width: 200,
          padding: '2rem 1rem',
          borderLeft: '1px solid #ddd',
          background: '#f9f9f9',
        }}
      >
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, lineHeight: 2 }}>
            <li><Link href="/dashboard">📊 Dashboard</Link></li>
            <li><Link href="/clientes">👥 Clientes</Link></li>
            <li><Link href="/facturas">📄 Facturas</Link></li>
            <li><Link href="/contabilidad">💰 Contabilidad</Link></li>
            <li><Link href="/chat">💬 Chat IA</Link></li>
            <li><Link href="/employees">👥 Empleados</Link></li>
          </ul>
        </nav>
      </aside>
    </div>
  )
}
