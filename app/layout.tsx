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
        <aside className="w-64 bg-white border-r shadow flex flex-col">
          <div className="p-6 font-bold text-xl text-indigo-600">Clientum</div>
          <nav className="flex-1 overflow-y-auto px-4 space-y-1 text-sm">
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/dashboard") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              📊 Dashboard
            </Link>

            {/* Clientes */}
            <Link
              href="/clientes"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/clientes") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              👥 Clientes
            </Link>

            {/* Facturas dropdown */}
            <div className="group relative">
              <div
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/facturas") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>🧾 Facturas</span>
                <span className="text-xs ml-1 transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </div>
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
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
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/presupuestos") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              💼 Presupuestos
            </Link>

            {/* Negocio dropdown */}
            <div className="group relative">
              <div
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/negocio") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>🚀 Negocio</span>
                <span className="text-xs ml-1 transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </div>
              <div className="absolute left-full top-0 ml-2 w-52 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
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
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/impuestos") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              ⚖️ Impuestos
            </Link>

            {/* Tesorería dropdown */}
            <div className="group relative">
              <div
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/tesoreria") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>🏦 Tesorería</span>
                <span className="text-xs ml-1 transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </div>
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
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
              <div
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/contabilidad") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>📈 Contabilidad</span>
                <span className="text-xs ml-1 transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </div>
              <div className="absolute left-full top-0 ml-2 w-56 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
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
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/chat") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              💬 Chat IA
            </Link>

            {/* RRHH dropdown */}
            <div className="group relative">
              <div
                className={`flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 cursor-pointer ${
                  isActive("/RR.HH") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>👩‍💼 RRHH</span>
                <span className="text-xs ml-1 transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </div>
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
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
          <div className="px-4 mt-auto border-t pt-2 space-y-1">
            <div className="text-xs font-semibold">Ayuda y soporte</div>
            <Link
              href="/help/academia"
              className="block py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              📘 Academia Clientum
            </Link>
            <Link
              href="/help/tutoriales"
              className="block py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              🎥 Tutoriales
            </Link>
            <Link
              href="/help/votar-mejoras"
              className="block py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              👍 Votar mejoras
            </Link>
            <Link
              href="/help/novedades"
              className="block py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              🆕 Novedades
            </Link>
            <Link
              href="/help/soporte"
              className="block py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              🛠️ Soporte
            </Link>
            <Link
              href="/help/contacto"
              className="block py-1 px-2 text-sm hover:bg-gray-100 rounded"
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
        <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  );
}
