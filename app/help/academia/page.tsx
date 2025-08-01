// app/help/academia/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Academia Clientum",
  description: "Tutoriales y guías de uso de Clientum",
};

export default function AcademiaPage() {
  const recursos = [
    {
      title: "Guía de Inicio Rápido",
      description: "Aprende a dar de alta tus primeros clientes y facturas en minutos.",
      href: "/help/academia/guia-inicio-rapido",
    },
    {
      title: "Video Tutorial: Facturación Electrónica",
      description: "Paso a paso en vídeo para emitir tu primera factura electrónica.",
      href: "https://youtu.be/tu-video-factura",
      external: true,
    },
    {
      title: "Webinar: Control de Inventario",
      description: "Domina el módulo de inventario y almacén con este webinar grabado.",
      href: "https://youtu.be/tu-video-inventario",
      external: true,
    },
    {
      title: "Preguntas Frecuentes (FAQ)",
      description: "Respuestas rápidas a las dudas más comunes de nuestros usuarios.",
      href: "/help/academia/faq",
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold mb-4">Academia Clientum</h1>
      <p className="text-gray-600 mb-8">
        Bienvenido a la Academia de Clientum. Aquí encontrarás tutoriales, vídeos y guías para sacarle el máximo partido a todas las funcionalidades.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recursos.map((r) => (
          <Link
            key={r.title}
            href={r.href}
            target={r.external ? "_blank" : undefined}
            rel={r.external ? "noopener noreferrer" : undefined}
            className="block border rounded-lg p-6 hover:shadow-lg transition-shadow bg-white"
          >
            <h2 className="text-xl font-medium mb-2">{r.title}</h2>
            <p className="text-gray-500">{r.description}</p>
            {r.external && (
              <span className="inline-block mt-4 text-blue-600 hover:underline text-sm">
                Ver recurso externo ↗
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
