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
          <nav className="flex-1 flex flex-col px-4 text-sm space-y-1">
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
                href="#"
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
                <Link
                  href="/negocio/tareas"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/tareas") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  🗒️ Tareas
                </Link>
                <Link
                  href="/negocio/proyectos"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/proyectos") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  📁 Proyectos
                </Link>
                <Link
                  href="/negocio/plan-futuro"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/plan-futuro") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  🔮 Plan futuro
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
                href="/tesoreria/cuentas"
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
                  Pagos y Cobros
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
                href="#"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/rrhh") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                👥 RRHH
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 ml-2 w-56 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link
                  href="/rrhh/employees"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/rrhh/employees") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  👤 Empleados
                </Link>
                <Link
                  href="/rrhh/payroll"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/rrhh/payroll") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  💰 Nóminas
                </Link>
                <Link
                  href="/rrhh/gastos"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/rrhh/gastos") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  🧾 Gastos
                </Link>
                <Link
                  href="/rrhh/horarios"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/rrhh/horarios") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  ⏰ Horarios
                </Link>
                <Link
                  href="/rrhh/vacaciones"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/rrhh/vacaciones") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  🌴 Vacaciones
                </Link>
              </div>
            </div>
          </nav>

          {/* Ayuda y soporte (fijo al pie) */}
          <div className="mt-auto border-t pt-4 px-4 text-sm">
            <div className="font-medium mb-2">Ayuda y soporte</div>
            <Link href="#" className="block py-1 hover:text-indigo-600">
              📚 Academia Clientum
            </Link>
            <Link href="#" className="block py-1 hover:text-indigo-600">
              🎓 Tutoriales
            </Link>
            <Link href="#" className="block py-1 hover:text-indigo-600">
              ⭐ Votar mejoras
            </Link>
            <Link href="#" className="block py-1 hover:text-indigo-600">
              🆕 Novedades
            </Link>
            <Link href="#" className="block py-1 hover:text-indigo-600">
              📞 Llámanos
            </Link>
            <Link href="#" className="block py-1 hover:text-indigo-600">
              🛠️ Contactar soporte
            </Link>
            <Link href="#" className="block py-1 hover:text-indigo-600">
              💬 Chat con nosotros
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  );
}
