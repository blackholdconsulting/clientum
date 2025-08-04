// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // 1️⃣ RUTAS PÚBLICAS: no aplicamos protección
  if (
    pathname === "/favicon.ico" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/login" ||
    pathname.startsWith("/ayuda") ||
    pathname.startsWith("/soporte")
  ) {
    return NextResponse.next();
  }

  // 2️⃣ Creamos cliente Supabase y comprobamos sesión
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 3️⃣ Si NO hay sesión, redirigimos al login con callback
  if (!session) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4️⃣ Si hay sesión, dejamos pasar
  return res;
}

// 5️⃣ Matcher: aplica middleware a TODO excepto rutas públicas
export const config = {
  matcher: ["/((?!_next/|api/|login$|ayuda|soporte).*)"],
};
