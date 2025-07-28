// app/negocio/page.tsx
"use client";

import Link from "next/link";
import { FiClipboard, FiFolder, FiZap, FiSearch, FiBarChart2 } from "react-icons/fi";

export default function NegocioDashboard() {
  const cards = [
    {
      title: "Tareas",
      subtitle: "Gestiona y asigna tus tareas",
      href: "/negocio/tareas",
      icon: <FiClipboard size={20} />,
      color: "text-indigo-600",
    },
    {
      title: "Proyectos",
      subtitle: "Organiza tus proyectos",
      href: "/negocio/proyectos",
      icon: <FiFolder size={20} />,
      color: "text-yellow-600",
    },
    {
      title: "Plan futuro",
      subtitle: "Diseña tu hoja de ruta",
      href: "/negocio/plan-futuro",
      icon: <FiZap size={20} />,
      color: "text-green-600",
    },
    {
      title: "Estudio de Mercado",
      subtitle: "Analiza el mercado objetivo",
      href: "/negocio/estudio-mercado",
      icon: <FiSearch size={20} />,
      color: "text-pink-600",
    },
    {
      title: "Análisis Competencia",
      subtitle: "Compara con tus rivales",
      href: "/negocio/analisis-competencia",
      icon: <FiBarChart2 size={20} />,
      color: "text-blue-600",
    },
  ];

  return (
    <main className="p-6 bg-gray-100 min-h-full">
      <h1 className="text-2xl font-semibold mb-6">Negocio</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c) => (
          <div
            key={c.title}
            className="bg-white rounded-lg shadow p-5 flex flex-col justify-between"
          >
            <div className="flex items-center mb-4">
              <div className={`p-3 bg-gray-100 rounded-full ${c.color} mr-3`}>
                {c.icon}
              </div>
              <div>
                <h2 className="text-lg font-medium">{c.title}</h2>
                <p className="text-sm text-gray-500">{c.subtitle}</p>
              </div>
            </div>
            <Link
              href={c.href}
              className="mt-auto inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Ir a {c.title}
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
