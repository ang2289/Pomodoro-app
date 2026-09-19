// 已棄用頁面提示
// 當使用者訪問舊版路由時顯示此頁面

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PrimaryButton from '@/components/ui/PrimaryButton'

interface DeprecatedPageProps {
  /** 舊版路由路徑 */
  oldPath?: string
  /** 新版路由路徑 */
  newPath?: string
  /** 自訂提示訊息（i18n key 或未傳則用預設 key） */
  messageKey?: string
}

export default function DeprecatedPage({
  oldPath,
  newPath = '/pricing',
  messageKey,
}: DeprecatedPageProps) {
  const { t } = useTranslation()
  const defaultMessage = messageKey ? t(messageKey) : t('deprecated_default_message')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {t('deprecated_page_title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {defaultMessage}
          </p>
          {oldPath && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {t('deprecated_old_path')}：{oldPath}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Link to={newPath}>
            <PrimaryButton fullWidth>
              {t('go_to_new_flow')}
            </PrimaryButton>
          </Link>
          <Link to="/">
            <PrimaryButton fullWidth className="bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600">
              {t('back_to_home')}
            </PrimaryButton>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('deprecated_new_flow_label')}：
          </p>
          <ul className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
            <li>• {t('homepage')}：<Link to="/pricing" className="text-blue-600 dark:text-blue-400 hover:underline">/pricing</Link></li>
            <li>• {t('footer_usage_info')}：<Link to="/payment/bank-transfer" className="text-blue-600 dark:text-blue-400 hover:underline">/payment/bank-transfer</Link></li>
            <li>• <Link to="/payment/report" className="text-blue-600 dark:text-blue-400 hover:underline">/payment/report</Link></li>
            <li>• <Link to="/admin/payments" className="text-blue-600 dark:text-blue-400 hover:underline">/admin/payments</Link></li>
          </ul>
        </div>
      </div>
    </div>
  )
}
