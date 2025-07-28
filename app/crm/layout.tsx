// app/crm/layout.tsx
import Link from 'next/link'
import { ReactNode } from 'react'

export const metadata = {
  title: 'Clientum · CRM',
}

export default function CRMLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full">
      <aside className="w-48 bg-white border-r shadow-sm">
        <nav className="flex flex-col mt-4 space-y-1 text-sm">
          <Link
            href="/crm/funnel"
            className="px-4 py-2 hover:bg-indigo-50 rounded-l border-l-4 border-transparent hover:border-indigo-500"
          >
            Embudo de ventas
          </Link>
          <Link
            href="/crm/contacts"
            className="px-4 py-2 hover:bg-indigo-50 rounded-l border-l-4 border-transparent hover:border-indigo-500"
          >
            Contactos
          </Link>
          <Link
            href="/crm/calendar"
            className="px-4 py-2 hover:bg-indigo-50 rounded-l border-l-4 border-transparent hover:border-indigo-500"
          >
            Calendario
          </Link>
          <Link
            href="/crm/bookings"
            className="px-4 py-2 hover:bg-indigo-50 rounded-l border-l-4 border-transparent hover:border-indigo-500"
          >
            Reservas
          </Link>
          <Link
            href="/crm/meetings"
            className="px-4 py-2 hover:bg-indigo-50 rounded-l border-l-4 border-transparent hover:border-indigo-500"
          >
            Reuniones
          </Link>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-50 p-8">{children}</main>
    </div>
  )
}
