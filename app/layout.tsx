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

  // ✅ Detectar rutas públicas
  const isPublicRoute =
    path.startsWith("/landing") || path.startsWith("/auth");

  const isActive = (prefix: string) =>
    path === prefix || path.startsWith(prefix + "/");

  const linkClass = (prefix: string) =>
    `block py-2 px-3 rounded hover:bg-indigo-100 ${
      isActive(prefix) ? "bg-indigo-100 font-semibold" : ""
    }`;

  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-800 flex h-screen overflow-hidden">
        {/* 🔑 Mostrar menú solo si no es ruta pública */}
        {!isPublicRoute && (
          <aside className="w-64 bg-white border-r shadow flex flex-col">
            <div className="p-6 font-bold text-xl text-indigo-600">Clientum</div>
            <nav className="flex-1 overflow-y-auto px-4 space-y-1 text-sm">
              <Link href="/dashboard" className={linkClass("/dashboard")}>
                📊 Dashboard
              </Link>
              <Link href="/clientes" className={linkClass("/clientes")}>
                👥 Clientes
              </Link>
              <Link href="/proveedores" className={linkClass("/proveedores")}>
                🛒 Proveedores
              </Link>

              {/* Facturas + Histórico */}
              <div>
                <Link href="/facturas" className={linkClass("/facturas")}>
                  🧾 Facturas
                </Link>
                <div className="pl-4 space-y-1">
                  <Link href="/facturas" className={linkClass("/facturas")}>
                    Listado
                  </Link>
                  <Link
                    href="/facturas/historico"
                    className={linkClass("/facturas/historico")}
                  >
                    Histórico
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
                  <Link href="/negocio/tareas" className={linkClass("/negocio/tareas")}>
                    📝 Mis tareas
                  </Link>
                  <Link
                    href="/negocio/proyectos"
                    className={linkClass("/negocio/proyectos")}
                  >
                    📁 Proyectos
                  </Link>
                  <Link
                    href="/negocio/analisis-de-la-competencia"
                    className={linkClass("/negocio/analisis-de-la-competencia")}
                  >
                    📊 Análisis de la competencia
                  </Link>
                  <Link
                    href="/negocio/estudio-de-mercado"
                    className={linkClass("/negocio/estudio-de-mercado")}
                  >
                    🔎 Estudio de mercado
                  </Link>
                  <Link
                    href="/negocio/continuar-proyecto"
                    className={linkClass("/negocio/continuar-proyecto")}
                  >
                    ▶️ Continuar proyecto
                  </Link>
                </div>
              </div>

              {/* NOP */}
              <div>
                <Link href="/NOP" className={linkClass("/NOP")}>
                  🧮 NOP
                </Link>
                <div className="pl-4 space-y-1">
                  <Link href="/NOP/budget" className={linkClass("/NOP/budget")}>
                    💰 Budget
                  </Link>
                  <Link href="/NOP/opex" className={linkClass("/NOP/opex")}>
                    📉 OPEX
                  </Link>
                  <Link href="/NOP/capex" className={linkClass("/NOP/capex")}>
                    🏗️ CAPEX
                  </Link>
                </div>
              </div>

              <Link href="/impuestos" className={linkClass("/impuestos")}>
                ⚖️ Impuestos
              </Link>

              <Link href="/tesoreria" className={linkClass("/tesoreria")}>
                🏦 Tesorería
              </Link>

              <Link href="/contabilidad" className={linkClass("/contabilidad")}>
                📈 Contabilidad
              </Link>

              <Link href="/chat" className={linkClass("/chat")}>
                💬 Chat IA
              </Link>

              <Link href="/RR.HH" className={linkClass("/RR.HH")}>
                👩‍💼 RRHH
              </Link>
            </nav>

            <div className="px-4 mt-auto border-t pt-2 space-y-1">
              <div className="text-xs font-semibold">Ayuda y soporte</div>
              <Link href="/help/academia" className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                📘 Academia Clientum
              </Link>
              <Link href="/help/tutoriales" className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                🎥 Tutoriales
              </Link>
              <Link href="/help/votar-mejoras" className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                👍 Votar mejoras
              </Link>
              <Link href="/help/novedades" className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                🆕 Novedades
              </Link>
              <Link href="/help/soporte" className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                🛠️ Soporte
              </Link>
              <Link href="/help/contacto" className="block py-1 px-2 text-sm hover:bg-gray-100 rounded">
                💬 Contáctanos
              </Link>

              <div className="mt-3">
                <Link href="/profile" className="flex items-center py-2 px-3 text-sm hover:bg-gray-100 rounded">
                  <div className="h-8 w-8 bg-gray-200 rounded-full mr-2" />
                  Mi cuenta
                </Link>
                <UserMenu />
              </div>
            </div>
          </aside>
        )}

        <main
          className={`flex-1 p-8 overflow-y-auto bg-gray-100 ${
            !isPublicRoute ? "pl-0" : ""
          }`}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
