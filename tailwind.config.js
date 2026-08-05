/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        space: {
          bg: '#020205',
          card: 'rgba(10, 15, 30, 0.65)',
          border: 'rgba(0, 242, 254, 0.2)',
          lightBg: '#f8fafc',
          lightCard: 'rgba(255, 255, 255, 0.85)',
          lightBorder: 'rgba(37, 99, 235, 0.2)',
        },
        neon: {
          cyan: '#00f2fe',
          blue: '#4facfe',
          purple: '#9d4edd',
          green: '#10b981',
          yellow: '#f59e0b',
          red: '#ef4444',
          orange: '#f97316'
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 242, 254, 0.4)',
        'glow-purple': '0 0 20px rgba(157, 78, 221, 0.4)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
