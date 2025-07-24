// app/api/facturas/generar/route.ts

import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import { validateXmlAgainstXsd } from '@/lib/xsdValidator'
import { generateFacturaeXML as buildFacturaXml } from '@/utils/facturae'

export async function POST(request: Request) {
  try {
    const { facturaData } = await request.json()
    
    // 1) Generar XML
    const xml = buildFacturaXml(facturaData)

    // 2) Validar contra XSD
    const xsdPath = path.join(process.cwd(), 'xsd', 'facturae.xsd')
    const { valid, errors } = await validateXmlAgainstXsd(xml, xsdPath)
    if (!valid) {
      return NextResponse.json({ success: false, errors }, { status: 400 })
    }

    // 3) Guardar o enviar
    await fs.writeFile(path.join(process.cwd(), 'out', 'factura.xml'), xml)

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
