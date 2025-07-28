// app/RR.HH/horarios/page.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function HorariosPage() {
  const router = useRouter();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back & Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-800"
          aria-label="Volver"
        >
          ← Volver
        </button>
        <h1 className="text-2xl font-bold">Horarios</h1>
      </div>

      {/* Empty state */}
      <div className="text-center py-16 bg-white rounded shadow">
        {/* Illustration */}
        <svg
          className="mx-auto h-24 w-24 text-gray-300"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          stroke="currentColor"
        >
          <circle cx="32" cy="32" r="30" strokeWidth="4" />
          <path
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20 32h24M32 20v24"
          />
        </svg>

        <h2 className="mt-4 text-xl font-semibold">Sin horarios</h2>
        <p className="mt-2 text-gray-500">
          Aún no has definido turnos u horarios.
        </p>
        <Link href="/RR.HH/horarios/nuevo">
          <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Crear horario
          </button>
        </Link>

        <p className="mt-8 text-sm">
          <Link
            href="https://docs.clientum.com/horarios"
            target="_blank"
            className="text-blue-600 hover:underline"
          >
            Aprende a configurar tus turnos
          </Link>
        </p>
      </div>
    </div>
  );
}
