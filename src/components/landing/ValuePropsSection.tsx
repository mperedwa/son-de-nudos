/**
 * ValuePropsSection Component
 *
 * Propuestas de valor con iconos FontAwesome:
 * - Hecho a Mano
 * - Diseño con Ritmo
 * - Materiales Premium
 *
 * Diseño inspirado en Gemini
 */

import { useTranslation } from 'react-i18next'

export default function ValuePropsSection() {
  const { t } = useTranslation('landing')

  const valueProps = [
    {
      id: 'handmade',
      iconClass: 'fas fa-hands',
      titleKey: 'valueProps.handmade.title',
      descKey: 'valueProps.handmade.description',
    },
    {
      id: 'rhythm',
      iconClass: 'fas fa-music',
      titleKey: 'valueProps.rhythm.title',
      descKey: 'valueProps.rhythm.description',
    },
    {
      id: 'premium',
      iconClass: 'fas fa-gem',
      titleKey: 'valueProps.premium.title',
      descKey: 'valueProps.premium.description',
    },
  ]

  return (
    <section className="py-12 border-b border-stone-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {valueProps.map((prop) => (
            <div key={prop.id} className="flex flex-col items-center p-4">
              <i className={`${prop.iconClass} text-3xl text-brand-terra mb-4`}></i>
              <h3 className="font-serif text-lg mb-2 text-brand-dark">
                {t(prop.titleKey)}
              </h3>
              <p className="text-sm text-gray-500 font-light">
                {t(prop.descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
