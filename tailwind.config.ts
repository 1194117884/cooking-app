import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm food-inspired palette
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        terracotta: {
          50: '#fdf4f1',
          100: '#fce8e3',
          200: '#f9d0c6',
          300: '#f4b0a0',
          400: '#ec8870',
          500: '#e0644f',
          600: '#cd4b3b',
          700: '#ab3a31',
          800: '#8e322d',
          900: '#762d29',
        },
        sage: {
          50: '#f6f7f4',
          100: '#e8ebe3',
          200: '#d1d8c7',
          300: '#b3bfa3',
          400: '#95a17f',
          500: '#7a8563',
          600: '#5f6a4c',
          700: '#4d543f',
          800: '#404634',
          900: '#363a2e',
        },
        cream: {
          50: '#fdfcf8',
          100: '#f9f6ed',
          200: '#f3ecd6',
          300: '#ebe0b5',
          400: '#e0d08e',
          500: '#d4bc6a',
          600: '#c8a64e',
          700: '#a6863d',
          800: '#886d35',
          900: '#705a2f',
        },
        // Keep existing colors for compatibility
        primary: {
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffc4c4',
          300: '#ff9d9d',
          400: '#ff6b6b',
          500: '#ff4747',
          600: '#ee5a5a',
          700: '#dc2626',
          800: '#b91c1c',
          900: '#991b1b',
        },
        accent: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        'display': ['Playfair Display', 'LXGW WenKai', 'serif'],
        'body': ['Lato', 'LXGW WenKai', 'system-ui', 'sans-serif'],
        'serif-cn': ['Source Han Serif CN', 'Noto Serif SC', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(245, 158, 11, 0.15)',
        'float': '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
        'inner-light': 'inset 0 2px 4px 0 rgba(255, 255, 255, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'warm-gradient': 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
        'sunset-gradient': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
        'cream-gradient': 'linear-gradient(180deg, #fdfcf8 0%, #f9f6ed 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};

export default config;
