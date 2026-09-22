/** @type {import('tailwindcss').Config} */
// Build-time replacement for the inline `tailwind.config` that previously sat
// in index.html alongside the Play CDN script. The `primary` brand colour is
// carried over unchanged.
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1993cc',
      },
    },
  },
  plugins: [],
};
