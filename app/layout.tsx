// app/layout.tsx
// -----------------
// Aquí marcamos todo el layout como cliente,
// porque tus componentes hijos probablemente usan hooks.
// Ya no exportamos metadata en este archivo.
"use client";

import ClientWrapper from "../components/ClientWrapper";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
