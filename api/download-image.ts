import type { VercelRequest, VercelResponse } from '@vercel/node'
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const ORIGINAL_PREFIX = 'originals/by-image-id/'
const SIGNED_URL_SECONDS = 600
const text = (value: unknown) => String(value || '').trim()

function getR2() {
  const accountId = text(process.env.R2_ACCOUNT_ID)
  const accessKeyId = text(process.env.R2_ACCESS_KEY_ID)
  const secretAccessKey = text(process.env.R2_SECRET_ACCESS_KEY)
  if (!accountId || !accessKeyId || !secretAccessKey) throw new Error('R2_DOWNLOAD_ENV_MISSING')
  return {
    bucket: text(process.env.R2_PRIVATE_BUCKET_NAME || 'rxv-healing-images-staging'),
    client: new S3Client({ region: 'auto', endpoint: `https://${accountId}.r2.cloudflarestorage.com`, credentials: { accessKeyId, secretAccessKey } }),
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 啟用 CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed. Only POST requests are supported.',
    })
  }

  try {
    const imageId = text(req.body?.imageId)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(imageId)) {
      return res.status(400).json({ success: false, error: 'imageId is required' })
    }
    const { client, bucket } = getR2()
    const prefix = `${ORIGINAL_PREFIX}${imageId}/`
    const listed = await client.send(new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, MaxKeys: 10 }))
    const originalKey = listed.Contents?.map((item) => item.Key || '').find((key) => /^original\.(jpg|jpeg|png|webp)$/i.test(key.slice(prefix.length)))
    if (!originalKey) return res.status(404).json({ success: false, error: '找不到原始圖片' })
    const extension = originalKey.split('.').pop()?.toLowerCase() || 'jpg'
    const downloadUrl = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: originalKey, ResponseContentDisposition: `attachment; filename="RXV-${imageId}.${extension}"` }), { expiresIn: SIGNED_URL_SECONDS })
    return res.status(200).json({ success: true, downloadUrl })

  } catch (error: any) {
    console.error('[download-image] 發生錯誤:', error)
    return res.status(500).json({
      success: false,
      error: error?.message || '下載失敗，請稍後再試',
    })
  }
}
