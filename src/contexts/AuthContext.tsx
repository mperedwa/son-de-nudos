/**
 * AuthContext
 *
 * Proveedor de autenticación usando Context API
 * Soluciona el problema de múltiples instancias de useAuthHook
 * que causaban loops infinitos al navegar entre páginas admin.
 *
 * IMPORTANTE: Este contexto debe usarse en lugar de llamar
 * directamente a useAuthHook en los componentes.
 */

import { createContext, useContext, ReactNode, useMemo } from 'react'
import { useAuthHook } from '@/hooks/useAuthHook'
import type { User } from '@supabase/supabase-js'

// ==============================================================================
// TYPES
// ==============================================================================

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'superadmin'
  active: boolean
}

interface AuthContextValue {
  user: User | null
  adminData: AdminUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAdmin: boolean
}

// ==============================================================================
// CONTEXT
// ==============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ==============================================================================
// PROVIDER
// ==============================================================================

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  console.log('[AuthContext] AuthProvider montado')

  // Single instance of the auth hook - this is the ONLY place it should be called
  const auth = useAuthHook()

  // Memoize the context value to prevent unnecessary re-renders
  // Only update when critical auth state changes
  const value = useMemo(
    () => ({
      user: auth.user,
      adminData: auth.adminData,
      loading: auth.loading,
      error: auth.error,
      login: auth.login,
      logout: auth.logout,
      isAdmin: auth.isAdmin,
    }),
    [
      auth.user,
      auth.adminData,
      auth.loading,
      auth.error,
      auth.login,
      auth.logout,
      auth.isAdmin,
    ]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ==============================================================================
// CONSUMER HOOK
// ==============================================================================

/**
 * Hook para consumir el contexto de autenticación
 *
 * DEBE usarse dentro de un AuthProvider, sino lanza error
 *
 * @example
 * function MyComponent() {
 *   const { user, isAdmin, loading } = useAuth()
 *
 *   if (loading) return <div>Cargando...</div>
 *   if (!isAdmin) return <div>No autorizado</div>
 *
 *   return <div>Hola {user?.email}</div>
 * }
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }

  return context
}
