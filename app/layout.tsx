// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";

export const metadata = {
  title: "Clientum",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="es">
      <body className="flex h-screen overflow-hidden bg-gray-50 text-gray-800">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
