import { useTranslation } from 'react-i18next'
import Breadcrumbs from '@/components/Breadcrumbs'
import { useReturnPolicy } from '@/hooks/useStoreSettings'

/**
 * Página pública de Política de Devoluciones
 *
 * Muestra el contenido configurado desde el panel de admin
 * con soporte bilingüe automático según el idioma seleccionado
 */
export default function ReturnPolicyPage() {
  const { t, i18n } = useTranslation(['navigation', 'common'])
  const currentLang = i18n.language === 'en' ? 'en' : 'es'
  const { returnPolicy, loading } = useReturnPolicy(currentLang)

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs
        items={[
          { label: t('navigation:home'), href: '/' },
          { label: t('common:returnPolicy', 'Política de Devoluciones'), href: '/politicas/devoluciones' },
        ]}
      />

      <div className="max-w-3xl mx-auto mt-8">
        <h1 className="text-3xl md:text-4xl font-serif text-brand-terra mb-6">
          {currentLang === 'en' ? 'Return Policy' : 'Política de Devoluciones'}
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-terra"></div>
          </div>
        ) : returnPolicy ? (
          <div className="prose prose-stone max-w-none">
            {/* Renderizar el contenido como texto plano con saltos de línea */}
            <div className="whitespace-pre-wrap text-brand-dark leading-relaxed">
              {returnPolicy}
            </div>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-amber-800">
            <p className="text-center">
              {currentLang === 'en'
                ? 'Return policy not yet configured. Please check back later.'
                : 'La política de devoluciones aún no está configurada. Por favor, vuelve más tarde.'}
            </p>
          </div>
        )}

        {/* Info de contacto */}
        <div className="mt-12 p-6 bg-stone-100 rounded-xl">
          <h2 className="font-semibold text-brand-terra mb-3">
            {currentLang === 'en' ? 'Questions?' : '¿Preguntas?'}
          </h2>
          <p className="text-brand-dark text-sm">
            {currentLang === 'en'
              ? 'If you have any questions about our return policy, please contact us at '
              : 'Si tienes alguna pregunta sobre nuestra política de devoluciones, contáctanos en '}
            <a
              href="mailto:hello@sondenudos.com"
              className="text-brand-terra hover:underline"
            >
              hello@sondenudos.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
