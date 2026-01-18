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
  const isTestMode = false  // ✅ 正式模式

  if (isTestMode) {
    return {
      MERCHANT_ID: '2000132',
      HASH_KEY: '5294y06JbISpM5x9',
      HASH_IV: 'v77hoKGq4kWxNNIS',
      RETURN_URL: 'https://pomodoro-app-eight-rouge.vercel.app/api/ecpay?event=webhook',
      CLIENT_BACK_URL: 'https://pomodoro-app-eight-rouge.vercel.app/pricing/success',
    }
  }

  // 正式模式：使用環境變數，並提供正確的預設值
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://pomodoro-app-eight-rouge.vercel.app'
  
  return {
    MERCHANT_ID: process.env.ECPAY_MERCHANT_ID || process.env.VITE_ECPAY_MERCHANT_ID || '',
    HASH_KEY: process.env.ECPAY_HASH_KEY || process.env.VITE_ECPAY_HASH_KEY || '',
    HASH_IV: process.env.ECPAY_HASH_IV || process.env.VITE_ECPAY_HASH_IV || '',
    // OrderResultURL: Webhook URL（綠界通知後端）
    RETURN_URL: process.env.ECPAY_RETURN_URL || process.env.VITE_ECPAY_RETURN_URL || `${baseUrl}/api/ecpay?event=webhook`,
    // CLIENT_BACK_URL: 付款成功後用戶導向頁面（必須是前端頁面）
    CLIENT_BACK_URL: process.env.ECPAY_CLIENT_BACK_URL || process.env.VITE_ECPAY_CLIENT_BACK_URL || `${baseUrl}/pricing/success`,
  }
}

// ===== 共用函數：CheckMacValue 計算 =====

/**
 * 產生綠界 CheckMacValue（驗證碼）
 * 使用 SHA256 雜湊
 * 綠界規範：
 * 1. 依 key 名稱排序（A-Z）
 * 2. 前後加上 HashKey / HashIV
 * 3. 整體 URL encode + toLowerCase() + %20 改成 +
 * 4. SHA256 計算 → toUpperCase()
 */
function generateCheckMacValue(params: Record<string, string>, hashKey: string, hashIV: string): string {
  // 1. 將參數依 A-Z 排序（排除 CheckMacValue）
  const paramsForCheck = { ...params }
  delete paramsForCheck['CheckMacValue'] // 計算時不包含 CheckMacValue 本身
  const sortedKeys = Object.keys(paramsForCheck).sort()
  
  // 2. 組合字串：Key1=Value1&Key2=Value2...
  const checkString = sortedKeys
    .map(key => `${key}=${paramsForCheck[key]}`)
    .join('&')
  
  // 3. 加上 HashKey 和 HashIV
  // 格式：HashKey=xxx&Key1=Value1&Key2=Value2&...&HashIV=yyy
  const fullString = `HashKey=${hashKey}&${checkString}&HashIV=${hashIV}`
  
  // 4. URL Encode + toLowerCase() + 將 %20 改成 +
  let encoded = encodeURIComponent(fullString).toLowerCase()
  encoded = encoded.replace(/%20/g, '+') // 將空格編碼 %20 改成 +
  
  // 5. SHA256 雜湊
  const hash = crypto.createHash('sha256').update(encoded).digest('hex')
  
  // 6. 轉大寫
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

  // 使用統一的 CheckMacValue 計算函數
  const calculatedCheckMac = generateCheckMacValue(params, hashKey, hashIV)

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
        status,
        timestamp: new Date().toISOString(),
      })
      return
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    // 嘗試寫入 purchase_logs 表（不使用 bonus_points 欄位）
    try {
      const { error: insertError } = await supabase.from('purchase_logs').insert({
        user_id: userId,
        order_no: merchantTradeNo,
        amount: amount,
        points: points,
        status: status,
        created_at: new Date().toISOString(),
      })
      
      if (insertError) {
        // 表不存在時僅記錄，不中斷流程
        console.log('📝 付款紀錄（purchase_logs 表寫入失敗，可能表不存在）：', {
          merchantTradeNo,
          userId,
          amount,
          points,
          status,
          error: insertError.message,
        })
      }
    } catch (err: any) {
      // 捕捉其他可能的錯誤
      console.log('📝 付款紀錄（purchase_logs 表寫入失敗）：', {
        merchantTradeNo,
        userId,
        amount,
        points,
        status,
        error: err.message,
      })
    }
  } catch (error: any) {
    console.error('❌ 記錄付款失敗：', error)
    // 不中斷流程，僅記錄錯誤
  }
}

async function handleCreateOrder(req: VercelRequest, res: VercelResponse) {
  try {
    // 安全地解析請求體
    let body: any
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    } catch (parseError: any) {
      return res.status(400).json({ 
        error: 'Invalid request body',
        message: '無法解析請求資料，請確認資料格式正確'
      })
    }
    
    const { amount, points, userId } = body || {}

    // 驗證金額與點數
    // 支援正式方案：99/100000 和 199/300000
    // 支援測試方案：10/10（僅供測試用）
    const validAmounts = [99, 199, 10]
    const validPoints = [100000, 300000, 10]
    if (!validAmounts.includes(amount) || !validPoints.includes(points)) {
      return res.status(400).json({ error: '無效方案參數。金額必須為 99、199 或 10，點數必須為 100000、300000 或 10' })
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
    
    // 驗證必要配置是否存在
    if (!merchantID || !hashKey || !hashIV) {
      return res.status(500).json({
        error: 'Configuration error',
        message: '綠界金流設定不完整，請檢查環境變數'
      })
    }
    
    const isTestMode = ecpayConfig.MERCHANT_ID === '2000132' // 測試模式判斷
    
    // 一次性付款：ReturnURL（付款成功後跳轉到用戶瀏覽器）
    // ⚠️ 重要：ReturnURL 是用戶付款完成後導向的前端成功頁面，不是 webhook
    const returnUrl = ecpayConfig.CLIENT_BACK_URL
    // OrderResultURL：Webhook URL（綠界會以 POST 方式通知後端）
    // ⚠️ 重要：OrderResultURL 是後端 webhook 端點，不會在用戶瀏覽器中顯示
    const orderResultURL = ecpayConfig.RETURN_URL
    
    // 驗證 URL 配置
    if (!returnUrl || !orderResultURL) {
      console.error('❌ URL 配置錯誤：', { returnUrl, orderResultURL })
      return res.status(500).json({
        error: 'Configuration error',
        message: '綠界金流 URL 設定不完整，請檢查環境變數'
      })
    }

    // 確保 ReturnURL 指向成功頁面，不是 webhook
    if (returnUrl.includes('webhook') || returnUrl.includes('api/ecpay')) {
      console.error('❌ ReturnURL 設定錯誤，不應指向 webhook 端點：', returnUrl)
      return res.status(500).json({
        error: 'Configuration error',
        message: 'ReturnURL 設定錯誤，應指向前端成功頁面（/pricing/success），不應指向 webhook 端點'
      })
    }

    console.log('✅ 綠界 URL 配置：', {
      ReturnURL: returnUrl,  // 用戶導向頁面
      OrderResultURL: orderResultURL  // Webhook 端點
    })

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
    
    // 依據點數方案設定商品名稱、金額和交易描述
    let itemName: string
    let tradeDesc: string
    
    if (points === 10 && amount === 10) {
      // 測試用點數方案：10 元 / 10 點
      itemName = '測試用點數 1 元方案'
      tradeDesc = '測試用點數儲值 - 10元10點'
    } else if (points === 100000) {
      // 100,000 點方案
      itemName = 'RxV 點數100,000點'
      tradeDesc = 'RxV 點數儲值 - 100K'
    } else if (points === 300000) {
      // 300,000 點方案
      itemName = 'RxV 點數300,000點'
      tradeDesc = 'RxV 點數儲值 - 300K'
    } else {
      // 備用方案（不應該發生，因為前面已經驗證）
      itemName = `RxV 點數${points.toLocaleString()}點`
      tradeDesc = 'RxV 點數儲值'
    }

    const ecpayParams: Record<string, string> = {
      MerchantID: merchantID,
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: merchantTradeDate,
      PaymentType: 'aio',
      TotalAmount: amount.toString(),
      TradeDesc: tradeDesc,
      ItemName: itemName,
      ReturnURL: returnUrl,
      OrderResultURL: orderResultURL,
      ChoosePayment: 'Credit', // 強制使用信用卡付款
      IgnorePayment: 'WebATM#ATM#CVS#BARCODE#ApplePay#ECPay#GooglePay#UnionPay#Tenpay#Alipay', // 隱藏所有其他付款方式，只保留信用卡（使用 # 分隔）
      // 注意：如果綠界Pay仍然顯示，可能需要在綠界廠商後台設定「限用金流」為「信用卡一次付清」
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
        try {
          const { error: insertError } = await supabase.from('purchase_logs').insert({
            user_id: userId,
            order_no: merchantTradeNo,
            amount: amount,
            points: points,
            status: 'pending',
            created_at: new Date().toISOString(),
          })
          
          if (insertError) {
            // 表不存在時僅記錄錯誤，不中斷流程
            console.log('[ecpay/create-order] 訂單記錄失敗（可能表不存在）:', insertError.message)
          }
        } catch (err: any) {
          // 捕捉其他可能的錯誤
          console.log('[ecpay/create-order] 訂單記錄失敗:', err.message)
        }
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
    // ===== 檢查是否為測試模式 =====
    // 測試模式觸發條件：僅當 query 參數 test=1 時啟用
    const isTestMode = req.query.test === '1'
    
    // 取得綠界設定（使用 getEcpayConfig()）
    const ecpayConfig = getEcpayConfig()
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://pomodoro-app-eight-rouge.vercel.app'
    const successUrl = `${baseUrl}/pricing/success`
    
    // ⚠️ 重要：檢查是否是用戶瀏覽器被導向到此 URL（而非綠界服務器調用）
    // 如果是用戶瀏覽器（GET 請求或帶有瀏覽器 User-Agent 的 POST），則重定向到成功頁面
    const userAgent = req.headers['user-agent'] || ''
    const isBrowserRequest = userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari') || userAgent.includes('Edge') || userAgent.includes('Firefox')
    
    // 如果是 GET 請求，一定是用戶瀏覽器，直接重定向
    if (req.method === 'GET') {
      if (isTestMode) {
        console.log('🧪 [測試 webhook] GET 請求訪問 webhook URL（用戶瀏覽器），重定向到成功頁面')
      } else {
        console.log('⚠️ GET 請求訪問 webhook URL（用戶瀏覽器），重定向到成功頁面')
      }
      return res.redirect(302, successUrl)
    }
    
    // 如果是 POST 請求但來自瀏覽器（用戶被導向），也重定向
    if (req.method === 'POST' && isBrowserRequest) {
      if (isTestMode) {
        console.log('🧪 [測試 webhook] POST 請求來自瀏覽器（用戶被導向），重定向到成功頁面')
      } else {
        console.log('⚠️ POST 請求來自瀏覽器（用戶被導向），重定向到成功頁面')
      }
      return res.redirect(302, successUrl)
    }
    
    if (isTestMode) {
      console.log('🧪 ===== 測試 webhook 模式 =====')
    } else {
      console.log('📥 ===== 正式 webhook 模式 =====')
    }

    const hashKey = ecpayConfig.HASH_KEY
    const hashIV = ecpayConfig.HASH_IV

    // 取得回傳參數（綠界會以 POST 表單傳送）
    const params = req.method === 'POST' && req.body ? req.body : {}

    // ✅ 記錄原始綠界回傳資料到 ecpay_logs 表
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (isTestMode) {
      console.log('🧪 [測試 webhook] 收到通知，開始處理...')
    } else {
      console.log('📥 Webhook 收到通知，開始處理...')
    }
    console.log('📋 Webhook 參數：', {
      MerchantTradeNo: params['MerchantTradeNo'],
      RtnCode: params['RtnCode'],
      RtnMsg: params['RtnMsg'],
      TradeAmt: params['TradeAmt'],
      PaymentDate: params['PaymentDate'],
      CustomField3: params['CustomField3'],
    })

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase 設定不完整，無法處理 webhook')
      console.error('Supabase URL:', supabaseUrl ? '已設定' : '未設定')
      console.error('Supabase Key:', supabaseKey ? '已設定' : '未設定')
      return res.status(200).send('0|Configuration error')
    }

    // ===== 共用：寫入 ecpay_logs（無論測試模式或正式模式都要執行） =====
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })

      const { error: insertError } = await supabase.from('ecpay_logs').insert({
        raw_data: params, // 寫入完整的 raw_data（整個解析後的參數物件）
        created_at: new Date().toISOString(),
        ...(isTestMode && { test_mode: true }), // 標記測試模式（如果欄位存在）
      })

      if (insertError) {
        // 記錄插入錯誤（但不中斷流程）
        console.error('❌ 寫入 ecpay_logs 表失敗：', {
          error: insertError.message,
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint,
          isTestMode: isTestMode,
        })
      } else {
        console.log('✅ 已成功寫入 ecpay_logs 表')
        if (isTestMode) {
          console.log('🧪 [測試 webhook] 已記錄原始綠界回傳資料到 ecpay_logs 表')
        } else {
          console.log('✅ 已記錄原始綠界回傳資料到 ecpay_logs 表')
        }
      }
    } catch (logError: any) {
      // 如果表不存在或寫入失敗，記錄詳細錯誤資訊，但不中斷流程
      console.error('❌ 記錄 ecpay_logs 失敗（可能表不存在或發生異常）：', {
        error: logError?.message || 'Unknown error',
        stack: logError?.stack,
        code: logError?.code,
        details: logError?.details,
        hint: logError?.hint,
        isTestMode: isTestMode,
        paramsKeys: Object.keys(params),
      })
    }

    // ===== 檢查必要欄位是否存在 =====
    // 無論是測試模式還是正式模式，都需要檢查必要欄位
    const merchantTradeNo = params['MerchantTradeNo'] || ''
    const rtnCode = params['RtnCode'] || ''
    const tradeAmt = params['TradeAmt'] || ''
    const customField3 = params['CustomField3'] || ''
    
    if (!merchantTradeNo || !rtnCode || !tradeAmt || !customField3) {
      const missingFields: string[] = []
      if (!merchantTradeNo) missingFields.push('MerchantTradeNo')
      if (!rtnCode) missingFields.push('RtnCode')
      if (!tradeAmt) missingFields.push('TradeAmt')
      if (!customField3) missingFields.push('CustomField3')
      
      console.error(`❌ Webhook 參數錯誤：缺少必要欄位 ${missingFields.join(', ')}`)
      if (isTestMode) {
        console.error('🧪 [測試 webhook] 必要欄位檢查失敗')
      }
      return res.status(200).send('0|Missing required fields')
    }

    // ===== 解析 CustomField1/2/3 等欄位 =====
    const customField1 = params['CustomField1'] || '' // amount
    const customField2 = params['CustomField2'] || '' // points
    const userId = customField3
    const tradeAmtNum = parseInt(tradeAmt) || 0
    const rtnMsg = params['RtnMsg'] || ''
    const paymentDate = params['PaymentDate'] || ''
    const paymentType = params['PaymentType'] || ''

    // ===== 測試模式或正式模式的付款流程處理 =====
    if (isTestMode) {
      // ===== 測試模式：跳過 CheckMacValue 驗證，直接進入付款處理流程 =====
      console.log('🧪 [測試 webhook] 已啟用測試模式，跳過 CheckMacValue 驗證')
    } else {
      // ===== 正式模式：必須驗證 CheckMacValue =====
      const isValid = verifyCheckMacValue(params, hashKey, hashIV)
      if (!isValid) {
        console.error('❌ CheckMacValue 驗證失敗')
        return res.status(200).send('0|Invalid CheckMacValue') // 綠界要求回傳 1|0 格式
      }
      console.log('✅ CheckMacValue 驗證通過')
    }

    // 判斷付款狀態
    const isSuccess = rtnCode === '1' // 綠界成功代碼為 1

    if (!isSuccess) {
      // 付款失敗，僅記錄並回傳
      const failedPoints = tradeAmtNum === 99 ? 100000 : tradeAmtNum === 199 ? 300000 : tradeAmtNum === 10 ? 10 : 0
      await logPurchase(merchantTradeNo, userId, tradeAmtNum, failedPoints, 'failed')
      if (isTestMode) {
        console.log(`🧪 [測試 webhook] 付款失敗：${rtnMsg || 'Unknown error'}`)
      } else {
        console.log(`❌ 付款失敗：${rtnMsg || 'Unknown error'}`)
      }
      // ⚠️ 注意：Webhook 是後端對後端的通信，應該回傳文本給綠界服務器
      // 但如果用戶被導向到此 URL（GET 請求），則需要重定向到失敗頁面
      // 這裡的回傳是給綠界服務器的，不是給用戶瀏覽器的
      const ecpayConfig = getEcpayConfig()
      const baseUrl = process.env.VERCEL_URL 
        ? `https://${process.env.VERCEL_URL}` 
        : process.env.NEXT_PUBLIC_SITE_URL || 'https://pomodoro-app-eight-rouge.vercel.app'
      const failUrl = `${baseUrl}/pricing/fail`
      
      // 如果請求方法是 GET（用戶被導向），則重定向到失敗頁面
      // 否則回傳給綠界服務器（POST 請求）
      if (req.method === 'GET') {
        return res.redirect(302, failUrl)
      }
      return res.status(200).send('0|FAIL') // 給綠界服務器的回應
    }

    // ✅ 成功處理付款（RtnCode === '1'）
    if (isTestMode) {
      console.log('🧪 [測試 webhook] 付款成功，開始處理點數加值...')
    } else {
      console.log('✅ 付款成功，開始處理點數加值...')
    }
    
    // 1. 根據 TradeAmt 判斷對應點數（tradeAmtNum 已在前面計算）
    let points: number
    if (tradeAmtNum === 99) {
      points = 100000
    } else if (tradeAmtNum === 199) {
      points = 300000
    } else if (tradeAmtNum === 10) {
      points = 10 // 測試用
    } else {
      console.error(`❌ 無法識別的金額：${tradeAmtNum}`)
      return res.status(200).send('0|Invalid amount')
    }

    if (isTestMode) {
      console.log(`🧪 [測試 webhook] 訂單金額：${tradeAmtNum} 元，對應點數：${points} 點`)
    } else {
      console.log(`💰 訂單金額：${tradeAmtNum} 元，對應點數：${points} 點`)
    }

    // 驗證必要參數（userId 已在前面檢查過，這裡再次確認）
    if (!userId) {
      if (isTestMode) {
        console.error('🧪 [測試 webhook] Webhook 參數錯誤：缺少 userId')
      } else {
        console.error('❌ Webhook 參數錯誤：缺少 userId')
      }
      console.error('收到的參數：', { merchantTradeNo, tradeAmt, userId, rtnCode, rtnMsg })
      return res.status(200).send('0|Invalid parameters')
    }

    if (isTestMode) {
      console.log(`🧪 [測試 webhook] 使用者 ID：${userId}`)
    } else {
      console.log(`👤 使用者 ID：${userId}`)
    }

    // ✅ 預防重複寫入：先查詢是否已有同一筆 order_no
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })

      // ===== 第一層防重複機制：檢查 purchase_logs 表是否已有相同的 order_no =====
      let existingLog: { id: string; status: string } | null = null
      try {
        const { data } = await supabase
          .from('purchase_logs')
          .select('id, status')
          .eq('order_no', merchantTradeNo)
          .maybeSingle()
        
        existingLog = data

        if (existingLog && existingLog.status === 'success') {
          if (isTestMode) {
            console.log(`🧪 [測試 webhook] 訂單 ${merchantTradeNo} 已處理過（purchase_logs 表狀態為 success），略過重複通知`)
          } else {
            console.log(`🚫 訂單 ${merchantTradeNo} 已處理過（purchase_logs 表狀態為 success），略過重複通知`)
          }
          return res.status(200).send('1|OK')
        }
        
        if (existingLog && existingLog.status === 'pending' && isTestMode) {
          console.log(`🧪 [測試 webhook] 發現 pending 訂單 ${merchantTradeNo}，將更新為 success`)
        }
      } catch (logCheckError: any) {
        // purchase_logs 表不存在或查詢失敗時，繼續處理
        if (isTestMode) {
          console.error(`🧪 [測試 webhook] 檢查 purchase_logs 表時發生錯誤：${logCheckError.message}`)
        } else {
          console.error(`❌ 檢查 purchase_logs 表時發生錯誤：${logCheckError.message}`)
        }
        // 不返回，繼續處理以確保寫入
      }

      // ===== 第二層防重複機制：檢查 orders 表（如果存在的話） =====
      try {
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id, status')
          .eq('order_no', merchantTradeNo)
          .maybeSingle()

        if (existingOrder && existingOrder.status === 'paid') {
          if (isTestMode) {
            console.log(`🧪 [測試 webhook] 訂單 ${merchantTradeNo} 已處理過（orders 表狀態為 paid），略過重複通知`)
          } else {
            console.log(`🚫 訂單 ${merchantTradeNo} 已處理過（orders 表狀態為 paid），略過重複通知`)
          }
          return res.status(200).send('1|OK')
        }
      } catch (orderCheckError: any) {
        // orders 表不存在或查詢失敗時，繼續處理
        if (isTestMode) {
          console.log(`🧪 [測試 webhook] 檢查 orders 表時發生錯誤（可能表不存在），繼續處理：${orderCheckError.message}`)
        } else {
          console.log(`ℹ️ 檢查 orders 表時發生錯誤（可能表不存在），繼續處理：${orderCheckError.message}`)
        }
      }

      // ===== 第三層防重複機制：寫入或更新 purchase_logs 紀錄 =====
      // ⚠️ 重要：使用 order_no 欄位（不可再使用 merchant_trade_no）
      try {
        if (existingLog) {
          // 如果訂單已存在（可能是 pending 狀態），更新為 success
          const { error: updateError } = await supabase
            .from('purchase_logs')
            .update({
              amount: tradeAmtNum,
              points: points,
              status: 'success',
            })
            .eq('order_no', merchantTradeNo)

          if (updateError) {
            if (isTestMode) {
              console.error(`🧪 [測試 webhook] 更新 purchase_logs 表失敗：${updateError.message}`)
            } else {
              console.error(`❌ 更新 purchase_logs 表失敗：${updateError.message}`)
            }
            throw updateError
          } else {
            if (isTestMode) {
              console.log(`🧪 [測試 webhook] 已更新 purchase_logs 表：${merchantTradeNo}，金額 ${tradeAmtNum} 元，點數 ${points} 點，狀態更新為 success`)
            } else {
              console.log(`✅ 已更新 purchase_logs 表：${merchantTradeNo}，金額 ${tradeAmtNum} 元，點數 ${points} 點，狀態更新為 success`)
            }
          }
        } else {
          // 如果訂單不存在，插入新記錄（使用 order_no 欄位）
          const { error: insertError } = await supabase.from('purchase_logs').insert({
            user_id: userId,
            order_no: merchantTradeNo, // ⚠️ 使用 order_no 欄位，不使用 merchant_trade_no
            amount: tradeAmtNum,
            points: points,
            status: 'success',
            created_at: new Date().toISOString(),
          })

          if (insertError) {
            // 如果是唯一約束錯誤（競態條件導致重複插入），嘗試更新（第三層防重複機制）
            if (insertError.code === '23505' || insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
              if (isTestMode) {
                console.log(`🧪 [測試 webhook] 訂單 ${merchantTradeNo} 插入時發生唯一約束衝突，嘗試更新...`)
              } else {
                console.log(`⚠️ 訂單 ${merchantTradeNo} 插入時發生唯一約束衝突，嘗試更新...`)
              }
              
              const { error: updateError } = await supabase
                .from('purchase_logs')
                .update({
                  amount: tradeAmtNum,
                  points: points,
                  status: 'success',
                })
                .eq('order_no', merchantTradeNo)

              if (updateError) {
                if (isTestMode) {
                  console.error(`🧪 [測試 webhook] 更新 purchase_logs 表失敗（唯一約束後嘗試更新）：${updateError.message}`)
                } else {
                  console.error(`❌ 更新 purchase_logs 表失敗（唯一約束後嘗試更新）：${updateError.message}`)
                }
                throw updateError
              } else {
                if (isTestMode) {
                  console.log(`🧪 [測試 webhook] 已更新 purchase_logs 表（唯一約束後）：${merchantTradeNo}，狀態更新為 success`)
                } else {
                  console.log(`✅ 已更新 purchase_logs 表（唯一約束後）：${merchantTradeNo}，狀態更新為 success`)
                }
              }
            } else {
              if (isTestMode) {
                console.error(`🧪 [測試 webhook] 寫入 purchase_logs 表失敗：${insertError.message}`)
              } else {
                console.error(`❌ 寫入 purchase_logs 表失敗：${insertError.message}`)
              }
              throw insertError
            }
          } else {
            if (isTestMode) {
              console.log(`🧪 [測試 webhook] 已寫入 purchase_logs 表：${merchantTradeNo}，金額 ${tradeAmtNum} 元，點數 ${points} 點`)
            } else {
              console.log(`✅ 已寫入 purchase_logs 表：${merchantTradeNo}，金額 ${tradeAmtNum} 元，點數 ${points} 點`)
            }
          }
        }
      } catch (insertErr: any) {
        if (isTestMode) {
          console.error(`🧪 [測試 webhook] 處理 purchase_logs 表時發生錯誤：${insertErr.message}`)
        } else {
          console.error(`❌ 處理 purchase_logs 表時發生錯誤：${insertErr.message}`)
        }
        // 記錄詳細錯誤以便排查
        console.error('錯誤詳情：', JSON.stringify(insertErr, null, 2))
        
        // ⚠️ 備用機制：使用 logPurchase 函數再次嘗試寫入（作為最後的保障）
        try {
          if (isTestMode) {
            console.log(`🧪 [測試 webhook] 使用備用機制再次嘗試寫入 purchase_logs...`)
          } else {
            console.log(`🔄 使用備用機制再次嘗試寫入 purchase_logs...`)
          }
          await logPurchase(merchantTradeNo, userId, tradeAmtNum, points, 'success', 0)
        } catch (backupErr: any) {
          if (isTestMode) {
            console.error(`🧪 [測試 webhook] 備用寫入機制也失敗：${backupErr.message}`)
          } else {
            console.error(`❌ 備用寫入機制也失敗：${backupErr.message}`)
          }
        }
        
        // 不中斷流程，繼續處理點數更新（但應該記錄此錯誤以便後續處理）
      }

      // ===== 3. 同步更新 user_credits 點數（測試模式不影響既有邏輯） =====
      try {
        // 讀取目前點數
        const { data: currentCredits } = await supabase
          .from('user_credits')
          .select('remaining_chars')
          .eq('user_id', userId)
          .maybeSingle()

        if (currentCredits) {
          // 更新現有記錄
          await supabase.from('user_credits')
            .update({
              remaining_chars: currentCredits.remaining_chars + points,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
          if (isTestMode) {
            console.log(`🧪 [測試 webhook] 已為使用者 ${userId} 增加 ${points} 字點數（目前總計：${currentCredits.remaining_chars + points} 點）`)
          } else {
            console.log(`✅ 已為使用者 ${userId} 增加 ${points} 字點數（目前總計：${currentCredits.remaining_chars + points} 點）`)
          }
        } else {
          // 建立新記錄
          await supabase.from('user_credits').insert({
            user_id: userId,
            remaining_chars: points,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          if (isTestMode) {
            console.log(`🧪 [測試 webhook] 已為新使用者 ${userId} 建立點數記錄：${points} 點`)
          } else {
            console.log(`✅ 已為新使用者 ${userId} 建立點數記錄：${points} 點`)
          }
        }
      } catch (creditsError: any) {
        if (isTestMode) {
          console.error('🧪 [測試 webhook] 更新 user_credits 失敗：', creditsError)
        } else {
          console.error('❌ 更新 user_credits 失敗：', creditsError)
        }
        // 即使更新失敗，仍回傳成功給綠界（避免重複通知）
        // 但應記錄錯誤以便後續處理
      }

      // ===== 4. 可選：寫入 orders 表（如果表存在的話，測試模式不影響既有邏輯） =====
      try {
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('order_no', merchantTradeNo)
          .maybeSingle()

        if (!existingOrder) {
          await supabase.from('orders').insert({
            order_no: merchantTradeNo,
            user_id: userId,
            amount: tradeAmtNum,
            description: 'RxV 點數購買',
            status: 'paid',
            created_at: new Date().toISOString(),
          })
          if (isTestMode) {
            console.log(`🧪 [測試 webhook] 已寫入 orders 表：${merchantTradeNo}`)
          } else {
            console.log(`✅ 已寫入 orders 表：${merchantTradeNo}`)
          }
        }
      } catch (orderErr: any) {
        // orders 表不存在或寫入失敗時，不影響主要流程
        if (isTestMode) {
          console.log(`🧪 [測試 webhook] 寫入 orders 表時發生錯誤（可能表不存在），繼續：${orderErr.message}`)
        } else {
          console.log(`ℹ️ 寫入 orders 表時發生錯誤（可能表不存在），繼續：${orderErr.message}`)
        }
      }
    } else {
      // 如果沒有 Supabase 設定，使用舊的 logPurchase 函數作為備用
      if (isTestMode) {
        console.log('🧪 [測試 webhook] 無 Supabase 設定，使用備用機制...')
      }
      await logPurchase(merchantTradeNo, userId, tradeAmtNum, points, 'success', 0)
      await addUserCredits(userId, points)
    }

    // 回傳給綠界（必須回傳 1|OK 或 0|Error）
    // 1|OK 表示成功接收，0|Error 表示失敗
    // ⚠️ 注意：在函數開頭已經檢查過 GET 請求並重定向，這裡只處理綠界服務器的 POST 請求
    // 如果請求方法是 GET（不應該到達這裡，因為已經在函數開頭處理），則重定向到成功頁面
    if (req.method === 'GET') {
      if (isTestMode) {
        console.log('🧪 [測試 webhook] GET 請求訪問 webhook URL（付款成功），重定向到成功頁面')
      } else {
        console.log('⚠️ GET 請求訪問 webhook URL（付款成功），重定向到成功頁面')
      }
      return res.redirect(302, successUrl)
    }
    
    if (isTestMode) {
      console.log('🧪 [測試 webhook] 處理完成，回傳 1|OK')
    } else {
      console.log('✅ Webhook 處理完成，回傳 1|OK')
    }
    return res.status(200).send('1|OK')
  } catch (error: any) {
    // 測試模式檢查（僅當 query 參數 test=1 時啟用）
    const isTestMode = req.query.test === '1'
    
    if (isTestMode) {
      console.error('🧪 [測試 webhook] Webhook 處理失敗：', error)
    } else {
      console.error('❌ Webhook 處理失敗：', error)
    }
    
    // 記錄錯誤日誌
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      params: req.body,
      ...(isTestMode && { test_mode: true }),
    }
    console.error('Webhook 錯誤日誌：', JSON.stringify(errorLog, null, 2))
    
    // 回傳錯誤給綠界（但仍回傳 0|Error 避免重複通知）
    return res.status(200).send('0|Error')
  }
}

// ===== 處理函數：模擬付款成功（Admin 測試模式） =====

/**
 * 模擬付款成功流程（僅限 admin 使用）
 * URL: /api/ecpay?simulate=payment-success&order_no=xxxx&user_id=xxxx
 * 或: /api/simulate-payment-success?order_no=xxxx&user_id=xxxx
 */
async function handleSimulatePaymentSuccess(req: VercelRequest, res: VercelResponse) {
  try {
    // 允許 GET 和 POST 請求
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' })
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        error: 'Configuration error',
        message: 'Supabase 設定不完整'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    })

    // 從查詢參數獲取 order_no 和 user_id
    const orderNo = (req.query.order_no || req.query.orderNo) as string
    const providedUserId = (req.query.user_id || req.query.userId) as string

    if (!orderNo) {
      return res.status(400).json({
        error: 'Missing parameter',
        message: '請提供 order_no 參數，例如：?order_no=2000132964033333'
      })
    }

    // 先查詢訂單信息（如果存在的話），以獲取 user_id
    let orderUserId: string | null = null
    try {
      const { data: orderData } = await supabase
        .from('purchase_logs')
        .select('user_id')
        .eq('order_no', orderNo)
        .maybeSingle()

      if (orderData?.user_id) {
        orderUserId = orderData.user_id
      }
    } catch (err: any) {
      console.error('❌ 查詢訂單 user_id 失敗：', err.message)
    }

    // 確定要檢查的 user_id（優先使用提供的，其次使用訂單中的）
    const checkUserId = providedUserId || orderUserId

    if (!checkUserId) {
      return res.status(400).json({
        error: 'Missing parameter',
        message: '請提供 user_id 參數，或確保訂單已存在於 purchase_logs 表中。例如：?order_no=xxxx&user_id=xxxx'
      })
    }

    // 檢查用戶是否是 admin
    let userEmail: string | null = null
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', checkUserId)
        .maybeSingle()

      if (!userError && userData?.email) {
        userEmail = userData.email
      } else {
        return res.status(403).json({
          error: 'Forbidden',
          message: '無法確認用戶身份，請確認 user_id 正確且用戶已存在於 users 表中。'
        })
      }
    } catch (err: any) {
      console.error('❌ 查詢用戶 email 失敗：', err.message)
      return res.status(500).json({
        error: 'Database error',
        message: `查詢用戶信息失敗：${err.message}`
      })
    }

    // 限定只有 ang2289@gmail.com 可以使用
    const ADMIN_EMAIL = 'ang2289@gmail.com'
    if (userEmail !== ADMIN_EMAIL) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `此功能僅限管理員使用。當前用戶：${userEmail || '未知'}。只有 ${ADMIN_EMAIL} 可以使用此功能。`
      })
    }

    console.log(`🧪 [模擬付款] Admin ${userEmail} 正在模擬訂單 ${orderNo} 的付款成功流程...`)

    // 查詢訂單信息（從 purchase_logs 表）
    let orderInfo: { user_id: string; amount: number; points: number; status: string } | null = null
    try {
      const { data, error } = await supabase
        .from('purchase_logs')
        .select('user_id, amount, points, status')
        .eq('order_no', orderNo)
        .maybeSingle()

      if (error) {
        console.error('❌ 查詢訂單信息失敗：', error.message)
      } else if (data) {
        orderInfo = data
        console.log('✅ 找到訂單信息：', orderInfo)
      } else {
        // 如果訂單不存在，需要從參數獲取信息
        console.log('⚠️ 訂單不存在於 purchase_logs 表，將使用提供的參數或預設值')
      }
    } catch (err: any) {
      console.error('❌ 查詢訂單時發生錯誤：', err.message)
    }

    // 確定用戶 ID、金額和點數
    // ⚠️ 重要：如果提供了 user_id 參數，使用它；否則使用訂單中的 user_id
    // 但如果訂單不存在，必須提供 user_id 參數
    const finalUserId = providedUserId || orderInfo?.user_id || orderUserId || ''
    const finalAmount = parseInt(req.query.amount as string) || orderInfo?.amount || 99
    let finalPoints: number

    // 根據金額判斷點數
    if (finalAmount === 99) {
      finalPoints = 100000
    } else if (finalAmount === 199) {
      finalPoints = 300000
    } else if (finalAmount === 10) {
      finalPoints = 10
    } else {
      // 如果無法判斷，使用訂單中的點數或預設值
      finalPoints = parseInt(req.query.points as string) || orderInfo?.points || 100000
    }

    if (!finalUserId) {
      return res.status(400).json({
        error: 'Missing parameter',
        message: '無法確定用戶 ID。請提供 user_id 參數，或確保訂單已存在於 purchase_logs 表中。例如：?order_no=xxxx&user_id=xxxx'
      })
    }

    console.log(`💰 [模擬付款] 訂單：${orderNo}，用戶：${finalUserId}，金額：${finalAmount} 元，點數：${finalPoints} 點`)

    // 模擬 webhook 處理邏輯
    // 1. 檢查是否已處理過
    let existingLog: { id: string; status: string } | null = null
    try {
      const { data } = await supabase
        .from('purchase_logs')
        .select('id, status')
        .eq('order_no', orderNo)
        .maybeSingle()

      existingLog = data

      if (existingLog && existingLog.status === 'success') {
        console.log(`⚠️ 訂單 ${orderNo} 已經處理過（狀態為 success），將更新點數但不重複寫入`)
      }
    } catch (err: any) {
      console.error('❌ 檢查訂單狀態時發生錯誤：', err.message)
    }

    // 2. 寫入或更新 purchase_logs
    try {
      if (existingLog) {
        // 更新現有記錄
        const { error: updateError } = await supabase
          .from('purchase_logs')
          .update({
            amount: finalAmount,
            points: finalPoints,
            status: 'success',
          })
          .eq('order_no', orderNo)

        if (updateError) {
          console.error(`❌ 更新 purchase_logs 失敗：${updateError.message}`)
          throw updateError
        } else {
          console.log(`✅ 已更新 purchase_logs 表：${orderNo}，狀態更新為 success`)
        }
      } else {
        // 插入新記錄
        const { error: insertError } = await supabase.from('purchase_logs').insert({
          user_id: finalUserId,
          order_no: orderNo,
          amount: finalAmount,
          points: finalPoints,
          status: 'success',
          created_at: new Date().toISOString(),
        })

        if (insertError) {
          // 如果是唯一約束錯誤，嘗試更新
          if (insertError.code === '23505' || insertError.message.includes('duplicate') || insertError.message.includes('unique')) {
            console.log(`⚠️ 訂單 ${orderNo} 插入時發生唯一約束衝突，嘗試更新...`)
            
            const { error: updateError } = await supabase
              .from('purchase_logs')
              .update({
                amount: finalAmount,
                points: finalPoints,
                status: 'success',
              })
              .eq('order_no', orderNo)

            if (updateError) {
              throw updateError
            } else {
              console.log(`✅ 已更新 purchase_logs 表（唯一約束後）：${orderNo}`)
            }
          } else {
            throw insertError
          }
        } else {
          console.log(`✅ 已寫入 purchase_logs 表：${orderNo}，金額 ${finalAmount} 元，點數 ${finalPoints} 點`)
        }
      }
    } catch (err: any) {
      console.error(`❌ 處理 purchase_logs 時發生錯誤：${err.message}`)
      return res.status(500).json({
        error: 'Database error',
        message: `寫入 purchase_logs 失敗：${err.message}`
      })
    }

    // 3. 更新 user_credits 點數
    try {
      const { data: currentCredits } = await supabase
        .from('user_credits')
        .select('remaining_chars')
        .eq('user_id', finalUserId)
        .maybeSingle()

      if (currentCredits) {
        // 更新現有記錄
        await supabase.from('user_credits')
          .update({
            remaining_chars: currentCredits.remaining_chars + finalPoints,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', finalUserId)
        console.log(`✅ 已為使用者 ${finalUserId} 增加 ${finalPoints} 字點數（目前總計：${currentCredits.remaining_chars + finalPoints} 點）`)
      } else {
        // 建立新記錄
        await supabase.from('user_credits').insert({
          user_id: finalUserId,
          remaining_chars: finalPoints,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        console.log(`✅ 已為新使用者 ${finalUserId} 建立點數記錄：${finalPoints} 點`)
      }
    } catch (err: any) {
      console.error('❌ 更新 user_credits 失敗：', err)
      return res.status(500).json({
        error: 'Database error',
        message: `更新 user_credits 失敗：${err.message}`
      })
    }

    // 4. 可選：寫入 orders 表（如果表存在的話）
    try {
      const { data: existingOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('order_no', orderNo)
        .maybeSingle()

      if (!existingOrder) {
        await supabase.from('orders').insert({
          order_no: orderNo,
          user_id: finalUserId,
          amount: finalAmount,
          description: 'RxV 點數購買（模擬）',
          status: 'paid',
          created_at: new Date().toISOString(),
        })
        console.log(`✅ 已寫入 orders 表：${orderNo}`)
      }
    } catch (err: any) {
      // orders 表不存在或寫入失敗時，不影響主要流程
      console.log(`ℹ️ 寫入 orders 表時發生錯誤（可能表不存在），繼續：${err.message}`)
    }

    console.log(`✅ [模擬付款] 完成！訂單 ${orderNo} 已成功處理`)

    // 導向成功頁面（帶上訂單編號和金額參數）
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://pomodoro-app-eight-rouge.vercel.app'
    
    const successUrl = `${baseUrl}/pricing/success?MerchantTradeNo=${orderNo}&TradeAmt=${finalAmount}&PaymentDate=${encodeURIComponent(new Date().toISOString().replace('T', ' ').substring(0, 19))}&PaymentType=Credit`

    // 如果是 GET 請求，直接重定向
    if (req.method === 'GET') {
      return res.redirect(302, successUrl)
    }

    // 如果是 POST 請求，返回 JSON 響應
    return res.status(200).json({
      success: true,
      message: '模擬付款成功處理完成',
      order_no: orderNo,
      user_id: finalUserId,
      amount: finalAmount,
      points: finalPoints,
      redirect_url: successUrl,
    })
  } catch (error: any) {
    console.error('❌ [模擬付款] 處理失敗：', error)
    return res.status(500).json({
      error: 'Simulation failed',
      message: error?.message || '模擬付款處理時發生錯誤',
      ...(process.env.NODE_ENV === 'development' && { stack: error?.stack }),
    })
  }
}

// ===== 主 Handler =====

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // ===== CORS =====
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      return res.status(200).end()
    }

    // ===== 判斷請求類型 =====
    // 檢查是否為模擬付款請求
    const isSimulatePayment = req.query.simulate === 'payment-success' || req.url?.includes('simulate-payment-success')
    
    if (isSimulatePayment) {
      // 模擬付款請求（支援 GET 和 POST）
      return await handleSimulatePaymentSuccess(req, res)
    }

    // 檢查是否為 webhook
    const isWebhook = req.query.event === 'webhook'
    const isWebhookUrl = req.url?.includes('webhook') || false

    if (isWebhook || isWebhookUrl) {
      // Webhook 請求（僅支援 POST）
      if (req.method !== 'POST') {
        // 如果是 GET 請求訪問 webhook URL（可能是用戶被錯誤導向），重定向到成功頁面
        const ecpayConfig = getEcpayConfig()
        const successUrl = ecpayConfig.CLIENT_BACK_URL || '/pricing/success'
        console.log(`⚠️ GET 請求訪問 webhook URL，重定向到成功頁面：${successUrl}`)
        return res.redirect(302, successUrl)
      }
      return await handleWebhook(req, res)
    }

    // 建立訂單請求（僅支援 POST）
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed. Create order requires POST.' })
    }
    return await handleCreateOrder(req, res)
  } catch (error: any) {
    // 捕獲所有未預期的錯誤，確保返回 JSON 格式的錯誤訊息
    console.error('❌ [ecpay/handler] 未預期的錯誤：', error)
    
    // 確保返回 JSON 格式的錯誤，避免 Vercel 返回 HTML 錯誤頁面
    if (!res.headersSent) {
      return res.status(500).json({
        error: 'Internal server error',
        message: error?.message || '伺服器發生錯誤，請稍後再試',
        ...(process.env.NODE_ENV === 'development' && { stack: error?.stack }),
      })
    }
  }
}
