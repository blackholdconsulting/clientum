import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString();
  const yearEnd = new Date(new Date().getFullYear(), 11, 31).toISOString();

  const { data: facturas } = await supabase
    .from("facturas")
    .select("total, estado, fecha_emision")
    .eq("user_id", user.id)
    .gte("fecha_emision", yearStart)
    .lte("fecha_emision", yearEnd);

  const { data: opex } = await supabase
    .from("opex")
    .select("monto, fecha")
    .eq("user_id", user.id)
    .gte("fecha", yearStart)
    .lte("fecha", yearEnd);

  const { data: capex } = await supabase
    .from("capex")
    .select("monto, fecha")
    .eq("user_id", user.id)
    .gte("fecha", yearStart)
    .lte("fecha", yearEnd);

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const chartData = meses.map((mes, idx) => {
    const start = new Date(new Date().getFullYear(), idx, 1);
    const end = new Date(new Date().getFullYear(), idx + 1, 0);

    const ingresosMes = facturas
      ?.filter(
        (f) =>
          new Date(f.fecha_emision) >= start &&
          new Date(f.fecha_emision) <= end &&
          f.estado === "pagada"
      )
      .reduce((acc, curr) => acc + Number(curr.total), 0) || 0;

    const gastosOpex = opex
      ?.filter((g) => new Date(g.fecha) >= start && new Date(g.fecha) <= end)
      .reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;

    const gastosCapex = capex
      ?.filter((g) => new Date(g.fecha) >= start && new Date(g.fecha) <= end)
      .reduce((acc, curr) => acc + Number(curr.monto), 0) || 0;

    return {
      mes,
      ingresos: ingresosMes,
      gastos: gastosOpex + gastosCapex,
    };
  });

  return NextResponse.json(chartData);
}
