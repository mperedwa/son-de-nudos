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
      const { data, error } = await supabase
        .from('admins')
        .select('id, email, name, role, active')
        .eq('id', userId)
        .eq('active', true)
        .single()

      if (error) {
        console.error('Error verificando admin:', error)
        return null
      }

      return data as AdminUser
    } catch (err) {
      console.error('Error en checkAdminStatus:', err)
      return null
    }
  }

  // Inicializar sesión al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Obtener sesión actual
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setUser(session.user)

          // Verificar si es admin
          const admin = await checkAdminStatus(session.user.id)
          setAdminData(admin)
        }
      } catch (err) {
        console.error('Error inicializando auth:', err)
        setError('Error al inicializar autenticación')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event)

        // Solo procesar eventos relevantes para evitar re-renders innecesarios
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user)
          const admin = await checkAdminStatus(session.user.id)
          setAdminData(admin)
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setAdminData(null)
          setLoading(false)
        }
        // Ignorar INITIAL_SESSION, TOKEN_REFRESHED y otros eventos
      }
    )

    return () => {
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
        .update({ last_login_at: new Date().toISOString() } as any)
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
