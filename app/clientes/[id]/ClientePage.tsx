// app/clientes/[id]/ClientePage.tsx
"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";
import Layout from "../../../layout";

interface Cliente {
  /* …tus campos… */
}

export default function ClientePage({ id }: { id: string }) {
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  // …resto de tus useState, useEffect, handleSubmit, handleDelete…
  // => en lugar de usar `params.id` lee simplemente `id`
  return (
    <Layout>
      {/* …toda tu UI de edición de cliente… */}
    </Layout>
  );
}
