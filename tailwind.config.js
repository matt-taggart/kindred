/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        sage: {
          DEFAULT: '#9CA986',
          100: '#E6E9E1',
          muted: '#8B9678', // from plan text secondary
        },
        terracotta: {
          DEFAULT: '#D4896A',
          100: '#F6E6DE',
        },
        cream: '#F3F0E6',
        surface: '#FDFBF7',
        slate: {
          DEFAULT: '#5C6356',
          600: '#5C6356', // mapping old usages
          900: '#2D312A', // darker for headings
        },
        border: '#E8E4DA',
      },
    },
  },
  plugins: [],
};
