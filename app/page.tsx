// app/page.tsx
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    // Si el usuario ya está logueado, enviarlo al dashboard
    redirect('/dashboard');
  } else {
    // Si no hay sesión, enviarlo a la nueva página de login con email y contraseña
    redirect('/auth/login');
  }

  return null; // No mostramos nada porque siempre redirige
}
