import { Link } from 'react-router-dom'

export default function VideoPreviewPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🎬 AI 短影音工具
        </h1>
        
        <div className="bg-white rounded-xl shadow-md p-8 mb-6">
          <p className="text-lg text-gray-700 mb-4">
            此功能目前為開發中，尚未提供實際影音產生服務。
          </p>
          <p className="text-xs text-gray-500">
            本頁僅為功能展示，不涉及任何付款或訂閱。
          </p>
        </div>

        <Link
          to="/"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          返回工具首頁
        </Link>
      </div>
    </div>
  )
}

