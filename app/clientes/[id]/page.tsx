// app/clientes/[id]/page.tsx
import React from "react";
import ClientePage from "./ClientePage";

export default function Page(props: any) {
  const id = props.params.id;
  return <ClientePage id={id} />;
}
