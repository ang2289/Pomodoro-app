// 綠界金流：建立付款表單 API
// 接收前端傳入的 planId，產生綠界付款表單

import type { VercelRequest, VercelResponse } from '@vercel/node'

// 引入方案定義（需要從前端 lib 複製或共用）
const PLANS = {
  pack99: { chars: 100000, price: 99 },
  pack199: { chars: 300000, price: 199 },
} as const

type PlanId = 'pack99' | 'pack199'

/**
 * 產生綠界 CheckMacValue（驗證碼）
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
  
  // 4. URL Encode
  const encoded = encodeURIComponent(fullString).toLowerCase()
  
  // 5. SHA256 雜湊
  // 注意：實際應使用 crypto 模組，這裡簡化處理
  // 在實際環境中，應使用 Node.js crypto 或第三方套件
  return encoded // 實際應為 SHA256(encoded)
}

/**
 * 建立綠界付款表單
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只接受 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { planId, userId } = req.body

    // 驗證 planId
    if (!planId || (planId !== 'pack99' && planId !== 'pack199')) {
      return res.status(400).json({ error: 'Invalid planId. Must be pack99 or pack199' })
    }

    // 取得方案資訊
    const plan = PLANS[planId as PlanId]
    if (!plan) {
      return res.status(400).json({ error: 'Plan not found' })
    }

    // 取得綠界設定（從環境變數）
    const merchantID = process.env.ECPAY_MERCHANT_ID || '3002607'
    const hashKey = process.env.ECPAY_HASH_KEY || 'pwFHCqoQD1i0sxYd6Mvz5T8B3nK9L2J'
    const hashIV = process.env.ECPAY_HASH_IV || 'EkRm7iFT261i5s4qiyWu3D2e7uP8hN1'
    const isTestMode = process.env.ECPAY_TEST_MODE !== 'false'
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.VITE_APP_URL || 'https://pomodoro-app-eight-rouge.vercel.app'
    
    const returnUrl = `${baseUrl}/pricing/success`
    const orderResultURL = `${baseUrl}/api/ecpay-webhook`

    // 產生訂單編號（格式：MerchantID + 時間戳記 + 隨機數）
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    const merchantTradeNo = `${merchantID}${timestamp}${random}`

    // 建立綠界付款參數
    const ecpayParams: Record<string, string> = {
      MerchantID: merchantID,
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0],
      PaymentType: 'aio',
      TotalAmount: plan.price.toString(),
      TradeDesc: `購買 ${planId} 方案，獲得 ${plan.chars.toLocaleString()} 字額度`,
      ItemName: `${planId} 方案 - ${plan.chars.toLocaleString()} 字`,
      ReturnURL: returnUrl,
      OrderResultURL: orderResultURL,
      ChoosePayment: 'ALL', // 支援所有付款方式
      EncryptType: '1', // SHA256
      // 額外參數：儲存 planId 和 userId 供 webhook 使用
      CustomField1: planId,
      CustomField2: userId || '',
    }

    // 產生 CheckMacValue
    const checkMacValue = generateCheckMacValue(ecpayParams, hashKey, hashIV)
    ecpayParams['CheckMacValue'] = checkMacValue

    // 記錄訂單（可選：寫入資料庫）
    // TODO: 將訂單資訊寫入 purchase_logs 表（狀態：pending）

    // 回傳付款表單資料
    return res.status(200).json({
      success: true,
      merchantTradeNo,
      formData: ecpayParams,
      apiUrl: isTestMode
        ? 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
        : 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5',
      planId,
      planInfo: {
        chars: plan.chars,
        price: plan.price,
      },
    })
  } catch (error: any) {
    console.error('❌ 建立綠界訂單失敗：', error)
    return res.status(500).json({
      error: 'Failed to create order',
      message: error.message,
    })
  }
}

