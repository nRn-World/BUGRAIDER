/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './App.tsx',
    './index.tsx',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        'primary-red': 'rgb(var(--color-primary-red) / <alpha-value>)',
        'background-dark': 'rgb(var(--color-background-dark) / <alpha-value>)',
      },
      boxShadow: {
        glass: '0 10px 40px rgba(0,0,0,0.45)',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 600ms ease-out both',
      },
    },
  },
  plugins: [],
};
