/**
 * Store de idioma con Zustand
 * Fase 8: Sistema bilingüe
 *
 * Sincroniza el idioma seleccionado con i18next
 */

import { create } from 'zustand'
import i18n from '@/i18n'

export type Language = 'es' | 'en'

type LanguageStore = {
  /**
   * Idioma actual
   */
  currentLanguage: Language

  /**
   * Cambiar idioma
   * Sincroniza con i18next y localStorage automáticamente
   */
  setLanguage: (lang: Language) => void

  /**
   * Alternar entre idiomas
   */
  toggleLanguage: () => void
}

/**
 * Store de idioma global
 */
export const useLanguageStore = create<LanguageStore>((set, get) => ({
  // Inicializar con el idioma detectado por i18next
  currentLanguage: (i18n.language?.split('-')[0] as Language) || 'en',

  setLanguage: (lang: Language) => {
    // Cambiar idioma en i18next
    i18n.changeLanguage(lang)

    // Actualizar estado del store
    set({ currentLanguage: lang })

    // i18next automáticamente guarda en localStorage
  },

  toggleLanguage: () => {
    const current = get().currentLanguage
    const newLang: Language = current === 'es' ? 'en' : 'es'
    get().setLanguage(newLang)
  },
}))

/**
 * Sincronizar store cuando i18next cambie de idioma
 * (por ejemplo, si el usuario cambia desde otro componente)
 */
i18n.on('languageChanged', (lng: string) => {
  const lang = lng.split('-')[0] as Language
  const currentLang = useLanguageStore.getState().currentLanguage

  // Solo actualizar si es diferente para evitar loops
  if (lang !== currentLang) {
    useLanguageStore.setState({ currentLanguage: lang })
  }
})

export default useLanguageStore
