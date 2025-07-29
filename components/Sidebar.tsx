"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserMenu from "./UserMenu";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isPublicRoute, setIsPublicRoute] = useState(false);

  useEffect(() => {
    setIsPublicRoute(
      pathname.startsWith("/landing") ||
      pathname.startsWith("/auth") ||
      pathname === "/"
    );
  }, [pathname]);

  const isActive = (prefix: string) =>
    pathname === prefix || pathname.startsWith(prefix + "/");

  const linkClass = (prefix: string) =>
    `block py-2 px-3 rounded hover:bg-indigo-100 ${
      isActive(prefix) ? "bg-indigo-100 font-semibold" : ""
    }`;

  if (isPublicRoute) return null;

  return (
    <aside className="w-64 bg-white border-r shadow flex flex-col">
      <div className="p-6 font-bold text-xl text-indigo-600">Clientum</div>
      <nav className="flex-1 overflow-y-auto px-4 space-y-1 text-sm">
        <Link href="/dashboard" className={linkClass("/dashboard")}>📊 Dashboard</Link>
        <Link href="/clientes" className={linkClass("/clientes")}>👥 Clientes</Link>
        <Link href="/proveedores" className={linkClass("/proveedores")}>🛒 Proveedores</Link>
        {/* ... resto del menú igual ... */}
      </nav>
      <div className="px-4 mt-auto border-t pt-2 space-y-1">
        <div className="text-xs font-semibold">Ayuda y soporte</div>
        {/* ... resto ... */}
        <div className="mt-3">
          <Link href="/profile" className="flex items-center py-2 px-3 text-sm hover:bg-gray-100 rounded">
            <div className="h-8 w-8 bg-gray-200 rounded-full mr-2" />
            Mi cuenta
          </Link>
          <UserMenu />
        </div>
      </div>
    </aside>
  );
}
