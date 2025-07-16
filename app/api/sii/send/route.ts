// app/api/sii/send/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { sendToSii } from '@/lib/siiClient';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  // 1) Autenticación
  const { data: { session } } = await getServerSession();
  if (!session) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const userId = session.user.id;

  // 2) Recibimos el XML firmado y el id de factura
  const { facturaId, signedXml } = await request.json() as { facturaId: string; signedXml: string };
  if (!signedXml || !facturaId) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }

  try {
    // 3) Enviamos a SII
    const siiRes = await sendToSii(signedXml);

    // 4) Parseamos estado y código
    const estado = siiRes.CabeceraRespuesta?.EstadoSolicitud || 'DESCONOCIDO';
    const codigo = siiRes.CabeceraRespuesta?.CodigoDescuento || siiRes.CabeceraRespuesta?.CodigoError || '';
    const descripcion = siiRes.CabeceraRespuesta?.Descripcion || '';

    // 5) Guardamos en sii_logs
    await supabase
      .from('sii_logs')
      .insert({
        factura_id: facturaId,
        user_id: userId,
        estado,
        codigo,
        descripcion,
        raw_response: JSON.stringify(siiRes),
      });

    return NextResponse.json({ estado, codigo, descripcion });
  } catch (e: any) {
    console.error('Error enviando SII:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
