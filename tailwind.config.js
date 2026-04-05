/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        sans:    ['DM Sans', 'sans-serif'],
      },
      colors: {
        // Teal accent palette
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      animation: {
        'shimmer':     'shimmer 2s linear infinite',
        'pulse-soft':  'pulse-soft 2.5s ease-in-out infinite',
        'slide-up':    'slide-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition:  '200% 0' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: 1 },
          '50%':      { opacity: 0.6 },
        },
        'slide-up': {
          from: { opacity: 0, transform: 'translateY(16px) scale(0.96)' },
          to:   { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
