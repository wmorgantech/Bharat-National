/** @type {import('tailwindcss').Config} */
// Build-time replacement for the inline `tailwind.config` that previously sat
// in index.html alongside the Play CDN script. Theme values are carried over
// unchanged so the compiled CSS matches what the CDN was generating.
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
