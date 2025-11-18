import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute
 *
 * Componente que protege rutas del panel admin.
 * Solo permite acceso a usuarios autenticados con rol de admin activo.
 *
 * Flujo:
 * 1. Verifica autenticación con useAuth()
 * 2. Muestra loading mientras verifica sesión
 * 3. Redirige a /admin/login si no está autenticado
 * 4. Renderiza children si está autenticado como admin
 *
 * @example
 * <Route path="/admin/dashboard" element={
 *   <ProtectedRoute>
 *     <Dashboard />
 *   </ProtectedRoute>
 * } />
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAdmin, loading } = useAuth()

  // Mostrar loading mientras verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5E6D3]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#8B6F47] font-medium">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Redirigir a login si no es admin
  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />
  }

  // Renderizar contenido protegido
  return <>{children}</>
}
