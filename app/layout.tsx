// app/layout.tsx
// -----------------
// Este archivo es cliente ("use client") porque tus hijos usan hooks.
// Ya no exporta metadata aquí; solo envuelve tu layout.

"use client";

import SidebarLayout from "../components/Layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <SidebarLayout>
          {children}
        </SidebarLayout>
      </body>
    </html>
  );
}
