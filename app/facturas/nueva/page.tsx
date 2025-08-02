"use client";

import React, { Fragment, useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import QRCode from "react-qr-code";

interface Cliente { id: string; nombre: string }
interface Perfil {
  nombre_empresa: string;
  nif: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  cp: string;
  pais: string;
  telefono: string;
  email: string;
  web: string;
}
interface Cuenta { id: string; codigo: string; nombre: string }
interface Linea {
  id: number;
  descripcion: string;
  cantidad: number;
  precio: number;
  iva: number;
  cuentaId: string;
}

export default function CrearFacturaPage() {
  const router = useRouter();

  // Datos maestros
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);

  // Formulario
  const [serie, setSerie] = useState("");
  const [numero, setNumero] = useState("");
  const [clienteId, setClienteId] = useState("");
  const [tipo, setTipo] = useState<"factura" | "simplificada">("factura");
  const [lineas, setLineas] = useState<Linea[]>([
    { id: Date.now(), descripcion: "", cantidad: 1, precio: 0, iva: 21, cuentaId: "" },
  ]);
  const [customFields, setCustomFields] = useState(false);
  const [mensajeFinal, setMensajeFinal] = useState(false);
  const [textoFinal, setTextoFinal] = useState("");
  const [showQROption, setShowQROption] = useState(false);
  const [qrOpen, setQROpen] = useState(false);
  const [catCuenta, setCatCuenta] = useState("");

  // Totales
  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  const ivaTotal = lineas.reduce((s, l) => s + l.cantidad * l.precio * (l.iva / 100), 0);
  const total = subtotal + ivaTotal;

  // Carga inicial
  useEffect(() => {
    fetch("/api/clientes")
      .then((r) => r.json())
      .then((d) => setClientes(d.clientes || []));
    fetch("/api/usuario/perfil")
      .then((r) => r.json())
      .then((d) => d.perfil && setPerfil(d.perfil));
    fetch("/api/contabilidad/cuadro-de-cuentas")
      .then((r) => r.json())
      .then((d) => setCuentas(d.cuentas || []));
  }, []);

  // Handlers de líneas
  const addLinea = () =>
    setLineas((prev) => [
      ...prev,
      { id: Date.now(), descripcion: "", cantidad: 1, precio: 0, iva: 21, cuentaId: "" },
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
        l.id === id ? { ...l, [field]: value } : l
      )
    );

  // Envío del formulario
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      serie,
      numero,
      cliente_id: clienteId,
      tipo,
      lineas: lineas.map((l) => ({
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        precio: l.precio,
        iva_porc: l.iva,
        cuenta_id: l.cuentaId,
      })),
      custom_fields: customFields,
      mensaje_final: mensajeFinal ? textoFinal : null,
      show_qr: showQROption,
      categoria_cuenta: catCuenta,
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
    setQROpen(true);
  };

  return (
    <div className="p-6">
      <Link href="/facturas" className="text-blue-600 hover:underline mb-4 block">
        ← Volver a Facturas
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Crear Factura</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
        {/* Cabecera */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <input
            value={serie}
            onChange={(e) => setSerie(e.target.value)}
            placeholder="Serie"
            className="border rounded px-3 py-2"
            required
          />
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            placeholder="Número"
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
            value={tipo}
            onChange={(e) => setTipo(e.target.value as any)}
            className="border rounded px-3 py-2"
          >
            <option value="factura">Factura</option>
            <option value="simplificada">Factura Simplificada</option>
          </select>
        </div>

        {/* Datos del remitente */}
        {perfil ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
            <div>
              <strong>{perfil.nombre_empresa}</strong>
              <br />
              {perfil.direccion}
              <br />
              {perfil.cp} {perfil.ciudad} ({perfil.provincia})
              <br />
              {perfil.pais}
            </div>
            <div>
              NIF/CIF: {perfil.nif}
              <br />
              Tel: {perfil.telefono}
              <br />
              Email: {perfil.email}
              <br />
              Web: {perfil.web}
            </div>
          </div>
        ) : (
          <p>Cargando datos del remitente…</p>
        )}

        {/* Líneas de factura */}
        {lineas.map((l) => (
          <div key={l.id} className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-end">
            <input
              value={l.descripcion}
              onChange={(e) => updateLinea(l.id, "descripcion", e.target.value)}
              placeholder="Descripción"
              className="col-span-2 border rounded px-3 py-2"
              required
            />
            <input
              type="number"
              min={1}
              value={l.cantidad}
              onChange={(e) => updateLinea(l.id, "cantidad", +e.target.value)}
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={l.precio}
              onChange={(e) => updateLinea(l.id, "precio", +e.target.value)}
              className="border rounded px-3 py-2"
            />
            <select
              value={l.iva}
              onChange={(e) => updateLinea(l.id, "iva", +e.target.value)}
              className="border rounded px-3 py-2"
            >
              {[0, 4, 10, 21].map((p) => (
                <option key={p} value={p}>
                  IVA {p}%
                </option>
              ))}
            </select>
            <select
              value={l.cuentaId}
              onChange={(e) => updateLinea(l.id, "cuentaId", e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Cuenta contable</option>
              {cuentas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} – {c.nombre}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeLinea(l.id)}
              className="text-red-600 hover:underline"
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
          + Añadir línea
        </button>

        {/* Totales */}
        <div className="text-right space-y-1">
          <div>Subtotal: {subtotal.toFixed(2)} €</div>
          <div>IVA: {ivaTotal.toFixed(2)} €</div>
          <div className="font-bold">Total: {total.toFixed(2)} €</div>
        </div>

        {/* Opciones extra */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={customFields}
              onChange={() => setCustomFields(!customFields)}
              className="mr-2"
            />
            Campos personalizados
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={mensajeFinal}
              onChange={() => setMensajeFinal(!mensajeFinal)}
              className="mr-2"
            />
            Añadir mensaje al final
          </label>
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={showQROption}
              onChange={() => setShowQROption(!showQROption)}
              className="mr-2"
            />
            Mostrar QR acceso Portal
          </label>
        </div>
        {mensajeFinal && (
          <textarea
            value={textoFinal}
            onChange={(e) => setTextoFinal(e.target.value)}
            placeholder="Tu mensaje al final"
            className="w-full border rounded px-3 py-2"
          />
        )}

        {/* Categorizar */}
        <div>
          <label className="block mb-1">Categorizar (Cuenta contable global)</label>
          <select
            value={catCuenta}
            onChange={(e) => setCatCuenta(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Selecciona cuenta</option>
            {cuentas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.codigo} – {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Acciones */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Guardar Factura
          </button>
          <button
            type="button"
            onClick={() => {/* TODO: implementar Facturae */}}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Facturae
          </button>
          <button
            type="button"
            onClick={() => {/* TODO: implementar Verifactu */}}
            className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Verifactu
          </button>
        </div>
      </form>

            {/* Modal QR */}
      <Transition appear show={qrOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-40 overflow-y-auto"
          onClose={() => setQROpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            {/* Backdrop */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
            </Transition.Child>

            {/* Centering trick */}
            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white rounded shadow-xl">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6">
                  Acceso a la factura
                </Dialog.Title>
                {showQROption && (
                  <div className="mt-4 text-center">
                    <QRCode value={`${window.location.origin}/facturas/${serie}${numero}`} />
                    <p className="mt-2 text-sm text-gray-500">
                      Escanea para ver tu factura online
                    </p>
                  </div>
                )}
                <div className="mt-4 text-right">
                  <button
                    onClick={() => setQROpen(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => router.push(`/facturas/${serie}${numero}`)}
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Ver factura
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

    </div>
  );
}
