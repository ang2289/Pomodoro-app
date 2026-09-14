import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const adminFile = path.join(root, 'src', 'pages', 'admin', 'images.tsx')
const viteFile = path.join(root, 'vite.config.ts')
const backupDir = path.join(root, 'backup', 'image-admin-v4-1')

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

function ensureFile(file) {
  if (!fs.existsSync(file)) throw new Error(`找不到檔案：${file}`)
}

function backup(file) {
  fs.mkdirSync(backupDir, { recursive: true })
  const target = path.join(backupDir, `${path.basename(file)}.${stamp()}.bak`)
  fs.copyFileSync(file, target)
  return target
}

for (const file of [adminFile, viteFile]) ensureFile(file)

const adminBackup = backup(adminFile)
const viteBackup = backup(viteFile)

const originalAdmin = fs.readFileSync(adminFile, 'utf8')
const originalVite = fs.readFileSync(viteFile, 'utf8')
const adminEol = originalAdmin.includes('\r\n') ? '\r\n' : '\n'
const viteEol = originalVite.includes('\r\n') ? '\r\n' : '\n'

try {
  // Windows 常見 CRLF 會讓舊版精確字串比對失敗。
  // 先暫時統一成 LF，再執行既有 v4 套用程式。
  fs.writeFileSync(adminFile, originalAdmin.replace(/\r\n/g, '\n'), 'utf8')
  fs.writeFileSync(viteFile, originalVite.replace(/\r\n/g, '\n'), 'utf8')

  await import(`./apply-image-admin-v4.mjs?run=${Date.now()}`)

  // 套用完成後恢復原本換行格式，避免整檔只因 EOL 產生大量差異。
  const nextAdmin = fs.readFileSync(adminFile, 'utf8').replace(/\r?\n/g, adminEol)
  const nextVite = fs.readFileSync(viteFile, 'utf8').replace(/\r?\n/g, viteEol)
  fs.writeFileSync(adminFile, nextAdmin, 'utf8')
  fs.writeFileSync(viteFile, nextVite, 'utf8')

  console.log('RXV 圖片後台 v4.1 已套用。')
  console.log('已修正 Windows CRLF 導致的 ImageCategory 比對失敗。')
  console.log('只修改網站後台與本機 Vite 開發 API；沒有修改手機 APP、Capacitor、APP 版本或 catalog JSON 結構。')
  console.log(`備份：admin -> ${adminBackup}`)
  console.log(`備份：vite  -> ${viteBackup}`)
  console.log('下一步：重新啟動 npm run dev，再開 http://localhost:3005/admin/images')
} catch (error) {
  fs.copyFileSync(adminBackup, adminFile)
  fs.copyFileSync(viteBackup, viteFile)
  console.error('v4.1 套用失敗，已自動還原原檔。')
  throw error
}
