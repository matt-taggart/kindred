/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#9CA986',
          100: '#E6E9E1', // lighter tint for backgrounds
        },
        terracotta: {
          DEFAULT: '#D48158',
          100: '#F6E6DE', // lighter tint
        },
        magic: {
          DEFAULT: '#6366f1', // Indigo 500
          100: '#e0e7ff', // Indigo 100
          200: '#c7d2fe', // Indigo 200
          600: '#4f46e5', // Indigo 600
        },
        cream: '#F3F0E6',
        slate: '#475569',
      },
    },
  },
  plugins: [],
};
