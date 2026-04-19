import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'charity-management-system-production.up.railway.app',
      '.up.railway.app',
      'localhost'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  preview: {
    allowedHosts: [
      'charity-management-system-production.up.railway.app',
      '.up.railway.app',
      'localhost'
    ],
    port: 3000,
    host: '0.0.0.0'
  }
})