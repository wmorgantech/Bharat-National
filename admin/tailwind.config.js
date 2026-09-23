/** @type {import('tailwindcss').Config} */
// Admin design tokens, deliberately identical to the storefront's
// (frontend/tailwind.config.js) so both apps read as one product.
//
// `primary` was #1993cc here while the storefront brand is #00897B, and
// App.css declared a third value (#3b82f6). All three are unified onto the
// real Bharat National Computers brand teal.
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#00897B',
          dark: '#00695C',
          light: '#26A69A',
          deep: '#0F615D',
        },
        ink: {
          50: '#F2F4F7',
          100: '#E4E6EB',
          200: '#D0D5DD',
          500: '#475467',
          600: '#344054',
          900: '#1A1A1A',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(16,24,40,0.04), 0 8px 24px -12px rgba(16,24,40,0.18)',
        lift: '0 2px 4px rgba(16,24,40,0.05), 0 18px 40px -16px rgba(16,24,40,0.28)',
        glow: '0 10px 30px -10px rgba(0,137,123,0.55)',
      },
    },
  },
  plugins: [],
};
