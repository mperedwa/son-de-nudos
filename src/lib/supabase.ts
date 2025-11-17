/**
 * Supabase Client Configuration
 * Fase 11: Panel de Administración
 *
 * Este archivo configura el cliente de Supabase para acceder a la base de datos PostgreSQL.
 * Incluye helpers para autenticación y queries type-safe.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// ==============================================================================
// TYPES
// ==============================================================================

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          handle: string
          title: string
          description_html: string | null
          images: string[]
          price: number
          compare_at_price: number | null
          tags: string[]
          available_for_sale: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      variants: {
        Row: {
          id: string
          product_id: string
          title: string
          sku: string
          price: number
          compare_at_price: number | null
          available: boolean
          stock: number
          options: Record<string, string>
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['variants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['variants']['Insert']>
      }
      coupons: {
        Row: {
          id: string
          code: string
          percent: number
          min_amount: number | null
          max_uses: number | null
          current_uses: number
          valid_from: string
          valid_until: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'current_uses' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>
      }
      orders: {
        Row: {
          id: string
          stripe_session_id: string | null
          customer_email: string
          customer_name: string | null
          shipping_address: Record<string, any> | null
          items: Record<string, any>
          subtotal: number
          discount: number
          shipping: number
          total: number
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      admins: {
        Row: {
          id: string
          email: string
          password_hash: string
          name: string
          role: 'admin' | 'superadmin'
          active: boolean
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['admins']['Row'], 'id' | 'created_at' | 'updated_at' | 'last_login_at'>
        Update: Partial<Database['public']['Tables']['admins']['Insert']>
      }
      shipping_config: {
        Row: {
          id: string
          standard_cost: number
          free_shipping_threshold: number
          currency: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['shipping_config']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['shipping_config']['Insert']>
      }
      stock_history: {
        Row: {
          id: string
          variant_id: string
          change: number
          reason: 'restock' | 'sale' | 'adjustment' | 'return' | 'damage'
          previous_stock: number
          new_stock: number
          admin_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['stock_history']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
  }
}

// ==============================================================================
// ENVIRONMENT VARIABLES
// ==============================================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env')
}

// ==============================================================================
// CLIENT INSTANCE
// ==============================================================================

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
)

// ==============================================================================
// HELPER FUNCTIONS
// ==============================================================================

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}

/**
 * Sign out current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('[Supabase] Error signing out:', error)
    throw error
  }
}

// ==============================================================================
// REAL-TIME SUBSCRIPTIONS
// ==============================================================================

/**
 * Subscribe to stock changes for a specific variant
 */
export function subscribeToStockChanges(
  variantId: string,
  callback: (newStock: number) => void
) {
  return supabase
    .channel(`variant:${variantId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'variants',
        filter: `id=eq.${variantId}`,
      },
      (payload) => {
        const newData = payload.new as Database['public']['Tables']['variants']['Row']
        callback(newData.stock)
      }
    )
    .subscribe()
}

/**
 * Subscribe to new orders
 */
export function subscribeToNewOrders(
  callback: (order: Database['public']['Tables']['orders']['Row']) => void
) {
  return supabase
    .channel('new-orders')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
      },
      (payload) => {
        const newOrder = payload.new as Database['public']['Tables']['orders']['Row']
        callback(newOrder)
      }
    )
    .subscribe()
}

// ==============================================================================
// EXPORT DEFAULT
// ==============================================================================

export default supabase
