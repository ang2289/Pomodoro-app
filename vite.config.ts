import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// 檢查是否已生成 SSL 憑證
const httpsEnabled = fs.existsSync(path.resolve(__dirname, 'localhost.key')) && 
                     fs.existsSync(path.resolve(__dirname, 'localhost.crt'));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  define: { 'import.meta.env.IMAGE_CATALOG_URL': JSON.stringify(env.IMAGE_CATALOG_URL || '') },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    ...(httpsEnabled ? {
      https: {
        key: fs.readFileSync(path.resolve(__dirname, 'localhost.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'localhost.crt')),
      },
    } : {}),
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: process.env.VITE_VERCEL_URL || 'https://pomodoro-app-eight-rouge.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
      }
    }
  }
}})

