/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#eef3fa',
          100: '#d5e2f2',
          200: '#adc5e5',
          300: '#7aa1d3',
          400: '#4d7fbf',
          500: '#2e5fa8',
          600: '#1e3a5f',
          700: '#182d4a',
          800: '#112036',
          900: '#0b1524',
        },
        gold: {
          300: '#f0d080',
          400: '#e8c24a',
          500: '#c9a227',
          600: '#a8841f',
          700: '#876818',
        },
      },
      fontFamily: {
        sans: ['"Inter"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.25s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateY(-8px)', opacity: 0 }, to: { transform: 'translateY(0)', opacity: 1 } },
        scaleIn: { from: { transform: 'scale(0.95)', opacity: 0 }, to: { transform: 'scale(1)', opacity: 1 } },
      },
    },
  },
  plugins: [],
}
