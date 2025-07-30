"use client";

import { useState, FormEvent } from "react";

type FormState = {
  issuerName: string;
  issuerNIF: string;
  receiverName: string;
  receiverNIF: string;
  concept: string;
  amount: string;
  vat: string;
};

export default function NuevaFacturaElectronicaPage() {
  const [form, setForm] = useState<FormState>({
    issuerName: "",
    issuerNIF: "",
    receiverName: "",
    receiverNIF: "",
    concept: "",
    amount: "",
    vat: "21",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/factura-electronica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const { success, error } = await res.json();
      if (success) {
        setMessage("✅ Factura enviada correctamente.");
        setForm({
          issuerName: "",
          issuerNIF: "",
          receiverName: "",
          receiverNIF: "",
          concept: "",
          amount: "",
          vat: "21",
        });
      } else {
        throw new Error(error || "Error desconocido");
      }
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center p-8 bg-gray-100 min-h-screen">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-8 space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Nueva Factura Electrónica
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-6"
        >
          {/* Emisor */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Nombre Emisor
              </label>
              <input
                name="issuerName"
                value={form.issuerName}
                onChange={handleChange}
                required
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Empresa S.L."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                NIF Emisor
              </label>
              <input
                name="issuerNIF"
                value={form.issuerNIF}
                onChange={handleChange}
                required
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="B12345678"
              />
            </div>
          </div>

          {/* Receptor */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Nombre Receptor
              </label>
              <input
                name="receiverName"
                value={form.receiverName}
                onChange={handleChange}
                required
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Cliente S.A."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                NIF Receptor
              </label>
              <input
                name="receiverNIF"
                value={form.receiverNIF}
                onChange={handleChange}
                required
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="A87654321"
              />
            </div>
          </div>

          {/* Detalles */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600">
                Concepto
              </label>
              <input
                name="concept"
                value={form.concept}
                onChange={handleChange}
                required
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Desarrollo web"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Importe (€)
              </label>
              <input
                name="amount"
                type="number"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
                required
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="1200.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                IVA (%)
              </label>
              <input
                name="vat"
                type="number"
                step="0.01"
                value={form.vat}
                onChange={handleChange}
                required
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            {loading ? "Enviando..." : "Enviar a AEAT"}
          </button>
        </form>

        {/* Mensaje */}
        {message && (
          <div
            className={`p-4 rounded-lg text-sm ${
              message.startsWith("✅")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
