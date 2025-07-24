// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { headers } from "next/headers";
import { ReactNode } from "react";

export const metadata = {
  title: "Clientum",
};

// Función para obtener la ruta activa desde los headers (async)
async function getActivePath(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-invoke-path") || "/";
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const path = await getActivePath();

  // Para comprobar si estamos en CRM (cualquiera de sus subrutas)
  const isCRM = path.startsWith("/crm");

  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-800 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow-md flex flex-col">
          <div className="p-6 font-bold text-xl text-indigo-600">Clientum</div>
          <nav className="flex flex-col gap-2 px-4 text-sm">
            <Link
              href="/dashboard"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                path === "/dashboard" ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              href="/clientes"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                path === "/clientes" ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              👥 Clientes
            </Link>
            <Link
              href="/facturas"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                path === "/facturas" ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              🧾 Facturas
            </Link>
            <Link
              href="/contabilidad"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                path === "/contabilidad" ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              📈 Contabilidad
            </Link>
            <Link
              href="/chat"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                path === "/chat" ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              💬 Chat IA
            </Link>
            <Link
              href="/employees"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                path === "/employees" ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              🧑‍💼 Empleados
            </Link>

            {/* Sección CRM */}
            <div className="mt-4 border-t pt-4">
              <Link
                href="/crm/funnel"
                className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                  isCRM ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                🔄 CRM
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  );
}
