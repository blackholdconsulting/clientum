export default function NewsPage() {
  return (
    <main className="p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-4">Novedades</h1>
      <p className="mb-6">
        Mantente al día con las últimas actualizaciones y lanzamientos de Clientum
        para aprovechar siempre lo nuevo.
      </p>
      <ul className="space-y-4">
        <li>
          <strong>v1.5.0</strong> — Nuevo módulo de tesorería integrado (Jul 2025)
        </li>
        <li>
          <strong>v1.4.2</strong> — Mejoras en importación de CSV de bancos (Jun
          2025)
        </li>
        <li>
          <strong>v1.4.0</strong> — Chat IA mejorado con respuestas contextuales
          (May 2025)
        </li>
      </ul>
    </main>
);
}
