import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? (process.env.NODE_ENV === 'production' ? '/history-loom/' : '/'),
  cacheDir: '.cache/vite',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: { atlas: 'index.html', classic: 'classic/index.html', legacyAtlas: 'atlas.html' },
    },
  },
  server: {
    host: '127.0.0.1',
  },
})
