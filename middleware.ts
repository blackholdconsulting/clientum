// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const { pathname, origin } = req.nextUrl;

  // rutas públicas:
  if (
    pathname === "/favicon.ico" ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    pathname === "/auth/login" ||            // ← aquí
    pathname.startsWith("/ayuda") ||
    pathname.startsWith("/soporte")
  ) {
    return NextResponse.next();
  }

  // sesión supabase
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // redirige a /auth/login en lugar de /login
    const loginUrl = new URL("/auth/login", origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/|api/|auth/login$|ayuda|soporte).*)"],
};
