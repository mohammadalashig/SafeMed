import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#0a0f14',
          900: '#111827',
          800: '#1a2332',
          700: '#24303f',
          600: '#2d3d4e',
          500: '#364a5d',
          400: '#4a5f73',
        },
        medical: {
          600: '#0891b2',
          500: '#06b6d4',
          400: '#22d3ee',
          300: '#67e8f9',
          200: '#a5f3fc',
        },
        safety: {
          600: '#059669',
          500: '#10b981',
          400: '#34d399',
          300: '#6ee7b7',
          200: '#a7f3d0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'gradient-shift': 'gradientShift 3s ease infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(6, 182, 212, 0.8), 0 0 40px rgba(6, 182, 212, 0.4)' },
        },
      },
      boxShadow: {
        'neon': '0 0 20px rgba(6, 182, 212, 0.6)',
        'neon-lg': '0 0 40px rgba(6, 182, 212, 0.4)',
        'safety': '0 0 20px rgba(16, 185, 129, 0.6)',
        'safety-lg': '0 0 40px rgba(16, 185, 129, 0.4)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
}

export default config

