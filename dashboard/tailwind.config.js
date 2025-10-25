/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        racing: {
          red: '#dc2626',
          green: '#16a34a',
          blue: '#2563eb',
          yellow: '#eab308',
          orange: '#ea580c',
          purple: '#9333ea',
          gray: '#6b7280'
        }
      },
      animation: {
        'pulse-race': 'pulse-race 2s infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out'
      }
    },
  },
  plugins: [],
}