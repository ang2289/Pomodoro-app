import { useNavigate } from 'react-router-dom'

interface UpgradeModalProps {
  /** 是否顯示彈窗 */
  isOpen: boolean
  /** 關閉彈窗的回調 */
  onClose: () => void
  /** 本次需要的字數 */
  requiredChars: number
  /** 目前剩餘的字數 */
  remainingChars: number
  /** 語言設定 */
  lang?: 'zh-tw' | 'en'
}

export default function UpgradeModal({
  isOpen,
  onClose,
  requiredChars,
  remainingChars,
  lang = 'zh-tw',
}: UpgradeModalProps) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleGoToPricing = () => {
    onClose()
    navigate('/pricing')
  }

  // 🧩 收尾 2：只有在 remainingChars === 0 時才顯示此彈窗
  // 視窗文案需標示「目前僅開放試用，購買功能尚未開放」
  // 不可出現付款、結帳、信用卡等字樣
  const isQuotaExhausted = remainingChars === 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {lang === 'zh-tw' ? '免費試用額度已用完' : 'Free Trial Quota Exhausted'}
        </h3>
        <p className="text-gray-700 mb-4 whitespace-pre-line">
          {isQuotaExhausted ? (
            lang === 'zh-tw'
              ? `您已完成本次免費試用（10,000 字）。\n目前僅開放試用，購買功能尚未開放。`
              : `You have completed the free trial (10,000 characters).\nCurrently only trial is available, purchase function is not yet open.`
          ) : (
            lang === 'zh-tw'
              ? `本次需要 ${requiredChars.toLocaleString()} 字，你剩餘 ${remainingChars.toLocaleString()} 字`
              : `This operation requires ${requiredChars.toLocaleString()} characters, but you only have ${remainingChars.toLocaleString()} characters remaining`
          )}
        </p>
        {isQuotaExhausted && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            {lang === 'zh-tw' 
              ? '⚠️ 目前僅開放試用，購買功能尚未開放'
              : '⚠️ Currently only trial is available, purchase function is not yet open'}
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            {lang === 'zh-tw' ? '關閉' : 'Close'}
          </button>
          <button
            onClick={handleGoToPricing}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            {lang === 'zh-tw' ? '查看方案（尚未開放購買）' : 'View Plans (Purchase Not Available)'}
          </button>
        </div>
      </div>
    </div>
  )
}

