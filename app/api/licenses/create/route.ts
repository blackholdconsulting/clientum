// app/api/licenses/create/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  // Inicializa el cliente de Supabase para Route Handlers
  const supabase = createRouteHandlerClient({ cookies });

  // Comprueba sesión de usuario
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    // Lee el body (esperamos { active: boolean })
    const { active } = (await request.json()) as { active: boolean };

    // Genera una clave única
    const newKey = uuidv4().toUpperCase();

    // Inserta la nueva licencia
    const { data, error } = await supabase
      .from("licenses")
      .insert([{ key: newKey, active }]);

    // Si hubo error o data es null/empty, lo manejamos
    if (error || !data || data.length === 0) {
      const msg = error?.message ?? "No se pudo crear la licencia";
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Devolvemos la primera licencia creada
    return NextResponse.json({ license: data[0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error interno" }, { status: 500 });
  }
}

