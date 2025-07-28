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
  const headersList = await headers();
  return headersList.get("x-invoke-path") || "/";
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
            {/* Menú principal */}
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
            <Link
              href="/presupuestos"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/presupuestos") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              💼 Presupuestos
            </Link>

            {/* Ajustes */}
            <div className="relative group">
              <button
                className={`w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 focus:outline-none ${
                  isActive("/settings") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>⚙️ Ajustes</span>
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </button>
              <div className="absolute left-full top-0 z-50 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link
                  href="/settings/verifactu"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/settings/verifactu")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  🔑 Verifactu
                </Link>
                <Link
                  href="/settings/facturae"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/settings/facturae")
                      ? "bg-indigo-50 font-medium"
                      : ""
                  }`}
                >
                  📄 Facturae
                </Link>
              </div>
            </div>

            {/* Resto de dropdowns idénticos al original */}
            {/* 🚀 Negocio */}
            <div className="relative group">
              <Link
                href="/negocio"
                className={`w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/negocio") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>🚀 Negocio</span>
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 z-50 ml-2 w-52 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link
                  href="/negocio/tareas"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/negocio/tareas") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Mis tareas
                </Link>
                {/* … demás items … */}
              </div>
            </div>

            {/* ⚖️ Impuestos */}
            <Link
              href="/impuestos"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/impuestos") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              ⚖️ Impuestos
            </Link>

            {/* 🏦 Tesorería */}
            <div className="relative group">
              <Link
                href="/tesoreria"
                className={`w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/tesoreria") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>🏦 Tesorería</span>
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 z-50 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link
                  href="/tesoreria/cuentas"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/tesoreria/cuentas") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Cuentas
                </Link>
                {/* … */}
              </div>
            </div>

            {/* 📈 Contabilidad */}
            <div className="relative group">
              <Link
                href="/contabilidad"
                className={`w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/contabilidad") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>📈 Contabilidad</span>
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 z-50 ml-2 w-56 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
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
                {/* … */}
              </div>
            </div>

            {/* 💬 Chat IA */}
            <Link
              href="/chat"
              className={`py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/chat") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              💬 Chat IA
            </Link>

            {/* 👩‍💼 RRHH */}
            <div className="relative group">
              <Link
                href="/RR.HH"
                className={`w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/RR.HH") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>👩‍💼 RRHH</span>
                <span className="text-xs ml-1 transform group-hover:rotate-180 transition-transform">
                  ▼
                </span>
              </Link>
              <div className="absolute left-full top-0 z-50 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-opacity">
                <Link
                  href="/RR.HH/employees"
                  className={`block py-2 px-3 hover:bg-indigo-50 ${
                    isActive("/RR.HH/employees") ? "bg-indigo-50 font-medium" : ""
                  }`}
                >
                  Empleados
                </Link>
                {/* … */}
              </div>
            </div>
          </nav>

          {/* Ayuda y soporte abajo */}
          <div className="px-4 mt-auto border-t pt-2">
            <div className="text-xs font-semibold mb-1">Ayuda y soporte</div>
            <Link
              href="/help/academia"
              className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              📘 Academia Clientum
            </Link>
            <Link
              href="/help/tutoriales"
              className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              🎥 Tutoriales
            </Link>
            <Link
              href="/help/votar-mejoras"
              className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              👍 Votar mejoras
            </Link>
            <Link
              href="/help/novedades"
              className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              🆕 Novedades
            </Link>
            <Link
              href="/help/soporte"
              className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              🛠️ Soporte
            </Link>
            <Link
              href="/help/contacto"
              className="flex items-center py-1 px-2 text-sm hover:bg-gray-100 rounded"
            >
              💬 Contáctanos
            </Link>

            {/* Perfil y logout */}
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

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  );
}
