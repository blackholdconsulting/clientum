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
  const linkClass = (prefix: string) =>
    `block py-2 px-3 rounded hover:bg-indigo-100 ${
      isActive(prefix) ? "bg-indigo-100 font-semibold" : ""
    }`;

  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-800 flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow flex flex-col">
          {/* Logo / App Title */}
          <div className="p-6 font-bold text-xl text-indigo-600">Clientum</div>

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 space-y-1 text-sm">
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              📊 Dashboard
            </Link>
            <Link href="/clientes" className={linkClass("/clientes")}>
              👥 Clientes
            </Link>

            {/* Facturas */}
            <div>
              <Link href="/facturas" className={linkClass("/facturas")}>
                🧾 Facturas
              </Link>
              <div className="pl-4 space-y-1">
                <Link href="/facturas" className={linkClass("/facturas")}>
                  Crear Factura
                </Link>
                <Link
                  href="/facturas/historico"
                  className={linkClass("/facturas/historico")}
                >
                  Histórico Facturas
                </Link>
                <Link
                  href="/facturas/factura-electronica"
                  className={linkClass("/facturas/factura-electronica")}
                >
                  📤 Factura Electrónica
                </Link>
                <Link
                  href="/facturas/factura-simplificada"
                  className={linkClass("/facturas/factura-simplificada")}
                >
                  🎫 Factura Simplificada
                </Link>
              </div>
            </div>

            <Link href="/presupuestos" className={linkClass("/presupuestos")}>
              💼 Presupuestos
            </Link>

            {/* Negocio */}
            <div>
              <Link href="/negocio" className={linkClass("/negocio")}>
                🚀 Negocio
              </Link>
              <div className="pl-4 space-y-1">
                <Link
                  href="/negocio/tareas"
                  className={linkClass("/negocio/tareas")}
                >
                  📝 Mis tareas
                </Link>
                <Link
                  href="/negocio/proyectos"
                  className={linkClass("/negocio/proyectos")}
                >
                  📁 Proyectos
                </Link>
                <Link
                  href="/negocio/plan-futuro"
                  className={linkClass("/negocio/plan-futuro")}
                >
                  🗺️ Plan Futuro
                </Link>
                <Link
                  href="/negocio/estudio-de-mercado"
                  className={linkClass("/negocio/estudio-de-mercado")}
                >
                  🔎 Estudio de Mercado
                </Link>
                <Link
                  href="/negocio/analisis-competencia"
                  className={linkClass("/negocio/analisis-competencia")}
                >
                  📊 Análisis de Competencia
                </Link>
                <Link
                  href="/negocio/continuar-proyecto"
                  className={linkClass("/negocio/continuar-proyecto")}
                >
                  ▶️ Continuar Proyecto
                </Link>
              </div>
            </div>

            <Link href="/impuestos" className={linkClass("/impuestos")}>
              ⚖️ Impuestos
            </Link>

            {/* Tesorería con submenú */}
            <div>
              <Link href="/tesoreria" className={linkClass("/tesoreria")}>
                🏦 Tesorería
              </Link>
              <div className="pl-4 space-y-1">
                <Link
                  href="/tesoreria/cuentas"
                  className={linkClass("/tesoreria/cuentas")}
                >
                  💳 Cuentas
                </Link>
                <Link
                  href="/tesoreria/cashflow"
                  className={linkClass("/tesoreria/cashflow")}
                >
                  💹 Cashflow
                </Link>
                <Link
                  href="/tesoreria/pagos-cobros"
                  className={linkClass("/tesoreria/pagos-cobros")}
                >
                  💵 Pagos y Cobros
                </Link>
                <Link
                  href="/tesoreria/remesas"
                  className={linkClass("/tesoreria/remesas")}
                >
                  📤 Remesas
                </Link>
              </div>
            </div>

            <Link href="/gastos" className={linkClass("/gastos")}>
              💸 Gastos
            </Link>

            {/* Contabilidad */}
            <div>
              <Link href="/contabilidad" className={linkClass("/contabilidad")}>
                📈 Contabilidad
              </Link>
              <div className="pl-4 space-y-1">
                {/* Aquí subelementos de contabilidad si los tienes */}
                <Link
                  href="/asientos"
                  className={linkClass("/asientos")}
                >
                  🧾 Asientos
                </Link>
              </div>
            </div>

            <Link href="/chat" className={linkClass("/chat")}>
              💬 Chat IA
            </Link>
            <Link href="/rrhh" className={linkClass("/rrhh")}>
              👩‍💼 RRHH
            </Link>

            {/* Inventario */}
            <div>
              <Link
                href="/inventario"
                className={linkClass("/inventario")}
              >
                📦 Inventario y Almacén
              </Link>
            </div>

            {/* Ayuda y Soporte */}
            <div>
              <Link href="/help" className={linkClass("/help")}>
                🆘 Ayuda y Soporte
              </Link>
              <div className="pl-4 space-y-1">
                <Link
                  href="/help/academia"
                  className={linkClass("/help/academia")}
                >
                  📘 Academia Clientum
                </Link>
                <Link
                  href="/help/tutoriales"
                  className={linkClass("/help/tutoriales")}
                >
                  🎥 Tutoriales
                </Link>
                <Link
                  href="/help/votar-mejoras"
                  className={linkClass("/help/votar-mejoras")}
                >
                  👍 Votar mejoras
                </Link>
                <Link
                  href="/help/novedades"
                  className={linkClass("/help/novedades")}
                >
                  🆕 Novedades
                </Link>
                <Link
                  href="/help/soporte"
                  className={linkClass("/help/soporte")}
                >
                  🛠️ Soporte
                </Link>
                <Link
                  href="/help/contacto"
                  className={linkClass("/help/contacto")}
                >
                  💬 Contáctanos
                </Link>
              </div>
            </div>
          </nav>

          {/* Pie: Mi perfil y menú de usuario */}
          <div className="px-4 mt-auto border-t pt-2 space-y-1">
            <Link
              href="/profile"
              className="flex items-center py-2 px-3 text-sm hover:bg-gray-100 rounded"
            >
              <div className="h-8 w-8 bg-gray-200 rounded-full mr-2" />
              Mi perfil
            </Link>
            <UserMenu />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  );
}
