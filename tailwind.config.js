/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta fusionada - Gemini + Original
        primary: {
          brown: '#8B6F47',
          DEFAULT: '#8B6F47',
        },
        secondary: {
          beige: '#F5E6D3',
          DEFAULT: '#F5E6D3',
        },
        accent: {
          gold: '#D4AF37', // Dorado más brillante (Gemini)
          DEFAULT: '#D4AF37',
        },
        text: {
          dark: '#2C2C2C', // Más oscuro (Gemini)
          light: '#5E665B', // Verde olivo (Gemini)
        },
        // Colores Gemini
        brand: {
          terra: '#A65D57', // Terracota más vibrante
          sand: '#F5F0EB',  // Fondo crema más cálido
          olive: '#5E665B', // Verde apagado para textos
          dark: '#2C2C2C',  // Oscuro para contraste
          gold: '#D4AF37',  // Dorado brillante
        },
        // Colores adicionales Landing Page
        terracotta: {
          light: '#E8B4A0',
          DEFAULT: '#A65D57', // Actualizado a Gemini
          dark: '#8B4A45',
        },
        olive: {
          light: '#A8B89C',
          DEFAULT: '#5E665B', // Actualizado a Gemini
          dark: '#4A524A',
        },
        sand: {
          light: '#FBF7F2',
          DEFAULT: '#F5F0EB', // Actualizado a Gemini
          dark: '#E5D5C3',
        },
      },
      fontFamily: {
        // Google Fonts: Playfair Display + Lato
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Lato"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 5px 20px rgba(139, 111, 71, 0.1)',
        'soft-hover': '0 10px 30px rgba(139, 111, 71, 0.2)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 1s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
