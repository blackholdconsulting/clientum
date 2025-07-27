export default function SupportPage() {
  return (
    <main className="p-6 bg-white rounded-md shadow max-w-lg">
      <h1 className="text-2xl font-semibold mb-4">Contactar Soporte</h1>
      <p className="mb-4">
        Rellena el siguiente formulario y te responderemos lo antes posible:
      </p>
      <form className="space-y-4">
        <div>
          <label className="block mb-1">Email</label>
          <input type="email" className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block mb-1">Asunto</label>
          <input type="text" className="w-full border rounded p-2" />
        </div>
        <div>
          <label className="block mb-1">Descripción</label>
          <textarea className="w-full border rounded p-2" rows={4} />
        </div>
        <button
          type="submit"
          className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Enviar
        </button>
      </form>
    </main>
);
}
