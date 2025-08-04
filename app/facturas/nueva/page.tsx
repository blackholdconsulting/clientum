// app/facturas/nueva/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import React, {
  useState,
  useEffect,
  Fragment,
  FormEvent,
  useRef
} from 'react';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import ReactQRCode from 'react-qr-code';
import { toDataURL } from 'qrcode';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/lib/supabaseClient';

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
  const refFactura = useRef<HTMLFormElement>(null);

  const [origin, setOrigin] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);

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

  const subtotal = lineas.reduce((s, l) => s + l.cantidad * l.precio, 0);
  const ivaTotal = lineas.reduce((s, l) => s + l.cantidad * l.precio * (l.iva / 100), 0);
  const total = subtotal + ivaTotal;

  useEffect(() => {
    supabase.from('clientes').select('id,nombre').then(({ data }) => setClientes(data || []));
    supabase.from('perfil').select().single().then(({ data }) => {
      if (data) {
        setPerfil({
          nombre_empresa: data.nombre_empresa,
          nif: data.nif,
          direccion: data.direccion,
          ciudad: data.ciudad,
          provincia: data.provincia,
          cp: data.cp,
          pais: data.pais,
          telefono: data.telefono,
          email: data.email,
          web: data.web,
        });
      }
    });
    supabase.from('cuentas').select('id,codigo,nombre').then(({ data }) => setCuentas(data || []));
  }, []);

  const addLinea = () =>
    setLineas(l => [...l, { id: Date.now(), descripcion: '', cantidad: 1, precio: 0, iva: 21, cuentaId: '' }]);
  const removeLinea = (id: number) =>
    setLineas(l => l.filter(x => x.id !== id));
  const updateLinea = (id: number, field: keyof Omit<Linea, 'id'>, value: string | number) =>
    setLineas(l => l.map(x => x.id === id ? { ...x, [field]: value } : x));

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
      return;
    }
    setQrOpen(true);
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
      head: [['Descripción', 'Cant.', 'Precio', 'IVA', 'Total', 'Cuenta']],
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

  return (
    <div className="p-6">
      <Link href="/facturas" className="text-blue-600 mb-4 inline-block">
        ← Volver a Facturas
      </Link>
      <h1 className="text-2xl font-semibold mb-6">Crear Factura</h1>

      <form
        onSubmit={handleGuardar}
        className="bg-white p-6 rounded shadow space-y-6"
        ref={refFactura}
      >
        {/* ...resto del formulario... */}
      </form>

      {/* Acciones */}
      {/* ...botones guardar, exportar, etc... */}

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
                Acceso factura
              </Dialog.Title>
              {origin && (
                <ReactQRCode value={`${origin}/facturas/${serie}${numero}`} />
              )}
              <div className="mt-4">
                <button
                  onClick={() => setQrOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  );
}
