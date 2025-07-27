// app/rrhh/vacaciones/page.tsx
"use client";

import Link from "next/link";

export default function VacacionesPage() {
  return (
    <main className="p-6 bg-white rounded-md shadow-lg">
      <header className="flex items-center space-x-4 mb-6">
        <Link href="/rrhh" className="text-gray-500 hover:text-gray-700 flex items-center">
          ← Volver
        </Link>
        <h1 className="text-2xl font-semibold">Vacaciones</h1>
      </header>

      <section className="text-center py-16">
        <img
          src="/assets/illustrations/no-vacations.svg"
          alt="Sin vacaciones"
          className="mx-auto mb-4 h-32"
        />
        <p className="mb-6 text-gray-600">Todavía no hay solicitudes de vacaciones.</p>
        <button className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
          Solicitar vacaciones
        </button>
      </section>

      <footer className="mt-8 text-center">
        <Link
          href="https://help.clientum.com/rrhh/vacaciones"
          target="_blank"
          className="text-sm text-indigo-600 hover:underline"
        >
          Consulta la política de vacaciones
        </Link>
      </footer>
    </main>
  );
}
