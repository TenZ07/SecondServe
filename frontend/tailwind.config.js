/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F2F7F7',
          100: '#E0ECEC',
          200: '#B8D4D4',
          300: '#8ABABA',
          400: '#5CA0A0',
          500: '#3D8585',
          600: '#2C6B6B',
          700: '#1F4F4F',
          800: '#143838',
          900: '#0A1C1C',
        },
        accent: {
          50: '#FDF6F3',
          100: '#F9EBE3',
          200: '#F0CEBC',
          300: '#E5AD91',
          400: '#D98C6A',
          500: '#C4735A',
          600: '#A05A45',
          700: '#7A4333',
          800: '#542E21',
          900: '#2E1A12',
        },
        cream: '#F8F6F1',
        charcoal: '#1E1E1E',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}