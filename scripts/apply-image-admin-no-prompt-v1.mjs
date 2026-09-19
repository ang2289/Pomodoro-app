import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const adminFile = path.join(root, 'src', 'pages', 'admin', 'images.tsx')
const viteFile = path.join(root, 'vite.image-admin.config.ts')
const backupDir = path.join(root, 'backup', 'image-admin-no-prompt-v1')

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function backup(file) {
  fs.mkdirSync(backupDir, { recursive: true })
  const target = path.join(backupDir, `${path.basename(file)}.${stamp()}.bak`)
  fs.copyFileSync(file, target)
  return target
}

for (const file of [adminFile, viteFile]) {
  if (!fs.existsSync(file)) throw new Error(`找不到檔案：${file}`)
}

const adminBackup = backup(adminFile)
const viteBackup = backup(viteFile)

let admin = fs.readFileSync(adminFile, 'utf8')
let vite = fs.readFileSync(viteFile, 'utf8')

// 3010 本機專用後台不再要求手動輸入管理金鑰；正式網站仍保留原本驗證流程。
const start = admin.indexOf("const IMAGE_ADMIN_KEY_STORAGE = 'rxv_image_admin_key'")
const interfaceIndex = admin.indexOf('interface ImageCategory', start)
if (start < 0 || interfaceIndex < 0) throw new Error('找不到圖片後台金鑰區塊，未修改任何檔案。')

const replacement = `const IMAGE_ADMIN_KEY_STORAGE = 'rxv_image_admin_key'\n\nfunction isLocalImageAdmin() {\n  return window.location.hostname === '127.0.0.1' && window.location.port === '3010'\n}\n\nfunction getImageAdminKey() {\n  if (isLocalImageAdmin()) return ''\n  let key = localStorage.getItem(IMAGE_ADMIN_KEY_STORAGE) || ''\n  if (!key) {\n    key = window.prompt('請輸入圖片後台管理金鑰')?.trim() || ''\n    if (key) localStorage.setItem(IMAGE_ADMIN_KEY_STORAGE, key)\n  }\n  return key\n}\n\nasync function imageAdminFetch(url: string, init: RequestInit = {}) {\n  const headers = new Headers(init.headers || {})\n  if (!isLocalImageAdmin()) {\n    const key = getImageAdminKey()\n    if (!key) throw new Error('請輸入圖片後台管理金鑰')\n    headers.set('X-RXV-Image-Admin-Key', key)\n  }\n  const response = await fetch(url, { ...init, headers })\n  if (!isLocalImageAdmin() && (response.status === 401 || response.status === 403)) {\n    localStorage.removeItem(IMAGE_ADMIN_KEY_STORAGE)\n  }\n  return response\n}\n\n`

admin = admin.slice(0, start) + replacement + admin.slice(interfaceIndex)
admin = admin.replaceAll('sessionStorage.removeItem(IMAGE_ADMIN_KEY_STORAGE)', 'localStorage.removeItem(IMAGE_ADMIN_KEY_STORAGE)')

// 專用 3010 Vite proxy 直接在伺服器端注入 .env.local 的 RXV_IMAGE_ADMIN_KEY。
vite = `import { defineConfig, loadEnv } from 'vite'\nimport react from '@vitejs/plugin-react'\nimport path from 'node:path'\n\nexport default defineConfig(({ mode }) => {\n  const env = loadEnv(mode, process.cwd(), '')\n  const adminKey = String(env.RXV_IMAGE_ADMIN_KEY || '').trim()\n\n  return {\n    plugins: [react()],\n    resolve: { alias: { '@': path.resolve(__dirname, './src') } },\n    server: {\n      host: '127.0.0.1',\n      port: 3010,\n      strictPort: true,\n      proxy: {\n        '/api': {\n          target: 'http://127.0.0.1:3000',\n          changeOrigin: true,\n          configure(proxy) {\n            proxy.on('proxyReq', (proxyReq) => {\n              if (adminKey) proxyReq.setHeader('X-RXV-Image-Admin-Key', adminKey)\n            })\n          },\n        },\n      },\n    },\n  }\n})\n`

fs.writeFileSync(adminFile, admin, 'utf8')
fs.writeFileSync(viteFile, vite, 'utf8')

console.log('RXV 圖片後台免重複輸入金鑰 v1 已套用。')
console.log('3010 本機後台：不再跳管理金鑰輸入框，由 Vite proxy 自動帶入 .env.local 金鑰。')
console.log('正式網站後台：仍保留管理金鑰驗證。')
console.log('沒有修改 rxv-app、Capacitor、APP 版本或 catalog JSON 結構。')
console.log(`後台備份：${adminBackup}`)
console.log(`Vite 備份：${viteBackup}`)
console.log('請重新執行：npm run dev:image-admin')
