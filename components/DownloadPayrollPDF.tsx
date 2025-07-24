'use client';

import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import React from 'react';

type Props = {
  nominas: {
    id: number;
    empleado_id: number;
    fecha_emision: string;
    salario_bruto: number;
    estado: string;
  }[];
};

const styles = StyleSheet.create({
  page: { padding: 30 },
  section: { marginBottom: 10 },
  bold: { fontWeight: 'bold' },
});

const PDFDocument = ({ nominas }: Props) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.bold}>Listado de Nóminas</Text>
      {nominas.map((n) => (
        <View key={n.id} style={styles.section}>
          <Text>Empleado ID: {n.empleado_id}</Text>
          <Text>Fecha: {n.fecha_emision}</Text>
          <Text>Salario bruto: {n.salario_bruto} €</Text>
          <Text>Estado: {n.estado}</Text>
        </View>
      ))}
    </Page>
  </Document>
);

export default function DownloadPayrollPDF({ nominas }: Props) {
  return (
    <PDFDownloadLink
      document={<PDFDocument nominas={nominas} />}
      fileName="nominas.pdf"
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
    >
      {({ loading }) => (loading ? 'Generando PDF...' : 'Exportar PDF')}
    </PDFDownloadLink>
  );
}
