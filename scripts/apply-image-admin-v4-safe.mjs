import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const adminFile = path.join(root, 'src', 'pages', 'admin', 'images.tsx')
const viteFile = path.join(root, 'vite.config.ts')
const adminMarker = 'RXV_IMAGE_ADMIN_V4'
const viteMarker = 'rxv-local-image-admin-api-v4'

for (const file of [adminFile, viteFile]) {
  if (!fs.existsSync(file)) throw new Error(`找不到檔案：${file}`)
}

const admin = fs.readFileSync(adminFile, 'utf8')
const vite = fs.readFileSync(viteFile, 'utf8')
const adminApplied = admin.includes(adminMarker)
const viteApplied = vite.includes(viteMarker)

if (process.argv.includes('--restore')) {
  await import('./apply-image-admin-v4.mjs')
} else if (adminApplied && viteApplied) {
  console.log('RXV 圖片後台 v4 已套用，不重複修改，也不建立第二份備份。')
} else if (adminApplied !== viteApplied) {
  throw new Error('偵測到 v4 只有部分套用。為避免覆寫，請先執行：node scripts/apply-image-admin-v4.mjs --restore')
} else {
  await import('./apply-image-admin-v4.mjs')
}
