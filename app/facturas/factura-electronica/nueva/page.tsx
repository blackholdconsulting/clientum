// app/facturas/factura-electronica/nueva/page.tsx
"use client";

import { useState, FormEvent } from "react";

type LineItem = {
  description: string;
  units: number;
  unitPrice: number;
};

export default function NuevaFacturaElectronicaPage() {
  const [issuerName, setIssuerName] = useState("");
  const [issuerNIF, setIssuerNIF] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [receiverNIF, setReceiverNIF] = useState("");
  const [vat, setVat] = useState(21);
  const [items, setItems] = useState<LineItem[]>([
    { description: "", units: 1, unitPrice: 0 },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Suma de bases y totales
  const baseImponible = items.reduce(
    (sum, i) => sum + i.units * i.unitPrice,
    0
  );
  const ivaImporte = (baseImponible * vat) / 100;
  const total = baseImponible + ivaImporte;

  const addLine = () =>
    setItems([...items, { description: "", units: 1, unitPrice: 0 }]);

  const removeLine = (idx: number) =>
    setItems(items.filter((_, i) => i !== idx));

  const updateLine = (
    idx: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const newItems = [...items];
    // @ts-ignore
    newItems[idx][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const resp = await fetch("/api/factura-electronica", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerName,
          issuerNIF,
          receiverName,
          receiverNIF,
          vat,
          items,
        }),
      });
      const { success, error } = await resp.json();
      if (success) {
        setMessage("✅ Factura enviada correctamente.");
        // reset
        setIssuerName("");
        setIssuerNIF("");
        setReceiverName("");
        setReceiverNIF("");
        setVat(21);
        setItems([{ description: "", units: 1, unitPrice: 0 }]);
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
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-8 space-y-6">
        <h1 className="text-3xl font-semibold text-gray-800">
          Nueva Factura Electrónica
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Emisor / Receptor */}
          <div className="grid sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-600">
                Nombre Emisor
              </label>
              <input
                required
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                NIF Emisor
              </label>
              <input
                required
                value={issuerNIF}
                onChange={(e) => setIssuerNIF(e.target.value)}
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Nombre Receptor
              </label>
              <input
                required
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                NIF Receptor
              </label>
              <input
                required
                value={receiverNIF}
                onChange={(e) => setReceiverNIF(e.target.value)}
                className="mt-1 w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-400"
              />
            </div>
          </div>

          {/* Líneas */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">
              Conceptos
            </h2>
            {items.map((item, idx) => (
              <div
                key={idx}
                className="grid sm:grid-cols-5 gap-4 items-end"
              >
                <div className="sm:col-span-2">
                  <label className="sr-only">Descripción</label>
                  <input
                    required
                    placeholder="Descripción"
                    value={item.description}
                    onChange={(e) =>
                      updateLine(idx, "description", e.target.value)
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="sr-only">Unidades</label>
                  <input
                    type="number"
                    min={1}
                    value={item.units}
                    onChange={(e) =>
                      updateLine(idx, "units", +e.target.value)
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-400"
                  />
                </div>
                <div>
                  <label className="sr-only">Precio Unit.</label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateLine(idx, "unitPrice", +e.target.value)
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-400"
                  />
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addLine}
              className="text-indigo-600 hover:underline"
            >
              + Añadir línea
            </button>
          </div>

          {/* IVA */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-600">
              IVA (%)
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={vat}
              onChange={(e) => setVat(+e.target.value)}
              className="w-20 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:ring-indigo-400"
            />
          </div>

          {/* Totales */}
          <div className="bg-gray-50 p-4 rounded-lg text-right space-y-1">
            <div>
              <span className="font-medium">Base imponible:</span>{" "}
              {baseImponible.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
            <div>
              <span className="font-medium">IVA ({vat}%):</span>{" "}
              {ivaImporte.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
            <div className="text-xl font-bold">
              Total:{" "}
              {total.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
          </div>

          {/* Enviar */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            {loading ? "Enviando..." : "Enviar a AEAT"}
          </button>
        </form>

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
