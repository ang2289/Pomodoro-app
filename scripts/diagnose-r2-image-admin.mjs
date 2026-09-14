import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

const root = process.cwd()
const candidates = [
  '.env.local',
  '.env',
  path.join('.vercel', '.env.production.local'),
  path.join('.vercel', '.env.preview.local'),
]

function parseEnv(rel) {
  const full = path.join(root, rel)
  if (!fs.existsSync(full)) return null
  try {
    return { full, rel, values: dotenv.parse(fs.readFileSync(full)) }
  } catch (error) {
    return { full, rel, error }
  }
}

async function bodyToText(body) {
  if (!body) return ''
  if (typeof body.transformToString === 'function') return await body.transformToString('utf-8')
  const chunks = []
  for await (const chunk of body) chunks.push(Buffer.from(chunk))
  return Buffer.concat(chunks).toString('utf8')
}

function imageCount(parsed) {
  if (Array.isArray(parsed)) return parsed.length
  for (const key of ['images', 'data', 'items']) {
    if (Array.isArray(parsed?.[key])) return parsed[key].length
  }
  return null
}

function safeError(error) {
  return {
    name: String(error?.name || 'Error'),
    code: String(error?.Code || error?.code || ''),
    http: error?.$metadata?.httpStatusCode ?? '',
    message: String(error?.message || '').replace(/[A-Za-z0-9+/=_-]{24,}/g, '[redacted]'),
  }
}

console.log('RXV R2 圖片後台診斷（只讀，不修改任何檔案）')
console.log('------------------------------------------------')

let anyWorkingCredential = false
let workingSource = ''

for (const rel of candidates) {
  const parsed = parseEnv(rel)
  if (!parsed) {
    console.log(`\n[${rel}] 不存在`)
    continue
  }
  if (parsed.error) {
    console.log(`\n[${rel}] 讀取失敗：${parsed.error.message}`)
    continue
  }

  const env = parsed.values
  const accountId = String(env.R2_ACCOUNT_ID || '').trim()
  const accessKeyId = String(env.R2_ACCESS_KEY_ID || '').trim()
  const secretAccessKey = String(env.R2_SECRET_ACCESS_KEY || '').trim()
  const publicBucket = String(env.R2_PUBLIC_BUCKET_NAME || 'rxv-healing-images-public').trim()
  const publicBase = String(env.R2_PUBLIC_ASSET_URL || env.VITE_PUBLIC_R2_URL || '').trim().replace(/\/$/, '')

  console.log(`\n[${rel}]`)
  console.log(`  R2 credentials: ${accountId && accessKeyId && secretAccessKey ? 'OK' : 'MISSING'}`)
  console.log(`  Public bucket: ${publicBucket}`)
  console.log(`  Public URL: ${publicBase ? 'OK' : 'MISSING'}`)

  if (publicBase) {
    try {
      const response = await fetch(`${publicBase}/catalog/images-public.json?diag=${Date.now()}`, { cache: 'no-store' })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const raw = await response.json()
      console.log(`  Public HTTP catalog: OK (${imageCount(raw) ?? '?'} images)`)
    } catch (error) {
      console.log(`  Public HTTP catalog: FAIL (${String(error?.message || error)})`)
    }
  }

  if (!(accountId && accessKeyId && secretAccessKey)) continue

  try {
    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    })
    const result = await client.send(new GetObjectCommand({
      Bucket: publicBucket,
      Key: 'catalog/images-public.json',
    }))
    const text = await bodyToText(result.Body)
    const raw = JSON.parse(text)
    console.log(`  S3 API catalog read: OK (${imageCount(raw) ?? '?'} images)`)
    anyWorkingCredential = true
    if (!workingSource) workingSource = rel
  } catch (error) {
    const info = safeError(error)
    console.log(`  S3 API catalog read: FAIL`)
    console.log(`    name=${info.name} code=${info.code || '-'} http=${info.http || '-'} message=${info.message || '-'}`)
  }
}

console.log('\n------------------------------------------------')
if (anyWorkingCredential) {
  console.log(`找到可用的 R2 憑證來源：${workingSource}`)
  console.log('下一步可把這一份 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY 安全同步到 .env.local。')
} else {
  console.log('目前測到的本機環境檔，沒有任何一組憑證能透過 R2 S3 API 讀取 catalog。')
  console.log('如果 Public HTTP catalog 顯示 OK，代表圖片與 catalog 本身正常，問題只在 R2 API 憑證或 bucket 權限。')
}
console.log('此診斷不會修改 APP、R2 catalog、bucket 或任何環境檔。')
