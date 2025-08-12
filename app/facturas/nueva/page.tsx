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

import type { Invoice, InvoiceItem, Party, TaxLine } from '@/lib/invoice';

interface Cliente { id: string; nombre: string; nif?: string; direccion?: string; ciudad?: string; provincia?: string; cp?: string; pais?: string; }
interface Perfil {
  id?: string; user_id?: string;
  // NOTA: estos nombres pueden variar; hacemos fallback en el mapper
  nombre_empr?: string; empresa?: string; nombre?: string; razon_social?: string;
  nif?: string; direccion?: string; ciudad?: string; provincia?: string; cp?: string; pais?: string;
  telefono?: string; email?: string; web?: string;
}
interface Cuenta { id: string; codigo: string; nombre: string; }
interface Linea { id: number; descripcion: string; cantidad: number; precio: number; iva: number; cuentaId: string; }

export default function NuevaFacturaPage() {
  const supabase = createPagesBrowserClient();
  const refFactura = useRef<HTMLFormElement>(null);

  // ===== UI base =====
  const [origin, setOrigin] = useState(''); useEffect(() => { setOrigin(window.location.origin); }, []);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);

  // ===== Datos de la factura =====
  const [serie, setSerie] = useState(''); const [numero, setNumero] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [tipo, setTipo] = useState<'factura'|'simplificada'>('factura');
  const [lineas, setLineas] = useState<Linea[]>([{ id: Date.now(), descripcion:'', cantidad:1, precio:0, iva:21, cuentaId:'' }]);
  const [customFields, setCustomFields] = useState(false);
  const [mensajeFinal, setMensajeFinal] = useState(false);
  const [textoFinal, setTextoFinal] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [catCuenta, setCatCuenta] = useState('');
  const [qrOpen, setQrOpen] = useState(false);

  // ===== VERI*FACTU / Facturae =====
  const [orgId, setOrgId] = useState<string>('');      // = user_id (multiusuario)
  const [verifactuQR, setVerifactuQR] = useState<string | null>(null);
  const [busyVF, setBusyVF] = useState(false);
  const [busyFAC, setBusyFAC] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  // Totales
  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  const ivaTotal = lineas.reduce((s, l) => s + l.cantidad * l.precio * (l.iva / 100), 0);
  const total = subtotal + ivaTotal;

  // ===== Helpers: mapper robusto desde PERFIL a Party =====
  const sellerFromPerfil = (p?: Perfil | null): Party => ({
    name: (p?.nombre_empr || p?.empresa || p?.razon_social || p?.nombre || '—').toString(),
    nif: (p?.nif || '—').toString(),
    address: (p?.direccion || '—').toString(),
    city: (p?.ciudad || '—').toString(),
    province: (p?.provincia || '—').toString(),
    zip: (p?.cp || '—').toString(),
    country: (p?.pais || 'ESP').toString(),
  });

  // ===== Carga inicial (perfil por user_id, igual que /profile/page.tsx) =====
  useEffect(() => {
    (async () => {
      const { data: { session} } = await supabase.auth.getSession();
      const uid = session?.user.id;
      if (!uid) { setLoading(false); return; }

      const { data: clientesData } = await supabase.from('clientes').select('id,nombre');
      setClientes(clientesData || []);

      // Traemos TODO el perfil y dejamos que el mapper elija los campos correctos.
      const { data: perfilData } = await supabase
        .from('perfil')
        .select('*')
        .eq('user_id', uid)
        .maybeSingle();
      if (perfilData) setPerfil(perfilData as any);
      setOrgId(uid);

      const { data: cuentasData } = await supabase.from('cuentas').select('id,codigo,nombre');
      setCuentas(cuentasData || []);

      setLoading(false);
    })();
  }, [supabase]);

  // ===== Líneas =====
  const addLinea = () => setLineas(ls => [...ls, { id: Date.now(), descripcion:'', cantidad:1, precio:0, iva:21, cuentaId:'' }]);
  const removeLinea = (id:number) => setLineas(ls => ls.filter(x => x.id !== id));
  const updateLinea = (id:number, f:keyof Omit<Linea,'id'>, v:any) => setLineas(ls => ls.map(x => x.id===id ? { ...x, [f]: v } : x));

  // ===== Ensambla objeto Invoice =====
  async function assembleInvoice(insertedId?: string): Promise<Invoice> {
    const now = new Date();
    const issueDate = now.toISOString().slice(0,10);
    const issueTime = now.toTimeString().slice(0,8);

    // Buyer
    let buyer: Party = { name:'Cliente', nif:'', address:'', city:'', province:'', zip:'', country:'ESP' };
    if (clienteId) {
      const { data: c } = await supabase
        .from('clientes')
        .select('id,nombre,nif,direccion,ciudad,provincia,cp,pais')
        .eq('id', clienteId)
        .maybeSingle();
      if (c) buyer = {
        name: c.nombre || 'Cliente',
        nif: (c as any).nif || '',
        address: (c as any).direccion || '',
        city: (c as any).ciudad || '',
        province: (c as any).provincia || '',
        zip: (c as any).cp || '',
        country: (c as any).pais || 'ESP',
      };
    }

    // Seller desde PERFIL robusto
    const seller = sellerFromPerfil(perfil);

    // Items + taxes
    const items: InvoiceItem[] = lineas.map(l => ({ description:l.descripcion, quantity:l.cantidad, unitPrice:l.precio, taxRate:l.iva }));
    const taxMap = new Map<number, { base:number; quota:number }>();
    lineas.forEach(l => {
      const base = l.cantidad*l.precio; const quota = base*(l.iva/100);
      const prev = taxMap.get(l.iva) || { base:0, quota:0 };
      taxMap.set(l.iva, { base: prev.base + base, quota: prev.quota + quota });
    });
    const taxes: TaxLine[] = Array.from(taxMap.entries()).map(([rate,v]) => ({ rate, base:+v.base.toFixed(2), quota:+v.quota.toFixed(2) }));

    return {
      id: insertedId || `${serie}${numero}`, orgId,
      number: `${serie}${numero}`, series: serie || undefined,
      issueDate, issueTime, seller, buyer, items, taxes, currency:'EUR',
      total: +total.toFixed(2),
    };
  }

  // ===== Guardar + Alta VERI*FACTU =====
  const handleGuardar = async (e:FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) { alert('Usuario no autenticado'); return; }

    const { data: inserted, error } = await supabase
      .from('facturas')
      .insert([{
        user_id: user.id,
        serie, numero, cliente_id: clienteId, tipo: tipo.toUpperCase(),
        lineas: lineas.map(l => ({ descripcion:l.descripcion, cantidad:l.cantidad, precio:l.precio, iva_porc:l.iva, cuenta_id:l.cuentaId })),
        custom_fields: customFields, mensaje_final: mensajeFinal ? textoFinal : null,
        show_qr: showQR, categoria_id: catCuenta
      }]).select('id').single();
    if (error) { alert('Error guardando factura: '+error.message); return; }

    try {
      setBusyVF(true);
      const invoice = await assembleInvoice(inserted?.id);
      const r = await fetch('/api/verifactu/alta', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ invoice }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j?.message || j?.error || 'Alta VERI*FACTU fallida');
      setVerifactuQR(j.qrPngDataUrl || null);
      setFlash('Registro VERI*FACTU generado ✔️');
    } catch (err:any) {
      setFlash('Error VERI*FACTU: ' + String(err?.message || err));
    } finally { setBusyVF(false); }
    setQrOpen(true);
  };

  // ===== Descargar Facturae =====
  const descargarFacturae = async () => {
    try {
      setBusyFAC(true);
      const invoice = await assembleInvoice();
      const res = await fetch('/api/factura-electronica', {
        method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ invoice })
      });
      if (!res.ok) throw new Error(await res.text());
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url;
      a.download = `${invoice.number}.${(res.headers.get('X-Signed')==='false')?'xml':'xsig'}`;
      a.click(); URL.revokeObjectURL(url);
      setFlash((res.headers.get('X-Signed')==='false') ? 'Facturae (sin firmar) descargada' : 'Facturae firmada descargada ✔️');
    } catch (e:any) {
      setFlash('Error Facturae: ' + String(e?.message || e));
    } finally { setBusyFAC(false); }
  };

  // ===== Exportar PDF =====
  const exportPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text(`Factura ${serie}${numero}`, 14, 20);

    // Bloque “Mi perfil” (emisor)
    const s = sellerFromPerfil(perfil);
    doc.setFontSize(10);
    doc.text([
      s.name || '—',
      s.address || '—',
      `${s.zip || '—'} ${s.city || '—'} (${s.province || '—'})`,
      s.country || 'ESP',
      `NIF/CIF: ${s.nif || '—'}`,
      // (opcionales) si los tienes en perfil:
      ...(perfil?.telefono ? [`Tel: ${perfil.telefono}`] : []),
      ...(perfil?.email ?   [`Email: ${perfil.email}`]   : []),
      ...(perfil?.web ?     [`Web: ${perfil.web}`]       : []),
    ], 14, 30);

    // Tabla
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
      const imgData = verifactuQR ? verifactuQR : await toDataURL(`${origin}/facturas/${serie}${numero}`);
      doc.addImage(imgData, 'PNG', 14, finalY+32, 40, 40);
    }

    doc.save(`factura-${serie}${numero}.pdf`);
  };

  if (loading) return <div className="p-6">Cargando datos…</div>;

  return (
    <div className="p-6">
      <Link href="/facturas" className="text-blue-600 mb-4 inline-block">← Volver a Facturas</Link>
      <h1 className="text-2xl font-semibold mb-6">Crear Factura</h1>

      {/* Vista previa: Datos del emisor (Mi perfil) */}
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

      <form onSubmit={handleGuardar} ref={refFactura} className="bg-white p-6 rounded shadow space-y-6">
        {/* Serie y número */}
        <div className="flex gap-4">
          <input type="text" placeholder="Serie" value={serie} onChange={e=>setSerie(e.target.value)} className="border rounded p-2 flex-1" />
          <input type="text" placeholder="Número" value={numero} onChange={e=>setNumero(e.target.value)} className="border rounded p-2 flex-1" />
        </div>

        {/* Cliente y tipo */}
        <div className="flex gap-4">
          <select value={clienteId} onChange={e=>setClienteId(e.target.value)} className="border rounded p-2 flex-1">
            <option value="">Selecciona cliente</option>
            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          <select value={tipo} onChange={e=>setTipo(e.target.value as any)} className="border rounded p-2 flex-1">
            <option value="factura">Factura Completa</option>
            <option value="simplificada">Factura Simplificada</option>
          </select>
        </div>

        {/* Líneas */}
        {lineas.map(l => (
          <div key={l.id} className="grid grid-cols-6 gap-2 items-end">
            <input type="text" placeholder="Descripción" value={l.descripcion} onChange={e=>updateLinea(l.id,'descripcion',e.target.value)} className="col-span-2 border rounded p-2" />
            <input type="number" placeholder="Cant." value={l.cantidad} onChange={e=>updateLinea(l.id,'cantidad',Number(e.target.value))} className="border rounded p-2" />
            <input type="number" placeholder="Precio" value={l.precio} onChange={e=>updateLinea(l.id,'precio',Number(e.target.value))} className="border rounded p-2" />
            <select value={l.iva} onChange={e=>updateLinea(l.id,'iva',Number(e.target.value))} className="border rounded p-2">
              {[4,10,21].map(t => <option key={t} value={t}>{t}%</option>)}
            </select>
            <select value={l.cuentaId} onChange={e=>updateLinea(l.id,'cuentaId',e.target.value)} className="border rounded p-2">
              <option value="">Cuenta</option>
              {cuentas.map(c => <option key={c.id} value={c.id}>{c.codigo} – {c.nombre}</option>)}
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
          <select value={catCuenta} onChange={e=>setCatCuenta(e.target.value)} className="border rounded p-2 ml-auto">
            <option value="">Categoría</option>
            {cuentas.map(c => <option key={c.id} value={c.id}>{c.codigo}</option>)}
          </select>
        </div>

        {mensajeFinal && <textarea placeholder="Texto final..." value={textoFinal} onChange={e=>setTextoFinal(e.target.value)} className="w-full border rounded p-2" />}

        {/* Acciones */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="mb-2">
            <p>Subtotal: {subtotal.toFixed(2)}€</p>
            <p>IVA: {ivaTotal.toFixed(2)}€</p>
            <p className="font-bold">Total: {total.toFixed(2)}€</p>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busyVF} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">{busyVF ? 'Guardando…' : 'Guardar Factura'}</button>
            <button type="button" onClick={exportPDF} className="px-4 py-2 bg-gray-200 rounded">Exportar PDF</button>
            <button type="button" onClick={descargarFacturae} disabled={busyFAC} className="px-4 py-2 bg-emerald-600 text-white rounded disabled:opacity-50">
              {busyFAC ? 'Firmando…' : 'Descargar Facturae'}
            </button>
          </div>
        </div>
      </form>

      {/* Modal QR */}
      <Transition show={qrOpen} as={Fragment}>
        <Dialog open onClose={()=>setQrOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center">
          <Transition.Child as={Fragment} enter="transition-opacity duration-200" enterFrom="opacity-0" enterTo="opacity-100">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child as={Fragment} enter="transition-transform duration-200" enterFrom="scale-95" enterTo="scale-100">
            <div className="bg-white p-6 rounded shadow text-center">
              <Dialog.Title className="text-lg font-semibold mb-4">{verifactuQR ? 'QR VERI*FACTU' : 'Acceso a tu factura'}</Dialog.Title>
              {verifactuQR ? <img src={verifactuQR} alt="QR Verifactu" className="mx-auto" /> : (origin && <ReactQRCode value={`${origin}/facturas/${serie}${numero}`} />)}
              <button onClick={()=>setQrOpen(false)} className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Cerrar</button>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
}
