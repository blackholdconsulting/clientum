// app/clientes/[id]/page.tsx
import React from "react";
import ClientePage from "./ClientePage";

export default function Page(props) {
  // props.params.id existe de todos modos
  return <ClientePage id={props.params.id} />;
}
