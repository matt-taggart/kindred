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
        },
        terracotta: {
          DEFAULT: '#D4896A',
          100: '#F6E6DE',
        },
        cream: '#F3F0E6',
        surface: '#FDFBF7',
        // Warm text colors (use instead of Tailwind's blue-gray slate)
        warmgray: {
          DEFAULT: '#5C6356',  // primary text
          muted: '#8B9678',    // secondary text
        },
        border: '#E8E4DA',
      },
    },
  },
  plugins: [],
};
