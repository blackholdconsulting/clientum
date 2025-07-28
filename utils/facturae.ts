// utils/facturae.ts

export function generateFacturaeXML({
  emisor,
  cliente,
  fecha,
  concepto,
  base,
  iva,
  total,
}: any) {
  return `
  <Factura>
    <Emisor><Nombre>${emisor.nombre}</Nombre><NIF>${emisor.nif}</NIF></Emisor>
    <Cliente><Nombre>${cliente.nombre}</Nombre><NIF>${cliente.nif}</NIF></Cliente>
    <Facturae>
      <FechaEmision>${fecha}</FechaEmision>
      <Concepto>${concepto}</Concepto>
      <BaseImponible>${base.toFixed(2)}</BaseImponible>
      <IVA>${iva.toFixed(2)}</IVA>
      <Total>${total.toFixed(2)}</Total>
    </Facturae>
  </Factura>
  `.trim();
}
