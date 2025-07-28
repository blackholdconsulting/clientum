'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

export default function NominaPDF({ empleado, nomina }: any) {
  const styles = StyleSheet.create({
    page: { padding: 30 },
    section: { marginBottom: 10 },
    bold: { fontWeight: 'bold' },
  })

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.bold}>Recibo de Nómina</Text>
        </View>
        <View style={styles.section}>
          <Text>Empleado: {empleado.nombre}</Text>
          <Text>NIF: {empleado.nif}</Text>
        </View>
        <View style={styles.section}>
          <Text>Fecha emisión: {nomina.fecha_emision}</Text>
          <Text>Salario bruto: {nomina.salario_bruto.toFixed(2)} €</Text>
          <Text>Estado: {nomina.estado}</Text>
        </View>
      </Page>
    </Document>
  )
}
