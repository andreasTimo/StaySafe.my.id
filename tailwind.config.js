/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        kekerasan: {
          light: '#FCA5A5',
          DEFAULT: '#EF4444',
          dark: '#991B1B',
        },
        pencurian: {
          light: '#FDBA74',
          DEFAULT: '#F97316',
          dark: '#9A3412',
        },
        penipuan: {
          light: '#D8B4FE',
          DEFAULT: '#A855F7',
          dark: '#581C87',
        },
        vandalisme: {
          light: '#93C5FD',
          DEFAULT: '#3B82F6',
          dark: '#1E3A5F',
        },
        tawuran: {
          light: '#BBF7D0',
          DEFAULT: '#22C55E',
          dark: '#14532D',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
