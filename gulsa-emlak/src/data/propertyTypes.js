export const PROPERTY_TYPES = [
  { value: 'daire',       label: 'Daire' },
  { value: 'villa',       label: 'Villa' },
  { value: 'mustakil',    label: 'Müstakil Ev' },
  { value: 'arsa',        label: 'Arsa' },
  { value: 'isyeri',      label: 'İşyeri' },
  { value: 'ofis',        label: 'Ofis' },
  { value: 'depo',        label: 'Depo / Antrepo' },
  { value: 'tarla',       label: 'Tarla' },
  { value: 'bag_bahce',   label: 'Bağ / Bahçe' },
  { value: 'ciftlik',     label: 'Çiftlik' },
  { value: 'konut',       label: 'Konut' },
  { value: 'diger',       label: 'Diğer' },
]

export const PROPERTY_STATUS = [
  { value: 'available', label: 'Satılık / Kiralık', color: 'green'  },
  { value: 'sold',      label: 'Satıldı',           color: 'blue'   },
  { value: 'rented',    label: 'Kiralandı',          color: 'purple' },
  { value: 'reserved',  label: 'Rezerve',            color: 'amber'  },
]

export const ROOMS = [
  '1+0', '1+1', '2+1', '3+1', '4+1', '4+2', '5+1', '5+2', '6+1', '6+2', '7+1', '8+1'
]

export const HEATING_TYPES = [
  { value: 'dogalgaz',    label: 'Doğalgaz' },
  { value: 'merkezi',     label: 'Merkezi ısıtma' },
  { value: 'soba',        label: 'Soba' },
  { value: 'klima',       label: 'Klima' },
  { value: 'yerden',      label: 'Yerden ısıtma' },
  { value: 'jeotermal',   label: 'Jeotermal' },
  { value: 'yok',         label: 'Isıtma yok' },
]

export const CURRENCY_SYMBOLS = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
}

export function formatPrice(price, currency = 'TRY') {
  if (!price && price !== 0) return '-'
  const sym = CURRENCY_SYMBOLS[currency] || currency
  return `${price.toLocaleString('tr-TR')} ${sym}`
}

export function getTypeLabel(value) {
  return PROPERTY_TYPES.find(t => t.value === value)?.label || value
}

export function getStatusInfo(value) {
  return PROPERTY_STATUS.find(s => s.value === value) || { label: value, color: 'gray' }
}
