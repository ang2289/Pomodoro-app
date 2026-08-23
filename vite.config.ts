import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
// 注意：必須用 loadEnv 讀取 .env / .env.local 的 VITE_VERCEL_URL，否則 proxy 會拿不到你在檔案裡設的本機 API 位址
export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, serverEnv)
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiProxyTarget =
    env.VITE_VERCEL_URL?.trim() || 'https://pomodoro-app-eight-rouge.vercel.app'
  const apiIsHttps = apiProxyTarget.startsWith('https://')

  // AI 關係軍師：Vite 只負責前端，API 交給本機 vercel dev。
  const relationshipApiProxyTarget =
    env.VITE_RELATIONSHIP_API_URL?.trim() || 'http://127.0.0.1:3000'
  const relationshipApiIsHttps = relationshipApiProxyTarget.startsWith('https://')

  return {
  define: {
    'import.meta.env.VITE_VERCEL_ENV': JSON.stringify(process.env.VERCEL_ENV || ''),
  },
  plugins: [
    react(),
    {
      name: 'local-group-buy-api',
      apply: 'serve' as const,
      configureServer(server: any) {
        server.middlewares.use(async (req: any, res: any, next: () => void) => {
          if (!req.url?.startsWith('/api/group-buy')) return next()
          try {
            const requestUrl = new URL(req.url, 'http://localhost')
            req.query = Object.fromEntries(requestUrl.searchParams.entries())
            if (!req.body && !['GET', 'HEAD'].includes(String(req.method || '').toUpperCase())) {
              const chunks: Buffer[] = []
              for await (const chunk of req) chunks.push(Buffer.from(chunk))
              const rawBody = Buffer.concat(chunks).toString('utf8')
              req.body = rawBody || undefined
            }
            res.status = (statusCode: number) => {
              res.statusCode = statusCode
              return res
            }
            res.json = (payload: unknown) => {
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              res.end(JSON.stringify(payload))
              return res
            }
            const apiModule = await server.ssrLoadModule('/api/group-buy.ts')
            await apiModule.default(req, res)
          } catch (error) {
            console.error('[local-group-buy-api] request failed', error)
            if (!res.headersSent) {
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
            }
            if (!res.writableEnded) res.end(JSON.stringify({ error: 'LOCAL_GROUP_BUY_API_FAILED' }))
          }
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3005,
    hmr: {
      overlay: false,
      host: 'localhost',
      port: 3005,
      protocol: 'ws'
    },
    watch: {
      ignored: [
        '**/playwright_shopee_profile/**',
        '**/.tmp_shopee_batch_mp4/**',
        '**/output/**',
        '**/out_mp4/**',
        '**/debug_pick/**',
        '**/public/goods-share/**',
        '**/temp_input.csv',
        '**/tmp_audio/**',
        '**/tmp_images/**',
      ],
    },
    // 本機 `npm run dev`（port 見 package.json，預設 3005）時，/api 會轉發到：
    // - .env.local 的 VITE_VERCEL_URL（例如 vercel dev 本機：http://127.0.0.1:3000）
    // - 未設定則走線上 Vercel API
    proxy: {
      '/api/relationship-ai': {
        target: relationshipApiProxyTarget,
        changeOrigin: true,
        secure: relationshipApiIsHttps,
        rewrite: (p) => p,
      },
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: apiIsHttps,
        rewrite: (p) => p,
      }
    }
  }
}})
