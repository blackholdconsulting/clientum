// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { headers } from "next/headers";
import { ReactNode } from "react";

// IMPORT normal de tu Client Component
import UserMenu from "../components/UserMenu";

export const metadata = {
  title: "Clientum",
};

async function getActivePath(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-invoke-path") || "/";
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const path = await getActivePath();
  const isActive = (prefix: string) =>
    path === prefix || path.startsWith(prefix + "/");

  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-800 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow-md flex flex-col">
          <div className="p-6 font-bold text-xl text-indigo-600">Clientum</div>
          <nav className="flex flex-col px-4 text-sm space-y-1">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/dashboard") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              📊 Dashboard
            </Link>
            {/* Clientes */}
            <Link
              href="/clientes"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/clientes") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              👥 Clientes
            </Link>
            {/* Facturas */}
            <Link
              href="/facturas"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/facturas") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              🧾 Facturas
            </Link>

            {/* Negocio */}
            <div className="relative group">
              <Link
                href="/negocio"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/negocio") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                🚀 Negocio
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link href="/negocio/tareas" className="block py-2 px-3 hover:bg-indigo-50">
                  Mis tareas
                </Link>
                <Link href="/negocio/proyectos" className="block py-2 px-3 hover:bg-indigo-50">
                  Proyectos
                </Link>
                <Link href="/negocio/plan-futuro" className="block py-2 px-3 hover:bg-indigo-50">
                  Plan futuro
                </Link>
                <Link href="/negocio/estudio-mercado" className="block py-2 px-3 hover:bg-indigo-50">
                  Estudio de mercado
                </Link>
                <Link href="/negocio/analisis-competencia" className="block py-2 px-3 hover:bg-indigo-50">
                  Análisis competencia
                </Link>
              </div>
            </div>

            {/* Impuestos */}
            <Link
              href="/impuestos"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/impuestos") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              ⚖️ Impuestos
            </Link>

            {/* Tesorería */}
            <div className="relative group">
              <Link
                href="/tesoreria"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/tesoreria") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                🏦 Tesorería
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link href="/tesoreria/cuentas" className="block py-2 px-3 hover:bg-indigo-50">
                  Cuentas
                </Link>
                <Link href="/tesoreria/cashflow" className="block py-2 px-3 hover:bg-indigo-50">
                  Cashflow
                </Link>
                <Link href="/tesoreria/pagos-cobros" className="block py-2 px-3 hover:bg-indigo-50">
                  Pagos y cobros
                </Link>
                <Link href="/tesoreria/remesas" className="block py-2 px-3 hover:bg-indigo-50">
                  Remesas
                </Link>
              </div>
            </div>

            {/* Contabilidad */}
            <div className="relative group">
              <Link
                href="/contabilidad"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/contabilidad") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                📈 Contabilidad
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link href="/contabilidad/cuadro-de-cuentas" className="block py-2 px-3 hover:bg-indigo-50">
                  Cuadro de cuentas
                </Link>
                <Link href="/contabilidad/libro-diario" className="block py-2 px-3 hover:bg-indigo-50">
                  Libro diario
                </Link>
                <Link href="/contabilidad/activos" className="block py-2 px-3 hover:bg-indigo-50">
                  Activos
                </Link>
                <Link href="/contabilidad/perdidas-ganancias" className="block py-2 px-3 hover:bg-indigo-50">
                  Pérdidas y ganancias
                </Link>
                <Link href="/contabilidad/balance-situacion" className="block py-2 px-3 hover:bg-indigo-50">
                  Balance de situación
                </Link>
              </div>
            </div>

            {/* Chat IA */}
            <Link
              href="/chat"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/chat") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              💬 Chat IA
            </Link>

            {/* RRHH */}
            <div className="relative group">
              <Link
                href="/RR.HH"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/RR.HH") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                👩‍💼 RRHH
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link href="/RR.HH/employees" className="block py-2 px-3 hover:bg-indigo-50">
                  Empleados
                </Link>
                <Link href="/RR.HH/payroll" className="block py-2 px-3 hover:bg-indigo-50">
                  Nóminas
                </Link>
                <Link href="/RR.HH/gastos" className="block py-2 px-3 hover:bg-indigo-50">
                  Gastos
                </Link>
                <Link href="/RR.HH/horarios" className="block py-2 px-3 hover:bg-indigo-50">
                  Horarios
                </Link>
                <Link href="/RR.HH/vacaciones" className="block py-2 px-3 hover:bg-indigo-50">
                  Vacaciones
                </Link>
              </div>
            </div>

            {/* Ayuda y soporte */}
            <div className="mt-auto px-4 pb-4 pt-6 border-t text-sm text-gray-600">
              <div className="font-semibold mb-2">Ayuda y soporte</div>
              <ul className="space-y-1">
                <li>
                  <Link href="/help/academia" className="hover:underline">
                    📘 Academia Clientum
                  </Link>
                </li>
                <li>
                  <Link href="/help/tutoriales" className="hover:underline">
                    🎥 Tutoriales
                  </Link>
                </li>
                <li>
                  <Link href="/help/votar-mejoras" className="hover:underline">
                    🗳️ Votar mejoras
                  </Link>
                </li>
                <li>
                  <Link href="/help/novedades" className="hover:underline">
                    ✨ Novedades
                  </Link>
                </li>
                <li>
                  <Link href="/help/soporte" className="hover:underline">
                    📞 Soporte
                  </Link>
                </li>
                <li>
                  <Link href="/help/contacto" className="hover:underline">
                    💬 Háblanos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Menú usuario */}
            <UserMenu />
          </nav>
        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  );
}
