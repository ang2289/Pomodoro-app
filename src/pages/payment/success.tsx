// 補點成功導流頁面
// 顯示補點完成提示並導向主要功能

import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { supabase } from '@/lib/supabase'
// ⚠️ 已移除 useAuth 和 useAuthCredits
import PrimaryButton from '@/components/ui/PrimaryButton'

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { remainingChars, refreshCredits } = useAuthCredits()
  const [hasRecentPayment, setHasRecentPayment] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkRecentPayment = async () => {
      if (!user?.email) {
        setHasRecentPayment(false)
        setLoading(false)
        return
      }

      try {
        // 查詢 payment_reports：email = user.email, processed = true, created_at >= now() - 24 hours
        const twentyFourHoursAgo = new Date()
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

        const { data, error } = await supabase
          .from('payment_reports')
          .select('id, plan_id, amount_ntd, created_at')
          .eq('email', user.email)
          .eq('processed', true)
          .gte('created_at', twentyFourHoursAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) {
          console.error('❌ 查詢補點記錄失敗:', error)
          setHasRecentPayment(false)
        } else {
          setHasRecentPayment(data && data.length > 0)
        }
      } catch (err) {
        console.error('❌ 檢查補點記錄時發生錯誤:', err)
        setHasRecentPayment(false)
      } finally {
        setLoading(false)
        // 刷新點數狀態
        await refreshCredits()
      }
    }

    checkRecentPayment()
  }, [user, refreshCredits])

  // 載入中
  if (loading) {
    return (
      <>
        <Helmet>
          <title>補點成功 - 載入中</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">載入中...</p>
          </div>
        </div>
      </>
    )
  }

  // 若有補點記錄：顯示成功提示
  if (hasRecentPayment) {
    return (
      <>
        <Helmet>
          <title>點數已補充完成</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
          <div className="max-w-2xl mx-auto">
            {/* 成功提示 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
              <div className="mb-6">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl">✅</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                點數已補充完成
              </h1>
              <p className="text-gray-600 mb-6">
                您的點數已成功補充，可以立即開始使用！
              </p>

              {/* ⚠️ 已移除點數顯示 */}
            </div>

            {/* 主要功能按鈕 */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                立即開始使用
              </h2>
              <div className="space-y-4">
                <Link to="/summary" className="block">
                  <PrimaryButton fullWidth className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                    📝 AI 摘要工具
                  </PrimaryButton>
                </Link>
                <Link to="/tools/homework-helper" className="block">
                  <PrimaryButton fullWidth className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600">
                    📚 作業解題助手
                  </PrimaryButton>
                </Link>
                {/* SEO 工具（若存在） */}
                {/* <Link to="/tools/seo" className="block">
                  <PrimaryButton fullWidth className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
                    🔍 SEO 優化工具
                  </PrimaryButton>
                </Link> */}
              </div>
            </div>

            {/* 使用說明連結 */}
            <div className="text-center">
              <Link
                to="/help"
                className="inline-block text-blue-600 hover:text-blue-800 underline text-sm"
              >
                📖 使用說明 / Help
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  // 若無補點記錄：顯示一般使用提示
  return (
    <>
      <Helmet>
        <title>歡迎使用</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            歡迎使用
          </h1>
          <p className="text-gray-600 mb-6">
            您目前沒有最近的補點記錄，歡迎探索我們的功能！
          </p>
          <div className="space-y-3">
            <PrimaryButton
              onClick={() => navigate('/summary')}
              fullWidth
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              前往 AI 摘要工具
            </PrimaryButton>
            <PrimaryButton
              onClick={() => navigate('/')}
              fullWidth
              className="bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              返回首頁
            </PrimaryButton>
          </div>
        </div>
      </div>
    </>
  )
}

