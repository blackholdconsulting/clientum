"use client";

import Link from "next/link";

export default function PlanFuturoPage() {
  return (
    <main className="p-6 bg-white rounded-md shadow-lg">
      {/* Header con botón “volver” */}
      <header className="flex items-center mb-6">
        <Link
          href="/negocio"
          className="text-gray-500 hover:text-gray-700 mr-4"
        >
          ←
        </Link>
        <h1 className="text-2xl font-semibold">Plan futuro</h1>
      </header>

      {/* Contenido principal */}
      <div className="flex flex-col items-center justify-center py-16">
        <img
          src="/illustrations/roadmap-empty.svg"
          alt="Sin plan futuro"
          className="w-48 h-48 mb-6"
        />
        <p className="text-gray-600 mb-4">
          Define tus objetivos a largo plazo.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Añadir objetivo
        </button>
      </div>

      {/* Enlace a artículo */}
      <div className="mt-8 bg-white border rounded-md p-4 flex items-center justify-between">
        <span className="text-gray-700">
          Aprende a trazar tu hoja de ruta estratégica.
        </span>
        <Link
          href="/articulo/trazar-hoja-de-ruta"
          className="text-sm text-blue-600 hover:underline"
        >
          Leer artículo
        </Link>
      </div>
    </main>
  );
}
