// app/layout.tsx
"use client";

import "./globals.css";
import Link from "next/link";
import { ReactNode, useState, useEffect } from "react";
import UserMenu from "../components/UserMenu";

export default function RootLayout({ children }: { children: ReactNode }) {
  // Ruta activa en cliente
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    setActive(window.location.pathname);
    const onPop = () => setActive(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const isActive = (prefix: string) =>
    active === prefix || active.startsWith(prefix + "/");

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
            {/* Dashboard */}
            <Link href="/dashboard">
              <a
                className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/dashboard") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                📊 Dashboard
              </a>
            </Link>

            {/* Clientes */}
            <Link href="/clientes">
              <a
                className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/clientes") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                👥 Clientes
              </a>
            </Link>

            {/* Facturas dropdown */}
            <div className="group relative">
              <button
                className={`w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 focus:outline-none ${
                  isActive("/facturas") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>🧾 Facturas</span>
                <span className="text-xs ml-1 transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </button>
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:visible transition-opacity z-10">
                <Link href="/facturas">
                  <a
                    className={`block py-2 px-3 hover:bg-indigo-50 ${
                      isActive("/facturas") && !isActive("/facturas/historico")
                        ? "bg-indigo-50 font-medium"
                        : ""
                    }`}
                  >
                    Listado
                  </a>
                </Link>
                <Link href="/facturas/historico">
                  <a
                    className={`block py-2 px-3 hover:bg-indigo-50 ${
                      isActive("/facturas/historico")
                        ? "bg-indigo-50 font-medium"
                        : ""
                    }`}
                  >
                    Histórico
                  </a>
                </Link>
              </div>
            </div>

            {/* Presupuestos */}
            <Link href="/presupuestos">
              <a
                className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/presupuestos") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                💼 Presupuestos
              </a>
            </Link>

            {/* Negocio dropdown */}
            <div className="group relative">
              <button
                className={`w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 focus:outline-none ${
                  isActive("/negocio") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>🚀 Negocio</span>
                <span className="text-xs ml-1 transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </button>
              <div className="absolute left-full top-0 ml-2 w-52 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:visible transition-opacity z-10">
                <Link href="/negocio/tareas">
                  <a
                    className={`block py-2 px-3 hover:bg-indigo-50 ${
                      isActive("/negocio/tareas") ? "bg-indigo-50 font-medium" : ""
                    }`}
                  >
                    Mis tareas
                  </a>
                </Link>
                <Link href="/negocio/proyectos">
                  <a
                    className={`block py-2 px-3 hover:bg-indigo-50 ${
                      isActive("/negocio/proyectos") ? "bg-indigo-50 font-medium" : ""
                    }`}
                  >
                    Proyectos
                  </a>
                </Link>
                <Link href="/negocio/continuar-proyecto">
                  <a
                    className={`block py-2 px-3 hover:bg-indigo-50 ${
                      isActive("/negocio/continuar-proyecto")
                        ? "bg-indigo-50 font-medium"
                        : ""
                    }`}
                  >
                    Continuar proyecto
                  </a>
                </Link>
              </div>
            </div>

            {/* Impuestos */}
            <Link href="/impuestos">
              <a
                className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/impuestos") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                ⚖️ Impuestos
              </a>
            </Link>

            {/* Tesorería dropdown */}
            <div className="group relative">
              <button
                className={`w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 focus:outline-none ${
                  isActive("/tesoreria") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>🏦 Tesorería</span>
                <span className="text-xs ml-1 transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </button>
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:visible transition-opacity z-10">
                <Link href="/tesoreria/cuentas">
                  <a
                    className={`block py-2 px-3 hover:bg-indigo-50 ${
                      isActive("/tesoreria/cuentas") ? "bg-indigo-50 font-medium" : ""
                    }`}
                  >
                    Cuentas
                  </a>
                </Link>
                <Link href="/tesoreria/pagos-cobros">
                  <a
                    className={`block py-2 px-3 hover:bg-indigo-50 ${
                      isActive("/tesoreria/pagos-cobros")
                        ? "bg-indigo-50 font-medium"
                        : ""
                    }`}
                  >
                    Pagos y cobros
                  </a>
                </Link>
              </div>
            </div>

            {/* Contabilidad dropdown */}
            <div className="group relative">
              <button
                className={`w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 focus:outline-none ${
                  isActive("/contabilidad") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>📈 Contabilidad</span>
                <span className="text-xs ml-1 transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </button>
              <div className="absolute left-full top-0 ml-2 w-56 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:visible transition-opacity z-10">
                <Link href="/contabilidad/cuadro-de-cuentas">
                  <a
                    className={`block py-2 px-3 hover:bg-indigo-50 ${
                      isActive("/contabilidad/cuadro-de-cuentas")
                        ? "bg-indigo-50 font-medium"
                        : ""
                    }`}
                  >
                    Cuadro de cuentas
                  </a>
                </Link>
                <Link href="/contabilidad/libro-diario">
                  <a
                    className={`block py-2 px-3 hover:bg-indigo-50 ${
                      isActive("/contabilidad/libro-diario")
                        ? "bg-indigo-50 font-medium"
                        : ""
                    }`}
                  >
                    Libro diario
                  </a>
                </Link>
              </div>
            </div>

            {/* Chat IA */}
            <Link href="/chat">
              <a
                className={`block py-2 px-3 rounded hover:bg-indigo-100 ${
                  isActive("/chat") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                💬 Chat IA
              </a>
            </Link>

            {/* RRHH dropdown */}
            <div className="group relative">
              <button
                className={`w-full flex justify-between items-center py-2 px-3 rounded hover:bg-indigo-100 focus:outline-none ${
                  isActive("/RR.HH") ? "bg-indigo-100 font-semibold" : ""
                }`}
              >
                <span>👩‍💼 RRHH</span>
                <span className="text-xs ml-1 transition-transform group-hover:rotate-180">
                  ▼
                </span>
              </button>
              <div className="absolute left-full top-0 ml-2 w-48 bg-white border rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-focus-within:opacity-100 group-focus-within:visible transition-opacity z-10">
                <Link href="/RR.HH/employees">
                  <a
                    className={`block py-2 px-3 hover:bg-indigo-50 ${
                      isActive("/RR.HH/employees") ? "bg-indigo-50 font-medium" : ""
                    }`}
                  >
                    Empleados
                  </a>
                </Link>
                <Link href="/RR.HH/horarios">
                  <a
                    className={`block py-2 px-3 hover:bg-indigo-50 ${
                      isActive("/RR.HH/horarios") ? "bg-indigo-50 font-medium" : ""
                    }`}
                  >
                    Horarios
                  </a>
                </Link>
              </div>
            </div>
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
