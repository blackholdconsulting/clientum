'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import VeriFactuQR from './VeriFactuQR';
import { toDataURL } from 'qrcode';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

type Cliente = { id: string; nombre: string; nif?: string };
type Cuenta = { id: string; codigo: string; nombre: string };
type Perfil = { nombre?: string; razon_social?: string; empresa?: string; nif?: string; direccion?: string; ciudad?: string; provincia?: string; cp?: string; pais?: string; telefono?: string; email?: string; web?: string; };

type Linea = { id: number; descripcion: string; cantidad: number; precio: number; iva: number; cuentaId: string; };
type InvoiceType = 'completa' | 'simplificada' | 'rectificativa';

export default function NuevaFacturaPage() {
  const supabase = createPagesBrowserClient();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);

  const [serie, setSerie] = useState(''); const [numero, setNumero] = useState('');
  const [clienteId, setClienteId] = useState(''); const [tipo, setTipo] = useState<InvoiceType>('completa');

  const [lineas, setLineas] = useState<Linea[]>([{ id: Date.now(), descripcion:'', cantidad:1, precio:0, iva:21, cuentaId:'' }]);
  const [showQR, setShowQR] = useState(false);
  const [facturaeBase64, setFacturaeBase64] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [payloadQR, setPayloadQR] = useState<any>(null);
  const [busySave, setBusySave] = useState(false);
  const [busyXades, setBusyXades] = useState(false);

  const subtotal = lineas.reduce((s, l) => s + l.cantidad*l.precio, 0);
  const ivaTotal = lineas.reduce((s, l) => s + l.cantidad*l.precio*(l.iva/100), 0);
  const total = subtotal + ivaTotal;

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: clientesData } = await supabase.from('clientes').select('id,nombre,nif');
      setClientes(clientesData || []);

      const { data: cuentasData } = await supabase.from('cuentas').select('id,codigo,nombre');
      setCuentas(cuentasData || []);

      // Si guardas un "perfil" distinto en otra tabla, adapta esta consulta
      const { data: prof } = await supabase.from('perfil').select('*').eq('user_id', session.user.id).maybeSingle();
      setPerfil(prof || null);
    })();
  }, [supabase]);

  const addLinea = () => setLineas(x => [...x, { id: Date.now(), descripcion:'', cantidad:1, precio:0, iva:21, cuentaId:'' }]);
  const removeLinea = (id:number) => setLineas(x => x.filter(l => l.id !== id));
  const updateLinea = (id:number, k:keyof Omit<Linea,'id'>, v:any) => setLineas(x => x.map(l => l.id===id? { ...l, [k]: v } : l));

  const tipoFacturae = (t: InvoiceType) => t; // usamos igual en payload y Veri*factu

  // ---- Guardar + obtener XAdES (y serie/número definitivos) ----
  const saveForXAdES = async () => {
    const issueDate = new Date().toISOString().slice(0,10);
    const r = await fetch('/api/facturas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issueDate,
        type: tipoFacturae(tipo),
        totals: { total: +total.toFixed(2) },
        payment: { method: 'transfer', iban: null, paypalEmail: null, notes: null }
      })
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j?.error || 'No se pudo guardar');

    setSerie(String(j.series || ''));
    setNumero(String(j.number || ''));
    setFacturaeBase64(j.facturaeBase64 || null);

    const emisorNif = (perfil?.nif || '').toString();
    setPayloadQR({
      issuerTaxId: emisorNif,
      issueDate,
      invoiceType: tipoFacturae(tipo),
      total: +total.toFixed(2),
      software: 'Clientum Signer v0.0.1',
      series: String(j.series),
      number: Number(j.number),
    });

    setFlash(`Guardado: ${j.series}-${String(j.number).padStart(6,'0')} ✔️`);
  };

  const handleGuardar = async (e:FormEvent) => {
    e.preventDefault();
    try { setBusySave(true); setFlash(null); await saveForXAdES(); }
    catch (err:any) { setFlash('Error al guardar: ' + String(err?.message || err)); }
    finally { setBusySave(false); }
  };

  const descargarFacturae = async () => {
    try {
      setBusyXades(true);
      if (!facturaeBase64 || !serie || !numero) await saveForXAdES();
      if (!facturaeBase64) { setFlash('No se pudo obtener XAdES. Reintenta.'); return; }
      const bytes = Uint8Array.from(atob(facturaeBase64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: 'application/xml' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${(serie||'S')}${(numero||'000001')}.xsig`;
      a.click(); URL.revokeObjectURL(a.href);
      setFlash(`Facturae firmada descargada (${(bytes.length/1024).toFixed(1)} KB)`);
    } catch (e:any) {
      setFlash('Error Facturae: ' + String(e?.message || e));
    } finally { setBusyXades(false); }
  };

  const exportPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text(`Factura ${serie}${numero}`, 14, 20);
    // Tabla y totales (mínimo)
    // @ts-ignore
    autoTable(doc, { startY: 40, head: [['Desc','Cant','Precio','IVA','Total']], body:
      lineas.map(l => [l.descripcion, l.cantidad, l.precio.toFixed(2), `${l.iva}%`, (l.cantidad*l.precio*(1+l.iva/100)).toFixed(2)]) });
    const y = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total: ${total.toFixed(2)} €`, 160, y, { align: 'right' });
    if (showQR) {
      const url = await toDataURL(window.location.href);
      doc.addImage(url, 'PNG', 14, y, 32, 32);
    }
    doc.save(`factura-${serie}${numero}.pdf`);
  };

  return (
    <div className="p-6">
      <Link href="/facturas" className="text-blue-600 mb-4 inline-block">← Volver a Facturas</Link>
      <h1 className="text-2xl font-semibold mb-6">Crear Factura</h1>

      {flash && <div className="mb-4 text-sm rounded border bg-slate-50 px-3 py-2">{flash}</div>}

      <form onSubmit={handleGuardar} className="bg-white p-6 rounded shadow space-y-6" data-invoice-form>
        <div className="flex gap-4">
          <input className="border rounded p-2 flex-1" placeholder="Serie" value={serie} onChange={e=>setSerie(e.target.value)} />
          <input className="border rounded p-2 flex-1" placeholder="Número" value={numero} onChange={e=>setNumero(e.target.value)} />
        </div>

        <div className="flex gap-4">
          <select className="border rounded p-2 flex-1" value={clienteId} onChange={e=>setClienteId(e.target.value)}>
            <option value="">Selecciona cliente</option>
            {clientes.map(c=> <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>

          {/* ⬇️ AÑADIDO: los 3 tipos */}
          <select className="border rounded p-2 flex-1" value={tipo} onChange={e=>setTipo(e.target.value as InvoiceType)}>
            <option value="completa">Factura Completa</option>
            <option value="simplificada">Factura Simplificada</option>
            <option value="rectificativa">Factura Rectificativa</option>
          </select>
        </div>

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

        <div className="flex items-center gap-4">
          <label><input type="checkbox" checked={showQR} onChange={e=>setShowQR(e.target.checked)} /> Mostrar QR</label>
          <div className="ml-auto">
            Subtotal: {subtotal.toFixed(2)}€ · IVA: {ivaTotal.toFixed(2)}€ · <b>Total: {total.toFixed(2)}€</b>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button type="submit" disabled={busySave} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
            {busySave ? 'Guardando…' : 'Guardar Factura'}
          </button>
          <button type="button" onClick={exportPDF} className="px-4 py-2 bg-gray-200 rounded">Exportar PDF</button>
          <button type="button" onClick={descargarFacturae} disabled={busyXades} className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50">
            {busyXades ? 'Firmando…' : 'Descargar Facturae'}
          </button>
        </div>
      </form>

      <VeriFactuQR enabled={showQR && !!payloadQR} payload={payloadQR} />
    </div>
  );
}
