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
        cream: '#F3F0E6',
        slate: '#475569',
      },
    },
  },
  plugins: [],
};
