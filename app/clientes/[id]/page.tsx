// app/clientes/[id]/page.tsx
import React from "react";
import ClientePage from "./ClientePage";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <ClientePage id={params.id} />;
}
