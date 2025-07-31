// File: app/layout.tsx
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
        <aside className="w-64 bg-white border-r shadow flex flex-col">
          <div className="p-6 font-bold text-xl text-indigo-600">Clientum</div>

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
            <Link href="/tesoreria" className={linkClass("/tesoreria")}>
              🏦 Tesorería
            </Link>
            <Link href="/gastos" className={linkClass("/gastos")}>
              💸 Gastos
            </Link>
            <Link href="/contabilidad" className={linkClass("/contabilidad")}>
              📈 Contabilidad
            </Link>
            <Link href="/chat" className={linkClass("/chat")}>
              💬 Chat IA
            </Link>
            <Link href="/RR.HH" className={linkClass("/RR.HH")}>
              👥 RRHH
            </Link>

            {/* Ayuda y Soporte */}
            <div>
              <Link href="/help" className={linkClass("/help")}>
                🆘 Ayuda y Soporte
              </Link>
              <div className="pl-4 space-y-1">
                <Link href="/help/chat" className={linkClass("/help/chat")}>
                  💬 Chat
                </Link>
                <Link
                  href="/help/contacto"
                  className={linkClass("/help/contacto")}
                >
                  📞 Contacto
                </Link>
                <Link
                  href="/help/feedback"
                  className={linkClass("/help/feedback")}
                >
                  ✉️ Feedback
                </Link>
                <Link
                  href="/help/novedades"
                  className={linkClass("/help/novedades")}
                >
                  📰 Novedades
                </Link>
                <Link
                  href="/help/tutoriales"
                  className={linkClass("/help/tutoriales")}
                >
                  🎓 Tutoriales
                </Link>
              </div>
            </div>
          </nav>

          {/* Perfil y Cerrar Sesión */}
          <div className="p-4 border-t flex justify-center">
            <UserMenu />
          </div>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </body>
    </html>
  );
}
