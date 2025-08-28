import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      swcPlugin()
    ],
    build: {
      sourcemap: true,
      minify: false,
      watch: {}
    }
  },
  preload: {
    plugins: [
      externalizeDepsPlugin(),
      swcPlugin()
    ],
    build: {
      sourcemap: true,
      minify: false,
      watch: {}
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      react()
    ],
    server: {
      hmr: {
        overlay: true
      }
    },
    build: {
      assetsDir: '.',
      rollupOptions: {
        output: {
          format: 'es',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]'
        }
      }
    }
  }
})
