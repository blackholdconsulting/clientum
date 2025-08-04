// app/facturas/nueva/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import React, {
  useState,
  useEffect,
  Fragment,
  FormEvent,
  useRef,
} from 'react';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import ReactQRCode from 'react-qr-code';
import { toDataURL } from 'qrcode';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

interface Cliente { id: string; nombre: string; }
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
interface Cuenta { id: string; codigo: string; nombre: string; }
interface Linea {
  id: number;
  descripcion: string;
  cantidad: number;
  precio: number;
  iva: number;
  cuentaId: string;
}

export default function NuevaFacturaPage() {
  const supabase = createPagesBrowserClient();
  const refFactura = useRef<HTMLFormElement>(null);

  // Estado de origen (para QR)
  const [origin, setOrigin] = useState('');
  useEffect(() => {
    // Esto solo corre en cliente
    setOrigin(window.location.origin);
  }, []);

  // Datos maestros
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);

  // Campos de factura
  const [serie, setSerie] = useState('');
  const [numero, setNumero] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [tipo, setTipo] = useState<'factura' | 'simplificada'>('factura');
  const [lineas, setLineas] = useState<Linea[]>([
    { id: Date.now(), descripcion: '', cantidad: 1, precio: 0, iva: 21, cuentaId: '' }
  ]);
  const [customFields, setCustomFields] = useState(false);
  const [mensajeFinal, setMensajeFinal] = useState(false);
  const [textoFinal, setTextoFinal] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [catCuenta, setCatCuenta] = useState('');
  const [qrOpen, setQrOpen] = useState(false);

  // Totales
  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  const ivaTotal = lineas.reduce((s, l) => s + l.cantidad * l.precio * (l.iva / 100), 0);
  const total = subtotal + ivaTotal;

  // Carga inicial de datos
  useEffect(() => {
    (async () => {
      const { data: clientesData } = await supabase.from('clientes').select('id,nombre');
      setClientes(clientesData || []);

      const { data: perfilData } = await supabase.from('perfil').select().single();
      if (perfilData) {
        setPerfil({
          nombre_empresa: perfilData.nombre_empresa,
          nif: perfilData.nif,
          direccion: perfilData.direccion,
          ciudad: perfilData.ciudad,
          provincia: perfilData.provincia,
          cp: perfilData.cp,
          pais: perfilData.pais,
          telefono: perfilData.telefono,
          email: perfilData.email,
          web: perfilData.web,
        });
      }

      const { data: cuentasData } = await supabase.from('cuentas').select('id,codigo,nombre');
      setCuentas(cuentasData || []);

      setLoading(false);
    })();
  }, [supabase]);

  const addLinea = () =>
    setLineas(ls => [...ls, { id: Date.now(), descripcion: '', cantidad: 1, precio: 0, iva: 21, cuentaId: '' }]);
  const removeLinea = (id: number) =>
    setLineas(ls => ls.filter(x => x.id !== id));
  const updateLinea = (id: number, field: keyof Omit<Linea, 'id'>, value: any) =>
    setLineas(ls => ls.map(x => x.id === id ? { ...x, [field]: value } : x));

  const handleGuardar = async (e: FormEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      alert('Usuario no autenticado');
      return;
    }

    const { error } = await supabase.from('facturas').insert([{
      user_id: user.id,
      serie,
      numero,
      cliente_id: clienteId,
      tipo: tipo.toUpperCase(),
      lineas: lineas.map(l => ({
        descripcion: l.descripcion,
        cantidad: l.cantidad,
        precio: l.precio,
        iva_porc: l.iva,
        cuenta_id: l.cuentaId
      })),
      custom_fields: customFields,
      mensaje_final: mensajeFinal ? textoFinal : null,
      show_qr: showQR,
      categoria_id: catCuenta
    }]);

    if (error) {
      alert('Error guardando factura: ' + error.message);
    } else {
      setQrOpen(true);
    }
  };

  const exportPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Factura ${serie}${numero}`, 14, 20);

    if (perfil) {
      doc.setFontSize(10);
      doc.text([
        perfil.nombre_empresa,
        perfil.direccion,
        `${perfil.cp} ${perfil.ciudad} (${perfil.provincia})`,
        perfil.pais,
        `NIF/CIF: ${perfil.nif}`,
        `Tel: ${perfil.telefono}`,
        `Email: ${perfil.email}`,
        `Web: ${perfil.web}`,
      ], 14, 30);
    }

    // @ts-ignore
    autoTable(doc, {
      startY: 70,
      head: [['Desc.', 'Cant.', 'Precio', 'IVA', 'Total', 'Cuenta']],
      body: lineas.map(l => [
        l.descripcion,
        String(l.cantidad),
        l.precio.toFixed(2),
        `${l.iva}%`,
        (l.cantidad * l.precio * (1 + l.iva / 100)).toFixed(2),
        cuentas.find(c => c.id === l.cuentaId)?.codigo || '',
      ]),
    });

    const finalY = (doc as any).lastAutoTable.finalY || 100;
    doc.setFontSize(10);
    doc.text(`Subtotal: ${subtotal.toFixed(2)} €`, 140, finalY + 10, { align: 'right' });
    doc.text(`IVA: ${ivaTotal.toFixed(2)} €`, 140, finalY + 16, { align: 'right' });
    doc.setFontSize(12);
    doc.text(`Total: ${total.toFixed(2)} €`, 140, finalY + 24, { align: 'right' });

    if (showQR && origin) {
      const qrData = `${origin}/facturas/${serie}${numero}`;
      const imgData = await toDataURL(qrData);
      doc.addImage(imgData, 'PNG', 14, finalY + 32, 40, 40);
    }

    doc.save(`factura-${serie}${numero}.pdf`);
  };

  if (loading) {
    return <div className="p-6">Cargando datos…</div>;
  }

  return (
    <div className="p-6">
      <Link href="/facturas" className="text-blue-600 mb-4 inline-block">
        ← Volver a Facturas
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Crear Factura</h1>

      <form onSubmit={handleGuardar} ref={refFactura} className="bg-white p-6 rounded shadow space-y-6">
        {/* Serie y número */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Serie"
            value={serie}
            onChange={e => setSerie(e.target.value)}
            className="border rounded p-2 flex-1"
          />
          <input
            type="text"
            placeholder="Número"
            value={numero}
            onChange={e => setNumero(e.target.value)}
            className="border rounded p-2 flex-1"
          />
        </div>

        {/* Cliente y tipo */}
        <div className="flex gap-4">
          <select
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
            className="border rounded p-2 flex-1"
          >
            <option value="">Selecciona cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value as any)}
            className="border rounded p-2 flex-1"
          >
            <option value="factura">Factura Completa</option>
            <option value="simplificada">Factura Simplificada</option>
          </select>
        </div>

        {/* Líneas */}
        {lineas.map((l, idx) => (
          <div key={l.id} className="grid grid-cols-6 gap-2 items-end">
            <input
              type="text"
              placeholder="Descripción"
              value={l.descripcion}
              onChange={e => updateLinea(l.id, 'descripcion', e.target.value)}
              className="col-span-2 border rounded p-2"
            />
            <input
              type="number"
              placeholder="Cant."
              value={l.cantidad}
              onChange={e => updateLinea(l.id, 'cantidad', Number(e.target.value))}
              className="border rounded p-2"
            />
            <input
              type="number"
              placeholder="Precio"
              value={l.precio}
              onChange={e => updateLinea(l.id, 'precio', Number(e.target.value))}
              className="border rounded p-2"
            />
            <select
              value={l.iva}
              onChange={e => updateLinea(l.id, 'iva', Number(e.target.value))}
              className="border rounded p-2"
            >
              {[4, 10, 21].map(t => <option key={t} value={t}>{t}%</option>)}
            </select>
            <select
              value={l.cuentaId}
              onChange={e => updateLinea(l.id, 'cuentaId', e.target.value)}
              className="border rounded p-2"
            >
              <option value="">Cuenta</option>
              {cuentas.map(c => <option key={c.id} value={c.id}>{c.codigo} – {c.nombre}</option>)}
            </select>
            <button
              type="button"
              onClick={() => removeLinea(l.id)}
              className="text-red-600"
            >
              ×
            </button>
          </div>
        ))}
        <button type="button" onClick={addLinea} className="text-blue-600">
          + Añadir línea
        </button>

        {/* Opciones finales */}
        <div className="flex items-center gap-4">
          <label>
            <input
              type="checkbox"
              checked={customFields}
              onChange={e => setCustomFields(e.target.checked)}
            /> Campos extra
          </label>
          <label>
            <input
              type="checkbox"
              checked={mensajeFinal}
              onChange={e => setMensajeFinal(e.target.checked)}
            /> Mensaje final
          </label>
          <label>
            <input
              type="checkbox"
              checked={showQR}
              onChange={e => setShowQR(e.target.checked)}
            /> Mostrar QR
          </label>
          <select
            value={catCuenta}
            onChange={e => setCatCuenta(e.target.value)}
            className="border rounded p-2 ml-auto"
          >
            <option value="">Categoría</option>
            {cuentas.map(c => (
              <option key={c.id} value={c.id}>{c.codigo}</option>
            ))}
          </select>
        </div>

        {mensajeFinal && (
          <textarea
            placeholder="Texto final..."
            value={textoFinal}
            onChange={e => setTextoFinal(e.target.value)}
            className="w-full border rounded p-2"
          />
        )}

        <div className="flex justify-between items-center">
          <div>
            <p>Subtotal: {subtotal.toFixed(2)}€</p>
            <p>IVA: {ivaTotal.toFixed(2)}€</p>
            <p className="font-bold">Total: {total.toFixed(2)}€</p>
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
            Guardar Factura
          </button>
          <button type="button" onClick={exportPDF} className="px-4 py-2 bg-gray-200 rounded">
            Exportar PDF
          </button>
        </div>
      </form>

      {/* Modal QR */}
      <Transition show={qrOpen} as={Fragment}>
        <Dialog
          open
          onClose={() => setQrOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" aria-hidden="true" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-200"
            enterFrom="scale-95"
            enterTo="scale-100"
          >
            <div className="bg-white p-6 rounded shadow text-center">
              <Dialog.Title className="text-lg font-semibold mb-4">
                Acceso a tu factura
              </Dialog.Title>
              {origin && (
                <ReactQRCode value={`${origin}/facturas/${serie}${numero}`} />
              )}
              <button
                onClick={() => setQrOpen(false)}
                className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cerrar
              </button>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
}
