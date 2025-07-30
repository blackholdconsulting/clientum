"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { sendFacturaToAEAT } from "@/lib/sendToAEAT";

export default function NuevaFacturaElectronicaPage() {
  const router = useRouter();

  const [form, setForm] = useState({
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
      // aquí tendrías que obtener certBuffer y keyBuffer según usuario
      const certBuffer = await fetch("/api/certs/certificate.pem").then(r =>
        r.arrayBuffer()
      );
      const keyBuffer = await fetch("/api/certs/private-key.pem").then(r =>
        r.arrayBuffer()
      );

      const xml = `
        <Invoice>
          <Issuer>
            <Name>${form.issuerName}</Name>
            <NIF>${form.issuerNIF}</NIF>
          </Issuer>
          <Receiver>
            <Name>${form.receiverName}</Name>
            <NIF>${form.receiverNIF}</NIF>
          </Receiver>
          <Items>
            <Item>
              <Concept>${form.concept}</Concept>
              <Amount>${form.amount}</Amount>
            </Item>
          </Items>
          <VAT>${form.vat}</VAT>
        </Invoice>
      `;

      const respuesta = await sendFacturaToAEAT(
        xml,
        Buffer.from(certBuffer),
        Buffer.from(keyBuffer)
      );

      setMessage("✅ Envío OK: " + respuesta);
    } catch (err: any) {
      console.error(err);
      setMessage("❌ Error: " + err.message);
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
        className="bg-white shadow-md rounded-lg p-6 grid grid-cols-1 gap-6"
      >
        {/* Emisor */}
        <section>
          <h2 className="text-xl font-medium mb-4">Emisor</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="issuerName"
              value={form.issuerName}
              onChange={handleChange}
              placeholder="Nombre Emisor"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              name="issuerNIF"
              value={form.issuerNIF}
              onChange={handleChange}
              placeholder="NIF Emisor"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </section>

        {/* Receptor */}
        <section>
          <h2 className="text-xl font-medium mb-4">Receptor</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="text"
              name="receiverName"
              value={form.receiverName}
              onChange={handleChange}
              placeholder="Nombre Receptor"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              name="receiverNIF"
              value={form.receiverNIF}
              onChange={handleChange}
              placeholder="NIF Receptor"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </section>

        {/* Concepto y monto */}
        <section>
          <h2 className="text-xl font-medium mb-4">Detalles</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <input
              type="text"
              name="concept"
              value={form.concept}
              onChange={handleChange}
              placeholder="Concepto"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="number"
              step="0.01"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Importe (€)"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="number"
              step="0.01"
              name="vat"
              value={form.vat}
              onChange={handleChange}
              placeholder="IVA (%)"
              className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </section>

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          {loading ? "Enviando..." : "Enviar a AEAT"}
        </button>

        {/* Mensaje resultado */}
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
