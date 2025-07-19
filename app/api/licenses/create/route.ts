// app/api/licenses/create/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

interface License {
  key: string;
  active: boolean;
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Comprueba sesión
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    const { active } = (await request.json()) as { active: boolean };
    const newKey = uuidv4().toUpperCase();

    const { data, error } = await supabase
      .from("licenses")
      .insert([{ key: newKey, active }]);

    // Casteamos a License[] antes de usar length
    const inserted = Array.isArray(data) ? (data as License[]) : null;

    if (error || !inserted || inserted.length === 0) {
      const msg = error?.message ?? "No se pudo crear la licencia";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    return NextResponse.json({ license: inserted[0] });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Error interno" },
      { status: 500 }
    );
  }
}

