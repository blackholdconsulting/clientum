// app/layout.tsx
// -------------------
// ¡NO incluyas NINGUNA línea "use client" aquí!

import ClientWrapper from "../components/ClientWrapper";

export const metadata = {
  title: "Clientum",
  description: "Gestión de clientes y facturas",
};

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
