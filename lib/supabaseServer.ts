// lib/supabaseServer.ts

import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { headers, cookies } from "next/headers";

// Usa la URL pública y la Service Role Key o la anon si no existe
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY! ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseServer = createServerClient({
  supabaseUrl,
  supabaseKey,
  headers,
  cookies,
});
