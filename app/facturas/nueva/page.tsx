'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRightIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

type Cliente = {
  id?: string;
  nombre: string;
  nif: string;
  direccion: string;
  localidad: string;
  provincia: string;
  pais: string;
  cp: string;
  email?: string;
  telefono?: string;
};

type Producto = {
  id?: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  iva: number;
  recargoEquivalencia?: number;
  descuento?: number;
};

type Empresa = {
  id?: string;
  nombre: string;
  nif: string;
  direccion: string;
  localidad: string;
  provincia: string;
  pais: string;
  cp: string;
  email?: string;
  telefono?: string;
  iban?: string;
  swift?: string;
};

export default function NuevaFacturaPage() {
  const router = useRouter();

  const [empresa, setEmpresa] = useState<Empresa>({
    nombre: '',
    nif: '',
    direccion: '',
    localidad: '',
    provincia: '',
    pais: 'ES',
    cp: '',
    email: '',
    telefono: '',
    iban: '',
    swift: '',
  });

  const [cliente, setCliente] = useState<Cliente>({
    nombre: '',
    nif: '',
    direccion: '',
    localidad: '',
    provincia: '',
    pais: 'ES',
    cp: '',
    email: '',
    telefono: '',
  });

  const [productos, setProductos] = useState<Producto[]>([
    { descripcion: '', cantidad: 1, precioUnitario: 0, iva: 21, recargoEquivalencia: 0, descuento: 0 },
  ]);

  const [numero, setNumero] = useState<string>('');
  const [fecha, setFecha] = useState<string>(new Date().toISOString().slice(0, 10));
  const [vencimiento, setVencimiento] = useState<string>('');
  const [notas, setNotas] = useState<string>('');
  const [formaPago, setFormaPago] = useState<string>('transferencia');
  const [flash, setFlash] = useState<string | null>(null);
  const [busyPDF, setBusyPDF] = useState(false);
  const [busyFAC, setBusyFAC] = useState(false);
  const [busyXADES, setBusyXADES] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(t);
  }, [flash]);

  const totalBase = useMemo(
    () =>
      productos.reduce((acc, p) => {
        const base = p.cantidad * p.precioUnitario * (1 - (p.descuento || 0) / 100);
        return acc + base;
      }, 0),
    [productos],
  );

  const totalIVA = useMemo(
    () =>
      productos.reduce((acc, p) => {
        const base = p.cantidad * p.precioUnitario * (1 - (p.descuento || 0) / 100);
        return acc + base * (p.iva / 100);
      }, 0),
    [productos],
  );

  const totalRE = useMemo(
    () =>
      productos.reduce((acc, p) => {
        const base = p.cantidad * p.precioUnitario * (1 - (p.descuento || 0) / 100);
        const re = p.recargoEquivalencia || 0;
        return acc + base * (re / 100);
      }, 0),
    [productos],
  );

  const total = useMemo(() => totalBase + totalIVA + totalRE, [totalBase, totalIVA, totalRE]);

  const addProducto = () => {
    setProductos((prev) => [...prev, { descripcion: '', cantidad: 1, precioUnitario: 0, iva: 21, recargoEquivalencia: 0, descuento: 0 }]);
  };

  const removeProducto = (idx: number) => {
    setProductos((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateProducto = (idx: number, patch: Partial<Producto>) => {
    setProductos((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const assembleInvoice = async () => {
    return {
      number: numero || `BORRADOR-${Date.now()}`,
      issueDate: fecha,
      dueDate: vencimiento || fecha,
      seller: {
        name: empresa.nombre,
        taxId: empresa.nif,
        address: empresa.direccion,
        city: empresa.localidad,
        province: empresa.provincia,
        country: empresa.pais,
        zip: empresa.cp,
        email: empresa.email,
      },
      buyer: {
        name: cliente.nombre,
        taxId: cliente.nif,
        address: cliente.direccion,
        city: cliente.localidad,
        province: cliente.provincia,
        country: cliente.pais,
        zip: cliente.cp,
        email: cliente.email,
      },
      lines: productos.map((p, i) => ({
        index: i + 1,
        description: p.descripcion,
        quantity: p.cantidad,
        unitPrice: p.precioUnitario,
        discountPct: p.descuento || 0,
        vatPct: p.iva,
        rePct: p.recargoEquivalencia || 0,
      })),
      totals: {
        base: Number(totalBase.toFixed(2)),
        vat: Number(totalIVA.toFixed(2)),
        re: Number(totalRE.toFixed(2)),
        grand: Number(total.toFixed(2)),
      },
      payment: { method: formaPago, iban: empresa.iban, bic: empresa.swift },
      notes: notas,
      // Datos Veri*factu
      verifactu: {
        regime: 'General',
        deviceSerial: 'CLIENTUM-SaaS',
      },
    };
  };

  const exportPDF = async () => {
    try {
      setBusyPDF(true);
      setFlash('Generando PDF...');
      const invoice = await assembleInvoice();

      const res = await fetch('/api/invoices/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Error generando PDF: ${res.status} ${t}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factura-${invoice.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setFlash('PDF generado correctamente.');
    } catch (e: any) {
      console.error(e);
      setFlash(e?.message || 'No se pudo generar el PDF.');
    } finally {
      setBusyPDF(false);
    }
  };

  const descargarFacturae = async () => {
    try {
      setBusyFAC(true);
      setFlash('Generando Facturae...');
      const invoice = await assembleInvoice();

      const res = await fetch('/api/factura-electronica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Error generando Facturae: ${res.status} ${t}`);
      }
      const xml = await res.text();

      const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facturae-${invoice.number}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setFlash('Facturae descargada.');
    } catch (e: any) {
      console.error(e);
      setFlash(e?.message || 'No se pudo generar la Facturae.');
    } finally {
      setBusyFAC(false);
    }
  };

  const firmarFacturae = async () => {
    try {
      setBusyXADES(true);
      setFlash('Generando y firmando Facturae...');

      // 1) Montar la factura con tus datos actuales
      const invoice = await assembleInvoice();

      // 2) Generar XML Facturae (sin firmar)
      const xmlRes = await fetch('/api/factura-electronica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      });
      if (!xmlRes.ok) {
        const t = await xmlRes.text();
        throw new Error(`Error generando Facturae: ${xmlRes.status} ${t}`);
      }
      const xml = await xmlRes.text();

      // 3) Firmar XAdES con el microservicio vía proxy Next.js
      const signRes = await fetch('/api/sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xml }),
      });
      if (!signRes.ok) {
        const t = await signRes.text();
        throw new Error(`Error firmando XML: ${signRes.status} ${t}`);
      }

      // 4) Descargar el XML firmado
      const blob = await signRes.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facturae-firmada-${new Date().toISOString().slice(0,10)}.xml`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setFlash('Facturae firmada descargada.');
    } catch (err: any) {
      console.error(err);
      setFlash(err?.message || 'No se pudo firmar la factura.');
    } finally {
      setBusyXADES(false);
    }
  };

  return (
    <div className="px-6 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Nueva factura</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportPDF}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-neutral-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-neutral-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700 disabled:opacity-50"
            disabled={busyPDF}
          >
            {busyPDF ? 'Generando…' : 'Descargar PDF'}
          </button>

          <button
            onClick={descargarFacturae}
            type="button"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50"
            disabled={busyFAC}
            title="Genera el XML Facturae sin firmar"
          >
            {busyFAC ? 'Generando…' : 'Descargar Facturae'}
          </button>

          <button
            onClick={firmarFacturae}
            type="button"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            disabled={busyXADES}
            title="Genera el XML Facturae y lo firma XAdES con tu certificado"
          >
            {busyXADES ? 'Firmando…' : 'Firmar y descargar Facturae (XAdES)'}
          </button>
        </div>
      </div>

      {flash && (
        <div className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
          {flash}
        </div>
      )}

      {/* --- Empresa --- */}
      <section className="mt-6 grid grid-cols-1 gap-6 rounded-xl border p-4 md:grid-cols-2">
        <h2 className="col-span-full text-sm font-semibold uppercase tracking-widest text-neutral-500">Emisor</h2>
        <div>
          <label className="block text-sm font-medium">Nombre / Razón social</label>
          <input value={empresa.nombre} onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">NIF</label>
          <input value={empresa.nif} onChange={(e) => setEmpresa({ ...empresa, nif: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Dirección</label>
          <input value={empresa.direccion} onChange={(e) => setEmpresa({ ...empresa, direccion: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Localidad</label>
          <input value={empresa.localidad} onChange={(e) => setEmpresa({ ...empresa, localidad: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Provincia</label>
          <input value={empresa.provincia} onChange={(e) => setEmpresa({ ...empresa, provincia: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">País</label>
          <input value={empresa.pais} onChange={(e) => setEmpresa({ ...empresa, pais: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">CP</label>
          <input value={empresa.cp} onChange={(e) => setEmpresa({ ...empresa, cp: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={empresa.email} onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input value={empresa.telefono} onChange={(e) => setEmpresa({ ...empresa, telefono: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">IBAN</label>
          <input value={empresa.iban} onChange={(e) => setEmpresa({ ...empresa, iban: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">SWIFT</label>
          <input value={empresa.swift} onChange={(e) => setEmpresa({ ...empresa, swift: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
      </section>

      {/* --- Cliente --- */}
      <section className="mt-6 grid grid-cols-1 gap-6 rounded-xl border p-4 md:grid-cols-2">
        <h2 className="col-span-full text-sm font-semibold uppercase tracking-widest text-neutral-500">Cliente</h2>
        <div>
          <label className="block text-sm font-medium">Nombre / Razón social</label>
          <input value={cliente.nombre} onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">NIF</label>
          <input value={cliente.nif} onChange={(e) => setCliente({ ...cliente, nif: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium">Dirección</label>
          <input value={cliente.direccion} onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Localidad</label>
          <input value={cliente.localidad} onChange={(e) => setCliente({ ...cliente, localidad: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Provincia</label>
          <input value={cliente.provincia} onChange={(e) => setCliente({ ...cliente, provincia: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">País</label>
          <input value={cliente.pais} onChange={(e) => setCliente({ ...cliente, pais: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">CP</label>
          <input value={cliente.cp} onChange={(e) => setCliente({ ...cliente, cp: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={cliente.email} onChange={(e) => setCliente({ ...cliente, email: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Teléfono</label>
          <input value={cliente.telefono} onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
      </section>

      {/* --- Cabecera factura --- */}
      <section className="mt-6 grid grid-cols-1 gap-6 rounded-xl border p-4 md:grid-cols-3">
        <h2 className="col-span-full text-sm font-semibold uppercase tracking-widest text-neutral-500">Datos factura</h2>
        <div>
          <label className="block text-sm font-medium">Número</label>
          <input value={numero} onChange={(e) => setNumero(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha</label>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Vencimiento</label>
          <input type="date" value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
      </section>

      {/* --- Lineas --- */}
      <section className="mt-6 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Conceptos</h2>
          <button onClick={addProducto} className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50">
            <PlusIcon className="h-4 w-4" />
            Añadir línea
          </button>
        </div>

        <div className="mt-3 divide-y">
          {productos.map((p, i) => (
            <div key={i} className="grid grid-cols-1 gap-3 py-3 md:grid-cols-12">
              <div className="md:col-span-5">
                <input
                  placeholder="Descripción"
                  value={p.descripcion}
                  onChange={(e) => updateProducto(i, { descripcion: e.target.value })}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <input
                  placeholder="Cantidad"
                  type="number"
                  value={p.cantidad}
                  onChange={(e) => updateProducto(i, { cantidad: Number(e.target.value) })}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <input
                  placeholder="Precio unit."
                  type="number"
                  value={p.precioUnitario}
                  onChange={(e) => updateProducto(i, { precioUnitario: Number(e.target.value) })}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <input
                  placeholder="Dto. %"
                  type="number"
                  value={p.descuento || 0}
                  onChange={(e) => updateProducto(i, { descuento: Number(e.target.value) })}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <input
                  placeholder="IVA %"
                  type="number"
                  value={p.iva}
                  onChange={(e) => updateProducto(i, { iva: Number(e.target.value) })}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div>
                <input
                  placeholder="RE %"
                  type="number"
                  value={p.recargoEquivalencia || 0}
                  onChange={(e) => updateProducto(i, { recargoEquivalencia: Number(e.target.value) })}
                  className="w-full rounded-md border px-3 py-2"
                />
              </div>
              <div className="flex items-center justify-end">
                <button onClick={() => removeProducto(i)} className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-neutral-50">
                  <TrashIcon className="h-4 w-4" />
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Totales & pago --- */}
      <section className="mt-6 grid grid-cols-1 gap-6 rounded-xl border p-4 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Totales</h2>
          <dl className="mt-2 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Base imponible</dt>
              <dd>{totalBase.toFixed(2)} €</dd>
            </div>
            <div className="flex justify-between">
              <dt>IVA</dt>
              <dd>{totalIVA.toFixed(2)} €</dd>
            </div>
            <div className="flex justify-between">
              <dt>Recargo Equivalencia</dt>
              <dd>{totalRE.toFixed(2)} €</dd>
            </div>
            <div className="flex justify-between font-semibold">
              <dt>Total</dt>
              <dd>{total.toFixed(2)} €</dd>
            </div>
          </dl>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-500">Pago</h2>
          <div className="mt-2 space-y-3">
            <div>
              <label className="block text-sm font-medium">Forma de pago</label>
              <select value={formaPago} onChange={(e) => setFormaPago(e.target.value)} className="mt-1 w-full rounded-md border px-3 py-2">
                <option value="transferencia">Transferencia</option>
                <option value="contado">Contado</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="domiciliacion">Domiciliación</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Notas</label>
              <textarea value={notas} onChange={(e) => setNotas(e.target.value)} rows={4} className="mt-1 w-full rounded-md border px-3 py-2" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
