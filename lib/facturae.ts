import axios from 'axios'

export const enviarFacturaAEspaña = async (xml: string) => {
  try {
    const response = await axios.post(
      'https://tu-endpoint-sii.com/api/facturae',
      { xml },
      {
        headers: {
          'Content-Type': 'application/xml',
        },
      }
    )
    return response.data
  } catch (error: any) {
    console.error('Error enviando a SII:', error.response?.data || error.message)
    throw new Error('Error al enviar la factura al SII.')
  }
}
