export default function TutorialsPage() {
  return (
    <main className="p-6 bg-white rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-4">Tutoriales</h1>
      <p className="mb-6">
        Vídeos y guías prácticas para aprender a usar nuestras herramientas:
      </p>
      <ol className="list-decimal pl-6 space-y-2">
        <li>Cómo crear tu primera factura</li>
        <li>Configurar tu plan contable</li>
        <li>Realizar conciliaciones bancarias</li>
        <li>Configurar modelos de impuestos</li>
        <li>Personalizar tu dashboard</li>
      </ol>
    </main>
);
}
