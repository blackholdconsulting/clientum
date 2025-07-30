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
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">
        Nueva Factura Electrónica
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded-lg p-6 grid gap-6"
      >
        {/* EMISOR */}
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            name="issuerName"
            value={form.issuerName}
            onChange={handleChange}
            placeholder="Nombre Emisor"
            className="w-full border rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <input
            name="issuerNIF"
            value={form.issuerNIF}
            onChange={handleChange}
            placeholder="NIF Emisor"
            className="w-full border rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* RECEPTOR */}
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            name="receiverName"
            value={form.receiverName}
            onChange={handleChange}
            placeholder="Nombre Receptor"
            className="w-full border rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <input
            name="receiverNIF"
            value={form.receiverNIF}
            onChange={handleChange}
            placeholder="NIF Receptor"
            className="w-full border rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* DETALLES */}
        <div className="grid sm:grid-cols-3 gap-4">
          <input
            name="concept"
            value={form.concept}
            onChange={handleChange}
            placeholder="Concepto"
            className="w-full border rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <input
            name="amount"
            type="number"
            step="0.01"
            value={form.amount}
            onChange={handleChange}
            placeholder="Importe (€)"
            className="w-full border rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <input
            name="vat"
            type="number"
            step="0.01"
            value={form.vat}
            onChange={handleChange}
            placeholder="IVA (%)"
            className="w-full border rounded-lg p-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        {/* BOTÓN */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          {loading ? "Enviando..." : "Enviar a AEAT"}
        </button>

        {/* MENSAJE */}
        {message && (
          <p
            className={`mt-4 text-sm ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
