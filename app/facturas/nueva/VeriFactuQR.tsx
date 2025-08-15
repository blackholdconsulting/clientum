'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { buildRFString, qrDataUrlFromRF, VeriFactuPayload } from '@/lib/verifactu';

type Props = {
  enabled: boolean;
  payload: VeriFactuPayload | null;
};

export default function VeriFactuQR({ enabled, payload }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!enabled || !payload) {
        setDataUrl(null);
        return;
      }
      try {
        const rf = buildRFString(payload);
        const url = await qrDataUrlFromRF(rf); // requiere 'qrcode' instalada para ver el QR
        if (!cancelled) setDataUrl(url);
      } catch {
        if (!cancelled) setDataUrl(null);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [enabled, payload]);

  if (!enabled || !payload) return null;

  return (
    <div className="mt-4 p-3 border rounded-xl bg-white inline-flex items-center gap-3">
      {dataUrl ? (
        <>
          <img src={dataUrl} alt="QR Veri*factu" className="h-28 w-28" />
          <div className="text-sm">
            <div className="font-medium">Veri*factu (RF/QR)</div>
            <div className="text-gray-500">
              Emisor: {payload.issuerTaxId} · Fecha: {payload.issueDate} · Importe:{' '}
              {payload.total.toFixed(2)} €
            </div>
          </div>
        </>
      ) : (
        <div className="text-sm text-gray-500">
          Generando QR… {`(instala "qrcode" para visualizarlo)`}
        </div>
      )}
    </div>
  );
}
