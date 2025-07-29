// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { headers } from "next/headers";
import { ReactNode } from "react";
import UserMenu from "../components/UserMenu";

export const metadata = {
  title: "Clientum",
};

async function getActivePath(): Promise<string> {
  const h = await headers();
  return h.get("x-invoke-path") || "/";
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
          <nav className="flex-1 flex flex-col px-4 text-sm space-y-1 overflow-y-auto">
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

            {/* Facturas dropdown */}
            <div className="group relative">
              <Link
                href="/facturas"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/facturas") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                🧾 Facturas
                <span className="text-xs ml-1 transform transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 z-50 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                <Link
                  href="/facturas"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/facturas") &&
                    !isActive("/facturas/historico")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  Listado
                </Link>
                <Link
                  href="/facturas/historico"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/facturas/historico")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  Histórico
                </Link>
              </div>
            </div>

            {/* Presupuestos */}
            <Link
              href="/presupuestos"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/presupuestos") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              💼 Presupuestos
            </Link>

            {/* Negocio dropdown */}
            <div className="group relative">
              <Link
                href="/negocio"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/negocio") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                🚀 Negocio
                <span className="text-xs ml-1 transform transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 z-50 ml-2 w-52 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                <Link
                  href="/negocio/tareas"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/tareas") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Mis tareas
                </Link>
                <Link
                  href="/negocio/proyectos"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/proyectos")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  Proyectos
                </Link>
                <Link
                  href="/negocio/plan-futuro"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/plan-futuro")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  Plan futuro
                </Link>
                <Link
                  href="/negocio/continuar-proyecto"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/continuar-proyecto")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  Continuar proyecto
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

            {/* Tesorería dropdown */}
            <div className="group relative">
              <Link
                href="/tesoreria"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/tesoreria") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                🏦 Tesorería
                <span className="text-xs ml-1 transform transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 z-50 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                <Link
                  href="/tesoreria/cuentas"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/tesoreria/cuentas")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  Cuentas
                </Link>
                <Link
                  href="/tesoreria/pagos-cobros"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/tesoreria/pagos-cobros")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  Pagos y cobros
                </Link>
              </div>
            </div>

            {/* Contabilidad dropdown */}
            <div className="group relative">
              <Link
                href="/contabilidad"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/contabilidad") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                📈 Contabilidad
                <span className="text-xs ml-1 transform transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 z-50 ml-2 w-56 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                <Link
                  href="/contabilidad/cuadro-de-cuentas"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/contabilidad/cuadro-de-cuentas")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  Cuadro de cuentas
                </Link>
                <Link
                  href="/contabilidad/libro-diario"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/contabilidad/libro-diario")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  Libro diario
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

            {/* RRHH dropdown */}
            <div className="group relative">
              <Link
                href="/RR.HH"
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/RR.HH") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                👩‍💼 RRHH
                <span className="text-xs ml-1 transform transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 z-50 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                <Link
                  href="/RR.HH/employees"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/RR.HH/employees")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  Empleados
                </Link>
                <Link
                  href="/RR.HH/horarios"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/RR.HH/horarios")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  Horarios
                </Link>
              </div>
            </div>
          </nav>

          {/* Ayuda y soporte */}
          <div className="px-4 mt-auto border-t pt-2">
            <div className="text-xs font-semibold mb-1">Ayuda y soporte</div>
            <Link
              href="/help/academia"
              className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              📘 Academia Clientum
            </Link>
            <Link
              href="/help/contacto"
              className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              💬 Contáctanos
            </Link>
            <div className="mt-3">
              <Link
                href="/profile"
                className="flex items-center py-2 px-3 text-sm hover:bg-gray-100 rounded"
              >
                <div className="h-8 w-8 bg-gray-200 rounded-full mr-2" />
                Mi cuenta
              </Link>
              <UserMenu />
            </div>
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
