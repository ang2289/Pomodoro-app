// 免費試用用完提示元件（全站共用）
// 當未登入使用者用完 3 次免費試用時顯示

import { useNavigate } from 'react-router-dom'
import { trackEvent } from '@/utils/analytics'

interface FreeTrialExhaustedPromptProps {
  onDismiss?: () => void
}

export default function FreeTrialExhaustedPrompt({ onDismiss }: FreeTrialExhaustedPromptProps) {
  const navigate = useNavigate()

  const handleLogin = () => {
    trackEvent('signup_after_trial', {
      source: 'free_trial_exhausted'
    })
    navigate('/login')
  }

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            免費試用已用完
          </h2>
          <p className="text-gray-600 leading-relaxed">
            你已完成 3 次免費體驗
            <br />
            登入即可獲得 10,000 點
            <br />
            可用於全站所有功能（摘要、作業與未來模組）
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleLogin}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            登入繼續使用
          </button>
          <button
            onClick={handleDismiss}
            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            稍後再說
          </button>
        </div>
      </div>
    </div>
  )
}
