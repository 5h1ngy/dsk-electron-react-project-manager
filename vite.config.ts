import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main process entry point
        entry: 'electron/main/index.ts',
        vite: {
          build: {
            outDir: 'dist/electron/main',
            rollupOptions: {
              external: ['electron', 'electron-updater', 'sqlite3', 'sequelize'],
            },
            minify: false,
            sourcemap: false,
          },
        },
      },
      {
        // Preload scripts
        entry: 'electron/preload/index.ts',
        vite: {
          build: {
            outDir: 'dist/electron/preload',
            minify: false,
            sourcemap: false,
          }
        },
      }
    ]),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@main': resolve(__dirname, 'electron/main'),
      '@preload': resolve(__dirname, 'electron/preload'),
      '@shared': resolve(__dirname, 'electron/shared'),
    },
  },
  build: {
    outDir: 'dist/renderer',
  },
});
