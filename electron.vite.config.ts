import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve(__dirname, 'packages/main/src'),
        '@preload': resolve(__dirname, 'packages/preload/src'),
        '@services': resolve(__dirname, 'packages/services/src')
      }
    },
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'packages/main/src/index.ts')
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    resolve: {
      alias: {
        '@preload': resolve(__dirname, 'packages/preload/src'),
        '@main': resolve(__dirname, 'packages/main/src'),
        '@services': resolve(__dirname, 'packages/services/src')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'packages/preload/src/index.ts')
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: resolve(__dirname, 'packages/renderer'),
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'packages/renderer/src'),
        '@preload': resolve(__dirname, 'packages/preload/src'),
        '@main': resolve(__dirname, 'packages/main/src'),
        '@services': resolve(__dirname, 'packages/services/src')
      }
    },
    plugins: [react()],
    build: {
      rollupOptions: {
        input: resolve(__dirname, 'packages/renderer/index.html')
      }
    }
  }
})
