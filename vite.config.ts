import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The production build is served from the GitHub Pages project path.
// Change this if the site moves to a custom domain at the root.
const PAGES_BASE = '/Real-Estate-Website/'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? PAGES_BASE : '/',
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  // MapLibre starts its worker as a module worker
  worker: { format: 'es' },
}))
