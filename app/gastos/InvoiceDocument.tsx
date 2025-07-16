'use client'
import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// opciones de tipografía
Font.register({
  family: 'OpenSans',
  src: 'https://fonts.gstatic.com/s/opensans/v20/mem8YaGs126MiZpBA-U1UpcaXcl0Aw.ttf'
})

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'OpenSans', fontSize: 12 },
  header: { fontSize: 20, marginBottom: 10, textAlign: 'center' },
  table: { display: 'table', width: 'auto', marginTop: 20 },
  row: { flexDirection: 'row' },
  cell: { flex: 1, border: '1px solid #ddd', padding: 5 },
  footer: { position: 'absolute', bottom: 30, left: 30, right: 30, textAlign: 'center', fontSize: 10 }
})

interface InvoiceDocumentProps {
  factura: {
    id: string
    cliente: { Nombre: string; NIF: string; Dirección: string }
    fecha_emision: string
    fecha_vencimiento: string
    concepto: string
    base_imponible: number
    iva_percent: number
    iva_total: number
    total: number
  }
}

export function InvoiceDocument({ factura }: InvoiceDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Factura Nº {factura.id}</Text>

        <Text>Cliente: {factura.cliente.Nombre}</Text>
        <Text>NIF: {factura.cliente.NIF}</Text>
        <Text>Dirección: {factura.cliente.Dirección}</Text>

        <View style={styles.table}>
          <View style={[styles.row, { backgroundColor: '#eee' }]}>
            {['Concepto', 'Emisión', 'Vencimiento', 'Base', 'IVA %', 'IVA', 'Total'].map((h) => (
              <Text key={h} style={styles.cell}>{h}</Text>
            ))}
          </View>
          <View style={styles.row}>
            <Text style={styles.cell}>{factura.concepto}</Text>
            <Text style={styles.cell}>{factura.fecha_emision}</Text>
            <Text style={styles.cell}>{factura.fecha_vencimiento}</Text>
            <Text style={styles.cell}>€{factura.base_imponible.toFixed(2)}</Text>
            <Text style={styles.cell}>{factura.iva_percent}%</Text>
            <Text style={styles.cell}>€{factura.iva_total.toFixed(2)}</Text>
            <Text style={styles.cell}>€{factura.total.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>Generated with Clientum &supabase</Text>
      </Page>
    </Document>
  )
}
