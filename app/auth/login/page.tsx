import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Login() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-semibold mb-6">Bienvenido a Clientum</h1>
      <form
        className="flex flex-col items-center space-y-4"
        action="/auth/sign-in"
        method="post"
      >
        <input
          className="border border-gray-300 p-2 rounded"
          name="email"
          type="email"
          placeholder="Tu correo"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Enviar enlace mágico
        </button>
      </form>
    </main>
  );
}
