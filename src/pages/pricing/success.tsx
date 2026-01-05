// 綠界付款成功頁面
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { buildSEO } from '../../lib/seo'
import { supabase } from '@/lib/supabase'
import PrimaryButton from '@/components/ui/PrimaryButton'

const seo = buildSEO({
  title: '付款成功',
  description: '付款已完成，字數額度已更新',
  url: '/pricing/success',
})

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [remainingChars, setRemainingChars] = useState<number | null>(null)
  const [creditsAdded, setCreditsAdded] = useState(false)
  const [purchaseLog, setPurchaseLog] = useState<{ points: number; bonusPoints: number } | null>(null)

  useEffect(() => {
    // 從 URL 參數取得付款資訊（綠界會回傳）
    const merchantTradeNo = searchParams.get('MerchantTradeNo')
    const tradeAmt = searchParams.get('TradeAmt')
    const paymentDate = searchParams.get('PaymentDate')
    const paymentType = searchParams.get('PaymentType')

    if (merchantTradeNo) {
      setPaymentInfo({
        merchantTradeNo,
        tradeAmt,
        paymentDate,
        paymentType,
      })

      // 根據 MerchantTradeNo 查詢購點紀錄獲取 points 和 bonus_points
      const fetchOrder = async () => {
        try {
          const { data, error } = await supabase
            .from('purchase_logs')
            .select('points, bonus_points, amount, status')
            .eq('merchant_trade_no', merchantTradeNo)
            .single()

          if (error) {
            console.error('[PaymentSuccess] 查詢購點紀錄失敗：', error)
          } else if (data) {
            // 如果查詢到紀錄，更新點數資訊
            const points = data.points || 0
            const bonusPoints = data.bonus_points || 0
            const totalPoints = points + bonusPoints
            setRemainingChars(totalPoints) // 顯示總點數（包含加贈）
            setCreditsAdded(true)
            // 儲存購點紀錄資訊以供顯示
            setPurchaseLog({
              points,
              bonusPoints,
            })
          }
        } catch (err: any) {
          console.error('[PaymentSuccess] 查詢購點紀錄錯誤：', err)
        } finally {
          setLoading(false)
        }
      }

      fetchOrder()
    } else {
      setLoading(false)
    }
  }, [searchParams])

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {loading ? (
            <div className="py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">處理中...</p>
            </div>
          ) : (
            <>
              {/* 成功圖示 */}
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">✅</span>
                </div>
              </div>

              {/* 成功訊息 */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                付款成功！
              </h1>
              <p className="text-gray-600 mb-6">
                使用額度已入帳，可立即使用
              </p>
              
              {/* 顯示購買的點數（包含加贈） */}
              {creditsAdded && remainingChars !== null && purchaseLog && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800 mb-2">您已成功獲得</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {remainingChars.toLocaleString()} 點
                  </p>
                  {purchaseLog.bonusPoints > 0 && (
                    <p className="text-sm text-blue-700 mt-2">
                      （含加贈 <strong>{purchaseLog.bonusPoints.toLocaleString()}</strong> 點）
                    </p>
                  )}
                  <p className="text-xs text-blue-600 mt-2">可立即使用！</p>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mb-6">
                您的使用額度已成功加入帳戶，可以立即使用 AI 摘要和解題功能。
              </p>

              {/* 付款資訊 */}
              {paymentInfo && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-3">付款資訊</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">訂單編號：</span>
                      <span className="font-mono text-gray-900">{paymentInfo.merchantTradeNo}</span>
                    </div>
                    {paymentInfo.tradeAmt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">付款金額：</span>
                        <span className="font-semibold text-gray-900">NT$ {paymentInfo.tradeAmt}</span>
                      </div>
                    )}
                    {paymentInfo.paymentDate && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">付款時間：</span>
                        <span className="text-gray-900">{paymentInfo.paymentDate}</span>
                      </div>
                    )}
                    {paymentInfo.paymentType && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">付款方式：</span>
                        <span className="text-gray-900">{paymentInfo.paymentType}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 操作按鈕 */}
              <div className="space-y-3">
                <PrimaryButton
                  onClick={() => navigate('/summary')}
                  fullWidth
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  前往使用 AI 摘要
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => navigate('/pricing')}
                  fullWidth
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  返回方案頁面
                </PrimaryButton>
              </div>

              {/* 提示訊息 */}
              <p className="mt-6 text-xs text-gray-500">
                ※ 若字數額度尚未更新，請稍候幾秒後重新整理頁面
              </p>
            </>
          )}
        </div>
      </div>
    </>
  )
}

