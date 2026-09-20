import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const adminKey = String(env.RXV_IMAGE_ADMIN_KEY || '').trim()
  // dev:image-admin 也要讓公開 /images 讀到最新 R2 catalog。
  // R2_PUBLIC_ASSET_URL 是公開網址（非密鑰），可安全映射給前端。
  const publicR2Url = String(env.VITE_PUBLIC_R2_URL || env.R2_PUBLIC_ASSET_URL || '').trim()

  return {
    define: {
      'import.meta.env.VITE_PUBLIC_R2_URL': JSON.stringify(publicR2Url),
    },
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
