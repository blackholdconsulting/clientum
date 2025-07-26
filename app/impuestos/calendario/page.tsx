// app/impuestos/calendario/page.tsx
"use client";

import Link from "next/link";

export default function CalendarioFiscalPage() {
  return (
    <main className="p-6 bg-white rounded-md shadow-lg">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Calendario Fiscal</h1>
        <Link
          href="/impuestos"
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200 transition"
        >
          ← Volver
        </Link>
      </header>
      {/* Aquí pon tu componente de calendario, por ejemplo un DatePicker, un FullCalendar, etc. */}
      <div className="border rounded p-4 text-center text-gray-500">
        [Aquí irá el calendario de vencimientos fiscales]
      </div>
    </main>
  );
}
