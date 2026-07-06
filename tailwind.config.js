/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0B0E14',
        surface: '#141924',
        'surface-2': '#1B2230',
        border: '#242C3D',
        text: '#E8ECF1',
        'text-dim': '#8A93A6',
        accent: '#5EE6C5',
        'accent-dim': '#2E7A6C',
        gold: '#FFB84D',
        purple: '#8B5CF6',
        danger: '#FF6B6B',
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
