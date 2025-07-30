// app/facturas/factura-electronica/nueva/page.tsx
"use client";

import { useState, FormEvent, useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const invoiceRef = useRef<HTMLDivElement>(null);

  // Cálculos
  const base = items.reduce((sum, i) => sum + i.units * i.unitPrice, 0);
  const ivaImport = (base * vat) / 100;
  const total = base + ivaImport;

  // Manipular líneas
  const addLine = () =>
    setItems([...items, { description: "", units: 1, unitPrice: 0 }]);
  const removeLine = (i: number) =>
    setItems(items.filter((_, idx) => idx !== i));
  const updateLine = (
    idx: number,
    field: keyof LineItem,
    value: string | number
  ) => {
    const copy = [...items];
    // @ts-ignore
    copy[idx][field] = value;
    setItems(copy);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["Descripción", "Unidades", "Precio Unit.", "Subtotal"];
    const rows = items.map((it) => [
      it.description,
      it.units.toString(),
      it.unitPrice.toFixed(2),
      (it.units * it.unitPrice).toFixed(2),
    ]);
    const csv =
      [headers, ...rows]
        .map((r) => r.map((c) => `"${c}"`).join(","))
        .join("\n") +
      `\n\nBase;${base.toFixed(2)}\nIVA (${vat}%);${ivaImport.toFixed(
        2
      )}\nTotal;${total.toFixed(2)}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "factura.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF
  const exportPDF = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("factura.pdf");
  };

  // Envío a AEAT (simulado)
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      // ... llamada fetch a tu API
      setMessage("✅ Factura enviada correctamente.");
    } catch (err: any) {
      setMessage("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen flex justify-center">
      <div
        ref={invoiceRef}
        className="w-full max-w-3xl bg-white shadow-lg rounded-lg p-8 space-y-6"
      >
        <h1 className="text-3xl font-semibold">Nueva Factura Electrónica</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Emisor / Receptor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <fieldset className="space-y-4">
              <legend className="font-medium">Emisor</legend>
              <input
                required
                placeholder="Nombre Emisor"
                value={issuerName}
                onChange={(e) => setIssuerName(e.target.value)}
                className="w-full bg-gray-50 border rounded px-4 py-2 focus:ring-indigo-400"
              />
              <input
                required
                placeholder="NIF Emisor"
                value={issuerNIF}
                onChange={(e) => setIssuerNIF(e.target.value)}
                className="w-full bg-gray-50 border rounded px-4 py-2 focus:ring-indigo-400"
              />
            </fieldset>
            <fieldset className="space-y-4">
              <legend className="font-medium">Receptor</legend>
              <input
                required
                placeholder="Nombre Receptor"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full bg-gray-50 border rounded px-4 py-2 focus:ring-indigo-400"
              />
              <input
                required
                placeholder="NIF Receptor"
                value={receiverNIF}
                onChange={(e) => setReceiverNIF(e.target.value)}
                className="w-full bg-gray-50 border rounded px-4 py-2 focus:ring-indigo-400"
              />
            </fieldset>
          </div>

          {/* Líneas */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Conceptos</h2>
            {items.map((it, i) => (
              <div
                key={i}
                className="grid sm:grid-cols-5 gap-4 items-end"
              >
                <input
                  required
                  placeholder="Descripción"
                  value={it.description}
                  onChange={(e) =>
                    updateLine(i, "description", e.target.value)
                  }
                  className="sm:col-span-2 bg-gray-50 border rounded px-3 py-2 focus:ring-indigo-400"
                />
                <input
                  type="number"
                  min={1}
                  value={it.units}
                  onChange={(e) =>
                    updateLine(i, "units", +e.target.value)
                  }
                  className="bg-gray-50 border rounded px-3 py-2 focus:ring-indigo-400"
                />
                <input
                  type="number"
                  step="0.01"
                  value={it.unitPrice}
                  onChange={(e) =>
                    updateLine(i, "unitPrice", +e.target.value)
                  }
                  className="bg-gray-50 border rounded px-3 py-2 focus:ring-indigo-400"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLine(i)}
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
            <label className="font-medium">IVA (%)</label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={vat}
              onChange={(e) => setVat(+e.target.value)}
              className="w-20 bg-gray-50 border rounded px-3 py-2 focus:ring-indigo-400"
            />
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-lg p-4 text-right space-y-1">
            <div>
              <span className="font-medium">Base imponible:</span>{" "}
              {base.toLocaleString("es-ES", {
                style: "currency",
                currency: "EUR",
              })}
            </div>
            <div>
              <span className="font-medium">IVA ({vat}%):</span>{" "}
              {ivaImport.toLocaleString("es-ES", {
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

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded hover:bg-indigo-700 transition"
            >
              {loading ? "Enviando..." : "Enviar a AEAT"}
            </button>
            <button
              type="button"
              onClick={exportPDF}
              className="bg-gray-800 text-white py-3 rounded hover:bg-gray-900 transition"
            >
              📄 Exportar PDF
            </button>
            <button
              type="button"
              onClick={exportCSV}
              className="bg-gray-600 text-white py-3 rounded hover:bg-gray-700 transition"
            >
              ⇓ Exportar CSV
            </button>
          </div>
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
