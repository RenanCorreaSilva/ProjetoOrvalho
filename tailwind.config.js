/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      keyframes: {
        drip: {
          '0%':   { transform: 'translateY(0px)', opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '1' },
          '100%': { transform: 'translateY(64px)', opacity: '0' },
        },
        'heat-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 4px #06b6d4)' },
          '50%':      { filter: 'drop-shadow(0 0 14px #06b6d4)' },
        },
      },
      animation: {
        'drip':       'drip 1.5s ease-in infinite',
        'drip-delay': 'drip 1.5s ease-in 0.75s infinite',
        'heat-pulse': 'heat-pulse 2s ease-in-out infinite',
        'spin-fast':  'spin 0.4s linear infinite',
      },
      transitionDuration: {
        '2000': '2000ms',
      },
    },
  },
  plugins: [],
}
