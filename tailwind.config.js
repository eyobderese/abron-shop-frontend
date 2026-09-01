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
      boxShadow: {
        card: '0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)',
        cardHover:
          '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
      },
    },
  },
  plugins: [],
};
