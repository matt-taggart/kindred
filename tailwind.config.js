/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#9DBEBB',
        secondary: '#F4ACB7',
        accent: '#FFE5D9',
        'brand-navy': '#2D3648',
        'background-light': '#FFFFFF',
        'background-dark': '#121414',
      },
      fontFamily: {
        display: ['Quicksand_400Regular', 'Quicksand_500Medium', 'Quicksand_600SemiBold', 'Quicksand_700Bold'],
        body: ['Outfit_300Light', 'Outfit_400Regular', 'Outfit_500Medium', 'Outfit_600SemiBold'],
      },
      borderRadius: {
        DEFAULT: '24px',
        xl: '32px',
        '2xl': '40px',
      },
      boxShadow: {
        soft: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
};
