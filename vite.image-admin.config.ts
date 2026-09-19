import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const adminKey = String(env.RXV_IMAGE_ADMIN_KEY || '').trim()

  return {
    plugins: [react()],
    resolve: { alias: { '@': path.resolve(__dirname, './src') } },
    server: {
      host: '127.0.0.1',
      port: 3010,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:3000',
          changeOrigin: true,
          configure(proxy) {
            proxy.on('proxyReq', (proxyReq) => {
              if (adminKey) proxyReq.setHeader('X-RXV-Image-Admin-Key', adminKey)
            })
          },
        },
      },
    },
  }
})
