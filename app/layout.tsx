// app/layout.tsx
'use client';

import './globals.css';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import {
  createPagesBrowserClient,
  SessionContextProvider,
} from '@supabase/auth-helpers-nextjs';
import type { Database } from '../types/supabase'; // Ajusta la ruta a tus tipos

export default function RootLayout({ children }: { children: ReactNode }) {
  // Creamos el cliente sólo una vez
  const supabase = createPagesBrowserClient<Database>();
  const router = useRouter();
  const pathname = usePathname() ?? '/';

  const isActive = (prefix: string) =>
    pathname === prefix || pathname.startsWith(prefix + '/');
  const linkClass = (prefix: string) =>
    `block py-2 px-3 rounded hover:bg-indigo-100 ${
      isActive(prefix) ? 'bg-indigo-100 font-semibold' : ''
    }`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-800 flex h-screen overflow-hidden">
        {/* Inyectamos la sesión de Supabase a todo el árbol */}
        <SessionContextProvider supabaseClient={supabase}>
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r shadow flex flex-col">
            <div className="p-6 font-bold text-xl text-indigo-600">Clientum</div>
            <nav className="flex-1 overflow-y-auto px-4 space-y-1 text-sm">
              <Link href="/dashboard" className={linkClass('/dashboard')}>
                📊 Dashboard
              </Link>
              <Link href="/clientes" className={linkClass('/clientes')}>
                👥 Clientes
              </Link>
              {/* … resto de enlaces … */}
              <Link href="/negocio/continuar-proyecto" className={linkClass('/negocio/continuar-proyecto')}>
                ▶️ Continuar Proyecto
              </Link>
              {/* … */}
              <Link href="/help" className={linkClass('/help')}>
                🆘 Ayuda y Soporte
              </Link>
            </nav>

            {/* Profile & logout */}
            <div className="px-4 mt-auto border-t pt-2 space-y-1">
              <Link
                href="/profile"
                className="flex items-center py-2 px-3 text-sm hover:bg-gray-100 rounded"
              >
                <div className="h-8 w-8 bg-gray-200 rounded-full mr-2" />
                Mi perfil
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center py-2 px-3 text-sm hover:bg-red-100 rounded text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h6a1 1 0 110 2H5v10h5a1 1 0 110 2H4a1 1 0 01-1-1V4z"
                    clipRule="evenodd"
                  />
                  <path d="M12.293 9.293a1 1 0 011.414 0L17 12.586l-3.293 3.293a1 1 0 01-1.414-1.414L13.586 13H9a1 1 0 110-2h4.586l-1.293-1.293a1 1 0 010-1.414z" />
                </svg>
                Cerrar sesión
              </button>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
            {children}
          </main>
        </SessionContextProvider>
      </body>
    </html>
  );
}
