import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { buildFacturae322 } from '@/lib/facturae'
import { Invoice, Party } from '@/lib/invoice'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })
  const { invoice } = await req.json() as { invoice: Invoice }

  // Cargar emisor de la org
  const { data: issuer } = await supabase
    .from('org_issuer')
    .select('*')
    .eq('org_id', invoice.orgId)
    .maybeSingle()

  const seller: Party = issuer ? {
    name: issuer.issuer_name,
    nif: issuer.issuer_nif,
    address: issuer.address,
    zip: issuer.zip,
    city: issuer.city,
    province: issuer.province,
    country: issuer.country
  } : invoice.seller

  const i2: Invoice = { ...invoice, seller }  // aseguramos emisor correcto

  const unsignedXml = buildFacturae322(i2)

  // Firma XAdES-BES con Chilkat
  const chilkat = require('@chilkat/ck-node16-win64') // ajusta a tu plataforma
  const cert = new chilkat.Cert()
  const pfxBytes = Buffer.from(process.env.SIGN_P12_BASE64!, 'base64')
  const ok = cert.LoadPfxData(pfxBytes, process.env.SIGN_P12_PASSWORD!)
  if (!ok) return new Response('Certificado inválido', { status: 500 })

  const gen = new chilkat.XmlDSigGen()
  gen.SigLocation = 'fe:Facturae'
  gen.SigLocationMod = 1
  gen.SigNamespacePrefix = 'ds'
  gen.SigNamespaceUri = 'http://www.w3.org/2000/09/xmldsig#'
  gen.SignedInfoPrefixList = ''
  gen.KeyInfoType = 'X509Data'
  gen.X509Type = 'Certificate'
  gen.AddSameDocRef('', 'sha256', 'EXCL_C14N', '', '')
  gen.SetX509Cert(cert, true)

  const xml = new chilkat.Xml()
  xml.LoadXml(unsignedXml)
  if (!gen.CreateXmlDSig(xml)) return new Response('Error firmando XML', { status: 500 })
  const signedXml = xml.GetXml()

  return new Response(signedXml, {
    headers: {
      'Content-Type': 'application/xml',
      'Content-Disposition': `attachment; filename="${invoice.number}.xsig"`
    }
  })
}
