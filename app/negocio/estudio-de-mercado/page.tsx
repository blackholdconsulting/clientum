// app/negocio/estudio-de-mercado/page.tsx
import Link from "next/link";

export default function EstudioMercadoPage() {
  return (
    <main className="p-6 bg-white rounded-md shadow-lg">
      {/* Cabecera con breadcrumb */}
      <header className="flex items-center mb-6">
        <Link
          href="/negocio"
          className="text-gray-500 hover:underline mr-2"
        >
          ← Volver
        </Link>
        <h1 className="text-2xl font-semibold">Estudio de Mercado</h1>
      </header>

      {/* Sección de introducción */}
      <section className="mb-8">
        <p className="text-gray-700">
          En esta sección podrás analizar el mercado, evaluar la competencia  
          y obtener datos clave para tomar decisiones estratégicas.
        </p>
      </section>

      {/* Componentes de contenido */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gráfica de tendencias */}
        <div className="p-4 border rounded-md">
          <h2 className="font-medium mb-2">Tendencias de búsqueda</h2>
          <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400">
            [Gráfica de tendencias]
          </div>
        </div>

        {/* Listado de competidores */}
        <div className="p-4 border rounded-md">
          <h2 className="font-medium mb-2">Principales competidores</h2>
          <ul className="list-disc pl-5 space-y-1 text-gray-700">
            <li>Empresa A – 25% cuota de mercado</li>
            <li>Empresa B – 18% cuota de mercado</li>
            <li>Empresa C – 12% cuota de mercado</li>
            <li>Otros – 45%</li>
          </ul>
        </div>

        {/* Mapa de calor geográfico */}
        <div className="p-4 border rounded-md md:col-span-2">
          <h2 className="font-medium mb-2">Mapa de calor geográfico</h2>
          <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400">
            [Mapa de calor]
          </div>
        </div>
      </section>

      {/* Llamada a la acción */}
      <footer className="mt-8 text-right">
        <button
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Descargar informe completo
        </button>
      </footer>
    </main>
  );
}
