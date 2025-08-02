"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface Cliente {
  id: string;
  nombre: string;
}

interface Linea {
  id: number;
  descripcion: string;
  cantidad: number;
  precio: number;
}

export default function NuevaFacturaPage() {
  const router = useRouter();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [via, setVia] = useState<"factura" | "simplificada">("factura");
  const [lineas, setLineas] = useState<Linea[]>([
    { id: Date.now(), descripcion: "", cantidad: 1, precio: 0 },
  ]);

  // carga de clientes
  useEffect(() => {
    fetch("/api/clientes")
      .then((r) => r.json())
      .then((data) => setClientes(data.clientes || []));
  }, []);

  // manejadores de líneas
  const addLinea = () =>
    setLineas((prev) => [
      ...prev,
      { id: Date.now(), descripcion: "", cantidad: 1, precio: 0 },
    ]);
  const removeLinea = (id: number) =>
    setLineas((prev) => prev.filter((l) => l.id !== id));
  const updateLinea = (
    id: number,
    field: keyof Omit<Linea, "id">,
    value: string | number
  ) =>
    setLineas((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, [field]: typeof value === "number" ? value : (value as string) }
          : l
      )
    );

  // envío
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // construye payload sin user_id
    const payload = {
      serie,
      numero,
      cliente_id: clienteId,
      via,
      lineas: lineas.map((l) => ({
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        precio: l.precio,
      })),
    };

    const res = await fetch("/api/facturas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.success) {
      alert("Error guardando factura: " + data.error);
      return;
    }

    router.push("/facturas/historico");
  };

  return (
    <div className="p-6">
      <button
        onClick={() => router.push("/facturas")}
        className="text-blue-600 hover:underline mb-4"
      >
        ← Volver a Facturas
      </button>
      <h1 className="text-2xl font-semibold mb-6">Crear Factura</h1>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        {/* Encabezado */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            placeholder="Serie"
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <input
            placeholder="Número"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="border rounded px-3 py-2"
            required
          />
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="border rounded px-3 py-2"
            required
          >
            <option value="">Selecciona Cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select
            value={via}
            onChange={(e) => setVia(e.target.value as any)}
            className="border rounded px-3 py-2"
          >
            <option value="factura">Factura</option>
            <option value="simplificada">Factura Simplificada</option>
          </select>
        </div>

        {/* Líneas */}
        <div className="space-y-4">
          {lineas.map((l) => (
            <div
              key={l.id}
              className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
            >
              <input
                placeholder="Descripción"
                value={l.descripcion}
                onChange={(e) => updateLinea(l.id, "descripcion", e.target.value)}
                className="border rounded px-3 py-2 col-span-2"
                required
              />
              <input
                type="number"
                min={1}
                value={l.cantidad}
                onChange={(e) =>
                  updateLinea(l.id, "cantidad", parseInt(e.target.value))
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                min={0}
                step={0.01}
                value={l.precio}
                onChange={(e) =>
                  updateLinea(l.id, "precio", parseFloat(e.target.value))
                }
                className="border rounded px-3 py-2"
              />
              <button
                type="button"
                onClick={() => removeLinea(l.id)}
                className="text-red-600 hover:underline"
              >
                Eliminar
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

        {/* Botones finales */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar Factura
          </button>
          <button
            type="button"
            onClick={() => router.push("/facturas/historico")}
            className="px-6 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

