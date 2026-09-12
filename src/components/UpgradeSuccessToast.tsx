// 升級成功提示元件
// 當 total_credits 增加時顯示一次性提示

import { useEffect, useState } from 'react'

interface UpgradeSuccessToastProps {
  /** 是否顯示 */
  show: boolean
  /** 語言設定 */
  lang?: 'zh-tw' | 'en'
  /** 關閉回調 */
  onClose: () => void
}

export default function UpgradeSuccessToast({
  show,
  lang = 'zh-tw',
  onClose,
}: UpgradeSuccessToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // 3 秒後自動關閉
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 300) // 等待動畫完成後再調用 onClose
      }, 3000)

      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [show, onClose])

  if (!show && !isVisible) {
    return null
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[-20px]'
      }`}
    >
      <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]">
        <div className="flex-shrink-0">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold">
            {lang === 'zh-tw' ? '升級成功！點數已加入帳戶' : 'Upgrade successful! Credits have been added to your account'}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 300)
          }}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}


