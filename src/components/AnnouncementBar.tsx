import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Barra de anuncios con carrusel auto-rotativo
 * Muestra mensajes promocionales uno a la vez
 * Estilo Gemini: fondo terracota vibrante
 */

export default function AnnouncementBar() {
  const { t } = useTranslation('announcements')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  // Obtener mensajes traducidos
  const messages = [
    t('freeShipping'),
    t('welcome10'),
    t('handmade'),
    t('shippingUSA'),
  ]

  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length)
    }, 4000) // Cambiar cada 4 segundos

    return () => clearInterval(interval)
  }, [isPaused, messages.length])

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
