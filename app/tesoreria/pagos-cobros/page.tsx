"use client";

export default function PagosCobrosPage() {
  return (
    <main className="p-6 bg-white rounded-md shadow-lg space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pagos y Cobros</h1>
        <button
          disabled
          className="px-4 py-2 bg-blue-600 text-white rounded opacity-50 cursor-not-allowed"
        >
          + Nuevo movimiento
        </button>
      </header>
      <p className="text-gray-600">Registra aquí pagos y cobros futuros (próximamente).</p>
    </main>
  );
}
