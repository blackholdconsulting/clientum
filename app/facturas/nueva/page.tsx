"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Link from "next/link";

interface Perfil {
  nombre_empresa: string;
  nif: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  cp: string;
  pais: string;
  email: string;
  web: string;
}

interface Linea {
  id: number;
  descripcion: string;
  cantidad: number;
  precio: number;
}

export default function NuevaFacturaPage() {
  // Estado perfil (remitente)
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  // Estado formulario de factura
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [tipo, setTipo] = useState("Factura");
  const [folioRelacionado, setFolioRelacionado] = useState("");

  // Líneas de servicio
  const [lineas, setLineas] = useState<Linea[]>([
    { id: Date.now(), descripcion: "", cantidad: 1, precio: 0 },
  ]);

  // Simula lista de clientes
  const clientes = [
    { id: "1", nombre: "Cliente A" },
    { id: "2", nombre: "Cliente B" },
  ];

  // Carga perfil al montar
  useEffect(() => {
    fetch("/api/usuario/perfil")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.perfil) {
          setPerfil({
            nombre_empresa: data.perfil.nombre_empresa || "",
            nif: data.perfil.nif || "",
            direccion: data.perfil.direccion || "",
            ciudad: data.perfil.ciudad || "",
            provincia: data.perfil.provincia || "",
            cp: data.perfil.cp || "",
            pais: data.perfil.pais || "",
            email: data.perfil.email || "",
            web: data.perfil.web || "",
          });
        }
      });
  }, []);

  // Gestiona líneas
  const addLinea = () => {
    setLineas((prev) => [
      ...prev,
      { id: Date.now(), descripcion: "", cantidad: 1, precio: 0 },
    ]);
  };
  const removeLinea = (id: number) => {
    setLineas((prev) => prev.filter((l) => l.id !== id));
  };
  const handleLineaChange = (
    id: number,
    field: keyof Omit<Linea, "id">,
    value: string
  ) => {
    setLineas((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              [field]:
                field === "descripcion"
                  ? value
                  : Math.max(0, Number(value)),
            }
          : l
      )
    );
  };

  // Enviar factura
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      serie,
      numero,
      clienteId,
      tipo,
      folioRelacionado,
      remitente: perfil,
      lineas,
    };
    console.log("Guardar factura:", payload);
    // Aquí tu lógica de envío a API...
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Link href="/facturas" className="text-blue-600 hover:underline">
          ← Volver a Facturas
        </Link>
        <h1 className="text-2xl font-semibold ml-4">Crear Factura</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
        {/* Cabecera factura */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="">Selecciona Cliente</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option>Factura</option>
            <option>Factura Simplificada</option>
          </select>
          <select
            value={folioRelacionado}
            onChange={(e) => setFolioRelacionado(e.target.value)}
            className="border rounded px-3 py-2 col-span-2"
          >
            <option value="">-- Relacionar con --</option>
            <option value="21">21</option>
          </select>
        </div>

        {/* Datos Remitente desde perfil */}
        <h2 className="text-lg font-medium">Datos de la Empresa (Remitente)</h2>
        {perfil ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              value={perfil.nombre_empresa}
              readOnly
              placeholder="Nombre / Razón Social"
              className="border rounded px-3 py-2 bg-gray-100"
            />
            <input
              type="text"
              value={perfil.nif}
              readOnly
              placeholder="NIF / CIF"
              className="border rounded px-3 py-2 bg-gray-100"
            />
            <input
              type="text"
              value={perfil.direccion}
              readOnly
              placeholder="Dirección"
              className="border rounded px-3 py-2 bg-gray-100 col-span-2"
            />
            <input
              type="text"
              value={perfil.ciudad}
              readOnly
              placeholder="Ciudad"
              className="border rounded px-3 py-2 bg-gray-100"
            />
            <input
              type="text"
              value={perfil.provincia}
              readOnly
              placeholder="Provincia"
              className="border rounded px-3 py-2 bg-gray-100"
            />
            <input
              type="text"
              value={perfil.cp}
              readOnly
              placeholder="Código Postal"
              className="border rounded px-3 py-2 bg-gray-100"
            />
            <input
              type="text"
              value={perfil.pais}
              readOnly
              placeholder="País"
              className="border rounded px-3 py-2 bg-gray-100"
            />
            <input
              type="email"
              value={perfil.email}
              readOnly
              placeholder="Email"
              className="border rounded px-3 py-2 bg-gray-100"
            />
            <input
              type="text"
              value={perfil.web}
              readOnly
              placeholder="Web"
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
        ) : (
          <p>Cargando datos del remitente…</p>
        )}

        {/* Líneas de servicio */}
        <h2 className="text-lg font-medium mt-6">Líneas de servicio</h2>
        <div className="space-y-4">
          {lineas.map((l) => (
            <div key={l.id} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <input
                type="text"
                placeholder="Descripción"
                value={l.descripcion}
                onChange={(e) => handleLineaChange(l.id, "descripcion", e.target.value)}
                className="border rounded px-3 py-2 col-span-2"
              />
              <input
                type="number"
                placeholder="Cantidad"
                value={l.cantidad}
                onChange={(e) => handleLineaChange(l.id, "cantidad", e.target.value)}
                className="border rounded px-3 py-2"
                min={1}
              />
              <input
                type="number"
                placeholder="Precio"
                value={l.precio}
                onChange={(e) => handleLineaChange(l.id, "precio", e.target.value)}
                className="border rounded px-3 py-2"
                min={0}
              />
              <button
                type="button"
                onClick={() => removeLinea(l.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLinea}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Añadir línea
          </button>
        </div>

        {/* Acciones finales */}
        <div className="flex space-x-4 mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar Factura
          </button>
          <button
            type="button"
            onClick={() => console.log("Facturae")}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Facturae
          </button>
          <button
            type="button"
            onClick={() => console.log("Verifactu")}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Verifactu
          </button>
        </div>
      </form>
    </div>
  );
}
