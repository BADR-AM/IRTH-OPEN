export const EGYPT_SHIPPING_ZONES: Record<string, number> = {
  'cairo': 55, 'giza': 55, 'alexandria': 55,
  'qaliubiya': 65, 'sharqia': 65, 'dakahlia': 65,
  'gharbia': 65, 'monufia': 65, 'beheira': 65,
  'kafr_el_sheikh': 65, 'damietta': 65, 'port_said': 65,
  'ismailia': 65, 'suez': 65,
  'fayoum': 75, 'beni_suef': 75, 'minya': 75,
  'asyut': 75, 'sohag': 75, 'qena': 75,
  'luxor': 75, 'aswan': 75, 'red_sea': 75,
  'north_sinai': 75, 'south_sinai': 75,
  'matruh': 75, 'new_valley': 75,
}

export function calcShipping(governorate: string, orderTotal: number, brand: 'sidr' | 'bereket'): number {
  const freeThreshold = brand === 'sidr' ? 700 : 500
  if (orderTotal >= freeThreshold) return 0
  const key = governorate.toLowerCase().replace(/ /g, '_')
  return EGYPT_SHIPPING_ZONES[key] ?? 75
}

export const VAT_RATE = 0.14

export function calcVat(amount: number): number {
  return Math.round(amount * VAT_RATE * 100) / 100
}

export function generateOrderNumber(brand: 'sidr' | 'bereket', seq: number): string {
  const prefix = brand === 'sidr' ? 'SIDR' : 'BRK'
  const year = new Date().getFullYear()
  return `${prefix}-${year}-${String(seq).padStart(4, '0')}`
}

export const VAT_RATE_PERCENT = 14
