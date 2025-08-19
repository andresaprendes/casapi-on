import { shippingZones } from '../data/mockData'

export const FREE_SHIPPING_THRESHOLD = 2000000

export function isFreeShipping(subtotal: number): boolean {
  return subtotal >= FREE_SHIPPING_THRESHOLD
}

export function getZoneBasePrice(zoneName?: string): number {
  if (!zoneName) return 0
  const zone = shippingZones.find(z => z.name === zoneName)
  return zone ? zone.basePrice : 0
}

export function computeShipping(subtotal: number, zoneName?: string): number {
  if (isFreeShipping(subtotal)) return 0
  return getZoneBasePrice(zoneName)
}

export function computeShippingSavings(subtotal: number, zoneName?: string): number {
  if (!isFreeShipping(subtotal)) return 0
  return getZoneBasePrice(zoneName)
}


