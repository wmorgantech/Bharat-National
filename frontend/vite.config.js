import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',

  // Dev server only - no effect on `vite build`.
  //
  // 5180/5181 are BNC's own pair, deliberately off Vite's default 5173 so
  // other projects on this machine cannot take the port first. That is what
  // broke things before: Vite silently moves to the next free port, the
  // storefront came up on an origin the backend's CORS allow-list did not
  // contain, and every API response lost its Access-Control-Allow-Origin
  // header - which surfaced as "could not load the catalogue" and as a login
  // that appeared to reject valid credentials.
  //
  // These two ports must match backend/.env CORS_ORIGINS exactly. strictPort
  // makes a clash fail loudly rather than drifting to an untrusted origin.
  server: {
    port: 5180,
    strictPort: true,
  },
})
