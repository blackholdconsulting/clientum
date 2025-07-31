// File: /app/facturas/page.tsx
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabaseClient";
import { registraVenta } from "@/lib/ventas";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

interface Cliente {
  id: string;
  nombre: string;
}

export default function CrearFacturaPage() {
  // Cabecera
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState("");
  const [vencimiento, setVencimiento] = useState("");

  // Emisor
  const [emisor, setEmisor] = useState({
    nombre: "",
    direccion: "",
    nif: "",
    cp: "",
    ciudad: "",
    email: "",
  });

  // Receptor (solo ID, carga nombre desde clientes)
  const [receptorId, setReceptorId] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);

  // Líneas e impuestos
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);
  const [ivaPct, setIvaPct] = useState(21);
  const [irpfPct, setIrpfPct] = useState(0);
  const [loading, setLoading] = useState(false);

  // Carga lista de clientes al montar
  useEffect(() => {
    supabase
      .from<Cliente, Cliente>("clientes")
      .select("id,nombre")
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setClientes(data || []);
      });
  }, []);

  // Añadir/eliminar/editar líneas
  const addLinea = () =>
    setLineas((prev) => [
      ...prev,
      { descripcion: "", unidades: 1, precioUnitario: 0 },
    ]);

  const removeLinea = (idx: number) =>
    setLineas((prev) => prev.filter((_, i) => i !== idx));

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
                name === "descripcion" ? value : parseFloat(value) || 0,
            }
          : l
      )
    );
  };

  // Calcular base, IVA, IRPF y total
  const calcularTotales = () => {
    const base = lineas.reduce(
      (sum, l) => sum + l.unidades * l.precioUnitario,
      0
    );
    const iva = +(base * ivaPct) / 100;
    const irpf = +(base * irpfPct) / 100;
    return { base, iva, irpf, total: base + iva - irpf };
  };

  // Exportar PDF y guardar en Supabase + ventas
  const handleExportPDF = async () => {
    if (!serie || !numero || !receptorId) {
      alert("Indica Serie, Número y selecciona Receptor.");
      return;
    }
    setLoading(true);
    const numeroFactura = `${serie}-${numero}`;

    // 1) Guardar factura
    const { error: facErr } = await supabase.from("facturas").insert({
      serie,
      numero,
      fecha,
      vencimiento,
      emisor,
      receptor_id: receptorId,
      numero_factura: numeroFactura,
      lineas,
      iva: ivaPct,
      irpf: irpfPct,
      via: "pdf",
    });
    if (facErr) {
      alert("Error al guardar factura: " + facErr.message);
      setLoading(false);
      return;
    }

    // 2) Registrar en ventas
    const { base, iva } = calcularTotales();
    try {
      await registraVenta({
        fecha,
        cliente_id: receptorId,
        numero_factura: numeroFactura,
        base,
        iva,
      });
    } catch (err: any) {
      console.error(err);
      alert("Factura guardada, pero fallo registro ventas: " + err.message);
    }

    // 3) Generar PDF
    const cliente = clientes.find((c) => c.id === receptorId);
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;
    doc.setFontSize(24).text(`Factura ${numeroFactura}`, 40, y);
    y += 30;
    doc.setFontSize(12).text(`Fecha: ${fecha}`, 40, y);
    doc.text(`Vto: ${vencimiento}`, 200, y);
    y += 30;
    doc.setFontSize(14).text("Emisor:", 40, y);
    doc.setFontSize(10).text(emisor.nombre, 100, y);
    doc.setFontSize(14).text("Receptor:", 300, y);
    doc.setFontSize(10).text(cliente?.nombre || "", 360, y);
    y += 20;

    // Encabezados de líneas
    doc.setFontSize(10).text("Desc.", 40, y);
    doc.text("Unid.", 240, y);
    doc.text("P.U.", 340, y, { align: "right" });
    doc.text("Importe", 450, y, { align: "right" });
    y += 16;

    // Detalle de líneas
    lineas.forEach((l) => {
      doc.text(l.descripcion, 40, y);
      doc.text(String(l.unidades), 240, y);
      doc.text(l.precioUnitario.toFixed(2), 340, y, { align: "right" });
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
    const { base: B, iva: I, total: T } = calcularTotales();
    y += 20;
    doc.setFontSize(12).text(`Base: ${B.toFixed(2)} €`, 300, y);
    y += 16;
    doc.text(`IVA (${ivaPct}%): ${I.toFixed(2)} €`, 300, y);
    y += 16;
    doc.setFontSize(14).text(`TOTAL: ${T.toFixed(2)} €`, 300, y);

    doc.save(`factura-${numeroFactura}.pdf`);
    setLoading(false);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-50 space-y-6">
      <h1 className="text-2xl font-bold">Crear Factura</h1>

      <form className="space-y-6 bg-white p-8 rounded shadow">
        {/* Serie / Número */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Serie"
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        {/* Fecha */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            value={vencimiento}
            onChange={(e) => setVencimiento(e.target.value)}
            required
            className="border rounded px-3 py-2"
          />
        </div>

        {/* Emisor */}
        <fieldset className="space-y-2">
          <legend className="font-semibold">Emisor</legend>
          <input
            placeholder="Nombre"
            value={emisor.nombre}
            onChange={(e) =>
              setEmisor({ ...emisor, nombre: e.target.value })
            }
            className="w-full border rounded px-3 py-2"
          />
          {/* … resto de campos emisor … */}
        </fieldset>

        {/* Receptor */}
        <div>
          <label className="block text-sm font-semibold">Receptor</label>
          <select
            value={receptorId}
            onChange={(e) => setReceptorId(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
          >
            <option value="">— Selecciona un cliente —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Líneas */}
        <fieldset className="space-y-4">
          <legend className="font-semibold">Líneas</legend>
          {lineas.map((l, i) => (
            <div key={i} className="grid grid-cols-5 gap-4 items-center">
              <input
                name="descripcion"
                placeholder="Descripción"
                value={l.descripcion}
                onChange={(e) => onLineaChange(i, e)}
                className="border rounded px-3 py-2 col-span-2"
              />
              <input
                name="unidades"
                type="number"
                placeholder="Unid."
                value={l.unidades}
                onChange={(e) => onLineaChange(i, e)}
                className="border rounded px-3 py-2"
              />
              <input
                name="precioUnitario"
                type="number"
                placeholder="P.U."
                step="0.01"
                value={l.precioUnitario}
                onChange={(e) => onLineaChange(i, e)}
                className="border rounded px-3 py-2"
              />
              <button
                type="button"
                onClick={() => removeLinea(i)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLinea}
            className="text-sm text-blue-600"
          >
            + Añadir línea
          </button>
        </fieldset>

        {/* Impuestos y acciones */}
        <div className="grid grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm">IVA (%)</label>
            <input
              type="number"
              value={ivaPct}
              onChange={(e) => setIvaPct(+e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">IRPF (%)</label>
            <input
              type="number"
              value={irpfPct}
              onChange={(e) => setIrpfPct(+e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div className="col-span-2 flex space-x-4 justify-end">
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {loading ? "Procesando…" : "Exportar PDF"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
