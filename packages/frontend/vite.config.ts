import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

const normalizeRuntimeTarget = (value?: string): 'desktop' | 'webapp' => {
  const normalized = value?.trim().toLowerCase()
  return normalized === 'desktop' ? 'desktop' : 'webapp'
}

const runtimeTarget = normalizeRuntimeTarget(
  process.env.VITE_APP_RUNTIME ?? process.env.APP_RUNTIME ?? 'webapp'
)

process.env.VITE_APP_RUNTIME = runtimeTarget
process.env.APP_RUNTIME = process.env.APP_RUNTIME ?? runtimeTarget

const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:3333'

const normalizeBasePath = (value?: string, fallback?: string): string => {
  if (!value || value.trim().length === 0) {
    return fallback ?? '/'
  }
  const normalized = value.trim()
  if (normalized === '.' || normalized === './') {
    return './'
  }
  if (normalized === '/') {
    return '/'
  }
  return normalized.endsWith('/') ? normalized : `${normalized}/`
}

const DEFAULT_BASE = runtimeTarget === 'desktop' ? './' : '/'
const PUBLIC_BASE = normalizeBasePath(
  process.env.VITE_PUBLIC_BASE,
  DEFAULT_BASE
)

process.env.VITE_PUBLIC_BASE = PUBLIC_BASE

export default defineConfig({
  base: PUBLIC_BASE,
  root: resolve(__dirname),
  publicDir: resolve(__dirname, '../../public'),
  plugins: [react()],
  resolve: {
    alias: {
      '@renderer': resolve(__dirname, 'src'),
      '@preload': resolve(__dirname, '../electron/src/preload/src'),
      '@main': resolve(__dirname, '../electron/src/main'),
      '@services': resolve(__dirname, '../shared/src'),
      '@backend': resolve(__dirname, '../backend/src'),
      '@seeding': resolve(__dirname, '../seeding/src')
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
    outDir: resolve(__dirname, '../../out/renderer-web'),
    emptyOutDir: true
  }
})
