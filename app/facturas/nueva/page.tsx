"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { supabase } from "@/lib/supabaseClient";
import { generarCodigoFactura, registraVenta } from "@/lib/ventas";
import { jsPDF } from "jspdf";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function NuevaFacturaPage() {
  // Estado cabecera
  const [fecha, setFecha] = useState("");
  const [vencimiento, setVencimiento] = useState("");

  // Datos del receptor
  const [clienteId, setClienteId] = useState("");

  // Líneas y porcentajes
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);
  const [ivaPct, setIvaPct] = useState(21);
  const [loading, setLoading] = useState(false);

  // Añadir línea
  const addLinea = () =>
    setLineas((prev) => [
      ...prev,
      { descripcion: "", unidades: 1, precioUnitario: 0 },
    ]);

  // Actualizar línea
  const onLineaChange = (
    idx: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setLineas((prev) =>
      prev.map((l, i) =>
        i === idx
          ? {
              ...l,
              [name]:
                name === "descripcion"
                  ? value
                  : parseFloat(value) || 0,
            }
          : l
      )
    );
  };

  // Calcular base, IVA y total
  const calcularTotales = () => {
    const base = lineas.reduce(
      (sum, l) => sum + l.unidades * l.precioUnitario,
      0
    );
    const iva = +(base * ivaPct) / 100;
    const total = base + iva;
    return { base, iva, total };
  };

  // Guardar y generar PDF
  const handleExportPDF = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 1) Generar código
    const numero = generarCodigoFactura();

    // 2) Insertar en facturas
    const { error: facErr } = await supabase
      .from("facturas")
      .insert({
        fecha,
        vencimiento,
        cliente_id: clienteId,
        numero_factura: numero,
        lineas,
        iva: ivaPct,
      });
    if (facErr) {
      alert("Error al guardar factura: " + facErr.message);
      setLoading(false);
      return;
    }

    // 3) Registrar en ventas
    const { base, iva } = calcularTotales();
    try {
      await registraVenta({
        fecha,
        cliente_id: clienteId,
        numero_factura: numero,
        base,
        iva,
      });
    } catch (err: any) {
      console.error(err);
      alert(
        "Factura creada, pero no pudo registrarse en ventas: " +
          err.message
      );
      setLoading(false);
      return;
    }

    // 4) Generar PDF
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;
    doc.setFontSize(24).text("Factura " + numero, 40, y);
    y += 30;
    doc.setFontSize(12).text(`Fecha: ${fecha}`, 40, y);
    doc.text(`Vto: ${vencimiento}`, 200, y);
    y += 30;

    // Tabla de líneas
    doc.setFontSize(10).text("Desc.", 40, y);
    doc.text("Unid.", 240, y);
    doc.text("P.U.", 340, y, { align: "right" });
    doc.text("Importe", 450, y, { align: "right" });
    y += 16;
    lineas.forEach((l) => {
      doc.text(l.descripcion, 40, y);
      doc.text(String(l.unidades), 240, y);
      doc.text(l.precioUnitario.toFixed(2), 340, y, {
        align: "right",
      });
      doc.text(
        (l.unidades * l.precioUnitario).toFixed(2),
        450,
        y,
        { align: "right" }
      );
      y += 16;
      if (y > 750) {
        doc.addPage();
        y = 40;
      }
    });

    // Totales
    y += 20;
    doc.text(`Base: ${base.toFixed(2)} €`, 300, y);
    y += 16;
    doc.text(`IVA (${ivaPct}%): ${iva.toFixed(2)} €`, 300, y);
    y += 16;
    doc.setFontSize(14).text(`TOTAL: ${(base + iva).toFixed(2)} €`, 300, y);

    doc.save(`factura-${numero}.pdf`);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-50 space-y-6">
      <h1 className="text-2xl font-bold">Nueva Factura</h1>

      <form
        onSubmit={handleExportPDF}
        className="space-y-6 bg-white p-8 rounded shadow"
      >
        {/* Cabecera */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Vencimiento</label>
            <input
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm">Cliente ID</label>
            <input
              type="text"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              required
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* Líneas */}
        <fieldset className="space-y-4">
          <legend className="font-semibold">Conceptos</legend>
          {lineas.map((l, i) => (
            <div
              key={i}
              className="grid grid-cols-4 gap-4 items-center"
            >
              <input
                name="descripcion"
                placeholder="Descripción"
                value={l.descripcion}
                onChange={(e) => onLineaChange(i, e)}
                className="border rounded px-3 py-2"
              />
              <input
                name="unidades"
                type="number"
                placeholder="Unidades"
                value={l.unidades}
                onChange={(e) => onLineaChange(i, e)}
                className="border rounded px-3 py-2"
              />
              <input
                name="precioUnitario"
                type="number"
                placeholder="Precio unitario"
                step="0.01"
                value={l.precioUnitario}
                onChange={(e) => onLineaChange(i, e)}
                className="border rounded px-3 py-2"
              />
              {i === lineas.length - 1 && (
                <button
                  type="button"
                  onClick={addLinea}
                  className="px-2 py-1 bg-blue-600 text-white rounded"
                >
                  +
                </button>
              )}
            </div>
          ))}
        </fieldset>

        {/* IVA y botón */}
        <div className="bg-white p-6 rounded shadow grid grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm">IVA (%)</label>
            <input
              type="number"
              value={ivaPct}
              onChange={(e) => setIvaPct(+e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {loading ? "Procesando…" : "Descargar PDF"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
