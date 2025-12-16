// 共用扣點提示元件
// 用於顯示點數使用情況和不足警告
// 適用於摘要、解題等所有需要扣點的功能

import { useNavigate } from 'react-router-dom'

interface CreditUsageNoticeProps {
  /** 剩餘點數 */
  remainingChars: number | null
  /** 本次需要字數 */
  requiredChars: number
  /** 功能名稱（用於顯示） */
  featureName: 'summary' | 'homework' | string
  /** 語言設定 */
  lang?: 'zh-tw' | 'en'
  /** 是否載入中 */
  loading?: boolean
}

export default function CreditUsageNotice({
  remainingChars,
  requiredChars,
  featureName,
  lang = 'zh-tw',
  loading = false,
}: CreditUsageNoticeProps) {
  const navigate = useNavigate()

  // 如果正在載入或沒有剩餘點數資料，顯示載入中
  if (loading || remainingChars === null) {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          {lang === 'zh-tw' ? '載入點數中…' : 'Loading credits...'}
        </p>
      </div>
    )
  }

  // 功能名稱顯示文字
  const getFeatureName = () => {
    if (lang === 'zh-tw') {
      return featureName === 'summary' ? '摘要' : featureName === 'homework' ? '解題' : featureName
    }
    return featureName === 'summary' ? 'Summary' : featureName === 'homework' ? 'Homework' : featureName
  }

  // 判斷是否點數不足
  const isInsufficient = remainingChars < requiredChars

  if (isInsufficient) {
    // 點數不足：警告狀態
    return (
      <div className="mt-3 p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 mb-1">
              {lang === 'zh-tw' ? '⚠️ 點數不足' : '⚠️ Insufficient Credits'}
            </p>
            <p className="text-sm text-red-700">
              {lang === 'zh-tw'
                ? `本次${getFeatureName()}需要 ${requiredChars.toLocaleString()} 字，剩餘 ${remainingChars.toLocaleString()} 字`
                : `${getFeatureName()} requires ${requiredChars.toLocaleString()} chars, remaining: ${remainingChars.toLocaleString()} chars`}
            </p>
          </div>
          <button
            onClick={() => navigate('/pricing')}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors whitespace-nowrap"
          >
            {lang === 'zh-tw' ? '購買點數' : 'Buy Credits'}
          </button>
        </div>
      </div>
    )
  }

  // 點數足夠：正常狀態
  const afterDeduction = remainingChars - requiredChars
  return (
    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-sm text-gray-700">
        {lang === 'zh-tw'
          ? `本次將扣除 ${requiredChars.toLocaleString()} 字，剩餘 ${afterDeduction.toLocaleString()} 字`
          : `This will deduct ${requiredChars.toLocaleString()} chars, remaining: ${afterDeduction.toLocaleString()} chars`}
      </p>
    </div>
  )
}

