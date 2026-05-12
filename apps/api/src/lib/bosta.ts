interface BostaDeliveryInput {
  orderNumber: string
  customerName: string
  customerPhone: string
  governorate: string
  addressLine: string
  codAmount: number
  notes?: string
}

interface BostaDeliveryResult {
  trackingNumber: string
  awbUrl: string
  deliveryId: string
}

export async function createBostaDelivery(
  apiKey: string,
  businessId: string,
  input: BostaDeliveryInput
): Promise<BostaDeliveryResult> {
  const governorateMap: Record<string, string> = {
    cairo: 'Cairo', giza: 'Giza', alexandria: 'Alexandria',
    qaliubiya: 'Qaliubiya', sharqia: 'Sharqia', dakahlia: 'Dakahlia',
    gharbia: 'Gharbia', monufia: 'Monufia', beheira: 'Beheira',
    kafr_el_sheikh: 'Kafr El Sheikh', damietta: 'Damietta',
    port_said: 'Port Said', ismailia: 'Ismailia', suez: 'Suez',
    fayoum: 'Fayoum', beni_suef: 'Beni Suef', minya: 'Minya',
    asyut: 'Asyut', sohag: 'Sohag', qena: 'Qena',
    luxor: 'Luxor', aswan: 'Aswan', red_sea: 'Red Sea',
    north_sinai: 'North Sinai', south_sinai: 'South Sinai',
    matruh: 'Matruh', new_valley: 'New Valley',
  }

  const res = await fetch('https://api.bosta.co/v2/deliveries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': apiKey,
      'X-Bosta-Business': businessId,
    },
    body: JSON.stringify({
      type: 10,
      spec: {
        packageType: 'Parcel',
        description: input.notes ? `طلب ${input.orderNumber}: ${input.notes}` : `طلب ${input.orderNumber}`,
      },
      receiver: {
        firstName: input.customerName,
        lastName: '.',
        phone: input.customerPhone,
        email: 'no-reply@irthwellness.co',
      },
      dropOffAddress: {
        city: governorateMap[input.governorate.toLowerCase().replace(/ /g, '_')] || 'Cairo',
        street: input.addressLine || 'N/A',
        buildingNumber: 'N/A',
        apartment: 'N/A',
        floor: 'N/A',
      },
      notes: input.notes,
      allowOpenPackage: false,
      webhookUrl: 'https://api.irthwellness.co/api/v1/webhooks/bosta',
      cod: input.codAmount > 0 ? Math.round(input.codAmount) : undefined,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Bosta API error (${res.status}): ${err}`)
  }

  const data = await res.json() as {
    data?: { _id?: string; trackingNumber?: string; waybill?: { url?: string } }
  }

  const delivery = data.data
  return {
    trackingNumber: delivery?.trackingNumber ?? '',
    awbUrl: delivery?.waybill?.url ?? '',
    deliveryId: delivery?._id ?? '',
  }
}

export async function trackBostaDelivery(apiKey: string, trackingNumber: string) {
  const res = await fetch(`https://api.bosta.co/v2/deliveries/tracking/${trackingNumber}`, {
    headers: { 'Authorization': apiKey },
  })
  if (!res.ok) throw new Error(`Bosta track error (${res.status})`)
  return res.json()
}
