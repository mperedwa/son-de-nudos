import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

// ============================================================================
// VALIDACIÓN CON ZOD
// ============================================================================

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La contraseña actual es requerida'),
    newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Debes confirmar la nueva contraseña'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'La nueva contraseña debe ser diferente a la actual',
    path: ['newPassword'],
  })

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

// ============================================================================
// COMPONENTE PROFILE
// ============================================================================

export default function AdminProfile() {
  const { adminData, user, login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  })

  // Handler del formulario de cambio de contraseña
  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsSubmitting(true)
    setSuccessMessage(null)
    setErrorMessage(null)

    try {
      // 1. Verificar que la contraseña actual sea correcta
      if (!user?.email) {
        throw new Error('No se pudo obtener el email del usuario')
      }

      const verificationResult = await login(user.email, data.currentPassword)

      if (!verificationResult.success) {
        setErrorMessage('La contraseña actual es incorrecta')
        return
      }

      // 2. Actualizar la contraseña en Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword,
      })

      if (updateError) {
        throw updateError
      }

      // 3. Éxito
      setSuccessMessage('¡Contraseña actualizada exitosamente!')
      reset()
    } catch (error) {
      console.error('Error cambiando contraseña:', error)
      setErrorMessage(
        error instanceof Error ? error.message : 'Error al cambiar la contraseña'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Título de la página */}
      <div>
        <h1 className="text-3xl font-semibold text-[#8B6F47] mb-2">Mi Perfil</h1>
        <p className="text-[#6B5844]">
          Gestiona tu información personal y contraseña
        </p>
      </div>

      {/* Card de información del perfil */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#D4A574]/20">
        <h2 className="text-xl font-semibold text-[#8B6F47] mb-4">
          Información del Perfil
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-[#6B5844] mb-1">
              Nombre
            </label>
            <p className="text-[#8B6F47] font-medium">
              {adminData?.name || 'No disponible'}
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#6B5844] mb-1">
              Email
            </label>
            <p className="text-[#8B6F47] font-medium">
              {adminData?.email || 'No disponible'}
            </p>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-sm font-medium text-[#6B5844] mb-1">
              Rol
            </label>
            <span
              className={`
                inline-flex px-3 py-1 rounded-full text-xs font-medium
                ${
                  adminData?.role === 'superadmin'
                    ? 'bg-gradient-to-r from-[#8B6F47] to-[#D4A574] text-white'
                    : 'bg-[#F5E6D3] text-[#8B6F47]'
                }
              `}
            >
              {adminData?.role === 'superadmin' ? 'Super Admin' : 'Admin'}
            </span>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-[#6B5844] mb-1">
              Estado
            </label>
            <span
              className={`
                inline-flex px-3 py-1 rounded-full text-xs font-medium
                ${
                  adminData?.active
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }
              `}
            >
              {adminData?.active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Card de cambio de contraseña */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#D4A574]/20">
        <h2 className="text-xl font-semibold text-[#8B6F47] mb-4">
          Cambiar Contraseña
        </h2>

        {/* Mensajes de éxito/error */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 flex items-center gap-2">
              <span>✓</span>
              {successMessage}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Campo Contraseña Actual */}
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-[#6B5844] mb-2"
            >
              Contraseña Actual
            </label>
            <input
              {...register('currentPassword')}
              id="currentPassword"
              type="password"
              autoComplete="current-password"
              className={`
                w-full px-4 py-3 rounded-lg border-2 transition-colors
                focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                ${
                  errors.currentPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-[#D4A574]/30 bg-white'
                }
              `}
              placeholder="Ingresa tu contraseña actual"
            />
            {errors.currentPassword && (
              <p className="mt-1.5 text-sm text-red-600">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          {/* Campo Nueva Contraseña */}
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-[#6B5844] mb-2"
            >
              Nueva Contraseña
            </label>
            <input
              {...register('newPassword')}
              id="newPassword"
              type="password"
              autoComplete="new-password"
              className={`
                w-full px-4 py-3 rounded-lg border-2 transition-colors
                focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                ${
                  errors.newPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-[#D4A574]/30 bg-white'
                }
              `}
              placeholder="Ingresa tu nueva contraseña (mínimo 8 caracteres)"
            />
            {errors.newPassword && (
              <p className="mt-1.5 text-sm text-red-600">
                {errors.newPassword.message}
              </p>
            )}
            <p className="mt-1.5 text-xs text-[#6B5844]/60">
              Debe tener al menos 8 caracteres
            </p>
          </div>

          {/* Campo Confirmar Nueva Contraseña */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#6B5844] mb-2"
            >
              Confirmar Nueva Contraseña
            </label>
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={`
                w-full px-4 py-3 rounded-lg border-2 transition-colors
                focus:outline-none focus:ring-2 focus:ring-[#D4A574] focus:border-transparent
                ${
                  errors.confirmPassword
                    ? 'border-red-300 bg-red-50'
                    : 'border-[#D4A574]/30 bg-white'
                }
              `}
              placeholder="Confirma tu nueva contraseña"
            />
            {errors.confirmPassword && (
              <p className="mt-1.5 text-sm text-red-600">
                {errors.confirmPassword.message}
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
                Actualizando contraseña...
              </span>
            ) : (
              'Cambiar Contraseña'
            )}
          </button>
        </form>

        {/* Nota de seguridad */}
        <div className="mt-6 p-4 bg-[#F5E6D3] rounded-lg border border-[#D4A574]/30">
          <p className="text-xs text-[#6B5844]">
            <strong>Nota de seguridad:</strong> Asegúrate de usar una contraseña
            segura que contenga letras, números y caracteres especiales. No
            compartas tu contraseña con nadie.
          </p>
        </div>
      </div>
    </div>
  )
}
