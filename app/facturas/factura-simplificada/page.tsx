// File: /app/facturas/factura-simplificada/page.tsx
"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabaseClient";
import { generarCodigoFactura, registraVenta } from "@/lib/ventas";

interface Cliente {
  id: string;
  nombre: string;
}

export default function FacturaSimplificadaPage() {
  // ————————————————————————
  // Estado del formulario
  // ————————————————————————
  const [fecha, setFecha] = useState("");
  const [receptorId, setReceptorId] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [servicio, setServicio] = useState("");
  const [precio, setPrecio] = useState(0);

  const [ivaPct, setIvaPct] = useState(21);
  const [loading, setLoading] = useState(false);

  // ————————————————————————
  // Al montar: cargar clientes para el select
  // ————————————————————————
  useEffect(() => {
    supabase
      .from("clientes")
      .select("id,nombre")
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setClientes((data || []) as Cliente[]);
      });
  }, []);

  // ————————————————————————
  // Cálculo de totales
  // ————————————————————————
  const base = precio;
  const iva = +(base * ivaPct) / 100;
  const total = +(base + iva).toFixed(2);

  // ————————————————————————
  // Manejar envío / generación de ticket
  // ————————————————————————
  const handleEmitir = async (e: FormEvent) => {
    e.preventDefault();
    if (!fecha || !receptorId || !servicio || precio <= 0) {
      alert("Completa fecha, cliente, servicio y precio.");
      return;
    }
    setLoading(true);

    // generar código único de ticket
    const codigo = generarCodigoFactura(); // p.ej. FAC25-ABCD

    // 1) Guardar en tabla `facturas` como simplificada
    const { error: facErr } = await supabase.from("facturas").insert({
      fecha,
      receptor_id: receptorId,
      numero_factura: codigo,
      servicio,
      base,
      iva: ivaPct,
      total,
      via: "simplificada",
    });
    if (facErr) {
      alert("Error al guardar factura: " + facErr.message);
      setLoading(false);
      return;
    }

    // 2) Registrar en libro de ventas
    try {
      await registraVenta({
        fecha,
        cliente_id: receptorId,
        numero_factura: codigo,
        base,
        iva,
      });
    } catch (err: any) {
      console.error(err);
      alert("Factura grabada, pero no se registró en ventas: " + err.message);
      setLoading(false);
      return;
    }

    // 3) Generar PDF tipo ticket
    const cliente = clientes.find((c) => c.id === receptorId);
    const doc = new jsPDF({ unit: "mm", format: [80, 200] }); // ticket tamaño 80×200mm
    let y = 10;

    doc.setFontSize(14).text("COMPROBANTE SIMPLIFICADO", 10, y, { align: "center" });
    y += 10;
    doc.setFontSize(10).text(`Código: ${codigo}`, 10, y);
    y += 6;
    doc.text(`Fecha: ${fecha}`, 10, y);
    y += 8;
    doc.text(`Cliente: ${cliente?.nombre || ""}`, 10, y);
    y += 8;
    doc.setFontSize(12).text("Servicio", 10, y);
    y += 6;
    doc.setFontSize(10).text(servicio, 10, y);
    y += 8;
    doc.text(`Base: € ${base.toFixed(2)}`, 10, y);
    y += 6;
    doc.text(`IVA (${ivaPct}%): € ${iva.toFixed(2)}`, 10, y);
    y += 6;
    doc.setFontSize(12).text(`TOTAL: € ${total.toFixed(2)}`, 10, y);
    y += 10;
    doc.setFontSize(8).text("¡Gracias por su compra!", 10, y, { align: "center" });

    doc.save(`ticket-${codigo}.pdf`);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Factura Simplificada</h1>
      <form onSubmit={handleEmitir} className="space-y-4">
        {/* Fecha */}
        <div>
          <label className="block text-sm">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>

        {/* Cliente */}
        <div>
          <label className="block text-sm">Cliente</label>
          <select
            value={receptorId}
            onChange={(e) => setReceptorId(e.target.value)}
            required
            className="mt-1 w-full border rounded px-2 py-1"
          >
            <option value="">— Seleccione cliente —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Servicio */}
        <div>
          <label className="block text-sm">Servicio</label>
          <input
            type="text"
            value={servicio}
            onChange={(e) => setServicio(e.target.value)}
            placeholder="Descripción breve"
            required
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm">Precio Base (€)</label>
          <input
            type="number"
            value={precio}
            onChange={(e) => setPrecio(+e.target.value)}
            step="0.01"
            required
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>

        {/* IVA */}
        <div>
          <label className="block text-sm">IVA (%)</label>
          <input
            type="number"
            value={ivaPct}
            onChange={(e) => setIvaPct(+e.target.value)}
            className="mt-1 w-full border rounded px-2 py-1"
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {loading ? "Procesando..." : "Emitir Ticket"}
        </button>
      </form>
    </div>
  );
}
