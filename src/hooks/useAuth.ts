import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'superadmin'
  active: boolean
}

interface UseAuthReturn {
  user: User | null
  adminData: AdminUser | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAdmin: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [adminData, setAdminData] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Verificar si el usuario autenticado es admin
  const checkAdminStatus = async (userId: string): Promise<AdminUser | null> => {
    try {
      console.log('[useAuth] checkAdminStatus() llamado con userId:', userId)
      const startTime = Date.now()

      const { data, error } = await supabase
        .from('admins')
        .select('id, email, name, role, active')
        .eq('id', userId)
        .eq('active', true)
        .single()

      const duration = Date.now() - startTime
      console.log(`[useAuth] checkAdminStatus() completado en ${duration}ms`)

      if (error) {
        console.error('[useAuth] Error verificando admin:', error.message, error.code)
        return null
      }

      if (!data) {
        console.warn('[useAuth] checkAdminStatus() devolvió data null/undefined')
        return null
      }

      console.log('[useAuth] Admin encontrado:', data.email, data.role)
      return data as AdminUser
    } catch (err) {
      console.error('[useAuth] Error en checkAdminStatus:', err)
      return null
    }
  }

  // Inicializar sesión al cargar
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let isInitialized = false

    const initializeAuth = async () => {
      try {
        console.log('[useAuth] Iniciando initializeAuth()...')

        // Timeout de seguridad - forzar loading=false después de 10 segundos
        timeoutId = setTimeout(() => {
          console.warn('[useAuth] ⚠️ Timeout de 10s alcanzado - forzando loading = false')
          setLoading(false)
        }, 10000)

        // Obtener sesión actual
        console.log('[useAuth] Obteniendo sesión actual...')
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[useAuth] Error obteniendo sesión:', sessionError)
          throw sessionError
        }

        console.log('[useAuth] Sesión obtenida:', session?.user?.id || 'no session')

        if (session?.user) {
          console.log('[useAuth] Usuario encontrado, verificando admin status...')
          setUser(session.user)

          // Verificar si es admin
          const admin = await checkAdminStatus(session.user.id)
          setAdminData(admin)

          if (admin) {
            console.log('[useAuth] ✅ Usuario es admin, login completo')
          } else {
            console.warn('[useAuth] ⚠️ Usuario autenticado pero NO es admin')
          }
        } else {
          console.log('[useAuth] No hay sesión activa')
        }

        // Limpiar timeout si todo fue exitoso
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }

        isInitialized = true
        setLoading(false)
        console.log('[useAuth] initializeAuth() completado')
      } catch (err) {
        console.error('[useAuth] Error en initializeAuth():', err)
        setError('Error al inicializar autenticación')
        setLoading(false)
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[useAuth] 🔔 Auth state changed:', event, session?.user?.id || 'no user')

        // Ignorar INITIAL_SESSION si ya inicializamos manualmente
        if (event === 'INITIAL_SESSION') {
          console.log('[useAuth] Ignorando INITIAL_SESSION (ya manejado en initializeAuth)')
          return
        }

        // Procesar SIGNED_IN
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('[useAuth] Procesando SIGNED_IN')
          setUser(session.user)
          const admin = await checkAdminStatus(session.user.id)
          setAdminData(admin)
          setLoading(false)
        }
        // Procesar SIGNED_OUT
        else if (event === 'SIGNED_OUT') {
          console.log('[useAuth] Procesando SIGNED_OUT')
          setUser(null)
          setAdminData(null)
          setLoading(false)
        }
        // Procesar TOKEN_REFRESHED
        else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('[useAuth] Procesando TOKEN_REFRESHED')
          setUser(session.user)
          // No necesitamos recargar adminData en refresh
          setLoading(false)
        }
      }
    )

    return () => {
      console.log('[useAuth] Cleanup: unsubscribing')
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      subscription.unsubscribe()
    }
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      // Autenticar con Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        return { success: false, error: authError.message }
      }

      if (!data.user) {
        setError('No se pudo autenticar')
        return { success: false, error: 'No se pudo autenticar' }
      }

      // Verificar que el usuario sea admin
      const admin = await checkAdminStatus(data.user.id)

      if (!admin) {
        // Si no es admin, cerrar sesión
        await supabase.auth.signOut()
        setError('No tienes permisos de administrador')
        return { success: false, error: 'No tienes permisos de administrador' }
      }

      // Actualizar last_login_at
      await supabase
        .from('admins')
        // @ts-expect-error - Supabase types inference issue with Update type
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', admin.id)

      setUser(data.user)
      setAdminData(admin)

      return { success: true }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      return { success: false, error: errorMsg }
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('Error signing out:', error)
        setError(error.message)
      }

      setUser(null)
      setAdminData(null)
    } catch (err) {
      console.error('Error en logout:', err)
      setError('Error al cerrar sesión')
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    adminData,
    loading,
    error,
    login,
    logout,
    isAdmin: !!adminData && adminData.active,
  }
}
