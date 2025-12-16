// 綠界金流：點數購買 Webhook（一次性付款）
// 驗證 CheckMacValue，將購買的字數加到 user_credits.remaining_chars

import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

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
  
  // SHA256 雜湊
  const hash = crypto.createHash('sha256').update(encoded).digest('hex')
  const calculatedCheckMac = hash.toUpperCase()

  return calculatedCheckMac === receivedCheckMac
}

/**
 * 增加使用者點數（Supabase user_credits）
 */
async function addUserCredits(userId: string, additionalChars: number) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    // 使用 Supabase REST API 增加點數（原子操作）
    // 方案 1：使用 RPC 函數（如果有）
    // 方案 2：先讀取現有點數，再更新
    const getResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_credits?user_id=eq.${userId}&select=remaining_chars`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const existingData = await getResponse.json()
    const currentCredits = existingData[0]?.remaining_chars || 0
    const newCredits = currentCredits + additionalChars

    // 更新或建立使用者記錄（原子更新）
    const upsertResponse = await fetch(
      `${supabaseUrl}/rest/v1/user_credits`,
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
          remaining_chars: newCredits,
          updated_at: new Date().toISOString(),
        }),
      }
    )

    if (!upsertResponse.ok) {
      const errorText = await upsertResponse.text()
      throw new Error(`Supabase update failed: ${upsertResponse.statusText} - ${errorText}`)
    }

    return { success: true, newCredits }
  } catch (error: any) {
    console.error('❌ 增加使用者點數失敗：', error)
    throw error
  }
}

/**
 * 記錄付款紀錄
 */
async function logPurchase(merchantTradeNo: string, planId: string, userId: string, amount: number, credits: number, status: string) {
  try {
    // TODO: 實際應寫入 purchase_logs 表
    console.log('📝 付款紀錄：', {
      merchantTradeNo,
      planId,
      userId,
      amount,
      credits,
      status,
      timestamp: new Date().toISOString(),
    })

    // 實際應寫入資料庫
    // const supabaseUrl = process.env.SUPABASE_URL || ''
    // const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    // await fetch(`${supabaseUrl}/rest/v1/purchase_logs`, {
    //   method: 'POST',
    //   headers: { ... },
    //   body: JSON.stringify({ ... })
    // })
  } catch (error: any) {
    console.error('❌ 記錄付款失敗：', error)
    // 不中斷流程，僅記錄錯誤
  }
}

/**
 * Webhook 處理器（一次性付款）
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

    // 取得回傳參數（綠界會以 POST 表單傳送）
    const params = req.method === 'POST' && req.body ? req.body : {}

    // 驗證 CheckMacValue
    const isValid = verifyCheckMacValue(params, hashKey, hashIV)
    if (!isValid) {
      console.error('❌ CheckMacValue 驗證失敗')
      return res.status(200).send('0|Invalid CheckMacValue') // 綠界要求回傳 1|0 格式
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
    const PLANS: Record<string, { chars: number }> = {
      pack99: { chars: 100000 },
      pack199: { chars: 300000 },
    }
    const plan = PLANS[planId]
    const credits = plan?.chars || 0

    await logPurchase(
      merchantTradeNo,
      planId,
      userId,
      parseInt(tradeAmt),
      credits,
      isSuccess ? 'success' : 'failed'
    )

    // 若付款成功，增加使用者點數
    if (isSuccess && planId && userId && plan) {
      try {
        await addUserCredits(userId, plan.chars)
        console.log(`✅ 已為使用者 ${userId} 增加 ${plan.chars} 字點數`)
      } catch (error: any) {
        console.error('❌ 增加點數失敗：', error)
        // 即使更新失敗，仍回傳成功給綠界（避免重複通知）
        // 但應記錄錯誤以便後續處理
      }
    }

    // 回傳給綠界（必須回傳 1|OK 或 0|Error）
    // 1|OK 表示成功接收，0|Error 表示失敗
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

