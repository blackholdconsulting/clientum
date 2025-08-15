'use client';

import { useEffect, useMemo, useState } from 'react';
import { collectInvoiceFromForm, verifactuAlta, downloadBlob, xmlFileName } from '@/lib/invoice-signer';

type Props = {
  issuerTaxId: string;          // NIF emisor (mándalo desde tu server page)
  seriesHint?: string;          // opcional: serie mostrada como ayuda
  nextNumberHint?: number;      // opcional: siguiente número (solo display)
};

export default function InvoiceSaveBar({ issuerTaxId, seriesHint, nextNumberHint }: Props) {
  const [busy, setBusy] = useState<null | 'save' | 'qr' | 'xades'>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [rf, setRf] = useState<string | null>(null);
  const [facturaeBase64, setFacturaeBase64] = useState<string | null>(null);
  const [finalSerie, setFinalSerie] = useState<string | null>(null);
  const [finalNumero, setFinalNumero] = useState<number | null>(null);
  const [showQr, setShowQr] = useState<boolean>(false);

  // Lee el <form> de la página
  function getForm(): HTMLFormElement {
    const f =
      (document.getElementById('invoice-form') as HTMLFormElement | null) ||
      (document.querySelector('form[data-invoice-form]') as HTMLFormElement | null) ||
      (document.querySelector('form') as HTMLFormElement | null);
    if (!f) throw new Error('No se encontró el formulario de factura');
    return f;
  }

  async function handleSave() {
    try {
      setBusy('save');
      setToast(null);

      const form = getForm();
      const fd = new FormData(form);

      // Mapear mínimos para /api/facturas
      const paymentMethod = String(fd.get('payment_method') ?? fd.get('payment') ?? 'transfer');
      const payment_iban = String(fd.get('payment_iban') ?? '');
      const payment_paypal = String(fd.get('payment_paypal') ?? '');
      const payment_notes = String(fd.get('payment_notes') ?? '');

      const issueDate =
        String(fd.get('issueDate') ?? fd.get('fecha') ?? '') || new Date().toISOString().slice(0, 10);
      const typeRaw = String(fd.get('type') ?? fd.get('tipo') ?? 'completa').toLowerCase();
      const invoiceType: 'completa' | 'simplificada' | 'rectificativa' =
        typeRaw.startsWith('simp') ? 'simplificada' : typeRaw.startsWith('rect') ? 'rectificativa' : 'completa';

      const total =
        Number(fd.get('total') ?? fd.get('total_amount') ?? (fd.get('totals.total') as any)) || 0;

      const payload = {
        issueDate,
        type: invoiceType,
        totals: { total },
        payment: {
          method: paymentMethod,
          iban: payment_iban || null,
          paypalEmail: payment_paypal || null,
          notes: payment_notes || null,
        },
      };

      const r = await fetch('/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Error al guardar');

      // Guardamos datos clave devueltos
      setFinalSerie(j.series);
      setFinalNumero(j.number);
      setFacturaeBase64(j.facturaeBase64 || null);

      // Actualiza el form para futuras lecturas (collectInvoiceFromForm soporta data-*)
      form.dataset.series = String(j.series);
      form.dataset.number = String(j.number);

      // Si existen inputs ocultos 'serie'/'numero', también los rellenamos
      const inSerie = form.querySelector<HTMLInputElement>('input[name="serie"]');
      const inNumero = form.querySelector<HTMLInputElement>('input[name="numero"]');
      if (inSerie) inSerie.value = String(j.series);
      if (inNumero) inNumero.value = String(j.number);

      setToast(`Guardado: ${j.series}-${String(j.number).padStart(6, '0')}`);
    } catch (e: any) {
      alert(e?.message || e);
    } finally {
      setBusy(null);
    }
  }

  async function handleQr() {
    try {
      setBusy('qr');
      setToast(null);

      const form = getForm();
      const fd = new FormData(form);

      const issueDate =
        String(fd.get('issueDate') ?? fd.get('fecha') ?? '') || new Date().toISOString().slice(0, 10);
      const typeRaw = String(fd.get('type') ?? fd.get('tipo') ?? 'completa').toLowerCase();
      const invoiceType: 'completa' | 'simplificada' | 'rectificativa' =
        typeRaw.startsWith('simp') ? 'simplificada' : typeRaw.startsWith('rect') ? 'rectificativa' : 'completa';

      const total =
        Number(fd.get('total') ?? fd.get('total_amount') ?? (fd.get('totals.total') as any)) || 0;

      // Debe haberse guardado antes (para tener serie/numero finales)
      const serie = finalSerie ?? form.dataset.series ?? '';
      const numero = Number(finalNumero ?? form.dataset.number ?? NaN);
      if (!serie || !Number.isFinite(numero)) {
        throw new Error('Primero guarda la factura para obtener serie y número definitivos.');
      }

      const { rf, qr } = await verifactuAlta({
        issuerTaxId,
        issueDate,
        invoiceType,
        total,
        software: 'Clientum Signer v0.0.1',
        series: String(serie),
        number: Number(numero),
        withQR: true,
      });

      setRf(rf);
      setQrDataUrl(qr?.pngDataUrl || qr?.dataUrl || null);
      if (!qr?.pngDataUrl && !qr?.dataUrl) {
        setToast('RF generado. Para ver el QR, instala la dependencia "qrcode".');
      }
    } catch (e: any) {
      alert(e?.message || e);
    } finally {
      setBusy(null);
    }
  }

  function handleDownloadXAdES() {
    try {
      // Usa el XAdES devuelto por el server si está disponible
      if (facturaeBase64 && finalSerie && finalNumero) {
        const bytes = Uint8Array.from(atob(facturaeBase64), c => c.charCodeAt(0));
        downloadBlob(bytes, xmlFileName(finalSerie, finalNumero, true), 'application/xml');
        return;
      }
      // Fallback: intentar firmar desde el cliente con los datos del form (no preferente)
      const d = collectInvoiceFromForm();
      alert('XAdES no estaba en memoria. Intenta firmar desde el cliente o vuelve a guardar.');
    } catch (e: any) {
      alert(e?.message || e);
    }
  }

  return (
    <div className="mt-4 border rounded-2xl p-4 bg-white">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleSave}
          disabled={busy === 'save'}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {busy === 'save' ? 'Guardando…' : 'Guardar factura'}
        </button>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showQr}
            onChange={e => {
              setShowQr(e.target.checked);
              if (e.target.checked) handleQr();
              else { setQrDataUrl(null); setRf(null); }
            }}
          />
          Mostrar QR (Veri*factu)
        </label>

        <button
          onClick={handleDownloadXAdES}
          disabled={!finalSerie || !finalNumero || busy === 'xades'}
          className="px-4 py-2 rounded-lg border"
          title={!finalSerie ? 'Guarda primero para obtener serie/número' : 'Descargar Facturae (XAdES)'}
        >
          Descargar Facturae (XAdES)
        </button>

        <div className="text-xs text-gray-500 ml-auto">
          {seriesHint ? <>Serie por defecto: <b>{seriesHint}</b>&nbsp;</> : null}
          {Number.isFinite(nextNumberHint as any) ? <>Siguiente nº (orientativo): <b>{nextNumberHint}</b></> : null}
        </div>
      </div>

      {rf && (
        <div className="mt-3 text-xs">
          <div className="font-medium">RF:</div>
          <div className="font-mono break-all">{rf}</div>
        </div>
      )}

      {showQr && qrDataUrl && (
        <div className="mt-3">
          <img src={qrDataUrl} alt="QR Veri*factu" className="w-40 h-40" />
        </div>
      )}

      {toast && <div className="mt-3 text-sm text-green-700">{toast}</div>}
    </div>
  );
}
