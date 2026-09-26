import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // One .env at the repository root serves both apps.
  envDir: '../..',
  server: {
    proxy: {
      '/api/socket.io': { target: 'http://localhost:3100', ws: true },
      '/api': 'http://localhost:3100',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
  },
})
