/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'board-light': '#f0d9b5',
        'board-dark': '#b58863',
        'board-selected': '#7fc97f',
        'board-move': '#cdd16a',
      },
    },
  },
  plugins: [],
};
