"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";
import { Dialog } from "@headlessui/react";

interface Cliente {
  id: string;
  nombre: string;
}

interface Cuenta {
  id: string;
  codigo: string;
  nombre: string;
}

interface Linea {
  id: number;
  concepto: string;
  descripcion: string;
  cantidad: number;
  precio: number;
  iva: number;
  cuentaId: string;
}

export default function CrearFacturaPage() {
  const router = useRouter();

  // datos maestros
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);

  // formulario
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10));
  const [vencimiento, setVencimiento] = useState("");
  const [lineas, setLineas] = useState<Linea[]>([
    { id: Date.now(), concepto: "", descripcion: "", cantidad: 1, precio: 0, iva: 21, cuentaId: "" }
  ]);
  const [qrOpen, setQROpen] = useState(false);

  // totales
  const subtotal = lineas.reduce((sum, l) => sum + l.cantidad * l.precio, 0);
  const totalIva = lineas.reduce((sum, l) => sum + l.cantidad * l.precio * (l.iva/100), 0);
  const total = subtotal + totalIva;

  // carga inicial
  useEffect(() => {
    fetch("/api/clientes")
      .then(r=>r.json())
      .then(data=>setClientes(data.clientes || []));
    fetch("/api/contabilidad/cuadro-de-cuentas") // o tu endpoint de cuentas
      .then(r=>r.json())
      .then(data=>setCuentas(data.cuentas || []));
  }, []);

  // manejadores
  const addLinea = () =>
    setLineas(prev => [
      ...prev,
      { id: Date.now(), concepto: "", descripcion: "", cantidad: 1, precio: 0, iva:21, cuentaId: "" }
    ]);

  const removeLinea = (id: number) =>
    setLineas(prev => prev.filter(l=>l.id!==id));

  const updateLinea = (
    id: number,
    field: keyof Omit<Linea, "id">,
    value: string|number
  ) =>
    setLineas(prev =>
      prev.map(l =>
        l.id===id
          ? { ...l, [field]: typeof value==="number" ? value : value }
          : l
      )
    );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      user_id: /* tu user_id */,
      serie,
      numero,
      cliente_id: clienteId,
      fecha_emisor: fecha,
      fecha_vencim: vencimiento,
      lineas: lineas.map(l=>({
        concepto: l.concepto,
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        precio: l.precio,
        iva_porc: l.iva,
        cuenta_id: l.cuentaId
      }))
    };
    const res = await fetch("/api/facturas", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Error guardando factura");
      return;
    }
    const { factura } = await res.json();
    setQROpen(true);
  };

  return (
    <div className="p-6">
      <button
        onClick={()=>router.push("/facturas")}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Volver a Facturas
      </button>
      <h1 className="text-2xl font-semibold mb-6">Crear Factura</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        {/* Encabezado */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            placeholder="Serie"
            value={serie}
            onChange={e=>setSerie(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            placeholder="Número"
            value={numero}
            onChange={e=>setNumero(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <select
            required
            value={clienteId}
            onChange={e=>setClienteId(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Selecciona Cliente</option>
            {clientes.map(c=>(
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <input
            type="date"
            value={fecha}
            onChange={e=>setFecha(e.target.value)}
            className="border rounded px-3 py-2"
          />
          <input
            type="date"
            required
            placeholder="Vencimiento"
            value={vencimiento}
            onChange={e=>setVencimiento(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        {/* Líneas */}
        <div className="space-y-4">
          {lineas.map((l, i)=>(
            <div key={l.id} className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-center">
              <input
                placeholder="Concepto"
                value={l.concepto}
                onChange={e=>updateLinea(l.id,"concepto",e.target.value)}
                className="col-span-2 border rounded px-3 py-2"
                required
              />
              <textarea
                placeholder="Descripción"
                value={l.descripcion}
                onChange={e=>updateLinea(l.id,"descripcion",e.target.value)}
                className="col-span-2 border rounded px-3 py-2"
              />
              <input
                type="number"
                min={1}
                value={l.cantidad}
                onChange={e=>updateLinea(l.id,"cantidad",+e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
              <input
                type="number"
                min={0}
                step={0.01}
                value={l.precio}
                onChange={e=>updateLinea(l.id,"precio",+e.target.value)}
                className="border rounded px-3 py-2 w-full"
              />
              <select
                value={l.iva}
                onChange={e=>updateLinea(l.id,"iva",+e.target.value)}
                className="border rounded px-3 py-2"
              >
                {[0,4,10,21].map(p=>(
                  <option key={p} value={p}>IVA {p}%</option>
                ))}
              </select>
              <select
                required
                value={l.cuentaId}
                onChange={e=>updateLinea(l.id,"cuentaId",e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">Cuenta contable</option>
                {cuentas.map(c=>(
                  <option key={c.id} value={c.id}>
                    {c.codigo} – {c.nombre}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={()=>removeLinea(l.id)}
                className="text-red-600 hover:underline"
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addLinea}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          + Añadir línea
        </button>

        {/* Totales */}
        <div className="text-right space-y-1 mt-4">
          <div>Subtotal: {subtotal.toFixed(2)} €</div>
          <div>IVA: {totalIva.toFixed(2)} €</div>
          <div className="font-bold">Total: {total.toFixed(2)} €</div>
        </div>

        {/* Acciones */}
        <div className="flex justify-between items-center mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar y Generar QR
          </button>
          <button
            type="button"
            onClick={()=>router.push("/facturas/historico")}
            className="px-6 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </form>

      {/* Modal QR */}
      <Dialog open={qrOpen} onClose={()=>setQROpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
        <Dialog.Panel className="bg-white p-6 rounded shadow">
          <Dialog.Title className="text-xl font-semibold mb-4">Factura generada</Dialog.Title>
          <div className="bg-white p-4 inline-block">
            <QRCode value={window.location.origin + "/facturas/" + serie + numero} />
          </div>
          <div className="mt-4 text-right">
            <button onClick={()=>setQROpen(false)} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cerrar
            </button>
            <button onClick={()=>router.push("/facturas/" + serie + numero)} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Ver factura
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
