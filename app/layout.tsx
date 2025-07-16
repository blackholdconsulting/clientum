// app/layout.tsx
import "./globals.css";
import Link from "next/link";
import { ReactNode } from "react";

export const metadata = {
  title: "Clientum",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-100 text-gray-800">
        <header className="p-4 bg-white shadow">
          <nav className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:underline">
              📊 Dashboard
            </Link>
            <Link href="/clients" className="hover:underline">
              👥 Clientes
            </Link>
            <Link href="/facturas" className="hover:underline">
              🧾 Facturas
            </Link>
            <Link href="/contabilidad" className="hover:underline">
              📈 Contabilidad
            </Link>
            <Link href="/chat" className="hover:underline">
              💬 Chat IA
            </Link>

            {/* ——— Aquí añadimos Empleados ——— */}
            <Link href="/employees" className="hover:underline">
              🧑‍💼 Empleados
            </Link>
          </nav>
        </header>

        <main>{children}</main>
      </body>
    </html>
  );
}
