// ⚠️ 已停用：此組件已不再使用
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface UsageLog {
  id: string
  feature: 'summary' | 'homework'
  total_chars: number
  input_chars: number
  output_chars: number
  created_at: string
}

interface CreditUsageDisplayProps {
  lang?: 'zh-tw' | 'en'
}

/**
 * @deprecated 已停用，不再支援舊點數系統
 */
export default function CreditUsageDisplay({ lang = 'zh-tw' }: CreditUsageDisplayProps) {
  const { t } = useTranslation()
  const [usageLogs] = useState<UsageLog[]>([])
  const [loading] = useState(false)

  if (loading) {
    return (
      <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
        <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6">
          💳 {t('credits_usage_status')}
        </h2>
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            {t('credits_loading')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
      <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6">
        💳 {t('credits_usage_status')}
      </h2>

      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">
          {t('credits_disabled')}
        </p>
      </div>
    </div>
  )
}
