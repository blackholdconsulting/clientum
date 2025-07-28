'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const nav = [
  { label: 'Inicio', href: '/dashboard' },
  { label: 'Contactos', href: '/clientes' },
  { label: 'Ventas', href: '/ventas' },
  { label: 'Compras', href: '/compras' },
  { label: 'Tesorería', href: '/tesoreria' },
  { label: 'Contabilidad', href: '/contabilidad' },
  { label: 'RRHH', href: '/empleados' },
  { label: 'Chat IA', href: '/chat' },
];

export default function LayoutShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between">
        <div>
          <div className="text-xl font-bold px-6 py-4 border-b border-gray-800">
            <span className="text-indigo-400">◆</span> Clientum
          </div>
          <nav className="p-4 space-y-1">
            {nav.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`block px-3 py-2 rounded text-sm hover:bg-gray-800 ${
                  pathname === href ? 'bg-gray-800 font-semibold' : ''
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="px-6 py-4 border-t border-gray-800 text-xs text-gray-400">
          © 2025 Clientum v0.1.0
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
