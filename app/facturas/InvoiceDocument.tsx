// app/Facturas/InvoiceDocument.tsx
import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  Font,
} from '@react-pdf/renderer'

// (Opcional) registra tipografía si quieres
// Font.register({
//   family: 'Helvetica',
//   src: 'https://fonts.gstatic.com/s/helvetica/v11/…',
// })

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 12, fontFamily: 'Helvetica' },
  header: { marginBottom: 20, textAlign: 'center' },
  section: { marginBottom: 10 },
  title: { fontSize: 18, marginBottom: 10 },
  row: { flexDirection: 'row', marginBottom: 4 },
  colLabel: { width: '30%', fontWeight: 'bold' },
  colValue: { width: '70%' },
})

export interface InvoiceDocumentProps {
  factura: {
    id: string
    cliente: { Nombre: string }
    fecha_emision: string
    fecha_vencimiento: string
    concepto: string
    base_imponible: number
    iva_percent: number
    iva_total: number
    total: number
    estado: string
  }
}

export default function InvoiceDocument({ factura }: InvoiceDocumentProps) {
  const {
    id,
    cliente,
    fecha_emision,
    fecha_vencimiento,
    concepto,
    base_imponible,
    iva_percent,
    iva_total,
    total,
    estado,
  } = factura

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Factura #{id}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.row}>
            <Text style={styles.colLabel}>Cliente: </Text>
            <Text style={styles.colValue}>{cliente.Nombre}</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.colLabel}>Emisión: </Text>
            <Text style={styles.colValue}>{fecha_emision}</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.colLabel}>Vencimiento: </Text>
            <Text style={styles.colValue}>{fecha_vencimiento}</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.colLabel}>Estado: </Text>
            <Text style={styles.colValue}>{estado}</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.colLabel}>Concepto:</Text>
          <Text>{concepto}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.row}>
            <Text style={styles.colLabel}>Base imponible: </Text>
            <Text style={styles.colValue}>€{base_imponible.toFixed(2)}</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.colLabel}>IVA ({iva_percent}%): </Text>
            <Text style={styles.colValue}>€{iva_total.toFixed(2)}</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.colLabel}>Total: </Text>
            <Text style={styles.colValue}>€{total.toFixed(2)}</Text>
          </Text>
        </View>

        <View style={styles.section}>
          <Text>Gracias por su confianza.</Text>
        </View>
      </Page>
    </Document>
  )
}
