import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'

// ============================================================================
// VALIDACIÓN CON ZOD
// ============================================================================

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

// ============================================================================
// COMPONENTE LOGIN
// ============================================================================

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAdmin, loading: authLoading } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Redirigir si ya está autenticado (solo si estamos en login)
  useEffect(() => {
    if (!authLoading && isAdmin && location.pathname === '/admin/login') {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [isAdmin, authLoading, navigate, location.pathname])

  // Handler del formulario
  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true)
    setServerError(null)

    try {
      const result = await login(data.email, data.password)

      if (result.success) {
        navigate('/admin/dashboard', { replace: true })
      } else {
        setServerError(result.error || 'Error al iniciar sesión')
      }
    } catch (error) {
      setServerError('Error inesperado. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Mostrar loading mientras verifica autenticación inicial
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5E6D3]">
        <div className="w-12 h-12 border-4 border-[#8B6F47] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5E6D3] to-white px-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#8B6F47] mb-2">
            Panel de Administración
          </h1>
          <p className="text-[#6B5844]">Son de Nudos</p>
        </div>

        {/* Card del formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#D4A574]/20">
          <h2 className="text-xl font-semibold text-[#8B6F47] mb-6">
            Iniciar Sesión
          </h2>

          {/* Error del servidor */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Campo Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#6B5844] mb-2"
              >
                Email
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className={`
                  w-full px-4 py-3 rounded-lg border-2 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                  ${errors.email
                    ? 'border-red-300 bg-red-50'
                    : 'border-[#D4A574]/30 bg-white'
                  }
                `}
                placeholder="admin@sondenudos.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#6B5844] mb-2"
              >
                Contraseña
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                className={`
                  w-full px-4 py-3 rounded-lg border-2 transition-colors
                  focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                  ${errors.password
                    ? 'border-red-300 bg-red-50'
                    : 'border-[#D4A574]/30 bg-white'
                  }
                `}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1.5 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Botón submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                w-full py-3 px-4 rounded-lg font-medium text-white
                bg-gradient-to-r from-[#8B6F47] to-[#D4A574]
                hover:from-[#6B5844] hover:to-[#8B6F47]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:ring-offset-2
              "
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Credenciales de prueba (solo desarrollo) */}
          {import.meta.env.DEV && (
            <div className="mt-6 p-4 bg-[#F5E6D3] rounded-lg border border-[#D4A574]/30">
              <p className="text-xs font-medium text-[#8B6F47] mb-2">
                Credenciales de prueba:
              </p>
              <p className="text-xs text-[#6B5844] font-mono">
                admin@sondenudos.com
              </p>
              <p className="text-xs text-[#6B5844] font-mono">[REDACTED]</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-[#6B5844]">
          © {new Date().getFullYear()} Son de Nudos
        </p>
      </div>
    </div>
  )
}
