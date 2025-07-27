// app/negocio/analisis-de-la-competencia/page.tsx
import Link from "next/link";

export default function AnalisisCompetenciaPage() {
  // Datos de ejemplo; luego los conectarás con tu API o base de datos
  const competidores = [
    { nombre: "Empresa A", cuota: "30%", precio: "€99/mes", puntosFuertes: ["UX limpia", "Precios bajos"], puntosDebiles: ["Soporte limitado"] },
    { nombre: "Empresa B", cuota: "25%", precio: "€149/mes", puntosFuertes: ["Funcionalidades avanzadas"], puntosDebiles: ["Curva de aprendizaje"] },
    { nombre: "Empresa C", cuota: "15%", precio: "€79/mes", puntosFuertes: ["Integraciones"], puntosDebiles: ["Poca personalización"] },
  ];

  return (
    <main className="p-6 bg-white rounded-md shadow-lg">
      {/* Cabecera con breadcrumb */}
      <header className="flex items-center mb-6">
        <Link href="/negocio" className="text-gray-500 hover:underline mr-2">
          ← Volver
        </Link>
        <h1 className="text-2xl font-semibold">Análisis de la competencia</h1>
      </header>

      {/* Introducción */}
      <section className="mb-8">
        <p className="text-gray-700">
          Identifica quiénes son tus principales competidores, qué ofrecen y
          cómo se posicionan en el mercado para ajustar tu estrategia.
        </p>
      </section>

      {/* Tabla comparativa */}
      <section className="overflow-x-auto">
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Competidor</th>
              <th className="px-4 py-2 text-left">Cuota de mercado</th>
              <th className="px-4 py-2 text-left">Precio</th>
              <th className="px-4 py-2 text-left">Puntos fuertes</th>
              <th className="px-4 py-2 text-left">Puntos débiles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {competidores.map((c) => (
              <tr key={c.nombre} className="hover:bg-gray-50">
                <td className="px-4 py-2">{c.nombre}</td>
                <td className="px-4 py-2">{c.cuota}</td>
                <td className="px-4 py-2">{c.precio}</td>
                <td className="px-4 py-2">
                  <ul className="list-disc pl-5">
                    {c.puntosFuertes.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-4 py-2">
                  <ul className="list-disc pl-5">
                    {c.puntosDebiles.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Gráfico comparativo */}
      <section className="mt-8 p-4 border rounded-md">
        <h2 className="font-medium mb-2">Gráfico de cuota de mercado</h2>
        <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
          [Gráfico de barras o pastel aquí]
        </div>
      </section>

      {/* Llamada a la acción */}
      <footer className="mt-8 text-right">
        <button className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
          Descargar informe PDF
        </button>
      </footer>
    </main>
  );
}
