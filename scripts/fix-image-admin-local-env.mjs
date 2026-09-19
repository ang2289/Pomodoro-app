import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { spawnSync } from 'node:child_process'
import dotenv from 'dotenv'

const root = process.cwd()
const envFile = path.join(root, '.env')
const localFile = path.join(root, '.env.local')
const backupDir = path.join(root, 'backup', 'image-admin-local-env')

if (!fs.existsSync(envFile)) throw new Error('找不到 .env')
if (!fs.existsSync(localFile)) fs.writeFileSync(localFile, '', 'utf8')

const envRaw = fs.readFileSync(envFile, 'utf8')
const localRaw = fs.readFileSync(localFile, 'utf8')
const env = dotenv.parse(envRaw)
const local = dotenv.parse(localRaw)

const requiredFromEnv = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY']
for (const key of requiredFromEnv) {
  const value = String(local[key] || env[key] || '').trim()
  if (!value) throw new Error(`找不到 ${key}，未修改 .env.local`)
}

const adminKey = String(local.RXV_IMAGE_ADMIN_KEY || '').trim() || crypto.randomBytes(24).toString('hex')
const publicUrl = String(local.R2_PUBLIC_ASSET_URL || local.VITE_PUBLIC_R2_URL || env.R2_PUBLIC_ASSET_URL || env.VITE_PUBLIC_R2_URL || '').trim()
if (!publicUrl) throw new Error('找不到 VITE_PUBLIC_R2_URL / R2_PUBLIC_ASSET_URL，未修改 .env.local')

const values = {
  RXV_IMAGE_ADMIN_KEY: adminKey,
  R2_ACCOUNT_ID: String(local.R2_ACCOUNT_ID || env.R2_ACCOUNT_ID).trim(),
  R2_ACCESS_KEY_ID: String(local.R2_ACCESS_KEY_ID || env.R2_ACCESS_KEY_ID).trim(),
  R2_SECRET_ACCESS_KEY: String(local.R2_SECRET_ACCESS_KEY || env.R2_SECRET_ACCESS_KEY).trim(),
  R2_PUBLIC_BUCKET_NAME: String(local.R2_PUBLIC_BUCKET_NAME || env.R2_PUBLIC_BUCKET_NAME || 'rxv-healing-images-public').trim(),
  R2_PRIVATE_BUCKET_NAME: String(local.R2_PRIVATE_BUCKET_NAME || env.R2_PRIVATE_BUCKET_NAME || 'rxv-healing-images-staging').trim(),
  R2_PUBLIC_ASSET_URL: publicUrl,
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

let next = localRaw.replace(/^\uFEFF/, '')
for (const [key, value] of Object.entries(values)) {
  const re = new RegExp(`^\\s*${escapeRegExp(key)}\\s*=.*(?:\\r?\\n|$)`, 'gm')
  next = next.replace(re, '')
  if (next && !next.endsWith('\n')) next += os.EOL
  next += `${key}=${value}${os.EOL}`
}

fs.mkdirSync(backupDir, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const backupFile = path.join(backupDir, `.env.local.${stamp}.bak`)
fs.copyFileSync(localFile, backupFile)
fs.writeFileSync(localFile, next, 'utf8')

const verify = dotenv.parse(fs.readFileSync(localFile, 'utf8'))
const checkKeys = [
  'RXV_IMAGE_ADMIN_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_PUBLIC_BUCKET_NAME',
  'R2_PRIVATE_BUCKET_NAME',
  'R2_PUBLIC_ASSET_URL',
  'VITE_PUBLIC_R2_URL',
]

console.log('RXV 本機圖片後台環境已修復。')
for (const key of checkKeys) {
  console.log(`${key}: ${String(verify[key] || '').trim() ? 'OK' : 'MISSING'}`)
}
console.log(`備份：${backupFile}`)

const clip = spawnSync('clip.exe', [], { input: adminKey, encoding: 'utf8' })
if (clip.status === 0) {
  console.log('圖片後台管理金鑰已複製到 Windows 剪貼簿；瀏覽器詢問時直接 Ctrl+V。')
} else {
  console.log('剪貼簿寫入失敗；請不要公開貼出管理金鑰，改用本機方式讀取。')
}
console.log('下一步：重新執行 npm run dev:image-admin')
