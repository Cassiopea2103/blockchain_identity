import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https: wss: ws: http://localhost:*; img-src 'self' data: https:;"
    }
  },
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      'process': 'process/browser',
      'buffer': 'buffer',
    }
  },
  optimizeDeps: {
    include: ['buffer', 'process']
  }
})