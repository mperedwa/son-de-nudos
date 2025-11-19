/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de tonos tierra - Son de Nudos
        primary: {
          brown: '#8B6F47',
          DEFAULT: '#8B6F47',
        },
        secondary: {
          beige: '#F5E6D3',
          DEFAULT: '#F5E6D3',
        },
        accent: {
          gold: '#D4A574',
          DEFAULT: '#D4A574',
        },
        text: {
          dark: '#3C2F2F',
          light: '#6B5D54',
        },
        // Colores adicionales Landing Page
        terracotta: {
          light: '#E8B4A0',
          DEFAULT: '#C97B5D',
          dark: '#A65D42',
        },
        olive: {
          light: '#A8B89C',
          DEFAULT: '#7A8B6F',
          dark: '#5C6B52',
        },
        sand: {
          light: '#FBF7F2',
          DEFAULT: '#F0E6D8',
          dark: '#E5D5C3',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'Times', 'serif'],
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Open Sans', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 5px 20px rgba(139, 111, 71, 0.1)',
        'soft-hover': '0 10px 30px rgba(139, 111, 71, 0.2)',
      },
    },
  },
  plugins: [],
}
