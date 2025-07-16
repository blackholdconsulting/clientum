// **NO** pongas "use client" en este archivo

import ClientWrapper from "./components/ClientWrapper";

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
        {/* Aquí envuelves todo lo que necesite React client-side */}
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
