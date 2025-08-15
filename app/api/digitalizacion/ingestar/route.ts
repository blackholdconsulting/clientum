export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { sha256Hex } from '@/lib/digitalizacion';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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
    const { data: userRes } = await supabaseAnon.auth.getUser(accessToken ?? undefined);
    const userId = userRes?.user?.id;
    if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

    const form = await req.formData();
    const file = form.get('file') as File | null;
    const batchId = (form.get('batchId') as string) || null;
    if (!file) return NextResponse.json({ error: 'Falta file' }, { status: 400 });

    const supabaseSrv = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let effBatchId = batchId;
    if (!effBatchId) {
      const { data: openBatch } = await supabaseSrv
        .from('scan_batches')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'open')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (openBatch?.id) {
        effBatchId = openBatch.id;
      } else {
        const { data: created, error: cErr } = await supabaseSrv
          .from('scan_batches')
          .insert({ user_id: userId, status: 'open' })
          .select('id')
          .single();
        if (cErr) throw new Error('No se pudo crear batch: ' + cErr.message);
        effBatchId = created.id;
      }
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const sha256 = sha256Hex(buf);

    const storagePath = `${userId}/${effBatchId}/${file.name}`;
    const { error: upErr } = await supabaseSrv.storage
      .from('scans')
      .upload(storagePath, buf, { contentType: file.type || 'application/octet-stream', upsert: true });
    if (upErr) throw new Error('No se pudo subir a storage: ' + upErr.message);

    const { data: inserted, error: iErr } = await supabaseSrv
      .from('scan_docs')
      .insert({
        batch_id: effBatchId,
        user_id: userId,
        filename: file.name,
        mime: file.type || 'application/octet-stream',
        size_bytes: buf.length,
        sha256,
        storage_path: storagePath,
      })
      .select('id, filename, mime, size_bytes, sha256, storage_path')
      .single();
    if (iErr) throw new Error('No se pudo registrar documento: ' + iErr.message);

    await supabaseSrv.from('scan_events').insert({
      user_id: userId,
      batch_id: effBatchId,
      doc_id: inserted.id,
      type: 'upload',
      details: { filename: file.name, sha256 },
    });

    return NextResponse.json({ ok: true, batchId: effBatchId, doc: inserted });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Error' }, { status: 500 });
  }
}
