// 綠界付款成功頁面
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { buildSEO } from '../../lib/seo'
import { getCustomSessionToken, getPurchaseStatus } from '@/lib/accountApi'
import PrimaryButton from '@/components/ui/PrimaryButton'

const seo = buildSEO({
  title: '付款成功',
  description: '付款已完成，字數額度已更新',
  url: '/pricing/success',
})

interface PurchaseInfo {
  points: number
  amount: number
  status: string
  order_no: string
  created_at: string
}

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [purchaseInfo, setPurchaseInfo] = useState<PurchaseInfo | null>(null)
  const displayAmount = purchaseInfo?.amount ?? Number(searchParams.get('TradeAmt') || 0)
  const includesStorefrontGift = displayAmount === 99 || displayAmount === 199

  useEffect(() => {
    const fetchPaymentData = async () => {
      try {
        setLoading(true)
        
        // 從 URL 參數取得付款資訊（綠界會回傳）
        const merchantTradeNo = searchParams.get('MerchantTradeNo')

        if (!merchantTradeNo) {
          console.warn('[PaymentSuccess] 沒有訂單編號')
          setLoading(false)
          return
        }

        // 取得使用者 ID
        const sessionToken = getCustomSessionToken()
        if (!sessionToken) {
          console.warn('[PaymentSuccess] 沒有使用者 ID')
          setLoading(false)
          return
        }

        // 1. 查詢購點紀錄（從 purchase_logs 表）
        // 如果 webhook 已經處理，應該能找到成功記錄
        // 如果還沒處理，可能需要等待或重試
        let purchaseData: PurchaseInfo | null = null
        let retryCount = 0
        const maxRetries = 5
        const retryDelay = 1000 // 1 秒

        while (!purchaseData && retryCount < maxRetries) {
          const data = await getPurchaseStatus(merchantTradeNo).catch(() => null)
          const error = data ? null : new Error('PURCHASE_STATUS_NOT_READY')

          if (error) {
            console.error('[PaymentSuccess] 查詢購點紀錄失敗：', error)
            break
          }

          if (data && (data.status === 'success' || data.status === 'paid')) {
            purchaseData = data as PurchaseInfo
            break
          }

          // 如果還沒找到成功記錄，等待 webhook 處理
          if (retryCount < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, retryDelay))
          }
          retryCount++
        }

        // 如果還是沒找到，使用 URL 參數中的金額來判斷點數（備用方案）
        if (purchaseData) {
          setPurchaseInfo(purchaseData)
        }
      } catch (err: any) {
        console.error('[PaymentSuccess] 處理付款資料錯誤：', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPaymentData()
  }, [searchParams])


  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          {loading ? (
            <div className="py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">正在處理付款資料...</p>
              <p className="text-sm text-gray-400 mt-2">請稍候</p>
            </div>
          ) : (
            <>
              {/* 付款成功提示卡片 */}
              <div className="mb-8">
                {/* 成功圖示：✅ 綠色圓形打勾 icon */}
                <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-md mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                {/* 標題文字 */}
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  付款成功！
                </h1>
                
                {/* 內容 */}
                <p className="text-gray-600 text-base leading-relaxed">
                  您的點數已成功儲值，感謝您的支持。
                </p>
              </div>
              
              {/* 交易摘要資訊（若可取得） */}
              {purchaseInfo ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4 text-center">交易摘要</h3>
                  <div className="space-y-3 text-sm">
                    {/* 訂單編號 */}
                    {purchaseInfo.order_no && (
                      <div className="flex justify-between items-start">
                        <span className="text-gray-600 font-medium">訂單編號：</span>
                        <span className="font-mono text-xs text-gray-900 break-all text-right max-w-[60%]">
                          {purchaseInfo.order_no}
                        </span>
                      </div>
                    )}
                    
                    {/* 購買點數數量 */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-600 font-medium">購買點數：</span>
                      <span className="text-lg font-bold text-gray-900">
                        {purchaseInfo.points.toLocaleString()} 點
                      </span>
                    </div>
                    
                    {/* 實際付款金額 */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-600 font-medium">付款金額：</span>
                      <span className="text-lg font-bold text-green-600">
                        NT$ {purchaseInfo.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // 如果交易資訊無法即時顯示
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 text-center">
                    付款成功，點數已加入帳戶
                  </p>
                </div>
              )}

              {includesStorefrontGift ? (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left">
                  <p className="text-sm font-black text-emerald-700">🎁 本次點數包包含店家商品展示頁</p>
                  <h2 className="mt-2 text-lg font-black text-slate-950">站方確認後會為你人工開通</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    商品展示頁會由站方依付款紀錄開通。完成後會通知你，再使用付款時的同一個帳號登入設定店名、商品、聯絡方式與 QR Code。
                  </p>
                </div>
              ) : null}

              <PrimaryButton
                onClick={() => navigate('/')}
                fullWidth
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 shadow-md hover:shadow-lg transition-all duration-200"
              >
                回到首頁
              </PrimaryButton>
            </>
          )}
        </div>
      </div>
    </>
  )
}
