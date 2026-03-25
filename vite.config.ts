import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/history-loom/' : '/',
  cacheDir: '.cache/vite',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
  },
})
