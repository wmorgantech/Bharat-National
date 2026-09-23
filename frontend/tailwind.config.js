/** @type {import('tailwindcss').Config} */
// Build-time replacement for the inline `tailwind.config` that previously sat
// in index.html alongside the Play CDN script.
//
// The palette below is not a new brand palette: every value is one of the
// hex codes already declared as a CSS variable in index.html / App.css, just
// exposed to Tailwind so utilities like `bg-primary` actually compile. Before
// this, Footer.jsx used `bg-primary`/`text-primary` against a theme that never
// defined them, so its Subscribe button rendered with no background.
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // BNC brand teal stays the single accent colour.
        primary: {
          DEFAULT: '#00897B',
          dark: '#00695C',
          light: '#26A69A',
          deep: '#0F615D',
          50: '#E6F4F2',
          100: '#CCE9E5',
        },
        // Neutral text / surface ramp for a light UI.
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)',
        'card-hover': '0 4px 12px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.04)',
        lift: '0 10px 24px -8px rgba(15,23,42,0.12), 0 4px 8px rgba(15,23,42,0.05)',
        header: '0 1px 3px rgba(15,23,42,0.06)',
      },
    },
  },
  plugins: [],
};
