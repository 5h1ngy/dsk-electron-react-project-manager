import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:3333'

export default defineConfig({
  base: './',
  root: resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src'),
      '@preload': resolve(__dirname, '../electron/src/preload/src'),
      '@main': resolve(__dirname, '../electron/src/main'),
      '@services': resolve(__dirname, '../../shared/src'),
      '@backend': resolve(__dirname, '../../backend/src'),
      '@seeding': resolve(__dirname, '../../seeding/src')
    }
  },
  server: {
    port: Number(process.env.FRONTEND_PORT ?? 5173),
    host: true,
    proxy: {
      '/api': {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    outDir: resolve(__dirname, '../../../out/renderer-web'),
    emptyOutDir: true
  }
})
