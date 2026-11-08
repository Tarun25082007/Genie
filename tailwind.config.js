/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        genie: {
          dark: '#070814',
          panel: '#101426',
          border: '#2a3356',
          gold: '#ffd166',
          ruby: '#ef476f',
          emerald: '#06d6a0',
          cyan: '#118ab2',
          purple: '#7b2cbf',
          amber: '#f77f00'
        }
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        vt323: ['"VT323"', 'monospace'],
        mystic: ['Georgia', 'serif']
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'floatSlow 4s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(255, 209, 102, 0.6))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 5px rgba(255, 209, 102, 0.2))' }
        },
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
};
