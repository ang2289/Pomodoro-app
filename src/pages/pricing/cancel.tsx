// 綠界付款取消頁面
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { buildSEO } from '../../lib/seo'

const seo = buildSEO({
  title: '付款已取消',
  description: '付款流程已取消',
  url: '/pricing/cancel',
})

export default function PaymentCancelPage() {
  const navigate = useNavigate()

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* 取消圖示 */}
          <div className="mb-6">
            <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">⚠️</span>
            </div>
          </div>

          {/* 取消訊息 */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            付款已取消
          </h1>
          <p className="text-gray-600 mb-6">
            您已取消付款流程，不會產生任何費用。
          </p>

          {/* 操作按鈕 */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              返回方案頁面
            </button>
            <button
              onClick={() => navigate('/summary')}
              className="w-full bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-300 transition"
            >
              前往摘要工具
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

