export const getEcpayConfig = () => {
  const isTestMode = true  // ✅ 測試模式開啟

  if (isTestMode) {
    return {
      MERCHANT_ID: '2000132',
      HASH_KEY: '5294y06JbISpM5x9',
      HASH_IV: 'v77hoKGq4kWxNNIS',
      RETURN_URL: 'https://pomodoro-app-eight-rouge.vercel.app/api/ecpay/credit-webhook',
      CLIENT_BACK_URL: 'https://pomodoro-app-eight-rouge.vercel.app/pricing/success',
    }
  }

  // TODO: 上線時請改為正式參數
  return {
    MERCHANT_ID: process.env.VITE_ECPAY_MERCHANT_ID!,
    HASH_KEY: process.env.VITE_ECPAY_HASH_KEY!,
    HASH_IV: process.env.VITE_ECPAY_HASH_IV!,
    RETURN_URL: process.env.VITE_ECPAY_RETURN_URL!,
    CLIENT_BACK_URL: process.env.VITE_ECPAY_CLIENT_BACK_URL!,
  }
}
