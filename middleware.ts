// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1️⃣ Rutas públicas (sin protección):
  //    • Ayuda y Soporte: /ayuda, /soporte o la que uses
  //    • API de autenticación: /api/
  //    • Activos de Next.js: /_next/
  //    • Favicon
  //    • Página de login (para evitar bucle)
  if (
    pathname.startsWith("/ayuda") ||
    pathname.startsWith("/soporte") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname === "/login"
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Obtiene la sesión de Supabase
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 3️⃣ Si no hay sesión, redirige a /login con callbackUrl
  if (!session) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4️⃣ Si hay sesión, deja pasar
  return res;
}

// 5️⃣ Aplica este middleware a TODAS las rutas excepto las públicas
export const config = {
  matcher: ["/((?!_next|api|login|ayuda|soporte).*)"],
};
