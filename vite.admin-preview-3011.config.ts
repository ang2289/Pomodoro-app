import { defineConfig } from 'vite'

export default defineConfig({
  appType: 'spa',
  preview: {
    host: '127.0.0.1',
    port: 3011,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
