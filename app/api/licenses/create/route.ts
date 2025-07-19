// app/api/licenses/create/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  // Inicializa el cliente de Supabase para Route Handlers
  const supabase = createRouteHandlerClient({ cookies });

  // Obtén la sesión actual
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  try {
    // Lee el parámetro `active` del body
    const { active } = await request.json();

    // Genera una clave única
    const newKey = uuidv4().toUpperCase();

    // Inserta la nueva licencia
    const { data, error } = await supabase
      .from("licenses")
      .insert([{ key: newKey, active }]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Devuelve la licencia creada
    return NextResponse.json({ license: data![0] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Error interno" }, { status: 500 });
  }
}
