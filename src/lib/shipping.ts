/**
 * Shipping utilities for zone-based shipping calculation
 *
 * Zones:
 * - ZONE_1: USA ($8.99)
 * - ZONE_2: Canada, Mexico ($18.99)
 * - ZONE_3: International (not supported - contact required)
 */

export type ShippingZone = 'ZONE_1' | 'ZONE_2' | 'ZONE_3'

export interface ShippingConfig {
  id: string
  zone_1_cost: number
  zone_2_cost: number
  free_shipping_threshold: number
  currency: string
  updated_at: string
}

// Countries by zone
const ZONE_1_COUNTRIES = ['US']
const ZONE_2_COUNTRIES = ['CA', 'MX']

/**
 * Get shipping zone based on country code
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., 'US', 'CA', 'MX')
 * @returns ShippingZone
 */
export function getShippingZone(countryCode: string): ShippingZone {
  const code = countryCode.toUpperCase()

  if (ZONE_1_COUNTRIES.includes(code)) return 'ZONE_1'
  if (ZONE_2_COUNTRIES.includes(code)) return 'ZONE_2'
  return 'ZONE_3'
}

/**
 * Calculate shipping cost based on zone and subtotal
 * @param zone - Shipping zone
 * @param config - Shipping configuration from database
 * @param subtotal - Cart subtotal amount
 * @returns Shipping cost (0 if free shipping threshold met)
 */
export function getShippingCost(
  zone: ShippingZone,
  config: ShippingConfig,
  subtotal: number
): number {
  // Free shipping if subtotal meets threshold (only for supported zones)
  if (zone !== 'ZONE_3' && subtotal >= config.free_shipping_threshold) {
    return 0
  }

  switch (zone) {
    case 'ZONE_1':
      return config.zone_1_cost
    case 'ZONE_2':
      return config.zone_2_cost
    case 'ZONE_3':
      return 0 // Not supported - will be blocked at checkout
  }
}

/**
 * Check if a country is supported for shipping
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns true if country is in Zone 1 or Zone 2
 */
export function isCountrySupported(countryCode: string): boolean {
  const code = countryCode.toUpperCase()
  return ZONE_1_COUNTRIES.includes(code) || ZONE_2_COUNTRIES.includes(code)
}

/**
 * Get human-readable label for shipping zone
 * @param zone - Shipping zone
 * @param lang - Language code ('es' | 'en')
 * @returns Localized zone label
 */
export function getZoneLabel(zone: ShippingZone, lang: 'es' | 'en' = 'es'): string {
  const labels = {
    ZONE_1: {
      es: 'Estados Unidos',
      en: 'United States'
    },
    ZONE_2: {
      es: 'Canadá / México',
      en: 'Canada / Mexico'
    },
    ZONE_3: {
      es: 'Internacional',
      en: 'International'
    }
  }

  return labels[zone][lang]
}

/**
 * Get list of supported countries with their names
 * @param lang - Language code
 * @returns Array of country objects
 */
export function getSupportedCountries(lang: 'es' | 'en' = 'es') {
  const countries = {
    US: { es: 'Estados Unidos', en: 'United States' },
    CA: { es: 'Canadá', en: 'Canada' },
    MX: { es: 'México', en: 'Mexico' }
  }

  return Object.entries(countries).map(([code, names]) => ({
    code,
    name: names[lang],
    zone: getShippingZone(code)
  }))
}

/**
 * Calculate amount remaining for free shipping
 * @param subtotal - Current cart subtotal
 * @param threshold - Free shipping threshold
 * @returns Amount needed for free shipping, or 0 if already qualified
 */
export function getAmountUntilFreeShipping(
  subtotal: number,
  threshold: number
): number {
  const remaining = threshold - subtotal
  return remaining > 0 ? remaining : 0
}

/**
 * Check if cart qualifies for free shipping
 * @param subtotal - Current cart subtotal
 * @param threshold - Free shipping threshold
 * @returns true if free shipping is available
 */
export function qualifiesForFreeShipping(
  subtotal: number,
  threshold: number
): boolean {
  return subtotal >= threshold
}

/**
 * Default shipping configuration (fallback)
 */
export const DEFAULT_SHIPPING_CONFIG: ShippingConfig = {
  id: '',
  zone_1_cost: 8.99,
  zone_2_cost: 18.99,
  free_shipping_threshold: 150,
  currency: 'USD',
  updated_at: ''
}
