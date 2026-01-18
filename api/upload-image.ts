// api/upload-image.ts
// 圖片上傳 API（管理後台用）
// 使用 Service Role Key 繞過 RLS，並自動壓縮圖片

import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import sharp from 'sharp'

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!serviceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
}

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL or VITE_SUPABASE_URL environment variable is required')
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 啟用 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      base64,
      category_id,
      price_type // free | 99 | 199
    } = req.body

    if (!base64 || !category_id || !price_type) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // 1️⃣ Base64 → Buffer
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '')
    const inputBuffer = Buffer.from(base64Data, 'base64')

    // 2️⃣ 圖片自動壓縮（核心）
    const compressedBuffer = await sharp(inputBuffer)
      .resize({
        width: 1920,
        withoutEnlargement: true
      })
      .webp({
        quality: 80
      })
      .toBuffer()

    // 3️⃣ 產生檔名
    const fileName = `images/${Date.now()}.webp`

    // 4️⃣ 上傳到 Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, compressedBuffer, {
        contentType: 'image/webp',
        upsert: false
      })

    if (uploadError) {
      console.error(uploadError)
      return res.status(500).json({ error: 'Upload failed' })
    }

    // 5️⃣ 取得公開 URL
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    const publicUrl = publicUrlData.publicUrl
    const fileSizeKb = Math.round(compressedBuffer.length / 1024)
    const title = `圖片素材 ${Date.now()}`

    // 6️⃣ 寫入 images 資料表
    const { error: dbError } = await supabase
      .from('images')
      .insert({
        title: title,
        image_url: publicUrl,
        access_level: 'free',
        file_path: fileName,
        public_url: publicUrl,
        file_size_kb: fileSizeKb,
        is_free: true,
        category_id,
        price_type
      })

    if (dbError) {
      console.error(dbError)
      return res.status(500).json({ error: 'DB insert failed' })
    }

    return res.status(200).json({
      success: true,
      url: publicUrl,
      publicUrl: publicUrl,
      fileName: fileName
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Unexpected error' })
  }
}
