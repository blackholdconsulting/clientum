// File: /app/facturas/factura-simplificada/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabaseClient";
import { registraVenta, generarCodigoFactura } from "@/lib/ventas";
import Link from "next/link";

interface Cliente { id: string; nombre: string; }
interface Servicio { id: string; nombre: string; precio: number; }

export default function FacturaSimplificadaPage() {
  // ——— Inicializar fecha a hoy ———
  const today = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState<string>(today);

  // ——— Estados de cliente/servicio ———
  const [receptorId, setReceptorId] = useState("");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedServicioId, setSelectedServicioId] = useState("");
  const [servicioNombre, setServicioNombre] = useState("");
  const [precio, setPrecio] = useState(0);

  // ——— IVA y loading ———
  const [ivaPct, setIvaPct] = useState(21);
  const [loading, setLoading] = useState(false);

  // ——— Carga clientes y servicios ———
  useEffect(() => {
    supabase.from("clientes").select("id,nombre")
      .then(({ data, error }) => { if (!error) setClientes(data!); });
    supabase.from("servicios").select("id,nombre,precio")
      .then(({ data, error }) => { if (!error) setServicios(data!); });
  }, []);

  // ——— Cuando cambias de servicio, auto-completa nombre y precio ———
  useEffect(() => {
    if (!selectedServicioId) {
      setServicioNombre("");
      setPrecio(0);
    } else {
      const s = servicios.find((s) => s.id === selectedServicioId);
      if (s) {
        setServicioNombre(s.nombre);
        setPrecio(s.precio);
      }
    }
  }, [selectedServicioId, servicios]);

  // ——— Cálculo de totales ———
  const base = precio;
  const iva  = +(base * ivaPct) / 100;
  const total = +(base + iva).toFixed(2);

  // ——— Emitir ticket ———
  const handleEmitir = async (e: FormEvent) => {
    e.preventDefault();
    if (!fecha || !receptorId || !servicioNombre || precio <= 0) {
      alert("Completa todos los campos.");
      return;
    }
    setLoading(true);

    const numeroFactura = generarCodigoFactura();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      alert("Usuario no autenticado");
      setLoading(false);
      return;
    }

    // Inserta en facturas
    const { error: facErr } = await supabase
      .from("facturas")
      .insert({
        user_id:        user.id,
        cliente_id:     receptorId,
        fecha_emisor:   fecha,
        fecha_vencim:   fecha,
        concepto:       servicioNombre,
        base_imponib:   base,
        iva_porc:       ivaPct,
        total,
        via:            "simplificada",
        numero_factura: numeroFactura,
      });

    if (facErr) {
      alert("Error guardando factura: " + facErr.message);
      setLoading(false);
      return;
    }

    // Registra en ventas
    try {
      await registraVenta({ fecha, cliente_id: receptorId, numero_factura: numeroFactura, base, iva });
    } catch (err: any) {
      console.error(err);
      alert("Factura registrada, pero no en ventas: " + err.message);
    }

    // Genera PDF-ticket
    const cliente = clientes.find((c) => c.id === receptorId);
    const doc = new jsPDF({ unit: "mm", format: [80, 200] });
    let y = 10;

    doc.setFontSize(12).text("COMPROBANTE", 40, y, { align: "center" });
    y += 6;
    doc.setFontSize(8).text(`Nº: ${numeroFactura}`, 10, y);
    y += 6;
    doc.text(`Fecha: ${fecha}`, 10, y);
    y += 6;
    doc.text(`Cliente: ${cliente?.nombre}`, 10, y);
    y += 8;
    doc.setFontSize(10).text(servicioNombre, 10, y);
    y += 6;
    doc.setFontSize(8).text(`Base: €${base.toFixed(2)}`, 10, y);
    y += 6;
    doc.text(`IVA(${ivaPct}%): €${iva.toFixed(2)}`, 10, y);
    y += 6;
    doc.setFontSize(12).text(`TOTAL: €${total.toFixed(2)}`, 40, y, { align: "center" });
    y += 10;
    doc.setFontSize(6).text("¡Gracias por su compra!", 40, y, { align: "center" });

    doc.save(`ticket-${numeroFactura}.pdf`);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Factura Simplificada</h1>
      <form onSubmit={handleEmitir} className="space-y-4">
        {/* Fecha (por defecto hoy) */}
        <div>
          <label className="block text-sm">Fecha</label>
          <input
            type="date"
            className="mt-1 w-full border rounded px-2 py-1"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>

        {/* Cliente */}
        <div>
          <label className="block text-sm">Cliente</label>
          <select
            className="mt-1 w-full border rounded px-2 py-1"
            value={receptorId}
            onChange={(e) => setReceptorId(e.target.value)}
          >
            <option value="">— Selecciona cliente —</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Servicio desplegable */}
        <div>
          <label className="block text-sm">Servicio</label>
          <div className="flex space-x-2">
            <select
              className="mt-1 flex-1 border rounded px-2 py-1"
              value={selectedServicioId}
              onChange={(e) => setSelectedServicioId(e.target.value)}
            >
              <option value="">— Selecciona servicio —</option>
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} (€{s.precio.toFixed(2)})
                </option>
              ))}
            </select>
            <Link
              href="/facturas/servicios"
              className="mt-1 text-blue-600 hover:underline text-sm"
            >
              Gestionar
            </Link>
          </div>
        </div>

        {/* Precio Base (auto) */}
        <div>
          <label className="block text-sm">Precio Base (€)</label>
          <input
            type="number"
            className="mt-1 w-full border rounded px-2 py-1 bg-gray-100"
            value={precio}
            readOnly
          />
        </div>

        {/* IVA % */}
        <div>
          <label className="block text-sm">IVA (%)</label>
          <input
            type="number"
            className="mt-1 w-full border rounded px-2 py-1"
            value={ivaPct}
            onChange={(e) => setIvaPct(+e.target.value)}
          />
        </div>

        {/* Botón emitir */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {loading ? "Procesando..." : "Emitir Ticket"}
        </button>
      </form>
    </div>
  );
}
