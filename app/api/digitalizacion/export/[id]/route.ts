export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import JSZip from 'jszip';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(_: Request, { params }: { params: { id: string } }) {
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

    const batchId = params.id;

    const supabaseSrv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // lote + docs
    const { data: batch, error: bErr } = await supabaseSrv
      .from('scan_batches')
      .select('*')
      .eq('id', batchId)
      .eq('user_id', userId)
      .single();
    if (bErr || !batch) return NextResponse.json({ error: 'Lote no encontrado' }, { status: 404 });

    const { data: docs, error: dErr } = await supabaseSrv
      .from('scan_docs')
      .select('filename, storage_path')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: true });
    if (dErr) throw new Error('No se pudieron cargar docs: ' + dErr.message);

    const zip = new JSZip();

    // añadir manifest firmado (obligatorio para auditoría)
    if (batch.manifest_signed_path) {
      const { data: mf, error: mfErr } = await supabaseSrv.storage
        .from('manifests')
        .download(batch.manifest_signed_path);
      if (!mfErr && mf) {
        const arr = await mf.arrayBuffer();
        zip.file('manifest-signed.xml', Buffer.from(arr));
      }
    }
    if (batch.manifest_path) {
      const { data: m, error: mErr } = await supabaseSrv.storage
        .from('manifests')
        .download(batch.manifest_path);
      if (!mErr && m) {
        const arr = await m.arrayBuffer();
        zip.file('manifest.xml', Buffer.from(arr));
      }
    }

    // añadir documentos
    for (const d of docs || []) {
      const { data: file, error: fErr } = await supabaseSrv.storage.from('scans').download(d.storage_path);
      if (!fErr && file) {
        const arr = await file.arrayBuffer();
        zip.file(`docs/${d.filename}`, Buffer.from(arr));
      }
    }

    const buf = await zip.generateAsync({ type: 'nodebuffer' });
    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="fz01_batch_${batchId}.zip"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
