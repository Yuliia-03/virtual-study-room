/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      backgroundColor: ['hover'],
      safelist: [
        'hover:bg-[#8e99e3]',
        'hover:scale-105',
      ],
      scale: ['hover'],
      fontFamily: {
        'press-start': ['"Press Start 2P"', 'cursive'],
      },
    },
  },
  plugins: [],
}
