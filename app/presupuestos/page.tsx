// app/presupuestos/page.tsx
"use client";

import Link from "next/link";

export default function PresupuestosPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Presupuestos</h1>
        <Link href="/presupuestos/nuevo">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Nuevo presupuesto
          </button>
        </Link>
      </div>

      {/* Empty state */}
      <div className="text-center py-16 bg-white rounded shadow">
        <p className="text-xl font-semibold">Sin presupuestos</p>
        <p className="mt-2 text-gray-500">
          Todavía no has creado ningún presupuesto.
        </p>
        <Link href="/presupuestos/nuevo">
          <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Crear presupuesto
          </button>
        </Link>
      </div>
    </div>
  );
}
