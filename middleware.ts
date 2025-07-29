import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Rutas que requieren autenticación
  const protectedRoutes = [
    "/dashboard",
    "/facturas",
    "/clientes",
    "/proveedores",
    "/presupuestos",
    "/negocio",
    "/NOP",
    "/impuestos",
    "/tesoreria",
    "/contabilidad",
    "/chat",
    "/RR.HH"
  ];

  if (protectedRoutes.some((route) => req.nextUrl.pathname.startsWith(route))) {
    if (!session) {
      const loginUrl = new URL("/auth/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/facturas/:path*",
    "/clientes/:path*",
    "/proveedores/:path*",
    "/presupuestos/:path*",
    "/negocio/:path*",
    "/NOP/:path*",
    "/impuestos/:path*",
    "/tesoreria/:path*",
    "/contabilidad/:path*",
    "/chat/:path*",
    "/RR.HH/:path*",
  ],
};
