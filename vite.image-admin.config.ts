import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const adminKey = String(env.RXV_IMAGE_ADMIN_KEY || '').trim()
  return {
    // 本機 3010 不讓瀏覽器直接跨網域讀 R2，避免 CORS 失敗後退回舊的 1,584 張靜態清單。
    // 改由同源 /api/image-admin 代理讀取最新 R2 catalog。
    define: {
      'import.meta.env.VITE_PUBLIC_R2_URL': JSON.stringify(''),
      'import.meta.env.VITE_IMAGE_MANIFEST_URL': JSON.stringify('/api/image-admin?action=public-catalog'),
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
