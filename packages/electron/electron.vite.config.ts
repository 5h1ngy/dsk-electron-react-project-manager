import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const normalizeRuntimeTarget = (value?: string): 'desktop' | 'webapp' => {
  const normalized = value?.trim().toLowerCase()
  return normalized === 'webapp' ? 'webapp' : 'desktop'
}

const runtimeTarget = normalizeRuntimeTarget(
  process.env.APP_RUNTIME ?? process.env.VITE_APP_RUNTIME ?? 'desktop'
)

process.env.APP_RUNTIME = runtimeTarget
process.env.VITE_APP_RUNTIME = process.env.VITE_APP_RUNTIME ?? runtimeTarget

const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:3333'
const LOCAL_TSCONFIG_PATH = resolve(__dirname, 'tsconfig.json')
const tsconfigRaw = JSON.parse(readFileSync(LOCAL_TSCONFIG_PATH, 'utf-8'))
process.env.TS_NODE_PROJECT =
  process.env.TS_NODE_PROJECT ?? resolve(__dirname, 'tsconfig.electron.json')

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve(__dirname, 'src/main'),
        '@preload': resolve(__dirname, 'src/preload/src'),
        '@services': resolve(__dirname, '../shared/src'),
        '@backend': resolve(__dirname, '../backend/src'),
        '@renderer': resolve(__dirname, '../frontend/src'),
        '@seeding': resolve(__dirname, '../seeding/src')
      }
    },
    esbuild: {
      tsconfigRaw
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'src/main/index.ts')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: {
        '@preload': resolve(__dirname, 'src/preload/src'),
        '@main': resolve(__dirname, 'src/main'),
        '@services': resolve(__dirname, '../shared/src'),
        '@backend': resolve(__dirname, '../backend/src'),
        '@renderer': resolve(__dirname, '../frontend/src'),
        '@seeding': resolve(__dirname, '../seeding/src')
      }
    },
    esbuild: {
      tsconfigRaw
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/src/index.ts')
        },
        output: {
          format: 'cjs',
          entryFileNames: 'index.cjs'
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: resolve(__dirname, '../frontend'),
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, '../frontend/src'),
        '@preload': resolve(__dirname, 'src/preload/src'),
        '@main': resolve(__dirname, 'src/main'),
        '@services': resolve(__dirname, '../shared/src'),
        '@backend': resolve(__dirname, '../backend/src'),
        '@seeding': resolve(__dirname, '../seeding/src')
      }
    },
    esbuild: {
      tsconfigRaw
    },
    plugins: [react()],
    server: {
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
      rollupOptions: {
        input: resolve(__dirname, '../frontend/index.html')
      }
    }
  }
})
