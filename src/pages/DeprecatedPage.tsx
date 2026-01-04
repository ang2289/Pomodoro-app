// 已棄用頁面提示
// 當使用者訪問舊版路由時顯示此頁面

import { Link } from 'react-router-dom'
import PrimaryButton from '@/components/ui/PrimaryButton'

interface DeprecatedPageProps {
  /** 舊版路由路徑 */
  oldPath?: string
  /** 新版路由路徑 */
  newPath?: string
  /** 自訂提示訊息 */
  message?: string
}

export default function DeprecatedPage({
  oldPath = '此頁面',
  newPath = '/pricing',
  message,
}: DeprecatedPageProps) {
  const defaultMessage = message || `此頁面已棄用，請前往新版流程`

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            頁面已棄用
          </h1>
          <p className="text-gray-600 mb-4">
            {defaultMessage}
          </p>
          {oldPath && (
            <p className="text-sm text-gray-500 mb-2">
              舊版路徑：{oldPath}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Link to={newPath}>
            <PrimaryButton fullWidth>
              前往新版流程
            </PrimaryButton>
          </Link>
          <Link to="/">
            <PrimaryButton fullWidth className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50">
              返回首頁
            </PrimaryButton>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            新版流程：
          </p>
          <ul className="text-xs text-gray-500 mt-2 space-y-1">
            <li>• 方案頁：<Link to="/pricing" className="text-blue-600 hover:underline">/pricing</Link></li>
            <li>• 匯款頁：<Link to="/payment/bank-transfer" className="text-blue-600 hover:underline">/payment/bank-transfer</Link></li>
            <li>• 匯款回報：<Link to="/payment/report" className="text-blue-600 hover:underline">/payment/report</Link></li>
            <li>• 後台管理：<Link to="/admin/payments" className="text-blue-600 hover:underline">/admin/payments</Link></li>
          </ul>
        </div>
      </div>
    </div>
  )
}


