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
      <body
        className={`bg-gray-50 text-gray-800 flex h-screen overflow-hidden ${
          isPublicRoute ? "bg-white" : ""
        }`}
      >
        {/* 🔑 Mostrar sidebar solo en rutas privadas */}
        {!isPublicRoute && (
          <aside className="w-64 bg-white border-r shadow flex flex-col">
            <div className="p-6 font-bold text-xl text-indigo-600">Clientum</div>
            <nav className="flex-1 overflow-y-auto px-4 space-y-1 text-sm">
              {/* ... resto del menú ... */}
            </nav>

            <div className="px-4 mt-auto border-t pt-2 space-y-1">
              {/* ... ayuda y soporte ... */}
            </div>
          </aside>
        )}

        <main
          className={`flex-1 overflow-y-auto ${
            isPublicRoute ? "bg-white p-0" : "p-8 bg-gray-100"
          }`}
        >
          {children}
        </main>
      </body>
    </html>
  );
}
