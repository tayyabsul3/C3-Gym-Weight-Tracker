/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0F0F10',
        surface: '#1A1A1C',
        surface2: '#252527',
        border: '#2C2C2E',
        primary: '#00E5FF', // Neon Ice
        secondary: '#C3F400', // Acid Green
        success: '#C3F400',
        warn: '#FFC107',
        danger: '#ffb4ab',
        textPrimary: '#F1F5F9',
        textSecondary: '#94A3B8',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        focus: '0 4px 12px rgba(0, 229, 255, 0.25)',
        glow: '0 0 12px rgba(0, 229, 255, 0.35)',
        successGlow: '0 0 12px rgba(195, 244, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
