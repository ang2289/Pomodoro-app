// 綠界付款失敗頁面
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { buildSEO } from '../../lib/seo'

const seo = buildSEO({
  title: '付款失敗',
  description: '付款未成功，請重新嘗試',
  url: '/pricing/fail',
})

export default function PurchaseFailPage() {
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* 失敗圖示 */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>
          </div>

          {/* 失敗訊息 */}
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            付款失敗
          </h1>
          <p className="text-gray-600 mb-6">
            很抱歉，您的付款未成功，點數尚未儲值。<br />
            請確認信用卡資訊，或稍後再試一次。
          </p>

          {/* 操作按鈕 */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 font-medium py-3 px-4 rounded-lg transition shadow-md"
            >
              重新付款
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition"
            >
              回首頁
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
