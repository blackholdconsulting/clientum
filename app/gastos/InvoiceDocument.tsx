// app/gastos/InvoiceDocument.tsx
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
} from '@react-pdf/renderer';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  customerName: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}

type InvoiceDocumentProps = {
  data: InvoiceData;
};

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text>Factura nº {data.invoiceNumber}</Text>
        <Text>Fecha: {data.date}</Text>
        <Text>Cliente: {data.customerName}</Text>
      </View>

      <View style={styles.table}>
        {/* Header row */}
        <View style={styles.row}>
          <Text style={styles.cell}>Descripción</Text>
          <Text style={styles.cell}>Cantidad</Text>
          <Text style={styles.cell}>P. Unitario</Text>
          <Text style={styles.cell}>Total</Text>
        </View>
        {/* Data rows */}
        {data.items.map((item, i) => (
          <View style={styles.row} key={i}>
            <Text style={styles.cell}>{item.description}</Text>
            <Text style={styles.cell}>{item.quantity}</Text>
            <Text style={styles.cell}>{item.unitPrice.toFixed(2)} €</Text>
            <Text style={styles.cell}>{item.total.toFixed(2)} €</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text>Subtotal: {data.subtotal.toFixed(2)} €</Text>
        <Text>IVA: {data.tax.toFixed(2)} €</Text>
        <Text>Total: {data.total.toFixed(2)} €</Text>
      </View>
    </Page>
  </Document>
);

// Styles for @react-pdf/renderer
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'OpenSans',
    fontSize: 12,
  },
  header: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  table: {
    // 'table' display isn't supported by @react-pdf; use flex instead
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    border: '1px solid #ddd',
    padding: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
  },
});

export const DownloadInvoiceLink: React.FC<InvoiceDocumentProps> = ({ data }) => (
  <PDFDownloadLink
    document={<InvoiceDocument data={data} />}
    fileName={`Factura-${data.invoiceNumber}.pdf`}
  >
    {({ loading }) => (loading ? 'Generando PDF…' : 'Descargar Factura')}
  </PDFDownloadLink>
);
