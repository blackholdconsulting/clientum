// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { headers } from "next/headers";
import { ReactNode } from "react";

export const metadata = {
  title: "Clientum",
};

async function getActivePath(): Promise<string> {
  const headersList = await headers();
  return headersList.get("x-invoke-path") || "/";
}

export default async function RootLayout({ children }: { children: ReactNode }) {
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

            <Link
              href="/dashboard"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/dashboard") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              📊 Dashboard
            </Link>

            <Link
              href="/clientes"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/clientes") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              👥 Clientes
            </Link>

            <Link
              href="/facturas"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/facturas") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              🧾 Facturas
            </Link>

            {/* --- Negocio con submenú --- */}
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
              <div className="absolute left-full top-0 ml-2 w-52 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link
                  href="/negocio/tareas"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/tareas") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Tareas
                </Link>
                <Link
                  href="/negocio/proyectos"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/proyectos") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Proyectos
                </Link>
                <Link
                  href="/negocio/plan-futuro"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/plan-futuro") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Plan futuro
                </Link>
                <Link
                  href="/negocio/estudio-mercado"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/estudio-mercado") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Estudio de mercado
                </Link>
                <Link
                  href="/negocio/analisis-competencia"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/analisis-competencia") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Análisis competencia
                </Link>
              </div>
            </div>

            <Link
              href="/impuestos"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/impuestos") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              ⚖️ Impuestos
            </Link>

            {/* Tesorería con submenú */}
            <div className="relative group">
              <Link
                href="/tesoreria"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/tesoreria") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                💰 Tesorería
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link
                  href="/tesoreria/cuentas"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/tesoreria/cuentas") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Cuentas
                </Link>
                <Link
                  href="/tesoreria/cashflow"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/tesoreria/cashflow") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Cashflow
                </Link>
                <Link
                  href="/tesoreria/pagos-cobros"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/tesoreria/pagos-cobros") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Pagos y cobros
                </Link>
                <Link
                  href="/tesoreria/remesas"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/tesoreria/remesas") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Remesas
                </Link>
              </div>
            </div>

            {/* Contabilidad con submenú */}
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
                <Link
                  href="/contabilidad/cuadro-de-cuentas"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/contabilidad/cuadro-de-cuentas") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Cuadro de cuentas
                </Link>
                <Link
                  href="/contabilidad/libro-diario"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/contabilidad/libro-diario") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Libro diario
                </Link>
                <Link
                  href="/contabilidad/activos"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/contabilidad/activos") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Activos
                </Link>
                <Link
                  href="/contabilidad/perdidas-ganancias"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/contabilidad/perdidas-ganancias") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Pérdidas y ganancias
                </Link>
                <Link
                  href="/contabilidad/balance-situacion"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/contabilidad/balance-situacion") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Balance de situación
                </Link>
              </div>
            </div>

            <Link
              href="/chat"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/chat") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              💬 Chat IA
            </Link>

            {/* RRHH con submenú */}
            <div className="relative group">
              <Link
                href="/RR.HH"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/RR.HH") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                👤 RRHH
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 ml-2 w-52 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link
                  href="/RR.HH/employees"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/RR.HH/employees") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Empleados
                </Link>
                <Link
                  href="/RR.HH/payroll"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/RR.HH/payroll") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Nóminas
                </Link>
                <Link
                  href="/RR.HH/gastos"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/RR.HH/gastos") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Gastos
                </Link>
                <Link
                  href="/RR.HH/horarios"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/RR.HH/horarios") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Horarios
                </Link>
                <Link
                  href="/RR.HH/vacaciones"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/RR.HH/vacaciones") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Vacaciones
                </Link>
              </div>
            </div>
          </nav>

          {/* Ayuda y soporte al fondo */}
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
        </aside>

        {/* Menú de usuario */}
          <UserMenu />

        </aside>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  );
}

// Componente separado para el dropdown de usuario
function UserMenu() {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-4 pb-6 pt-4 border-t relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center space-x-2 hover:bg-gray-100 rounded p-2 transition"
      >
        <span className="flex-1 text-gray-800">Mi perfil</span>
        <svg
          className={`w-4 h-4 text-gray-600 transform transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul className="absolute left-4 right-4 bottom-16 bg-white border rounded shadow-lg text-sm">
          <li>
            <Link
              href="/profile"
              className="block px-4 py-2 hover:bg-indigo-50"
              onClick={() => setOpen(false)}
            >
              👤 Mi perfil
            </Link>
          </li>
          <li>
            <Link
              href="/api/auth/logout"
              className="block px-4 py-2 hover:bg-indigo-50"
            >
              🔌 Desconectar
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
