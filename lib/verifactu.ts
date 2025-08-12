// lib/verifactu.ts
import crypto from 'crypto'
import QRCode from 'qrcode'
import { Invoice } from './invoice'

export function canonicalString(i: Invoice, issuerNif: string, prevHash?: string|null) {
  const parts = [issuerNif, i.number, i.issueDate, (i.issueTime ?? '00:00:00'), i.total.toFixed(2), prevHash ?? '']
  return parts.join('|')
}

export function calcHash(i: Invoice, issuerNif: string, prevHash?: string|null) {
  const str = canonicalString(i, issuerNif, prevHash)
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex')
}

export async function buildQR(i: Invoice, issuerNif: string, hash: string) {
  const url = `https://sede.agenciatributaria.gob.es/qr?emisor=${encodeURIComponent(issuerNif)}&num=${encodeURIComponent(i.number)}&fecha=${i.issueDate}&total=${i.total.toFixed(2)}&hash=${hash}`
  const dataUrl = await QRCode.toDataURL(url, { margin: 0 })
  return { url, dataUrl }
}
