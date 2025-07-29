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
  const isActive = (p: string) => path === p || path.startsWith(p + "/");

  return (
    <html lang="es">
      <head>
        <title>Clientum</title>
      </head>
      <body className="bg-gray-50 text-gray-800 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow flex flex-col">
          <div className="p-6 font-bold text-xl text-indigo-600">Clientum</div>
          <nav className="flex-1 overflow-y-auto px-4 space-y-1 text-sm">
            <Link
              href="/dashboard"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/dashboard") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              href="/clientes"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/clientes") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              👥 Clientes
            </Link>

            {/* Facturas */}
            <Link
              href="/facturas"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/facturas") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              🧾 Facturas
            </Link>
            <Link
              href="/facturas/historico"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/facturas/historico")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              📜 Histórico
            </Link>

            <Link
              href="/presupuestos"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/presupuestos") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              💼 Presupuestos
            </Link>

            {/* Negocio */}
            <Link
              href="/negocio"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/negocio") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              🚀 Negocio
            </Link>
            <Link
              href="/negocio/tareas"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/negocio/tareas") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              📋 Mis tareas
            </Link>
            <Link
              href="/negocio/proyectos"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/negocio/proyectos")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              📁 Proyectos
            </Link>
            <Link
              href="/negocio/plan-futuro"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/negocio/plan-futuro")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              🔮 Plan futuro
            </Link>
            <Link
              href="/negocio/estudio-mercado"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/negocio/estudio-mercado")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              📊 Estudio de mercado
            </Link>
            <Link
              href="/negocio/analisis-competencia"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/negocio/analisis-competencia")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              🔍 Análisis competencia
            </Link>
            <Link
              href="/negocio/continuar-proyecto"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/negocio/continuar-proyecto")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              ▶️ Continuar proyecto
            </Link>

            <Link
              href="/impuestos"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/impuestos") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              ⚖️ Impuestos
            </Link>

            {/* Tesorería */}
            <Link
              href="/tesoreria"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/tesoreria") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              🏦 Tesorería
            </Link>
            <Link
              href="/tesoreria/cuentas"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/tesoreria/cuentas")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              💳 Cuentas
            </Link>
            <Link
              href="/tesoreria/cashflow"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/tesoreria/cashflow")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              💸 Cashflow
            </Link>
            <Link
              href="/tesoreria/pagos-cobros"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/tesoreria/pagos-cobros")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              💰 Pagos y cobros
            </Link>
            <Link
              href="/tesoreria/remesas"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/tesoreria/remesas")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              ✉️ Remesas
            </Link>

            {/* Contabilidad */}
            <Link
              href="/contabilidad"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/contabilidad") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              📈 Contabilidad
            </Link>
            <Link
              href="/contabilidad/cuadro-de-cuentas"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/contabilidad/cuadro-de-cuentas")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              📋 Cuadro de cuentas
            </Link>
            <Link
              href="/contabilidad/libro-diario"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/contabilidad/libro-diario")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              📖 Libro diario
            </Link>
            <Link
              href="/contabilidad/activos"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/contabilidad/activos")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              🏷️ Activos
            </Link>
            <Link
              href="/contabilidad/perdidas-ganancias"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/contabilidad/perdidas-ganancias")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              📉 Pérdidas y ganancias
            </Link>
            <Link
              href="/contabilidad/balance-situacion"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/contabilidad/balance-situacion")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              ⚖️ Balance de situación
            </Link>

            <Link
              href="/chat"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/chat") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              💬 Chat IA
            </Link>

            {/* RRHH */}
            <Link
              href="/RR.HH"
              className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                isActive("/RR.HH") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              👩‍💼 RRHH
            </Link>
            <Link
              href="/RR.HH/employees"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/RR.HH/employees")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              👥 Empleados
            </Link>
            <Link
              href="/RR.HH/nominas"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/RR.HH/nominas")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              🧾 Nóminas
            </Link>
            <Link
              href="/RR.HH/gastos"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/RR.HH/gastos") ? "bg-indigo-100 font-semibold" : ""
              }`}
            >
              💸 Gastos
            </Link>
            <Link
              href="/RR.HH/horarios"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/RR.HH/horarios")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              ⏰ Horarios
            </Link>
            <Link
              href="/RR.HH/vacaciones"
              className={`block py-2 px-3 pl-8 rounded hover:bg-indigo-100 ${
                isActive("/RR.HH/vacaciones")
                  ? "bg-indigo-100 font-semibold"
                  : ""
              }`}
            >
              🌴 Vacaciones
            </Link>
          </nav>

          {/* Ayuda y soporte */}
          <div className="px-4 mt-auto border-t pt-2 space-y-1">
            <div className="text-xs font-semibold">Ayuda y soporte</div>
            <Link href="/help/academia">
              <a className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                📘 Academia Clientum
              </a>
            </Link>
            <Link href="/help/tutoriales">
              <a className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                🎥 Tutoriales
              </a>
            </Link>
            <Link href="/help/votar-mejoras">
              <a className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                👍 Votar mejoras
              </a>
            </Link>
            <Link href="/help/novedades">
              <a className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                🆕 Novedades
              </a>
            </Link>
            <Link href="/help/soporte">
              <a className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                🛠️ Soporte
              </a>
            </Link>
            <Link href="/help/contacto">
              <a className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                💬 Contáctanos
              </a>
            </Link>
            <div className="mt-3">
              <Link href="/profile">
                <a className="flex items-center py-2 px-3 text-sm hover:bg-gray-100 rounded">
                  <div className="h-8 w-8 bg-gray-200 rounded-full mr-2" />
                  Mi cuenta
                </a>
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
