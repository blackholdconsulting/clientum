// app/profile/page.tsx
'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, ChangeEvent } from 'react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';

interface Perfil {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  idioma?: string;
  nombre_empresa?: string;
  nif?: string;
  direccion?: string;
  ciudad?: string;
  provincia?: string;
  cp?: string;
  pais?: string;
  email?: string;
  web?: string;
  firma?: string;
}

export default function PerfilPage() {
  const supabase = createPagesBrowserClient();
  const [perfil, setPerfil] = useState<Perfil>({ idioma: 'Español' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/usuario/perfil');
        const json = await res.json();
        if (!json.success) {
          setError(json.error);
        } else if (json.perfil) {
          const p: Perfil = json.perfil;
          if (p.firma) {
            const { data: { publicUrl } } = supabase.storage
              .from('firmas')
              .getPublicUrl(p.firma);
            p.firma = publicUrl;
          }
          setPerfil(p);
        } else {
          setPerfil(p => ({ ...p, email: '' }));
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [supabase]);

  if (loading) return <div className="p-6">Cargando perfil…</div>;
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded shadow space-y-6">
      <h1 className="text-2xl font-semibold">Mi perfil</h1>
      {/* Renderiza aquí tu formulario con `perfil` y handlers */}
      <pre>{JSON.stringify(perfil, null, 2)}</pre>
    </div>
  );
}
