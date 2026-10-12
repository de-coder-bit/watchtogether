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
        brand: {
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        cinema: {
          bg: '#090a0f',
          surface: '#11131c',
          card: '#161926',
          border: '#232738',
          hover: '#1e2235',
          accent: '#8b5cf6',
          glow: '#ec4899',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'glow-brand': '0 0 25px -5px rgba(217, 70, 239, 0.4)',
        'glow-accent': '0 0 25px -5px rgba(139, 92, 246, 0.4)',
        'glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.4)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'speaking-glow': 'speakingGlow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        speakingGlow: {
          '0%': { boxShadow: '0 0 5px #10b981, inset 0 0 5px #10b981' },
          '100%': { boxShadow: '0 0 20px #10b981, inset 0 0 10px #10b981' },
        }
      }
    },
  },
  plugins: [],
}
