// app/facturas/page.tsx
"use client";

import { useState, ChangeEvent } from "react";
import { jsPDF } from "jspdf";
import axios from "axios";
import { buildFacturaeXML, FacturaeData } from "../../lib/facturae";

interface Linea {
  descripcion: string;
  unidades: number;
  precioUnitario: number;
}

export default function FacturasPage() {
  const [serie, setSerie] = useState("A");
  const [numero, setNumero] = useState("");
  const [fecha, setFecha] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [emisor, setEmisor] = useState({ nombre: "DECLARANDO SL", direccion: "", nif: "", cp: "", ciudad: "", email: "" });
  const [receptor, setReceptor] = useState({ nombre: "", direccion: "", cif: "", cp: "", ciudad: "", email: "" });
  const [lineas, setLineas] = useState<Linea[]>([{ descripcion: "", unidades: 1, precioUnitario: 0 }]);
  const [iva, setIva] = useState(21);
  const [irpf, setIrpf] = useState(0);

  const handleLineaChange = (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLineas(L =>
      L.map((l, idx) =>
        idx === i ? { ...l, [name]: name === "descripcion" ? value : parseFloat(value) || 0 } : l
      )
    );
  };
  const addLinea = () => setLineas(L => [...L, { descripcion: "", unidades: 1, precioUnitario: 0 }]);
  const calcularTotales = () => {
    const base = lineas.reduce((s, l) => s + l.unidades * l.precioUnitario, 0);
    const ivaImp = +(base * iva / 100).toFixed(2);
    const irpfImp = +(base * irpf / 100).toFixed(2);
    return { base, ivaImp, irpfImp, total: +(base + ivaImp - irpfImp).toFixed(2) };
  };

  const exportCSV = () => {
    const { base, ivaImp, irpfImp, total } = calcularTotales();
    const header = ["Serie","Número","Fecha","Vencimiento","Emisor","Receptor","Descripción","Unidades","Precio U.","Importe"];
    const rows = lineas.map(l => [serie,numero,fecha,vencimiento,emisor.nombre,receptor.nombre,l.descripcion,l.unidades.toString(),l.precioUnitario.toFixed(2),(l.unidades*l.precioUnitario).toFixed(2)]);
    rows.push(["","","","","","","BASE IMPONIBLE","","",base.toFixed(2)]);
    rows.push(["","","","","","","IVA ("+iva+"%)","","",ivaImp.toFixed(2)]);
    rows.push(["","","","","","","IRPF ("+irpf+"%)","","",-irpfImp.toFixed(2)]);
    rows.push(["","","","","","","TOTAL","","",total.toFixed(2)]);
    const csv = [header,...rows].map(r=>r.map(c=>`"${c.replace(/"/g,'""')}"`).join(",")).join("\r\n")
      +"\r\n\nCondiciones de pago: 30 días netos. Pago por transferencia.";
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download=`factura-${serie}${numero||"NN"}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF({unit:"pt",format:"a4"}); let y=40;
    doc.setFont("helvetica","bold");doc.setFontSize(24);doc.setTextColor(0,102,204);doc.text("Factura",40,y);y+=30;
    doc.setFont("helvetica","normal");doc.setFontSize(12);doc.text(`Serie: ${serie}`,40,y);doc.text(`Número: ${numero}`,200,y);doc.text(`Fecha: ${fecha}`,360,y);y+=16;
    doc.text(`Vencimiento: ${vencimiento}`,40,y);y+=30;
    doc.setFont("helvetica","bold");doc.setFontSize(14);doc.setTextColor(0,102,204);doc.text("Emisor",40,y);doc.text("Receptor",300,y);y+=18;
    doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(60,60,60);
    doc.text(`Nombre: ${emisor.nombre}`,40,y);doc.text(`Nombre: ${receptor.nombre}`,300,y);y+=14;
    doc.text(`Dirección: ${emisor.direccion}`,40,y);doc.text(`Dirección: ${receptor.direccion}`,300,y);y+=14;
    doc.text(`NIF: ${emisor.nif}`,40,y);doc.text(`CIF: ${receptor.cif}`,300,y);y+=14;
    doc.text(`CP y ciudad: ${emisor.cp}`,40,y);doc.text(`CP y ciudad: ${receptor.cp}`,300,y);y+=14;
    doc.text(`Email: ${emisor.email}`,40,y);doc.text(`Email: ${receptor.email}`,300,y);y+=30;
    doc.setFont("helvetica","bold");doc.setFontSize(12);doc.setTextColor(0,102,204);
    ["Descripción","Unidades","Precio U. (€)","Importe (€)"].forEach((h,i)=>doc.text(h,40+i*130,y));y+=16;
    doc.setLineWidth(0.5);doc.line(40,y,550,y);y+=10;
    doc.setFont("helvetica","normal");doc.setTextColor(0,0,0);
    lineas.forEach(l=>{doc.text(l.descripcion,40,y);doc.text(l.unidades.toString(),170,y,{align:"right"});doc.text(l.precioUnitario.toFixed(2),300,y,{align:"right"});doc.text((l.unidades*l.precioUnitario).toFixed(2),430,y,{align:"right"});y+=18;if(y>750){doc.addPage();y=40;}});
    const {base,ivaImp,irpfImp,total} = calcularTotales();y+=20;
    doc.setFont("helvetica","bold");doc.setTextColor(0,102,204);
    doc.text("BASE IMPONIBLE:",300,y);doc.text(base.toFixed(2)+" €",550,y,{align:"right"});y+=16;
    doc.text(`IVA (${iva}%):`,300,y);doc.text(ivaImp.toFixed(2)+" €",550,y,{align:"right"});y+=16;
    doc.text(`IRPF (${irpf}%):`,300,y);doc.text((-irpfImp).toFixed(2)+" €",550,y,{align:"right"});y+=16;
    doc.setFontSize(16);doc.setTextColor(0,0,0);doc.text("TOTAL:",300,y);doc.text(total.toFixed(2)+" €",550,y,{align:"right"});y+=30;
    doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(60,60,60);
    doc.text("Condiciones de pago: 30 días netos.",40,y);y+=14;doc.text("Pago por transferencia: ESXXXXXXXXXXXXXXX9",40,y);
    doc.save(`factura-${serie}${numero}.pdf`);
  };

  const exportXML = () => {
    const data: FacturaeData = { serie,numero,fecha,vencimiento,emisor:{nombre:emisor.nombre,nif:emisor.nif,direccion:emisor.direccion,cp:emisor.cp,ciudad:emisor.ciudad},receptor:{nombre:receptor.nombre,cif:receptor.cif,direccion:receptor.direccion,cp:receptor.cp,ciudad:receptor.ciudad},lineas,iva,irpf };
    const xml = buildFacturaeXML(data);
    const blob = new Blob([xml],{type:"application/xml"}); const url = URL.createObjectURL(blob);
    const a = document.createElement("a");a.href=url;a.download=`facturae-${serie}-${numero}.xml`;a.click();
    URL.revokeObjectURL(url);
  };

  const enviarVerifactu = async () => {
    const data: FacturaeData = { serie,numero,fecha,vencimiento,emisor:{nombre:emisor.nombre,nif:emisor.nif,direccion:emisor.direccion,cp:emisor.cp,ciudad:emisor.ciudad},receptor:{nombre:receptor.nombre,cif:receptor.cif,direccion:receptor.direccion,cp:receptor.cp,ciudad:receptor.ciudad},lineas,iva,irpf };
    const xml = buildFacturaeXML(data);
    const resp = await axios.post<{pdfUrl:string}>(\"https://api.verifactu.com/v1/invoices/upload\",{xml},{headers:{Authorization:`Bearer ${process.env.NEXT_PUBLIC_VERIFACTU_KEY}`}}); 
    window.open(resp.data.pdfUrl,\"_blank\");
  };

  return (
    <div className=\"p-8 max-w-4xl mx-auto space-y-6 bg-gray-50\">
      <h1 className=\"text-2xl font-bold\">Nueva Factura</h1>
      <form className=\"bg-white p-6 rounded shadow space-y-4\">
        {/* Inputs aquí... */}
        <div className=\"flex justify-end space-x-3 pt-4 border-t\">
          <button type=\"button\" onClick={exportCSV} className=\"px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700\">Exportar CSV</button>
          <button type=\"button\" onClick={exportPDF} className=\"px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700\">Descargar PDF</button>
          <button type=\"button\" onClick={exportXML} className=\"px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700\">Descargar XML</button>
          <button type=\"button\" onClick={enviarVerifactu} className=\"px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700\">Enviar a Verifactu</button>
        </div>
      </form>
    </div>
  );
}
