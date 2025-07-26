"use client";

import Image from "next/image";

export default function CuentasPage() {
  return (
    <main className="p-6 bg-white rounded-md shadow-lg space-y-6">
      {/* Cabecera */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cuentas Bancarias</h1>
        <button
          disabled
          className="px-4 py-2 bg-blue-600 text-white rounded opacity-50 cursor-not-allowed"
        >
          + Añadir cuenta
        </button>
      </header>

      {/* Hero gráfico */}
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-lg font-medium mb-2">Conecta tu primera cuenta</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Vincula tus bancos y sincroniza tu extracto</li>
            <li>Crea reglas de conciliación automática</li>
            <li>Sigue tu flujo de caja en tiempo real</li>
          </ul>
        </div>
        <div className="flex-1 flex justify-center">
          <Image
            src="/illustrations/tesoreria-cuentas.svg"
            alt="Ilustración Tesorería"
            width={300}
            height={200}
          />
        </div>
      </div>

      {/* Link a artículo */}
      <div className="border border-gray-200 rounded p-4 bg-gray-50 flex justify-between items-center">
        <span>Aprende a sincronizar tu banco</span>
        <a
          href="#"
          className="text-indigo-600 hover:underline text-sm font-medium"
        >
          Leer artículo →
        </a>
      </div>
    </main>
  );
}
