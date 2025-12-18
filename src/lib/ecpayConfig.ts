// 綠界金流設定管理檔（單一來源）
// ⚠️ 重要：此檔案為綠界金流設定的單一來源，請勿在其他地方硬編

/**
 * 綠界金流環境設定
 */
export interface EcpayConfig {
  /** 商店代號（MerchantID） */
  merchantID: string
  /** 金鑰（HashKey） */
  hashKey: string
  /** 向量（HashIV） */
  hashIV: string
  /** 回傳網址（Webhook URL） */
  webhookUrl: string
  /** 成功付款後跳轉網址 */
  returnUrl: string
  /** 是否為測試環境 */
  isTestMode: boolean
  /** 綠界 API 網址 */
  apiUrl: string
}

/**
 * 取得綠界金流設定
 * 從環境變數讀取，若無則使用預設測試值
 */
export function getEcpayConfig(): EcpayConfig {
  // 從環境變數讀取（生產環境應設定在 Vercel 環境變數中）
  const merchantID = import.meta.env.VITE_ECPAY_MERCHANT_ID || '3002607'
  const hashKey = import.meta.env.VITE_ECPAY_HASH_KEY || 'pwFHCqoQD1i0sxYd6Mvz5T8B3nK9L2J'
  const hashIV = import.meta.env.VITE_ECPAY_HASH_IV || 'EkRm7iFT261i5s4qiyWu3D2e7uP8hN1'
  
  // 判斷是否為測試環境
  const isTestMode = import.meta.env.VITE_ECPAY_TEST_MODE !== 'false'
  
  // API 網址（測試環境與正式環境不同）
  const apiUrl = isTestMode
    ? 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
    : 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5'
  
  // Webhook URL（應設定為你的 API 端點）
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://pomodoro-app-eight-rouge.vercel.app'
  const webhookUrl = `${baseUrl}/api/ecpay/credit-webhook`
  
  // 成功付款後跳轉網址
  const returnUrl = `${baseUrl}/pricing/success`
  
  return {
    merchantID,
    hashKey,
    hashIV,
    webhookUrl,
    returnUrl,
    isTestMode,
    apiUrl,
  }
}

/**
 * 取得綠界金流設定（僅回傳基本資訊，不含敏感資料）
 */
export function getEcpayConfigPublic() {
  const config = getEcpayConfig()
  return {
    merchantID: config.merchantID,
    isTestMode: config.isTestMode,
    apiUrl: config.apiUrl,
  }
}

