import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

const API_PROXY_TARGET = process.env.API_PROXY_TARGET ?? 'http://localhost:3333'
process.env.TS_NODE_PROJECT =
  process.env.TS_NODE_PROJECT ?? resolve(__dirname, 'tsconfig.electron.json')

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve(__dirname, 'src/main'),
        '@preload': resolve(__dirname, 'src/preload/src'),
        '@services': resolve(__dirname, '../shared/src'),
        '@api': resolve(__dirname, '../api/src'),
        '@renderer': resolve(__dirname, 'src/renderer/src'),
        '@seeding': resolve(__dirname, '../seeding/src')
      }
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
        '@api': resolve(__dirname, '../api/src'),
        '@renderer': resolve(__dirname, 'src/renderer/src'),
        '@seeding': resolve(__dirname, '../seeding/src')
      }
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
    root: resolve(__dirname, 'src/renderer'),
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer/src'),
        '@preload': resolve(__dirname, 'src/preload/src'),
        '@main': resolve(__dirname, 'src/main'),
        '@services': resolve(__dirname, '../shared/src'),
        '@api': resolve(__dirname, '../api/src'),
        '@seeding': resolve(__dirname, '../seeding/src')
      }
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
        input: resolve(__dirname, 'src/renderer/index.html')
      }
    }
  }
})
