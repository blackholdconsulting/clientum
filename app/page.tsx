// app/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Layout from "./layout";

export default function HomePage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [session, setSession] = useState(null);

  // Al montar, intercambiamos tokens de Magic Link y guardamos la sesión
  useEffect(() => {
    async function handleMagicLink() {
      const accessToken = searchParams.get("access_token");
      const refreshToken = searchParams.get("refresh_token");
      if (accessToken && refreshToken) {
        // Establece la sesión en el cliente
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        // Limpia la URL para no repetir el proceso al recargar
        router.replace(window.location.pathname);
      }
    }
    handleMagicLink();

    // Escucha cambios de sesión en vivo
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });
    // Inicializa estado con lo que haya en localStorage (si ha habido sesión previa)
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [searchParams, supabase, router]);

  // Si no hay sesión, mostramos el botón de login (Magic Link)
  if (!session) {
    return (
      <Layout>
        <div className="p-6">
          <h1 className="text-2xl mb-4">Bienvenido a Clientum</h1>
          <button
            onClick={() =>
              supabase.auth.signInWithOtp({ email: window.prompt("Introduce tu email:") || "" })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Enviar enlace mágico
          </button>
        </div>
      </Layout>
    );
  }

  // Con sesión, enseñamos la UI principal
  return (
    <Layout>
      <main className="p-6">
        <h1 className="text-2xl mb-4">Dashboard</h1>
        <p>Estás autenticado como <strong>{session.user.email}</strong>.</p>
        <button
          onClick={() => supabase.auth.signOut().then(() => setSession(null))}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        >
          Cerrar sesión
        </button>
      </main>
    </Layout>
  );
}
