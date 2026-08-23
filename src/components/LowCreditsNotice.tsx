// 低點數提醒元件
// 當 remaining_credits < 5000 且 consume_credits 尚可成功時顯示

import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { trackEvent } from '@/utils/analytics'

interface LowCreditsNoticeProps {
  /** 剩餘點數 */
  remainingCredits: number
  /** 語言設定 */
  lang?: 'zh-tw' | 'en'
  /** 自訂 className */
  className?: string
}

export default function LowCreditsNotice({
  remainingCredits,
  lang = 'zh-tw',
  className = '',
}: LowCreditsNoticeProps) {
  const { t } = useTranslation()
  const location = useLocation()
  
  // 只在 remaining_credits < 5000 且 > 0 時顯示（表示還可以用，但偏低）
  if (remainingCredits >= 5000 || remainingCredits <= 0) {
    return null
  }

  const handlePricingClick = () => {
    const sourcePage = location.pathname || 'unknown'
    trackEvent('click_pricing', { source_page: sourcePage })
  }

  return (
    <div className={`bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-amber-600 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm text-amber-800">
            {t('credits_low_remaining', { count: remainingCredits })}
          </p>
          <Link
            to="/pricing"
            onClick={handlePricingClick}
            className="inline-block mt-2 text-sm font-medium text-amber-700 hover:text-amber-900 underline"
          >
            {t('credits_view_plans')} →
          </Link>
        </div>
      </div>
    </div>
  )
}


