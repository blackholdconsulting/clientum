import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString();

  // Ingresos del mes (facturas pagadas)
  const { data: facturas, error: errorFacturas } = await supabase
    .from("facturas")
    .select("total, estado, fecha_emision")
    .eq("user_id", user.id)
    .gte("fecha_emision", firstDay)
    .lte("fecha_emision", lastDay);

  if (errorFacturas) return NextResponse.json({ error: errorFacturas.message }, { status: 400 });

  const ingresos = facturas
    ?.filter((f) => f.estado === "pagada")
    .reduce((acc, curr) => acc + Number(curr.total), 0) || 0;

  // Gastos OPEX
  const { data: opex, error: errorOpex } = await supabase
    .from("opex")
    .select("monto, fecha")
    .eq("user_id", user.id)
    .gte("fecha", firstDay)
    .lte("fecha", lastDay);

  if (errorOpex) return NextResponse.json({ error: errorOpex.message }, { status: 400 });

  const totalOpex = opex?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;

  // Gastos CAPEX
  const { data: capex, error: errorCapex } = await supabase
    .from("capex")
    .select("monto, fecha")
    .eq("user_id", user.id)
    .gte("fecha", firstDay)
    .lte("fecha", lastDay);

  if (errorCapex) return NextResponse.json({ error: errorCapex.message }, { status: 400 });

  const totalCapex = capex?.reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;

  // Facturas pendientes
  const facturasPendientes = facturas?.filter((f) => f.estado !== "pagada").length || 0;

  // Beneficio = ingresos - (opex + capex)
  const beneficio = ingresos - (totalOpex + totalCapex);

  return NextResponse.json({
    ingresos,
    gastos: totalOpex + totalCapex,
    beneficio,
    facturasPendientes,
  });
}
