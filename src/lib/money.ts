/**
 * Utilidades para operaciones con dinero y formateo de moneda
 * Funciones puras para trabajar con el tipo Money
 */

import type { Money } from '@/types/models'

/**
 * Formatea un valor Money a string con formato de moneda
 * @param money - Objeto Money con amount y currency
 * @param locale - Locale para formateo (default: 'en-US')
 * @returns String formateado como "$123.45"
 *
 * @example
 * formatMoney({ amount: 189, currency: 'USD' }) // "$189.00"
 * formatMoney({ amount: 329.5, currency: 'USD' }) // "$329.50"
 */
export function formatMoney(money: Money, locale: string = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(money.amount)
}

/**
 * Suma dos valores Money
 * @param a - Primer valor Money
 * @param b - Segundo valor Money
 * @returns Nuevo objeto Money con la suma
 * @throws Error si las monedas no coinciden
 *
 * @example
 * addMoney({ amount: 100, currency: 'USD' }, { amount: 50, currency: 'USD' })
 * // { amount: 150, currency: 'USD' }
 */
export function addMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot add different currencies: ${a.currency} and ${b.currency}`)
  }
  return {
    amount: a.amount + b.amount,
    currency: a.currency,
  }
}

/**
 * Resta dos valores Money (a - b)
 * @param a - Valor inicial
 * @param b - Valor a restar
 * @returns Nuevo objeto Money con la resta
 * @throws Error si las monedas no coinciden
 */
export function subtractMoney(a: Money, b: Money): Money {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot subtract different currencies: ${a.currency} and ${b.currency}`)
  }
  return {
    amount: a.amount - b.amount,
    currency: a.currency,
  }
}

/**
 * Multiplica un valor Money por un número
 * @param money - Valor Money
 * @param multiplier - Multiplicador (puede ser entero o decimal)
 * @returns Nuevo objeto Money multiplicado
 *
 * @example
 * multiplyMoney({ amount: 100, currency: 'USD' }, 2.5)
 * // { amount: 250, currency: 'USD' }
 */
export function multiplyMoney(money: Money, multiplier: number): Money {
  return {
    amount: money.amount * multiplier,
    currency: money.currency,
  }
}

/**
 * Compara dos valores Money
 * @param a - Primer valor
 * @param b - Segundo valor
 * @returns -1 si a < b, 0 si a === b, 1 si a > b
 * @throws Error si las monedas no coinciden
 */
export function compareMoney(a: Money, b: Money): -1 | 0 | 1 {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot compare different currencies: ${a.currency} and ${b.currency}`)
  }
  if (a.amount < b.amount) return -1
  if (a.amount > b.amount) return 1
  return 0
}

/**
 * Calcula el porcentaje de descuento entre dos precios
 * @param originalPrice - Precio original
 * @param salePrice - Precio de venta
 * @returns Porcentaje de descuento como número entero (ej: 25 para 25%)
 *
 * @example
 * getDiscountPercentage({ amount: 200, currency: 'USD' }, { amount: 150, currency: 'USD' })
 * // 25
 */
export function getDiscountPercentage(originalPrice: Money, salePrice: Money): number {
  if (originalPrice.currency !== salePrice.currency) {
    throw new Error('Prices must have the same currency')
  }
  if (originalPrice.amount <= salePrice.amount) return 0

  const discount = ((originalPrice.amount - salePrice.amount) / originalPrice.amount) * 100
  return Math.round(discount)
}

/**
 * Crea un objeto Money a partir de un número
 * @param amount - Cantidad en USD
 * @returns Objeto Money
 */
export function createMoney(amount: number): Money {
  return {
    amount,
    currency: 'USD',
  }
}
