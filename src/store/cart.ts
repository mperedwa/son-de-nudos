import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Tipos del carrito
 */
export type Money = {
  amount: number
  currency: 'USD'
}

export type CartItem = {
  productId: string
  variantId: string
  title: string
  variantTitle: string
  quantity: number
  unitPrice: Money
  image?: string
}

export type CartState = {
  items: CartItem[]
  couponCode?: string
  discountAmount?: Money

  // Acciones
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (productId: string, variantId: string) => void
  updateQty: (productId: string, variantId: string, quantity: number) => void
  applyCoupon: (code: string) => Promise<{ success: boolean; error?: string }>
  removeCoupon: () => void
  clear: () => void

  // Computed
  subtotal: () => Money
  shipping: () => Money
  total: () => Money
  isFreeShipping: () => boolean
  amountUntilFreeShipping: () => number
}

/**
 * Store del carrito con Zustand
 * Gestiona items, cantidades, cupones y totales
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
  items: [],
  couponCode: undefined,
  discountAmount: undefined,

  addItem: (item) => {
    set((state) => {
      // Si ya existe el item, incrementar cantidad
      const existingIndex = state.items.findIndex(
        (i) => i.productId === item.productId && i.variantId === item.variantId
      )

      if (existingIndex >= 0) {
        const newItems = [...state.items]
        newItems[existingIndex].quantity += 1
        return { items: newItems }
      }

      // Si no existe, agregarlo con quantity 1
      return {
        items: [...state.items, { ...item, quantity: 1 }],
      }
    })
  },

  removeItem: (productId, variantId) => {
    set((state) => ({
      items: state.items.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      ),
    }))
  },

  updateQty: (productId, variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, variantId)
      return
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity }
          : item
      ),
    }))
  },

  applyCoupon: async (code) => {
    // Validación local de cupones (Fase 6: integrar con API)
    const validCoupons: Record<string, { percent: number; minAmount?: number }> = {
      WELCOME10: { percent: 0.1 }, // 10% descuento
      PRISCILLA15: { percent: 0.15 }, // 15% descuento
      VERANO20: { percent: 0.2, minAmount: 50 }, // 20% descuento con mínimo $50
      NAVIDAD25: { percent: 0.25, minAmount: 100 }, // 25% descuento con mínimo $100
    }

    const coupon = validCoupons[code.toUpperCase()]

    if (!coupon) {
      return { success: false, error: 'Cupón inválido' }
    }

    const subtotal = get().subtotal()

    // Verificar monto mínimo si aplica
    if (coupon.minAmount && subtotal.amount < coupon.minAmount) {
      return {
        success: false,
        error: `Este cupón requiere un mínimo de $${coupon.minAmount}`,
      }
    }

    const discountAmount: Money = {
      amount: subtotal.amount * coupon.percent,
      currency: 'USD',
    }

    set({
      couponCode: code.toUpperCase(),
      discountAmount,
    })

    return { success: true }
  },

  removeCoupon: () => {
    set({
      couponCode: undefined,
      discountAmount: undefined,
    })
  },

  clear: () => {
    set({
      items: [],
      couponCode: undefined,
      discountAmount: undefined,
    })
  },

  subtotal: () => {
    const items = get().items
    const amount = items.reduce((acc, item) => acc + item.unitPrice.amount * item.quantity, 0)
    return { amount, currency: 'USD' }
  },

  shipping: () => {
    const isFree = get().isFreeShipping()
    // Import config here to avoid circular dependency
    const shippingCost = 10 // Hardcoded for now, ideally from config
    return {
      amount: isFree ? 0 : shippingCost,
      currency: 'USD',
    }
  },

  isFreeShipping: () => {
    const subtotal = get().subtotal()
    const freeShippingThreshold = 150 // Hardcoded for now, ideally from config
    return subtotal.amount >= freeShippingThreshold
  },

  amountUntilFreeShipping: () => {
    const subtotal = get().subtotal()
    const freeShippingThreshold = 150 // Hardcoded for now, ideally from config
    return Math.max(0, freeShippingThreshold - subtotal.amount)
  },

  total: () => {
    const subtotal = get().subtotal()
    const discount = get().discountAmount?.amount || 0
    const shipping = get().shipping().amount
    return {
      amount: Math.max(0, subtotal.amount - discount + shipping),
      currency: 'USD',
    }
  },
    }),
    {
      name: 'son-de-nudos-cart',
      // Solo persistir items y cupón, no las funciones
      partialize: (state) => ({
        items: state.items,
        couponCode: state.couponCode,
        discountAmount: state.discountAmount,
      }),
    }
  )
)
