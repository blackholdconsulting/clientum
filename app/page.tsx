// app/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    // Redirigir automáticamente si el usuario está loggeado
    redirect('/dashboard');
  } else {
    // Si no hay sesión, redirigir a la landing
    redirect('/landing');
  }

  return null;
}
