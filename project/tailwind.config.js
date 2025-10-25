/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80c0ff',
          300: '#4da6ff',
          400: '#1a8dff',
          500: '#0073e6',
          600: '#005bb3',
          700: '#004280',
          800: '#002a4d',
          900: '#00111a',
        },
        success: {
          50: '#e6f7ed',
          100: '#b3e6cc',
          200: '#80d6ab',
          300: '#4dc589',
          400: '#1ab568',
          500: '#00a551',
          600: '#008241',
          700: '#005e30',
          800: '#003b1f',
          900: '#00190d',
        }
      }
    },
  },
  plugins: [],
}
