// app/facturas/nueva/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, Fragment, FormEvent, useRef } from 'react';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import ReactQRCode from 'react-qr-code';
import { toDataURL } from 'qrcode';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

import VeriFactuQR from './VeriFactuQR';
import type { VeriFactuPayload } from '@/lib/verifactu';

// === Tipos mínimos locales ===
interface Cliente { id: string; nombre: string; nif?: string; direccion?: string; ciudad?: string; provincia?: string; cp?: string; pais?: string; }
interface Perfil {
  user_id?: string;
  nombre_empr?: string; empresa?: string; nombre?: string; razon_social?: string;
  nif?: string; direccion?: string; ciudad?: string; provincia?: string; cp?: string; pais?: string;
  telefono?: string; email?: string; web?: string;
}
interface Cuenta { id: string; codigo: string; nombre: string; }
interface Linea { id: number; descripcion: string; cantidad: number; precio: number; iva: number; cuentaId: string; }

type TipoUI = 'factura' | 'simplificada' | 'rectificativa';

export default function NuevaFacturaPage() {
  const supabase = createPagesBrowserClient();
  const refFactura = useRef<HTMLFormElement>(null);

  // ===== Estado base =====
  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  // Factura
  const [serie, setSerie] = useState(''); const [numero, setNumero] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [tipo, setTipo] = useState<TipoUI>('factura');
  const [lineas, setLineas] = useState<Linea[]>([{ id: Date.now(), descripcion:'', cantidad:1, precio:0, iva:21, cuentaId:'' }]);

  // UI extra
  const [customFields, setCustomFields] = useState(false);
  const [mensajeFinal, setMensajeFinal] = useState(false);
  const [textoFinal, setTextoFinal] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [catCuenta, setCatCuenta] = useState('');
  const [qrOpen, setQrOpen] = useState(false);

  // Veri*factu / firma
  const [verifactuPayload, setVerifactuPayload] = useState<VeriFactuPayload | null>(null);
  const [busySave, setBusySave] = useState(false);
  const [busyXades, setBusyXades] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [facturaeBase64, setFacturaeBase64] = useState<string | null>(null);

  // Totales
  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  const ivaTotal = lineas.reduce((s, l) => s + l.cantidad * l.precio * (l.iva / 100), 0);
  const total = subtotal + ivaTotal;

  // ===== Helpers =====
  const sellerFromPerfil = (p?: Perfil | null) => ({
    name: (p?.nombre_empr || p?.empresa || p?.razon_social || p?.nombre || '—').toString(),
    nif: (p?.nif || '—').toString(),
    address: (p?.direccion || '—').toString(),
    city: (p?.ciudad || '—').toString(),
    province: (p?.provincia || '—').toString(),
    zip: (p?.cp || '—').toString(),
    country: (p?.pais || 'ESP').toString(),
  });

  const invoiceTypeForVerifactu = (t: TipoUI): 'completa'|'simplificada'|'rectificativa' =>
    t === 'simplificada' ? 'simplificada' : (t === 'rectificativa' ? 'rectificativa' : 'completa');

  // ===== Carga inicial (perfil, clientes, cuentas) =====
  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user.id;
      if (!uid) { setLoading(false); return; }

      const { data: clientesData } = await supabase.from('clientes').select('id,nombre');
      setClientes(clientesData || []);

      const { data: perfilData } = await supabase
        .from('perfil')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();
      if (perfilData) setPerfil(perfilData as any);

      const { data: cuentasData } = await supabase.from('cuentas').select('id,codigo,nombre');
      setCuentas(cuentasData || []);

      setLoading(false);
    })();
  }, [supabase]);

  // ===== Líneas =====
  const addLinea = () => setLineas(ls => [...ls, { id: Date.now(), descripcion:'', cantidad:1, precio:0, iva:21, cuentaId:'' }]);
  const removeLinea = (id:number) => setLineas(ls => ls.filter(x => x.id !== id));
  const updateLinea = (id:number, f:keyof Omit<Linea,'id'>, v:any) => setLineas(ls => ls.map(x => x.id===id ? { ...x, [f]: v } : x));

  // ===== Guardar + obtener XAdES (con Bearer + cookies) =====
  const saveForXAdES = async () => {
    const issueDate = new Date().toISOString().slice(0, 10);

    // token de sesión
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const res = await fetch('/api/facturas', {
      method: 'POST',
      credentials: 'include', // también manda cookies de Supabase si existen
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        issueDate,
        type: invoiceTypeForVerifactu(tipo), // 'completa' | 'simplificada' | 'rectificativa'
        totals: { total: +total.toFixed(2) },
        // si tienes UI de pago, mapea aquí; esto es un mínimo válido
        payment: { method: 'transfer', iban: null, paypalEmail: null, notes: null },
      }),
    });

    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || 'No se pudo guardar');

    // serie/número finales (reservados atómicamente)
    setSerie(String(j.series || ''));
    setNumero(String(j.number || ''));
    setFacturaeBase64(j.facturaeBase64 || null);

    // payload RF/QR Veri*factu
    const emisorNif = sellerFromPerfil(perfil).nif || '';
    setVerifactuPayload({
      issuerTaxId: emisorNif,
      issueDate,
      invoiceType: invoiceTypeForVerifactu(tipo),
      total: +total.toFixed(2),
      software: 'Clientum Signer v0.0.1',
      series: String(j.series),
      number: Number(j.number),
    });

    setFlash(`Guardado: ${j.series}-${String(j.number).padStart(6, '0')} ✔️`);
  };

  // ===== Guardar =====
  const handleGuardar = async (e:FormEvent) => {
    e.preventDefault();
    try { setBusySave(true); setFlash(null); await saveForXAdES(); if (showQR) setQrOpen(true); }
    catch (err:any) { setFlash('Error al guardar: ' + String(err?.message || err)); }
    finally { setBusySave(false); }
  };

  // ===== Descargar Facturae (guarda si hace falta) =====
  const descargarFacturae = async () => {
    try {
      setBusyXades(true);
      if (!facturaeBase64 || !serie || !numero) await saveForXAdES();
      if (!facturaeBase64) { setFlash('No se pudo obtener el XAdES. Reintenta.'); return; }

      const bytes = Uint8Array.from(atob(facturaeBase64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/xml' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(serie||'S')}${(numero||'000001')}.xsig`; // o .xml según tu firmador
      a.click(); URL.revokeObjectURL(a.href);

      setFlash(`Facturae firmada descargada (${(bytes.length/1024).toFixed(1)} KB)`);
    } catch (e:any) {
      setFlash('Error Facturae: ' + String(e?.message || e));
    } finally { setBusyXades(false); }
  };

  // ===== Exportar PDF (cliente) =====
  const exportPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text(`Factura ${serie}${numero}`, 14, 20);

    // Emisor
    const s = sellerFromPerfil(perfil);
    doc.setFontSize(10);
    doc.text([
      s.name || '—',
      s.address || '—',
      `${s.zip || '—'} ${s.city || '—'} (${s.province || '—'})`,
      s.country || 'ESP',
      `NIF/CIF: ${s.nif || '—'}`,
      ...(perfil?.telefono ? [`Tel: ${perfil.telefono}`] : []),
      ...(perfil?.email ?   [`Email: ${perfil.email}`]   : []),
      ...(perfil?.web ?     [`Web: ${perfil.web}`]       : []),
    ], 14, 30);

    // @ts-ignore
    autoTable(doc, {
      startY: 70,
      head: [['Desc.','Cant.','Precio','IVA','Total','Cuenta']],
      body: lineas.map(l => [
        l.descripcion,
        String(l.cantidad),
        l.precio.toFixed(2),
        `${l.iva}%`,
        (l.cantidad*l.precio*(1+l.iva/100)).toFixed(2),
        cuentas.find(c=>c.id===l.cuentaId)?.codigo || ''
      ]),
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${subtotal.toFixed(2)} €`, 140, finalY+10, { align:'right' });
    doc.text(`IVA: ${ivaTotal.toFixed(2)} €`, 140, finalY+16, { align:'right' });
    doc.setFontSize(12);
    doc.text(`Total: ${total.toFixed(2)} €`, 140, finalY+24, { align:'right' });

    if (showQR && origin) {
      const imgData = await toDataURL(`${origin}/facturas/${serie}${numero}`);
      doc.addImage(imgData, 'PNG', 14, finalY+32, 40, 40);
    }

    doc.save(`factura-${serie}${numero}.pdf`);
  };

  if (loading) return <div className="p-6">Cargando datos…</div>;

  return (
    <div className="p-6">
      <Link href="/facturas" className="text-blue-600 mb-4 inline-block">← Volver a Facturas</Link>
      <h1 className="text-2xl font-semibold mb-6">Crear Factura</h1>

      {/* Datos emisor */}
      <div className="mb-4 rounded border bg-slate-50 px-4 py-3 text-sm">
        <p className="font-medium mb-1">Datos del emisor (Mi perfil)</p>
        {(() => {
          const s = sellerFromPerfil(perfil);
          return (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div><b>Nombre</b>: {s.name}</div>
                <div><b>NIF</b>: {s.nif}</div>
                <div><b>Dirección</b>: {s.address}</div>
                <div><b>Localidad</b>: {s.zip} {s.city} ({s.province})</div>
                <div><b>País</b>: {s.country}</div>
              </div>
              <div>
                <div><b>Tel.</b>: {perfil?.telefono || '—'}</div>
                <div><b>Email</b>: {perfil?.email || '—'}</div>
                <div><b>Web</b>: {perfil?.web || '—'}</div>
              </div>
            </div>
          );
        })()}
      </div>

      {flash && <div className="mb-4 text-sm rounded border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">{flash}</div>}

      <form onSubmit={handleGuardar} ref={refFactura} className="bg-white p-6 rounded shadow space-y-6" data-invoice-form>
        {/* Serie y número */}
        <div className="flex gap-4">
          <input className="border rounded p-2 flex-1" placeholder="Serie" value={serie} onChange={e=>setSerie(e.target.value)} />
          <input className="border rounded p-2 flex-1" placeholder="Número" value={numero} onChange={e=>setNumero(e.target.value)} />
        </div>

        {/* Cliente y tipo */}
        <div className="flex gap-4">
          <select className="border rounded p-2 flex-1" value={clienteId} onChange={e=>setClienteId(e.target.value)}>
            <option value="">Selecciona cliente</option>
            {clientes.map(c=> <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          <select className="border rounded p-2 flex-1" value={tipo} onChange={e=>setTipo(e.target.value as TipoUI)}>
            <option value="factura">Factura Completa</option>
            <option value="simplificada">Factura Simplificada</option>
            <option value="rectificativa">Factura Rectificativa</option>
          </select>
        </div>

        {/* Líneas */}
        {lineas.map(l => (
          <div key={l.id} className="grid grid-cols-6 gap-2 items-end">
            <input className="col-span-2 border rounded p-2" placeholder="Descripción" value={l.descripcion} onChange={e=>updateLinea(l.id,'descripcion',e.target.value)} />
            <input type="number" className="border rounded p-2" placeholder="Cant." value={l.cantidad} onChange={e=>updateLinea(l.id,'cantidad',Number(e.target.value))} />
            <input type="number" className="border rounded p-2" placeholder="Precio" value={l.precio} onChange={e=>updateLinea(l.id,'precio',Number(e.target.value))} />
            <select className="border rounded p-2" value={l.iva} onChange={e=>updateLinea(l.id,'iva',Number(e.target.value))}>
              {[4,10,21].map(v=><option key={v} value={v}>{v}%</option>)}
            </select>
            <select className="border rounded p-2" value={l.cuentaId} onChange={e=>updateLinea(l.id,'cuentaId',e.target.value)}>
              <option value="">Cuenta</option>
              {cuentas.map(c=><option key={c.id} value={c.id}>{c.codigo} – {c.nombre}</option>)}
            </select>
            <button type="button" onClick={()=>removeLinea(l.id)} className="text-red-600">×</button>
          </div>
        ))}
        <button type="button" onClick={addLinea} className="text-blue-600">+ Añadir línea</button>

        {/* Opciones */}
        <div className="flex items-center gap-4">
          <label><input type="checkbox" checked={customFields} onChange={e=>setCustomFields(e.target.checked)} /> Campos extra</label>
          <label><input type="checkbox" checked={mensajeFinal} onChange={e=>setMensajeFinal(e.target.checked)} /> Mensaje final</label>
          <label><input type="checkbox" checked={showQR} onChange={e=>setShowQR(e.target.checked)} /> Mostrar QR</label>
          <select className="border rounded p-2 ml-auto" value={catCuenta} onChange={e=>setCatCuenta(e.target.value)}>
            <option value="">Categoría</option>
            {cuentas.map(c => <option key={c.id} value={c.id}>{c.codigo}</option>)}
          </select>
        </div>

        {mensajeFinal && <textarea className="w-full border rounded p-2" placeholder="Texto final..." value={textoFinal} onChange={e=>setTextoFinal(e.target.value)} />}

        {/* Acciones */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="mb-2">
            <p>Subtotal: {subtotal.toFixed(2)}€</p>
            <p>IVA: {ivaTotal.toFixed(2)}€</p>
            <p className="font-bold">Total: {total.toFixed(2)}€</p>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busySave} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
              {busySave ? 'Guardando…' : 'Guardar Factura'}
            </button>
            <button type="button" onClick={exportPDF} className="px-4 py-2 bg-gray-200 rounded">Exportar PDF</button>
            <button type="button" onClick={descargarFacturae} disabled={busyXades} className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50">
              {busyXades ? 'Firmando…' : 'Descargar Facturae'}
            </button>
          </div>
        </div>
      </form>

      {/* QR Veri*factu inline */}
      <VeriFactuQR enabled={showQR && !!verifactuPayload} payload={verifactuPayload} />

      {/* Modal QR fallback */}
      <Transition show={qrOpen} as={Fragment}>
        <Dialog open onClose={()=>setQrOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center">
          <Transition.Child as={Fragment} enter="transition-opacity duration-200" enterFrom="opacity-0" enterTo="opacity-100">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child as={Fragment} enter="transition-transform duration-200" enterFrom="scale-95" enterTo="scale-100">
            <div className="bg-white p-6 rounded shadow text-center">
              <Dialog.Title className="text-lg font-semibold mb-4">Acceso a tu factura</Dialog.Title>
              {origin && <ReactQRCode value={`${origin}/facturas/${serie}${numero}`} />}
              <button onClick={()=>setQrOpen(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cerrar</button>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
}
