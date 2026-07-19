import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Makes http://localhost:5173/storage/... transparently forward to
      // http://localhost:8000/storage/..., so the browser sees it as
      // same-origin — no CORS header needed on the Laravel side at all.
      '/storage': 'http://localhost:8000',
    },
  },
})