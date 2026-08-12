import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || ''
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL/VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const token = typeof req.query.token === 'string' ? req.query.token.trim() : ''
  if (!token || token.length < 32) {
    return res.status(400).json({ success: false, error: '下載連結無效' })
  }

  try {
    const supabase = getSupabaseAdmin()

    const { data: order, error: orderError } = await supabase
      .from('digital_product_orders')
      .select('id, order_no, product_code, status, download_expires_at, download_count, download_limit')
      .eq('download_token', token)
      .single()

    if (orderError || !order) {
      return res.status(404).json({ success: false, error: '找不到下載授權' })
    }

    if (order.status !== 'approved') {
      return res.status(403).json({ success: false, error: '此訂單尚未開放下載' })
    }

    const expiresAt = order.download_expires_at ? new Date(order.download_expires_at) : null
    if (!expiresAt || Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      return res.status(410).json({ success: false, error: '下載期限已過，請聯絡客服' })
    }

    if (order.download_count >= order.download_limit) {
      return res.status(429).json({ success: false, error: '已達此訂單的下載次數上限' })
    }

    const { data: bundle, error: bundleError } = await supabase
      .from('digital_product_bundles')
      .select('storage_bucket, storage_path, version')
      .eq('product_code', order.product_code)
      .single()

    if (bundleError || !bundle) {
      console.error('[digital-product-download] bundle not configured', bundleError)
      return res.status(503).json({ success: false, error: '素材包尚未完成上架，請稍後再試' })
    }

    const { data: signed, error: signedError } = await supabase.storage
      .from(bundle.storage_bucket)
      .createSignedUrl(bundle.storage_path, 300, {
        download: `RxV_高畫質圖片素材庫_${bundle.version || '最新版'}.zip`,
      })

    if (signedError || !signed?.signedUrl) {
      console.error('[digital-product-download] signed url failed', signedError)
      return res.status(503).json({ success: false, error: '暫時無法建立下載連結，請稍後再試' })
    }

    const { error: updateError } = await supabase
      .from('digital_product_orders')
      .update({ download_count: order.download_count + 1 })
      .eq('id', order.id)
      .eq('download_count', order.download_count)

    if (updateError) {
      console.error('[digital-product-download] count update failed', updateError)
      return res.status(409).json({ success: false, error: '下載狀態更新失敗，請重新開啟連結' })
    }

    return res.redirect(302, signed.signedUrl)
  } catch (error: any) {
    console.error('[digital-product-download] unexpected error', error)
    return res.status(500).json({ success: false, error: '下載服務暫時無法使用' })
  }
}
