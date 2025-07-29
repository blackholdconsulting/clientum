"use client";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function LandingPage() {
  const handleCheckout = async (plan: "monthly" | "yearly") => {
    const stripe = await stripePromise;
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const { sessionId } = await res.json();
    await stripe?.redirectToCheckout({ sessionId });
  };

  return (
    <main className="bg-gray-50 text-gray-900">
      {/* Hero */}
      <section className="flex flex-col items-center text-center py-20 px-6 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
        <h1 className="text-5xl font-bold mb-4">Gestiona tu negocio sin complicaciones</h1>
        <p className="text-xl mb-8">Facturación, contabilidad, RRHH y mucho más en un solo lugar.</p>
        <div className="flex gap-4">
          <button
            onClick={() => handleCheckout("monthly")}
            className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold shadow hover:bg-gray-200"
          >
            Suscribirme (29,99€/mes)
          </button>
          <button
            onClick={() => handleCheckout("yearly")}
            className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-green-600"
          >
            Plan Anual (Ahorra 2 meses)
          </button>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {[
          { title: "Automatización total", desc: "Olvídate de tareas repetitivas, Clientum lo hace por ti." },
          { title: "Gestión 360°", desc: "Facturas, impuestos, empleados, contabilidad, todo integrado." },
          { title: "Asistente IA", desc: "Tu contable virtual 24/7 para ayudarte en cualquier momento." },
        ].map((b, i) => (
          <div key={i} className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-xl font-semibold mb-3">{b.title}</h3>
            <p>{b.desc}</p>
          </div>
        ))}
      </section>

      {/* Comparativa */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Lo que otros no te ofrecen</h2>
        <table className="w-full border text-center">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3">Función</th>
              <th className="p-3">Clientum</th>
              <th className="p-3">Otros</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Asistente IA incluido", "✅", "❌"],
              ["Automatización completa", "✅", "❌"],
              ["Precio fijo transparente", "✅", "❌"],
              ["Multiusuario sin coste extra", "✅", "❌"],
            ].map(([f, c, o], i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{f}</td>
                <td className="p-3">{c}</td>
                <td className="p-3">{o}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 text-center">
        <p>© 2025 Clientum. Todos los derechos reservados.</p>
        <a href="/auth/login" className="block mt-2 underline hover:text-gray-300">Acceder a mi cuenta</a>
      </footer>
    </main>
  );
}
