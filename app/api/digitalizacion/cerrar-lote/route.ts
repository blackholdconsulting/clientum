export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { buildBatchManifestXML } from '@/lib/digitalizacion';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SIGNER_API_KEY = process.env.SIGNER_API_KEY!;

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const accessToken =
      cookieStore.get('sb-access-token')?.value ??
      cookieStore.get('sb:token')?.value ??
      null;

    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userRes } = await supabaseAnon.auth.getUser(accessToken);
    const userId = userRes?.user?.id;
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const { batchId } = await req.json() as { batchId: string };
    if (!batchId) return NextResponse.json({ error: 'Falta batchId' }, { status: 400 });

    const supabaseSrv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // cargar docs del lote
    const { data: docs, error: dErr } = await supabaseSrv
      .from('scan_docs')
      .select('id, filename, mime, size_bytes, sha256, storage_path')
      .eq('batch_id', batchId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (dErr) throw new Error('No se pudieron cargar documentos: ' + dErr.message);
    if (!docs?.length) return NextResponse.json({ error: 'Lote vacío' }, { status: 400 });

    const { xml, hashChainHex } = buildBatchManifestXML({
      batchId,
      userId,
      docs: docs as any,
    });

    // firmar manifiesto con el proxy existente
    const base =
      process.env.NEXT_PUBLIC_APP_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

    const signRes = await fetch(new URL('/api/sign/xml', base), {
      method: 'POST',
      headers: { 'Content-Type': 'application/xml', 'X-API-Key': SIGNER_API_KEY },
      body: xml,
    });

    if (!signRes.ok) {
      const t = await signRes.text().catch(() => '');
      throw new Error(`Firma falló (${signRes.status}): ${t || 'sin texto'}`);
    }

    const signedBuf = await signRes.arrayBuffer();
    const signedXml = Buffer.from(signedBuf);

    // subir a storage: manifests
    const manifestPath = `${userId}/${batchId}/manifest.xml`;
    const signedPath = `${userId}/${batchId}/manifest-signed.xml`;

    const up1 = await supabaseSrv.storage.from('manifests').upload(manifestPath, xml, {
      contentType: 'application/xml',
      upsert: true,
    });
    if (up1.error) throw new Error('No se pudo subir manifest.xml: ' + up1.error.message);

    const up2 = await supabaseSrv.storage.from('manifests').upload(signedPath, signedXml, {
      contentType: 'application/xml',
      upsert: true,
    });
    if (up2.error) throw new Error('No se pudo subir manifest-signed.xml: ' + up2.error.message);

    // cerrar lote
    const { error: upErr } = await supabaseSrv
      .from('scan_batches')
      .update({
        status: 'sealed',
        sealed_at: new Date().toISOString(),
        manifest_path: manifestPath,
        manifest_signed_path: signedPath,
        hash_chain: hashChainHex,
      })
      .eq('id', batchId)
      .eq('user_id', userId);

    if (upErr) throw new Error('No se pudo cerrar el lote: ' + upErr.message);

    await supabaseSrv.from('scan_events').insert({
      user_id: userId,
      batch_id: batchId,
      type: 'seal',
      details: { hashChainHex, manifest_path: manifestPath, manifest_signed_path: signedPath },
    });

    return NextResponse.json({ ok: true, batchId, manifestPath, signedPath, hashChainHex });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
