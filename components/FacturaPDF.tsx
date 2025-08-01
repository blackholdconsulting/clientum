import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12 },
  header: { fontSize: 20, textAlign: "center", marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  bold: { fontWeight: "bold" },
  tableHeader: { backgroundColor: "#f0f0f0", padding: 5 },
  tableRow: { flexDirection: "row", borderBottom: "1px solid #ddd", padding: 5 },
});

export default function FacturaPDF({ factura }: { factura: any }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Factura #{factura.numero}</Text>

        <View style={styles.row}>
          <Text>Fecha: {factura.fecha_emisor}</Text>
          <Text>Vencimiento: {factura.fecha_vencim}</Text>
        </View>
        <View style={styles.row}>
          <Text>Emisor: {factura.emisor}</Text>
          <Text>Receptor: {factura.receptor}</Text>
        </View>

        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={{ width: "50%" }}>Concepto</Text>
          <Text style={{ width: "15%", textAlign: "right" }}>Base</Text>
          <Text style={{ width: "15%", textAlign: "right" }}>IVA %</Text>
          <Text style={{ width: "20%", textAlign: "right" }}>Total</Text>
        </View>

        <View style={styles.tableRow}>
          <Text style={{ width: "50%" }}>{factura.concepto}</Text>
          <Text style={{ width: "15%", textAlign: "right" }}>{factura.base_imponib} €</Text>
          <Text style={{ width: "15%", textAlign: "right" }}>{factura.iva_percent} %</Text>
          <Text style={{ width: "20%", textAlign: "right" }}>{factura.total} €</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.bold}>Total a pagar: {factura.total} €</Text>
        </View>
      </Page>
    </Document>
  );
}
