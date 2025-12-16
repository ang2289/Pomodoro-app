// 綠界金流：建立點數購買訂單 API（一次性付款）
// 接收前端傳入的 planId，產生綠界一次性付款表單

import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

// 引入方案定義（從 usagePlans.ts）
const PLANS = {
  pack99: { chars: 100000, price: 99 },
  pack199: { chars: 300000, price: 199 },
} as const

type PlanId = 'pack99' | 'pack199'

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
 * 建立綠界一次性付款訂單
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
    
    // 一次性付款：ReturnURL（付款成功後跳轉）
    const returnUrl = `${baseUrl}/pricing/success`
    // Webhook URL（綠界會主動通知）
    const orderResultURL = `${baseUrl}/api/ecpay/credit-webhook`

    // 產生訂單編號（格式：MerchantID + 時間戳記 + 隨機數）
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    const merchantTradeNo = `CREDIT_${merchantID}_${timestamp}_${random}`

    // 建立綠界付款參數（一次性付款）
    const ecpayParams: Record<string, string> = {
      MerchantID: merchantID,
      MerchantTradeNo: merchantTradeNo,
      MerchantTradeDate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0],
      PaymentType: 'aio',
      TotalAmount: plan.price.toString(),
      TradeDesc: `購買點數方案：${plan.chars.toLocaleString()} 字`,
      ItemName: `${planId} 方案 - ${plan.chars.toLocaleString()} 字`,
      ReturnURL: returnUrl,
      OrderResultURL: orderResultURL,
      ChoosePayment: 'ALL', // 支援所有付款方式
      EncryptType: '1', // SHA256
      // 額外參數：儲存 planId 和 userId 供 webhook 使用
      CustomField1: planId,
      CustomField2: userId || '',
      // 一次性付款（非訂閱）
      StoreID: '', // 商店代號（一次性付款不需要）
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
    
    // 記錄錯誤日誌
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      planId: req.body?.planId,
      userId: req.body?.userId,
    }
    console.error('錯誤日誌：', JSON.stringify(errorLog, null, 2))
    
    return res.status(500).json({
      error: 'Failed to create order',
      message: error.message || '建立訂單時發生錯誤，請稍後再試',
    })
  }
}

