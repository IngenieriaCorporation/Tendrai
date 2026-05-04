/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0A1F44',
          50: '#E8EDF5',
          100: '#C5D0E5',
          600: '#071830',
          700: '#040F1E',
        },
        brand: {
          bg: '#F4F6F8',
          border: '#D1D5DB',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
