// 圖片下載 API
// 處理圖片下載請求，驗證使用者方案並產生下載連結

import { createClient } from '@supabase/supabase-js'
import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * 初始化 Supabase 客戶端（使用 Service Role Key）
 */
function getSupabaseClient() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || ''
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
  }

  if (!supabaseUrl) {
    throw new Error('SUPABASE_URL or VITE_SUPABASE_URL environment variable is required')
  }

  // 使用 SERVICE_ROLE_KEY 可以繞過 RLS 政策
  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

/**
 * 取得使用者方案
 * TODO: 根據實際的使用者方案儲存方式實作
 * 可能需要從：
 * - users 或 profiles 資料表查詢
 * - subscription 相關資料表
 * - 或根據某個欄位判斷
 */
async function getUserPlan(supabase: any, userId?: string): Promise<'free' | 'price_99' | 'price_199'> {
  // TODO: 實作實際的使用者方案查詢邏輯
  // 範例：從 profiles 或 subscriptions 資料表查詢
  /*
  if (userId) {
    const { data } = await supabase
      .from('profiles')
      .select('plan_type')
      .eq('id', userId)
      .single()
    
    return data?.plan_type || 'free'
  }
  */
  
  // 暫時回傳 free，需要根據實際資料表結構調整
  return 'free'
}

/**
 * 判斷使用者方案是否足以下載圖片
 */
function canDownloadImage(userPlan: 'free' | 'price_99' | 'price_199', imagePriceType: string): boolean {
  // 免費圖片：所有人都可以下載
  if (imagePriceType === 'free') {
    return true
  }
  
  // 99 元圖片：需要 99 或 199 方案
  if (imagePriceType === 'price_99') {
    return userPlan === 'price_99' || userPlan === 'price_199'
  }
  
  // 199 元圖片：僅 199 方案可下載
  if (imagePriceType === 'price_199') {
    return userPlan === 'price_199'
  }
  
  // 未知類型，預設不允許
  return false
}

/**
 * 取得方案金額顯示文字
 */
function getPlanDisplayText(priceType: string): string {
  switch (priceType) {
    case 'free':
      return '免費'
    case 'price_99':
      return 'NT$99'
    case 'price_199':
      return 'NT$199'
    default:
      return priceType
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
    const { imageId, userId } = req.body

    // 驗證必要參數
    if (!imageId) {
      return res.status(400).json({
        success: false,
        error: 'imageId is required',
      })
    }

    // 初始化 Supabase 客戶端
    const supabase = getSupabaseClient()

    // 1. 查詢圖片資訊
    const { data: imageData, error: imageError } = await supabase
      .from('images')
      .select('id, title, price_type, file_path, public_url')
      .eq('id', imageId)
      .single()

    if (imageError || !imageData) {
      console.error('[download-image] 查詢圖片失敗:', imageError)
      return res.status(404).json({
        success: false,
        error: '圖片不存在',
      })
    }

    // 2. 取得使用者方案（如果有 userId）
    // TODO: 如果未登入，應回傳需要登入的錯誤
    const userPlan = await getUserPlan(supabase, userId)

    // 3. 判斷是否有權限下載
    const priceType = imageData.price_type || 'free'
    const hasPermission = canDownloadImage(userPlan, priceType)

    if (!hasPermission) {
      const planText = getPlanDisplayText(priceType)
      return res.status(403).json({
        success: false,
        error: `此圖片需 ${planText} 以上方案才可下載`,
        requiresLogin: !userId,
        requiredPlan: priceType,
      })
    }

    // 4. 產生下載連結
    // 如果有 file_path，使用 signed URL；否則使用 public_url
    let downloadUrl: string

    if (imageData.file_path) {
      // 使用 signed URL（60 秒有效）
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('images')
        .createSignedUrl(imageData.file_path, 60)

      if (signedUrlError || !signedUrlData?.signedUrl) {
        console.error('[download-image] 產生 signed URL 失敗:', signedUrlError)
        // 如果產生 signed URL 失敗，回退使用 public_url
        downloadUrl = imageData.public_url || ''
      } else {
        downloadUrl = signedUrlData.signedUrl
      }
    } else {
      // 使用 public_url
      downloadUrl = imageData.public_url || ''
    }

    if (!downloadUrl) {
      return res.status(500).json({
        success: false,
        error: '無法取得下載連結',
      })
    }

    // 5. 回傳成功結果
    return res.status(200).json({
      success: true,
      downloadUrl,
      imageTitle: imageData.title,
    })

  } catch (error: any) {
    console.error('[download-image] 發生錯誤:', error)
    return res.status(500).json({
      success: false,
      error: error?.message || '下載失敗，請稍後再試',
    })
  }
}
