const ETA_SANDBOX = 'https://sandbox.api.invoicing.eta.gov.eg'
const ETA_PROD = 'https://api.invoicing.eta.gov.eg'

interface EtaConfig {
  clientId: string
  clientSecret: string
  env: 'sandbox' | 'production'
  companyTaxId: string
}

let tokenCache: { token: string; expires: number } | null = null

async function getToken(config: EtaConfig): Promise<string> {
  if (tokenCache && tokenCache.expires > Date.now()) return tokenCache.token

  const base = config.env === 'sandbox' ? ETA_SANDBOX : ETA_PROD
  const res = await fetch(`${base}/api/v1/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'client_credentials',
    }),
  })
  const data = await res.json() as { access_token?: string; expires_in?: number }
  if (!data.access_token) throw new Error('ETA auth failed')

  tokenCache = { token: data.access_token, expires: Date.now() + (data.expires_in ?? 3600) * 1000 }
  return data.access_token
}

export async function submitReceipt(
  config: EtaConfig,
  receipt: {
    orderNumber: string
    orderDate: string
    customerName: string
    customerTaxId?: string
    items: { name: string; qty: number; unitPrice: number; total: number }[]
    total: number
    vatAmount: number
    totalWithVat: number
  }
) {
  const base = config.env === 'sandbox' ? ETA_SANDBOX : ETA_PROD
  const token = await getToken(config)

  const res = await fetch(`${base}/api/v1/documentsubmissions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      documents: [{
        documentType: 'r',
        issuer: { address: { country: 'EG' }, type: 'B' },
        receiver: {
          name: receipt.customerName,
          address: { country: 'EG' },
          type: 'P',
          ...(receipt.customerTaxId ? { taxId: receipt.customerTaxId } : {}),
        },
        documentTypeVersion: '1.0',
        dateTimeIssued: receipt.orderDate,
        taxActivityCode: '0101',
        invoiceLines: receipt.items.map((item, i) => ({
          natureOfItem: item.name,
          internalCode: `${receipt.orderNumber}-${i}`,
          itemType: 'GS1',
          itemCode: `${receipt.orderNumber}-${i}`,
          unitType: 'EA',
          quantity: item.qty,
          unitValue: { currencySold: 'EGP', amountSold: item.unitPrice },
          itemsTotal: item.total,
          valueDifference: item.total,
          totalTaxableFees: 0,
          netTotal: item.total,
          itemsDiscount: 0,
          discount: { rate: 0, amount: 0 },
          taxableItems: [{ taxType: 'T1', amount: item.total, subType: 'S', rate: 14 }],
          taxTotals: [{ taxType: 'T1', amount: item.total * 0.14 }],
        })),
        totalSales: receipt.total,
        totalDiscount: 0,
        netSales: receipt.total,
        totalAmount: receipt.totalWithVat,
        totalItemsDiscount: 0,
        extraDiscount: 0,
        taxTotals: [{ taxType: 'T1', amount: receipt.vatAmount }],
        totalOtherChargesFees: 0,
        documentNote: `Order ${receipt.orderNumber}`,
      }],
    }),
  })

  const data = await res.json() as { acceptedDocuments?: { uuid: string }[]; rejectedDocuments?: { error: { message: string } }[] }
  if (data.rejectedDocuments?.length) {
    throw new Error(`ETA rejected: ${data.rejectedDocuments[0].error.message}`)
  }
  return data.acceptedDocuments?.[0]?.uuid
}
