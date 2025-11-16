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
