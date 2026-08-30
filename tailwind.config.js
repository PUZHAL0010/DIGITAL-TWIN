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
        background: '#090d16',
        surface: '#0e1526',
        'surface-card': '#131b31',
        'surface-border': '#1e293b',
        'surface-hover': '#1e2942',
        cyan: {
          400: '#38bdf8',
          500: '#0ea5e9',
          glow: '#00f2fe'
        },
        risk: {
          normal: '#10b981',
          low: '#3b82f6',
          moderate: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        'glow-cyan': '0 0 20px -5px rgba(14, 165, 233, 0.5)',
        'glow-red': '0 0 20px -5px rgba(239, 68, 68, 0.5)',
        'glow-amber': '0 0 20px -5px rgba(245, 158, 11, 0.5)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.05)' }
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' }
        }
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanline 8s linear infinite'
      }
    },
  },
  plugins: [],
}
