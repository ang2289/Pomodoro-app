// 綠界金流：Webhook 接收付款結果通知
// 驗證 CheckMacValue，更新使用者字數額度

import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * 驗證綠界 CheckMacValue
 */
function verifyCheckMacValue(params: Record<string, string>, hashKey: string, hashIV: string): boolean {
  const receivedCheckMac = params['CheckMacValue']
  if (!receivedCheckMac) {
    return false
  }

  // 移除 CheckMacValue 後重新計算
  const paramsWithoutCheckMac = { ...params }
  delete paramsWithoutCheckMac['CheckMacValue']

  // 產生 CheckMacValue（與 create-order 相同邏輯）
  const sortedKeys = Object.keys(paramsWithoutCheckMac).sort()
  const checkString = sortedKeys
    .map(key => `${key}=${paramsWithoutCheckMac[key]}`)
    .join('&')
  const fullString = `HashKey=${hashKey}&${checkString}&HashIV=${hashIV}`
  const encoded = encodeURIComponent(fullString).toLowerCase()
  
  // TODO: 實際應使用 SHA256 雜湊驗證
  // 這裡簡化處理，實際環境中應使用 crypto 模組
  const calculatedCheckMac = encoded // 實際應為 SHA256(encoded)

  return calculatedCheckMac === receivedCheckMac
}

/**
 * 更新使用者字數額度（Supabase）
 */
async function updateUserQuota(userId: string, planId: string, additionalChars: number) {
  try {
    // TODO: 實際應呼叫 Supabase API
    // 這裡使用環境變數取得 Supabase 設定
    const supabaseUrl = process.env.SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    // 讀取使用者目前的 total_used_chars
    const getResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_meta?user_id=eq.${userId}&select=total_used_chars`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const existingData = await getResponse.json()
    const currentUsed = existingData[0]?.total_used_chars || 0

    // 計算新的額度（增加字數 = 減少已使用字數）
    // 注意：這裡假設 total_used_chars 是「已使用」，額度 = limit - used
    // 若實際資料結構不同，需調整邏輯
    const newUsed = Math.max(0, currentUsed - additionalChars)

    // 更新或建立使用者記錄
    const upsertResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_meta`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          user_id: userId,
          total_used_chars: newUsed,
          updated_at: new Date().toISOString(),
        }),
      }
    )

    if (!upsertResponse.ok) {
      throw new Error(`Supabase update failed: ${upsertResponse.statusText}`)
    }

    return { success: true, newUsed }
  } catch (error: any) {
    console.error('❌ 更新使用者額度失敗：', error)
    throw error
  }
}

/**
 * 記錄付款紀錄
 */
async function logPurchase(merchantTradeNo: string, planId: string, userId: string, amount: number, status: string) {
  try {
    // TODO: 實際應寫入 purchase_logs 表
    // 這裡簡化處理，實際環境中應使用 Supabase API
    console.log('📝 付款紀錄：', {
      merchantTradeNo,
      planId,
      userId,
      amount,
      status,
      timestamp: new Date().toISOString(),
    })

    // 實際應寫入資料庫
    // const supabaseUrl = process.env.SUPABASE_URL || ''
    // const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    // await fetch(`${supabaseUrl}/rest/v1/purchase_logs`, { ... })
  } catch (error: any) {
    console.error('❌ 記錄付款失敗：', error)
    // 不中斷流程，僅記錄錯誤
  }
}

/**
 * Webhook 處理器
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只接受 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 取得綠界設定
    const hashKey = process.env.ECPAY_HASH_KEY || 'pwFHCqoQD1i0sxYd6Mvz5T8B3nK9L2J'
    const hashIV = process.env.ECPAY_HASH_IV || 'EkRm7iFT261i5s4qiyWu3D2e7uP8hN1'

    // 取得回傳參數（綠界會以 POST 表單或 JSON 傳送）
    const params = req.method === 'POST' && req.body ? req.body : {}

    // 驗證 CheckMacValue
    const isValid = verifyCheckMacValue(params, hashKey, hashIV)
    if (!isValid) {
      console.error('❌ CheckMacValue 驗證失敗')
      return res.status(400).json({ error: 'Invalid CheckMacValue' })
    }

    // 取得訂單資訊
    const merchantTradeNo = params['MerchantTradeNo'] || ''
    const tradeAmt = params['TradeAmt'] || '0'
    const rtnCode = params['RtnCode'] || ''
    const rtnMsg = params['RtnMsg'] || ''
    const paymentDate = params['PaymentDate'] || ''
    const paymentType = params['PaymentType'] || ''

    // 從 CustomField 取得 planId 和 userId
    const planId = params['CustomField1'] || ''
    const userId = params['CustomField2'] || ''

    // 判斷付款狀態
    const isSuccess = rtnCode === '1' // 綠界成功代碼為 1

    // 記錄付款結果
    await logPurchase(
      merchantTradeNo,
      planId,
      userId,
      parseInt(tradeAmt),
      isSuccess ? 'success' : 'failed'
    )

    // 若付款成功，更新使用者額度
    if (isSuccess && planId && userId) {
      try {
        // 取得方案字數
        const PLANS: Record<string, { chars: number }> = {
          pack99: { chars: 100000 },
          pack199: { chars: 300000 },
        }
        const plan = PLANS[planId]
        
        if (plan) {
          await updateUserQuota(userId, planId, plan.chars)
          console.log(`✅ 已為使用者 ${userId} 增加 ${plan.chars} 字額度`)
        }
      } catch (error: any) {
        console.error('❌ 更新額度失敗：', error)
        // 即使更新失敗，仍回傳成功給綠界（避免重複通知）
        // 但應記錄錯誤以便後續處理
      }
    }

    // 回傳給綠界（必須回傳 1|0）
    // 1 表示成功接收，0 表示失敗
    return res.status(200).send('1|OK')
  } catch (error: any) {
    console.error('❌ Webhook 處理失敗：', error)
    
    // 記錄錯誤日誌
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      params: req.body,
    }
    console.error('Webhook 錯誤日誌：', JSON.stringify(errorLog, null, 2))
    
    // 回傳錯誤給綠界（但仍回傳 1|Error 避免重複通知）
    return res.status(200).send('0|Error')
  }
}

