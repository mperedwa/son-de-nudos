import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAnnouncementMessages } from '@/hooks/useStoreSettings'

/**
 * Barra de anuncios con carrusel auto-rotativo
 * Muestra mensajes promocionales uno a la vez
 * Estilo Gemini: fondo terracota vibrante
 * Mensajes cargados desde Supabase (store_settings.announcement_messages)
 */

export default function AnnouncementBar() {
  const { t, i18n } = useTranslation('announcements')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Obtener mensajes desde store_settings (filtra solo activos)
  const language = i18n.language?.startsWith('en') ? 'en' : 'es'
  const { messages, loading } = useAnnouncementMessages(language)

  useEffect(() => {
    if (isPaused || messages.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, 4000) // Cambiar cada 4 segundos

    return () => clearInterval(interval)
  }, [isPaused, messages.length])

  // Reset index when messages change (e.g., language change)
  useEffect(() => {
    setCurrentIndex(0)
  }, [messages])

  // No mostrar si no hay mensajes o están cargando
  if (loading || messages.length === 0) {
    return null
  }

  return (
    <div
      className="bg-brand-terra text-white py-2 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label={t('ariaLabel')}
    >
      <div className="container mx-auto px-4">
        <p className="text-center text-xs tracking-widest uppercase font-bold animate-fade-in">
          {messages[currentIndex]}
        </p>
      </div>
    </div>
  )
}
