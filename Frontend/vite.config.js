import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/diagnosis': 'http://localhost:9000',
      '/knowledge': 'http://localhost:9000',
      '/advisory': 'http://localhost:9000',
      '/compost': 'http://localhost:9000',
      '/reports': 'http://localhost:9000',
    },
  },
})
