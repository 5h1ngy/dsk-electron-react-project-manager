import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname),
  plugins: [react()],
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src'),
      '@preload': resolve(__dirname, '../preload/src'),
      '@services': resolve(__dirname, '../services/src')
    }
  },
  server: {
    port: Number(process.env.FRONTEND_PORT ?? 5173),
    host: true
  },
  build: {
    outDir: resolve(__dirname, '../../out/renderer-web'),
    emptyOutDir: true
  }
})
