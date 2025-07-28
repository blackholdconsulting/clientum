// components/Sidebar.tsx

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', emoji: '📊' },
  { label: 'Empleados', href: '/employees', emoji: '👥' },
  { label: 'Nóminas', href: '/employees/payroll', emoji: '💸' },
  { label: 'Ajustes', href: '/settings', emoji: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 h-screen bg-white shadow-md flex flex-col p-4">
      <h2 className="text-xl font-bold text-blue-600 mb-6">Clientum</h2>
      <nav className="flex flex-col gap-2">
        {navItems.map(({ label, href, emoji }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'px-4 py-2 rounded text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition',
              pathname.startsWith(href) && 'bg-blue-100 text-blue-800 font-semibold'
            )}
          >
            <span className="mr-2">{emoji}</span>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
