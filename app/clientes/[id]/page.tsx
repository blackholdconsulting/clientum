// app/clientes/[id]/page.tsx
import React from "react";
import ClientePage from "./ClientePage";

export default function Page({
  params,
}: {
  params: { id: string };
}) {
  return <ClientePage id={params.id} />;
}
