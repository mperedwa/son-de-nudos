/**
 * NewsletterSection Component
 *
 * Invitación a unirse a la comunidad
 * - Promesa de exclusividad en nuevos diseños
 * - Formulario de suscripción elegante
 */

import { useState } from 'react'

export default function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setStatus('loading')

    // Simular envío - Integrar con servicio real
    await new Promise(resolve => setTimeout(resolve, 1000))

    setStatus('success')
    setEmail('')

    // Reset después de 3 segundos
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-brown via-primary-brown to-terracotta-dark text-white">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          {/* Icono decorativo */}
          <div className="w-16 h-16 mx-auto mb-8 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>

          {/* Título */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif mb-6">
            Únete al ritmo
          </h2>

          {/* Descripción */}
          <p className="text-white/80 font-sans leading-relaxed mb-10 text-lg">
            Sé la primera en conocer nuevas colecciones, acceder a piezas exclusivas
            y recibir inspiración artesanal directamente en tu bandeja de entrada.
          </p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico"
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20
                         text-white placeholder-white/50 font-sans
                         focus:outline-none focus:border-accent-gold focus:bg-white/20
                         transition-all duration-300"
              required
              disabled={status === 'loading' || status === 'success'}
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="px-8 py-4 bg-accent-gold text-primary-brown font-medium rounded-full
                         hover:bg-accent-gold/90 transition-all duration-300
                         disabled:opacity-70 disabled:cursor-not-allowed
                         transform hover:-translate-y-0.5 shadow-lg"
            >
              {status === 'loading' && (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Enviando...
                </span>
              )}
              {status === 'success' && (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ¡Suscrita!
                </span>
              )}
              {(status === 'idle' || status === 'error') && 'Suscribirme'}
            </button>
          </form>

          {/* Mensaje de éxito */}
          {status === 'success' && (
            <p className="mt-4 text-accent-gold text-sm font-sans animate-fadeIn">
              ¡Bienvenida a la comunidad! Revisa tu correo para confirmar tu suscripción.
            </p>
          )}

          {/* Garantía */}
          <p className="mt-6 text-white/50 text-xs font-sans">
            Respetamos tu privacidad. Sin spam, solo inspiración artesanal.
          </p>
        </div>
      </div>
    </section>
  )
}
