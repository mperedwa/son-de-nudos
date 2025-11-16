import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

/**
 * Props del componente Breadcrumbs
 */
export type BreadcrumbItem = {
  label: string
  href: string
}

export type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

/**
 * Componente de navegación Breadcrumbs
 * Muestra el camino de navegación actual
 * Accesible con ARIA labels
 * Fase 8: Integrado con i18n para soporte bilingüe
 */
export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { t } = useTranslation('common')

  return (
    <nav aria-label={t('breadcrumb')} className="mb-6">
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li key={`${item.href}-${index}`} className="flex items-center gap-2">
              {!isLast ? (
                <>
                  <Link
                    to={item.href}
                    className="text-text-light hover:text-primary-brown transition-colors"
                  >
                    {item.label}
                  </Link>
                  <svg
                    className="w-4 h-4 text-text-light"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </>
              ) : (
                <span
                  className="text-primary-brown font-medium"
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
