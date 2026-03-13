import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// The Go backend URL. Run: git-bug webui --port 3000
const API_URL = process.env.VITE_API_URL || 'http://localhost:3000'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/graphql': { target: API_URL, changeOrigin: true },
      '/gitfile': { target: API_URL, changeOrigin: true },
      '/upload': { target: API_URL, changeOrigin: true },
      '/api': { target: API_URL, changeOrigin: true },
      '/auth': { target: API_URL, changeOrigin: true },
    },
  },
})
