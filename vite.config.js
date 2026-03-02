import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Single export with proxy configuration to forward `/api` to the local
// Express proxy server during development.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5175',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, '/api')
      }
    }
  }
})
