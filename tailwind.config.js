/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans Ethiopic',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
        amharic: ['"Noto Sans Ethiopic"', 'Inter', 'sans-serif'],
      },
      colors: {
        // Nordstrom-Rack-inspired: nearly-black text, red sale accent,
        // with an Ethiopian green/yellow/red accent palette for local feel.
        ink: { DEFAULT: '#111111', soft: '#333333', muted: '#6B7280' },
        sale: { DEFAULT: '#C8102E', dark: '#9E0C24' },
        primary: { DEFAULT: '#111111', light: '#333333', dark: '#000000' },
        eth: {
          green: '#078930',
          yellow: '#FCDD09',
          red: '#DA121A',
        },
      },
      keyframes: {
        // New digit slides down into its box each second.
        'flash-tick': {
          '0%': { transform: 'translateY(-60%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        // Light sweep across the flash deal bar.
        'flash-shine': {
          '0%': { transform: 'translateX(-100%) skewX(-20deg)' },
          '60%, 100%': { transform: 'translateX(250%) skewX(-20deg)' },
        },
        // Lightning bolt "charges up" every couple of seconds.
        'flash-bolt': {
          '0%, 70%, 100%': { transform: 'scale(1) rotate(0deg)', filter: 'drop-shadow(0 0 0 rgba(252,221,9,0))' },
          '78%': { transform: 'scale(1.3) rotate(-12deg)', filter: 'drop-shadow(0 0 6px rgba(252,221,9,0.9))' },
          '86%': { transform: 'scale(1.1) rotate(8deg)' },
        },
        'flash-pop': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.08)' },
        },
      },
      animation: {
        'flash-tick': 'flash-tick 0.35s ease-out',
        'flash-shine': 'flash-shine 3.5s ease-in-out infinite',
        'flash-bolt': 'flash-bolt 2.4s ease-in-out infinite',
        'flash-pop': 'flash-pop 1.6s ease-in-out infinite',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)',
        cardHover:
          '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};
