// app/help/page.tsx
import Link from "next/link";
import { FiBookOpen, FiVideo, FiMessageSquare, FiZap, FiPhone, FiLifeBuoy } from "react-icons/fi";

const resources = [
  {
    href: "/help",
    icon: <FiBookOpen className="text-2xl text-indigo-600" />,
    title: "Centro de ayuda",
    description: "Documentación, FAQs y guías de uso",
  },
  {
    href: "/help/tutoriales",
    icon: <FiVideo className="text-2xl text-green-600" />,
    title: "Tutoriales",
    description: "Vídeos paso a paso para empezar y sacar partido",
  },
  {
    href: "/help/feedback",
    icon: <FiMessageSquare className="text-2xl text-yellow-600" />,
    title: "Dar feedback",
    description: "Sugiere mejoras o reporta errores directamente",
  },
  {
    href: "/help/novedades",
    icon: <FiZap className="text-2xl text-blue-600" />,
    title: "Novedades",
    description: "Descubre lo último que estamos lanzando",
  },
  {
    href: "/help/contacto",
    icon: <FiPhone className="text-2xl text-pink-600" />,
    title: "Llámanos",
    description: "Hablamos por teléfono si lo prefieres",
  },
  {
    href: "/help/contacto",
    icon: <FiLifeBuoy className="text-2xl text-red-600" />,
    title: "Soporte",
    description: "Chatea con nuestro equipo de soporte 24/7",
  },
];

export default function HelpPage() {
  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Ayuda y soporte</h1>
        <Link
          href="/dashboard"
          className="text-indigo-600 hover:underline flex items-center"
        >
          ← Volver al Dashboard
        </Link>
      </header>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((r) => (
          <div
            key={r.href + r.title}
            className="bg-white rounded-lg shadow p-6 flex flex-col justify-between"
          >
            <div className="flex items-center mb-4">
              {r.icon}
              <h2 className="ml-3 text-xl font-medium">{r.title}</h2>
            </div>
            <p className="flex-1 mb-4 text-gray-600">{r.description}</p>
            <Link
              href={r.href}
              className="mt-auto inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Ver {r.title}
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}
