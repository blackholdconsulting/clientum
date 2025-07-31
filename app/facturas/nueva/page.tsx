"use client";

import { useState, ChangeEvent } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabaseClient";
import { generarCodigoFactura, registraVenta } from "@/lib/ventas";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function FacturasPage() {
  // Cabecera factura
  const [fecha, setFecha] = useState("");
  const [vencimiento, setVencimiento] = useState("");

  // Datos de emisor (tú)
  const [emisor, setEmisor] = useState({
    nombre: "DECLARANDO SL",
    direccion: "",
    nif: "",
    cp: "",
    email: "",
  });
  // Datos de receptor (cliente)
  const [receptor, setReceptor] = useState({
    nombre: "",
    direccion: "",
    cif: "",
    cp: "",
    email: "",
  });

  // Líneas de factura
  const [lineas, setLineas] = useState<Linea[]>([
    { descripcion: "", unidades: 1, precioUnitario: 0 },
  ]);

  // Tipos de impuesto
  const [ivaPct, setIvaPct] = useState(21);
  const [irpfPct, setIrpfPct] = useState(0);

  // Loading
  const [loading, setLoading] = useState(false);

  const handleLineaChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLineas((L) =>
      L.map((l, idx) =>
        idx === i
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

  const addLinea = () => {
    setLineas((L) => [...L, { descripcion: "", unidades: 1, precioUnitario: 0 }]);
  };

  const calcularTotales = () => {
    const base = lineas.reduce((sum, l) => sum + l.unidades * l.precioUnitario, 0);
    const iva = +(base * ivaPct) / 100;
    const irpf = +(base * irpfPct) / 100;
    const total = base + iva - irpf;
    return { base, iva, irpf, total };
  };

  async function exportCSV() {
    setLoading(true);
    const numero = generarCodigoFactura();
    const { base, iva, irpf, total } = calcularTotales();

    // 1) Guarda factura en Supabase
    const { error: facErr } = await supabase.from("facturas").insert({
      fecha,
      vencimiento,
      receptor_nombre: receptor.nombre,
      numero_factura: numero,
      lineas,
      iva: ivaPct,
      irpf: irpfPct,
    });
    if (facErr) {
      alert("Error al guardar factura: " + facErr.message);
      setLoading(false);
      return;
    }

    // 2) Registra en Libro de Ventas
    try {
      await registraVenta({
        fecha,
        cliente_id: receptor.nombre, // ajusta si usas un ID real
        numero_factura: numero,
        base,
        iva,
      });
    } catch (err: any) {
      console.error(err);
      alert("Factura guardada, pero no se registró en ventas: " + err.message);
      setLoading(false);
      return;
    }

    // 3) Genera CSV
    const header = [
      "Número",
      "Fecha",
      "Vencimiento",
      "Emisor",
      "Receptor",
      "Descripción",
      "Unidades",
      "Precio Unitario",
      "Importe",
    ];
    const rows = lineas.map((l) => [
      numero,
      fecha,
      vencimiento,
      emisor.nombre,
      receptor.nombre,
      l.descripcion,
      l.unidades.toString(),
      l.precioUnitario.toFixed(2),
      (l.unidades * l.precioUnitario).toFixed(2),
    ]);
    rows.push(["", "", "", "", "", "BASE IMPONIBLE", "", "", base.toFixed(2)]);
    rows.push(["", "", "", "", "", `IVA (${ivaPct}%)`, "", "", iva.toFixed(2)]);
    rows.push(["", "", "", "", "", `IRPF (${irpfPct}%)`, "", "", (-irpf).toFixed(2)]);
    rows.push(["", "", "", "", "", "TOTAL", "", "", total.toFixed(2)]);
    const csv =
      [header, ...rows]
        .map((r) =>
          r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")
        )
        .join("\r\n") +
      "\r\n\nCondiciones de pago: 30 días netos. Pago por transferencia.";

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `factura-${numero}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  async function exportPDF() {
    setLoading(true);
    const numero = generarCodigoFactura();
    const { base, iva, irpf, total } = calcularTotales();

    // mis-mismos pasos de guardado
    const { error: facErr } = await supabase.from("facturas").insert({
      fecha,
      vencimiento,
      receptor_nombre: receptor.nombre,
      numero_factura: numero,
      lineas,
      iva: ivaPct,
      irpf: irpfPct,
    });
    if (facErr) {
      alert("Error al guardar factura: " + facErr.message);
      setLoading(false);
      return;
    }
    try {
      await registraVenta({
        fecha,
        cliente_id: receptor.nombre,
        numero_factura: numero,
        base,
        iva,
      });
    } catch (err: any) {
      console.error(err);
      alert("Factura guardada, pero no se registró en ventas: " + err.message);
      setLoading(false);
      return;
    }

    // luego generamos PDF
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    let y = 40;
    doc.setFont("helvetica", "bold").setFontSize(24).setTextColor(0, 102, 204);
    doc.text("Factura", 40, y);
    y += 30;
    doc.setFont("helvetica", "normal").setFontSize(12).setTextColor(0, 0, 0);
    doc.text(`Número: ${numero}`, 40, y);
    doc.text(`Fecha: ${fecha}`, 200, y);
    doc.text(`Vencimiento: ${vencimiento}`, 360, y);
    y += 30;

    doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(0, 102, 204);
    doc.text("Emisor", 40, y);
    doc.text("Receptor", 300, y);
    y += 18;
    doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(60, 60, 60);
    doc.text(`Nombre: ${emisor.nombre}`, 40, y);
    doc.text(`Nombre: ${receptor.nombre}`, 300, y);
    y += 14;
    doc.text(`Dirección: ${emisor.direccion}`, 40, y);
    doc.text(`Dirección: ${receptor.direccion}`, 300, y);
    y += 14;
    doc.text(`NIF: ${emisor.nif}`, 40, y);
    doc.text(`CIF: ${receptor.cif}`, 300, y);
    y += 14;
    doc.text(`Email: ${emisor.email}`, 40, y);
    doc.text(`Email: ${receptor.email}`, 300, y);
    y += 30;

    // tabla
    doc.setFont("helvetica", "bold").setTextColor(0, 102, 204).setFontSize(12);
    ["Descripción", "Unid.", "P.U. (€)", "Importe (€)"].forEach((h, i) =>
      doc.text(h, 40 + i * 130, y)
    );
    y += 16;
    doc.setLineWidth(0.5).line(40, y, 550, y);
    y += 10;
    doc.setFont("helvetica", "normal").setTextColor(0, 0, 0);
    lineas.forEach((l) => {
      doc.text(l.descripcion, 40, y);
      doc.text(String(l.unidades), 170, y, { align: "right" });
      doc.text(l.precioUnitario.toFixed(2), 300, y, { align: "right" });
      doc.text((l.unidades * l.precioUnitario).toFixed(2), 430, y, {
        align: "right",
      });
      y += 18;
      if (y > 750) {
        doc.addPage();
        y = 40;
      }
    });

    // totales
    y += 20;
    doc.setFont("helvetica", "bold").setTextColor(0, 102, 204);
    doc.text("BASE:", 300, y);
    doc.text(base.toFixed(2) + " €", 550, y, { align: "right" });
    y += 16;
    doc.text(`IVA (${ivaPct}%):`, 300, y);
    doc.text(iva.toFixed(2) + " €", 550, y, { align: "right" });
    y += 16;
    doc.text(`IRPF (${irpfPct}%):`, 300, y);
    doc.text((-irpf).toFixed(2) + " €", 550, y, { align: "right" });
    y += 16;
    doc.setFontSize(16).setTextColor(0, 0, 0);
    doc.text("TOTAL:", 300, y);
    doc.text(total.toFixed(2) + " €", 550, y, { align: "right" });

    doc.save(`factura-${numero}.pdf`);
    setLoading(false);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto bg-gray-50 space-y-6">
      <h1 className="text-2xl font-bold">Nueva Factura</h1>
      <form className="space-y-6 bg-white p-8 rounded shadow">
        {/* cabecera */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm">Vencimiento</label>
            <input
              type="date"
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              className="mt-1 block w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        {/* emisor/receptor */}
        <div className="grid grid-cols-2 gap-6">
          <fieldset className="space-y-2">
            <legend className="font-semibold">Emisor</legend>
            <input
              placeholder="Nombre"
              value={emisor.nombre}
              readOnly
              className="w-full border rounded px-3 py-2 bg-gray-100"
            />
            <input
              placeholder="Dirección"
              value={emisor.direccion}
              onChange={(e) =>
                setEmisor({ ...emisor, direccion: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <input
              placeholder="NIF"
              value={emisor.nif}
              onChange={(e) =>
                setEmisor({ ...emisor, nif: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <input
              placeholder="Email"
              value={emisor.email}
              onChange={(e) =>
                setEmisor({ ...emisor, email: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </fieldset>
          <fieldset className="space-y-2">
            <legend className="font-semibold">Receptor</legend>
            <input
              placeholder="Nombre"
              value={receptor.nombre}
              onChange={(e) =>
                setReceptor({ ...receptor, nombre: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <input
              placeholder="Dirección"
              value={receptor.direccion}
              onChange={(e) =>
                setReceptor({ ...receptor, direccion: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <input
              placeholder="CIF"
              value={receptor.cif}
              onChange={(e) =>
                setReceptor({ ...receptor, cif: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
            <input
              placeholder="Email"
              value={receptor.email}
              onChange={(e) =>
                setReceptor({ ...receptor, email: e.target.value })
              }
              className="w-full border rounded px-3 py-2"
            />
          </fieldset>
        </form>

        {/* líneas */}
        <fieldset className="bg-white p-6 rounded shadow space-y-4">
          <legend className="text-xl font-semibold">Conceptos</legend>
          {lineas.map((l, i) => (
            <div key={i} className="grid grid-cols-4 gap-4">
              <input
                name="descripcion"
                placeholder="Descripción"
                value={l.descripcion}
                onChange={(e) => handleLineaChange(i, e)}
                className="border rounded px-3 py-2"
              />
              <input
                name="unidades"
                type="number"
                placeholder="Unidades"
                value={l.unidades}
                onChange={(e) => handleLineaChange(i, e)}
                className="border rounded px-3 py-2"
              />
              <input
                name="precioUnitario"
                type="number"
                placeholder="Precio unitario"
                step="0.01"
                value={l.precioUnitario}
                onChange={(e) => handleLineaChange(i, e)}
                className="border rounded px-3 py-2"
              />
              <div className="flex items-center justify-between">
                <span>{(l.unidades * l.precioUnitario).toFixed(2)} €</span>
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
            </div>
          ))}
        </fieldset>

        {/* impuestos & acciones */}
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
          <div>
            <label className="block text-sm">IRPF (%)</label>
            <input
              type="number"
              value={irpfPct}
              onChange={(e) => setIrpfPct(+e.target.value)}
              className="mt-1 w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex space-x-3 justify-end">
            <button
              onClick={exportCSV}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {loading ? "Procesando…" : "Exportar CSV"}
            </button>
            <button
              onClick={exportPDF}
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              {loading ? "Procesando…" : "Descargar PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
