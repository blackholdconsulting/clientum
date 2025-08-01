// app/help/votar-mejoras/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Votar mejoras | Clientum",
  description: "Ayúdanos a priorizar nuevas funcionalidades proponiendo y votando mejoras.",
};

const sugerencias = [
  {
    id: 1,
    title: "Integración con bancos locales",
    votes: 42,
    description: "Sincroniza extractos bancarios de tu banco para conciliación automática.",
  },
  {
    id: 2,
    title: "Dashboard personalizable",
    votes: 35,
    description: "Widgets arrastrables para ver la info que más te interese al entrar.",
  },
  {
    id: 3,
    title: "App móvil nativa",
    votes: 28,
    description: "Acceso rápido desde iOS y Android con notificaciones push.",
  },
];

export default function VotarMejorasPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Votar mejoras</h1>
      <p className="text-gray-600 mb-6">
        Elige las propuestas que más te interesan para ayudarnos a decidir el roadmap.
      </p>

      <ul className="space-y-4">
        {sugerencias.map((s) => (
          <li
            key={s.id}
            className="flex items-center justify-between p-4 border rounded hover:shadow"
          >
            <div>
              <h2 className="text-xl font-medium">{s.title}</h2>
              <p className="text-gray-500">{s.description}</p>
            </div>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              <span>{s.votes}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          href="/help/votar-mejoras/proponer"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700"
        >
          Proponer nueva mejora
        </Link>
      </div>
    </div>
  );
}
