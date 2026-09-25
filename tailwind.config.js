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
        dark: {
          950: '#040404',
          900: '#080808',
          850: '#0C0C0C',
          800: '#111111',
          700: '#171717',
        },
        surface: {
          50: '#383838',
          100: '#121212',
          200: '#181818',
          300: '#1E1E1E',
          400: '#252525',
          hover: '#222222',
          active: '#2A2A2A',
        },
        accent: {
          DEFAULT: '#FFFFFF', // Clean White
          hover: '#E5E7EB',
          light: '#F3F4F6',
          silver: '#D1D5DB',
          gray: '#9CA3AF',
          dark: '#262626',
        },
        muted: {
          DEFAULT: '#9CA3AF',
          light: '#E5E7EB',
          dark: '#6B7280',
          darker: '#4B5563',
        }
      },
      borderRadius: {
        'card': '12px',
        'btn': '8px',
        'pill': '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.65)',
        'card-subtle': '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'luxury-fade': 'luxuryFade 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'luxury-slide-up': 'luxurySlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'luxury-slide-right': 'luxurySlideRight 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'equalizer-1': 'equalizer 1.4s ease-in-out infinite',
        'equalizer-2': 'equalizer 1.6s ease-in-out 0.25s infinite',
        'equalizer-3': 'equalizer 1.3s ease-in-out 0.5s infinite',
        'equalizer-4': 'equalizer 1.5s ease-in-out 0.15s infinite',
        'pulse-subtle': 'pulseSubtle 4s ease-in-out infinite',
      },
      keyframes: {
        luxuryFade: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        luxurySlideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        luxurySlideRight: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        equalizer: {
          '0%, 100%': { height: '3px' },
          '50%': { height: '13px' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.85' },
          '50%': { opacity: '1' },
        }
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
