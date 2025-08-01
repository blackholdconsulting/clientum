import React from "react";
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// 🎨 Estilos tipo Holded
const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, backgroundColor: "#fff", fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { width: 100, height: 50 },
  companyInfo: { textAlign: "right" },
  title: { fontSize: 24, marginBottom: 20, color: "#333", textAlign: "center" },
  section: { marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  bold: { fontWeight: "bold" },
  tableHeader: { flexDirection: "row", backgroundColor: "#f5f5f5", borderBottom: "1px solid #ccc", padding: 5 },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #eee", padding: 5 },
  footer: { marginTop: 30, textAlign: "center", fontSize: 10, color: "#777" },
});

export default function FacturaPDF({ factura }: { factura: any }) {
  // Permitir múltiples líneas si factura.json_factura.conceptos existe
  const conceptos = factura.json_factura?.conceptos || [
    {
      descripcion: factura.concepto || "Servicio",
      cantidad: 1,
      precio: factura.base_imponib,
      iva: factura.iva_percent,
    },
  ];

  const totalIVA = conceptos.reduce((sum: number, c: any) => sum + (c.cantidad * c.precio * c.iva) / 100, 0);
  const totalBase = conceptos.reduce((sum: number, c: any) => sum + c.cantidad * c.precio, 0);
  const total = totalBase + totalIVA;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header con logo y datos */}
        <View style={styles.header}>
          <Image src="/logo.png" style={styles.logo} />
          <View style={styles.companyInfo}>
            <Text>BlackHold Consulting</Text>
            <Text>NIF: B12345678</Text>
            <Text>Calle Mayor 1, Madrid</Text>
            <Text>Email: info@blackholdconsulting.com</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>Factura #{factura.numero}</Text>

        {/* Datos de factura */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text>Fecha emisión:</Text>
            <Text>{factura.fecha_emisor}</Text>
          </View>
          <View style={styles.row}>
            <Text>Fecha vencimiento:</Text>
            <Text>{factura.fecha_vencim}</Text>
          </View>
          <View style={styles.row}>
            <Text>Cliente:</Text>
            <Text>{factura.receptor || factura.cliente_id}</Text>
          </View>
        </View>

        {/* Tabla de conceptos */}
        <View style={styles.tableHeader}>
          <Text style={{ width: "40%" }}>Descripción</Text>
          <Text style={{ width: "15%", textAlign: "right" }}>Cantidad</Text>
          <Text style={{ width: "15%", textAlign: "right" }}>Precio</Text>
          <Text style={{ width: "15%", textAlign: "right" }}>IVA %</Text>
          <Text style={{ width: "15%", textAlign: "right" }}>Total</Text>
        </View>

        {conceptos.map((c: any, i: number) => (
          <View style={styles.tableRow} key={i}>
            <Text style={{ width: "40%" }}>{c.descripcion}</Text>
            <Text style={{ width: "15%", textAlign: "right" }}>{c.cantidad}</Text>
            <Text style={{ width: "15%", textAlign: "right" }}>{c.precio.toFixed(2)} €</Text>
            <Text style={{ width: "15%", textAlign: "right" }}>{c.iva}%</Text>
            <Text style={{ width: "15%", textAlign: "right" }}>
              {(c.cantidad * c.precio * (1 + c.iva / 100)).toFixed(2)} €
            </Text>
          </View>
        ))}

        {/* Totales */}
        <View style={{ marginTop: 20 }}>
          <View style={styles.row}>
            <Text>Base imponible:</Text>
            <Text>{totalBase.toFixed(2)} €</Text>
          </View>
          <View style={styles.row}>
            <Text>IVA total:</Text>
            <Text>{totalIVA.toFixed(2)} €</Text>
          </View>
          <View style={[styles.row, { marginTop: 10 }]}>
            <Text style={styles.bold}>Total a pagar:</Text>
            <Text style={styles.bold}>{total.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>Gracias por confiar en BlackHold Consulting</Text>
      </Page>
    </Document>
  );
}
