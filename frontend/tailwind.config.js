/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#B8860B',
          dark: '#8B6914',
          light: '#D4AF37',
        },
        cream: {
          DEFAULT: '#F8F5F0',
          dark: '#E8E0D5',
        },
        ink: {
          DEFAULT: '#111111',
          light: '#333333',
        },
        success: {
          DEFAULT: '#2D7A4F',
          light: '#40916C',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
