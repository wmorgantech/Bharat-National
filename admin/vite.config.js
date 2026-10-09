import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',

  // Dev server only - no effect on `vite build`.
  //
  // Paired with the storefront on 5180; see frontend/vite.config.js. 5181 was
  // already taken by another node process on this machine, hence 5182. Both
  // ports must appear in backend/.env CORS_ORIGINS, because this panel calls
  // the same API. strictPort makes a clash fail loudly.
  server: {
    port: 5182,
    strictPort: true,
  },
})