/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        racing: {
          red: '#FF0000',
          blue: '#0066FF',
          green: '#00FF00',
          yellow: '#FFFF00',
          orange: '#FF6600',
          purple: '#9933FF',
          black: '#000000',
          white: '#FFFFFF',
          gray: '#808080'
        },
        track: {
          asphalt: '#2D2D2D',
          grass: '#228B22',
          gravel: '#DEB887',
          barrier: '#FF4444'
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'bounce-soft': 'bounce 2s infinite',
        'flash': 'flash 0.5s ease-in-out infinite alternate',
        'race-start': 'race-start 3s ease-out',
        'overtake': 'overtake 0.8s ease-out'
      },
      keyframes: {
        flash: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0.5' }
        },
        'race-start': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.1)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'overtake': {
          '0%': { transform: 'translateX(0) scale(1)' },
          '50%': { transform: 'translateX(20px) scale(1.2)' },
          '100%': { transform: 'translateX(0) scale(1)' }
        }
      },
      boxShadow: {
        'racing': '0 0 20px rgba(255, 0, 0, 0.5)',
        'neon-blue': '0 0 15px rgba(0, 102, 255, 0.7)',
        'neon-green': '0 0 15px rgba(0, 255, 0, 0.7)',
        'neon-yellow': '0 0 15px rgba(255, 255, 0, 0.7)'
      },
      fontFamily: {
        'racing': ['Orbitron', 'monospace'],
        'mono': ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}