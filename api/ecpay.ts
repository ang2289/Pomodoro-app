// 綠界金流統一 API（合併 create-credit-order 和 credit-webhook）
// 使用 req.query.event === 'webhook' 或 URL 包含 'webhook' 來區分請求類型

import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

// ===== 綠界金流設定 =====

/**
 * 取得綠界金流設定
 * 與前端 src/lib/ecpayConfig.ts 保持一致
 */
export const getEcpayConfig = () => {
  const isTestMode = true  // ✅ 測試模式開啟

  if (isTestMode) {
    return {
      MERCHANT_ID: '2000132',
      HASH_KEY: '5294y06JbISpM5x9',
      HASH_IV: 'v77hoKGq4kWxNNIS',
      RETURN_URL: 'https://pomodoro-app-eight-rouge.vercel.app/api/ecpay?event=webhook',
      CLIENT_BACK_URL: 'https://pomodoro-app-eight-rouge.vercel.app/pricing/success',
    }
  }

  // TODO: 上線時請改為正式參數
  return {
    MERCHANT_ID: process.env.ECPAY_MERCHANT_ID || process.env.VITE_ECPAY_MERCHANT_ID || '',
    HASH_KEY: process.env.ECPAY_HASH_KEY || process.env.VITE_ECPAY_HASH_KEY || '',
    HASH_IV: process.env.ECPAY_HASH_IV || process.env.VITE_ECPAY_HASH_IV || '',
    RETURN_URL: process.env.ECPAY_RETURN_URL || process.env.VITE_ECPAY_RETURN_URL || '',
    CLIENT_BACK_URL: process.env.ECPAY_CLIENT_BACK_URL || process.env.VITE_ECPAY_CLIENT_BACK_URL || '',
  }
}

// ===== 共用函數：CheckMacValue 計算 =====

/**
 * 產生綠界 CheckMacValue（驗證碼）
 * 使用 SHA256 雜湊
 */
function generateCheckMacValue(params: Record<string, string>, hashKey: string, hashIV: string): string {
  // 1. 將參數依 A-Z 排序
  const sortedKeys = Object.keys(params).sort()
  
  // 2. 組合字串：Key1=Value1&Key2=Value2...
  const checkString = sortedKeys
    .map(key => `${key}=${params[key]}`)
    .join('&')
  
  // 3. 加上 HashKey 和 HashIV
  const fullString = `HashKey=${hashKey}&${checkString}&HashIV=${hashIV}`
  
  // 4. URL Encode（轉小寫）
  const encoded = encodeURIComponent(fullString).toLowerCase()
  
  // 5. SHA256 雜湊
  const hash = crypto.createHash('sha256').update(encoded).digest('hex')
  
  return hash.toUpperCase()
}

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

// ===== 處理函數：建立訂單 =====

/**
 * 增加使用者點數（Supabase user_credits）
 * 注意：此函數在 create-credit-order 中未使用，但在 webhook 中需要
 */
async function addUserCredits(userId: string, additionalChars: number) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || ''
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured')
    }

    // 使用 Supabase REST API 增加點數（原子操作）
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
async function logPurchase(merchantTradeNo: string, userId: string, amount: number, points: number, status: string, bonusPoints: number = 0) {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.log('📝 付款紀錄（無 Supabase 設定）：', {
        merchantTradeNo,
        userId,
        amount,
        points,
        bonusPoints,
        status,
        timestamp: new Date().toISOString(),
      })
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    // 嘗試寫入 purchase_logs 表
    await supabase.from('purchase_logs').insert({
      user_id: userId,
      merchant_trade_no: merchantTradeNo,
      amount: amount,
      points: points,
      bonus_points: bonusPoints,
      status: status,
      created_at: new Date().toISOString(),
    }).catch((err) => {
      // 表不存在時僅記錄，不中斷流程
      console.log('📝 付款紀錄（purchase_logs 表寫入失敗，可能表不存在）：', {
        merchantTradeNo,
        userId,
        amount,
        points,
        bonusPoints,
        status,
        error: err.message,
      })
    })
  } catch (error: any) {
    console.error('❌ 記錄付款失敗：', error)
    // 不中斷流程，僅記錄錯誤
  }
}

async function handleCreateOrder(req: VercelRequest, res: VercelResponse) {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const { amount, points, userId } = body

    // 驗證金額與點數
    if (![99, 199].includes(amount) || ![100000, 300000].includes(points)) {
      return res.status(400).json({ error: '無效方案參數。金額必須為 99 或 199，點數必須為 100000 或 300000' })
    }

    // 驗證 userId
    if (!userId) {
      return res.status(400).json({ error: 'userId 為必填' })
    }

    // 取得綠界設定（使用 getEcpayConfig()）
    const ecpayConfig = getEcpayConfig()
    const merchantID = ecpayConfig.MERCHANT_ID
    const hashKey = ecpayConfig.HASH_KEY
    const hashIV = ecpayConfig.HASH_IV
    const isTestMode = ecpayConfig.MERCHANT_ID === '2000132' // 測試模式判斷
    
    // 一次性付款：ReturnURL（付款成功後跳轉）
    const returnUrl = ecpayConfig.CLIENT_BACK_URL
    // Webhook URL（綠界會主動通知）
    const orderResultURL = ecpayConfig.RETURN_URL

    // 產生訂單編號（格式：MerchantID + 時間戳記後10位 + 隨機數，總長度不超過20字元）
    // 綠界限制：MerchantTradeNo 長度限制為 20 字元
    const timestamp = Date.now().toString().slice(-10) // 取時間戳最後 10 位
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0') // 4 位隨機數
    // 格式：MerchantID(7) + 時間戳(10) + 隨機數(4) = 21 字元，需縮短
    // 改用：MerchantID(7) + 時間戳(9) + 隨機數(4) = 20 字元
    const timestampShort = Date.now().toString().slice(-9) // 取時間戳最後 9 位
    const merchantTradeNo = `${merchantID}${timestampShort}${random}` // 總長度 = 7 + 9 + 4 = 20 字元

    // 建立綠界付款參數（一次性付款）
    // 格式化交易日期時間為綠界要求的格式：yyyy/MM/dd HH:mm:ss
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    const seconds = String(now.getSeconds()).padStart(2, '0')
    const merchantTradeDate = `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
    
    const ecpayParams: Record<string, string> = {
      MerchantID: merchantID,
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: merchantTradeDate,
      PaymentType: 'aio',
      TotalAmount: amount.toString(),
      TradeDesc: `RxV 點數包`,
      ItemName: `RxV 點數 ${points.toLocaleString()} 點`,
      ReturnURL: returnUrl,
      OrderResultURL: orderResultURL,
      ChoosePayment: 'ALL', // 支援所有付款方式
      EncryptType: '1', // SHA256
      // 額外參數：儲存 amount、points 和 userId 供 webhook 使用
      CustomField1: amount.toString(),
      CustomField2: points.toString(),
      CustomField3: userId,
      // 一次性付款（非訂閱）
      StoreID: '', // 商店代號（一次性付款不需要）
    }

    // 產生 CheckMacValue
    const checkMacValue = generateCheckMacValue(ecpayParams, hashKey, hashIV)
    ecpayParams['CheckMacValue'] = checkMacValue

    // 記錄訂單到 Supabase（可選）
    try {
      const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        })
        
        // 嘗試寫入 purchase_logs 表（如果表存在的話）
        // 注意：如果表不存在，這裡會失敗但不影響訂單建立
        await supabase.from('purchase_logs').insert({
          user_id: userId,
          merchant_trade_no: merchantTradeNo,
          amount: amount,
          points: points,
          status: 'pending',
          created_at: new Date().toISOString(),
        }).catch((err) => {
          // 表不存在時僅記錄錯誤，不中斷流程
          console.log('[ecpay/create-order] 訂單記錄失敗（可能表不存在）:', err.message)
        })
      }
    } catch (dbError: any) {
      // 資料庫錯誤不影響訂單建立
      console.log('[ecpay/create-order] 資料庫操作失敗:', dbError.message)
    }

    // 回傳付款表單資料
    return res.status(200).json({
      success: true,
      merchantTradeNo,
      formData: ecpayParams,
      apiUrl: isTestMode
        ? 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
        : 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5',
      amount,
      points,
    })
  } catch (error: any) {
    console.error('❌ 建立綠界訂單失敗：', error)
    
    // 記錄錯誤日誌
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      body: req.body,
    }
    console.error('錯誤日誌：', JSON.stringify(errorLog, null, 2))
    
    return res.status(500).json({
      error: 'Failed to create order',
      message: error.message || '建立訂單時發生錯誤，請稍後再試',
    })
  }
}

// ===== 處理函數：Webhook =====

async function handleWebhook(req: VercelRequest, res: VercelResponse) {
  try {
    // 取得綠界設定（使用 getEcpayConfig()）
    const ecpayConfig = getEcpayConfig()
    const hashKey = ecpayConfig.HASH_KEY
    const hashIV = ecpayConfig.HASH_IV

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

    // 從 CustomField 取得 amount、points 和 userId（新版格式）
    const amount = parseInt(params['CustomField1'] || '0')
    const points = parseInt(params['CustomField2'] || '0')
    const userId = params['CustomField3'] || ''

    // 判斷付款狀態
    const isSuccess = rtnCode === '1' // 綠界成功代碼為 1

    if (!isSuccess) {
      // 付款失敗，僅記錄並回傳
      await logPurchase(merchantTradeNo, userId, amount, points, 'failed')
      console.log(`❌ 付款失敗：${rtnMsg || 'Unknown error'}`)
      return res.status(200).send('0|FAIL') // 未付款成功
    }

    // 驗證必要參數
    if (!userId || !points || points <= 0) {
      console.error('❌ Webhook 參數錯誤：', { userId, points })
      return res.status(200).send('0|Invalid parameters')
    }

    // ✅ 檢查訂單狀態是否已為 paid/success，避免重複加點
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })

      // 檢查 orders 表（如果存在的話）
      try {
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('status')
          .eq('order_no', merchantTradeNo)
          .single()

        if (existingOrder?.status === 'paid') {
          console.log(`🚫 訂單 ${merchantTradeNo} 已處理過（orders 表狀態為 paid），略過重複通知`)
          return res.status(200).send('1|OK')
        }
      } catch (orderCheckError: any) {
        // orders 表不存在或查詢失敗時，繼續檢查 purchase_logs 表
      }

      // 檢查 purchase_logs 表（備用檢查）
      try {
        const { data: existingLog } = await supabase
          .from('purchase_logs')
          .select('status')
          .eq('merchant_trade_no', merchantTradeNo)
          .eq('status', 'success')
          .single()

        if (existingLog) {
          console.log(`🚫 訂單 ${merchantTradeNo} 已處理過（purchase_logs 表狀態為 success），略過重複通知`)
          return res.status(200).send('1|OK')
        }
      } catch (logCheckError: any) {
        // purchase_logs 表不存在或查詢失敗時，繼續處理
      }
    }

    // ✅ 判斷是否在限時活動期間，自動加贈 10% 點數
    const now = new Date()
    const promoStart = new Date('2026-01-06T00:00:00+08:00') // 台灣時間
    const promoEnd = new Date('2026-01-10T23:59:59+08:00') // 台灣時間
    
    // 若在活動期間，額外加贈 10% 點數
    const bonusPoints = now >= promoStart && now <= promoEnd ? Math.floor(points * 0.1) : 0
    const totalPoints = points + bonusPoints

    if (bonusPoints > 0) {
      console.log(`🎁 限時活動期間！加贈 ${bonusPoints} 點（原 ${points} 點 + 10% 加贈）`)
    }

    // 記錄付款結果（包含加贈點數）
    await logPurchase(merchantTradeNo, userId, amount, points, 'success', bonusPoints)

    // 更新訂單狀態（如果有 orders 表的話）
    try {
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { persistSession: false },
        })

        // 嘗試更新 orders 表（如果表存在的話）
        await supabase.from('orders').update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        }).eq('order_no', merchantTradeNo).catch((err) => {
          // 表不存在時僅記錄，不中斷流程
          console.log('[ecpay/webhook] orders 表更新失敗（可能表不存在）：', err.message)
        })
      }
    } catch (orderError: any) {
      // 訂單狀態更新失敗不影響點數增加流程
      console.log('[ecpay/webhook] 訂單狀態更新失敗：', orderError.message)
    }

    // 若付款成功，增加使用者點數（使用總點數，包含加贈）
    try {
      await addUserCredits(userId, totalPoints)
      if (bonusPoints > 0) {
        console.log(`✅ 已為使用者 ${userId} 增加 ${totalPoints} 字點數（原 ${points} 點 + 加贈 ${bonusPoints} 點）`)
      } else {
        console.log(`✅ 已為使用者 ${userId} 增加 ${points} 字點數`)
      }
    } catch (error: any) {
      console.error('❌ 增加點數失敗：', error)
      // 即使更新失敗，仍回傳成功給綠界（避免重複通知）
      // 但應記錄錯誤以便後續處理
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
    
    // 回傳錯誤給綠界（但仍回傳 0|Error 避免重複通知）
    return res.status(200).send('0|Error')
  }
}

// ===== 主 Handler =====

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ===== CORS =====
  // 建立訂單需要 CORS，Webhook 不需要（但加上也無妨）
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ===== 判斷請求類型 =====
  // 方式 1：檢查查詢參數 event=webhook
  const isWebhook = req.query.event === 'webhook'
  // 方式 2：檢查 URL 是否包含 webhook（備用）
  const isWebhookUrl = req.url?.includes('webhook') || false

  if (isWebhook || isWebhookUrl) {
    // Webhook 請求
    return await handleWebhook(req, res)
  } else {
    // 建立訂單請求
    return await handleCreateOrder(req, res)
  }
}
