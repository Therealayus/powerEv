/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        card: '#1E293B',
        primary: '#22C55E',
        accent: '#3B82F6',
        border: '#334155',
      },
      borderRadius: {
        card: '20px',
      },
    },
  },
  plugins: [],
};
