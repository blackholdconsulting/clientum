"use client";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function LandingPage() {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (plan: "monthly" | "yearly") => {
    setLoading(true);
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
    <main className="bg-slate-900 text-white min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-slate-900 fixed w-full top-0 z-50 border-b border-slate-800">
        <Link href="/" className="text-2xl font-bold">Clientum</Link>
        <nav className="flex gap-6">
          <Link href="#features" className="hover:text-blue-400">Funcionalidades</Link>
          <Link href="#prices" className="hover:text-blue-400">Precios</Link>
          <Link href="#resources" className="hover:text-blue-400">Recursos</Link>
        </nav>
        <div className="flex gap-3">
          <Link
            href="/auth/login"
            className="border px-4 py-2 rounded hover:bg-slate-800"
          >
            Inicia sesión
          </Link>
          <button
            onClick={() => handleCheckout("monthly")}
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            disabled={loading}
          >
            Empieza gratis
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center pt-40 pb-20 px-6">
        <h1 className="text-5xl font-bold mb-4">Facturación y mucho más</h1>
        <p className="text-lg text-slate-300 max-w-2xl mb-6">
          Clientum es el software de gestión en la nube que reúne todo lo que
          necesitas para administrar tu empresa sin complicaciones.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => handleCheckout("monthly")}
            className="bg-white text-slate-900 px-6 py-3 rounded font-semibold shadow hover:bg-gray-200"
          >
            Empieza gratis
          </button>
          <button
            onClick={() => handleCheckout("yearly")}
            className="bg-green-500 text-white px-6 py-3 rounded font-semibold shadow hover:bg-green-600"
          >
            Plan Anual (Ahorra 2 meses)
          </button>
        </div>
      </section>

      {/* Beneficios */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {[
          { title: "Automatización total", desc: "Olvídate de tareas repetitivas, Clientum lo hace por ti." },
          { title: "Gestión 360°", desc: "Facturas, impuestos, empleados, contabilidad, todo integrado." },
          { title: "Asistente IA", desc: "Tu contable virtual 24/7 para ayudarte en cualquier momento." },
        ].map((b, i) => (
          <div key={i} className="p-6 bg-slate-800 rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-3">{b.title}</h3>
            <p className="text-slate-300">{b.desc}</p>
          </div>
        ))}
      </section>

      {/* Comparativa */}
      <section id="prices" className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-6">Lo que otros no te ofrecen</h2>
        <table className="w-full border text-center border-slate-700">
          <thead>
            <tr className="bg-slate-800">
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
              <tr key={i} className="border-t border-slate-700">
                <td className="p-3">{f}</td>
                <td className="p-3">{c}</td>
                <td className="p-3">{o}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-8 text-center mt-auto">
        <p>© 2025 Clientum. Todos los derechos reservados.</p>
        <Link href="/auth/login" className="block mt-2 underline hover:text-white">
          Acceder a mi cuenta
        </Link>
      </footer>
    </main>
  );
}
