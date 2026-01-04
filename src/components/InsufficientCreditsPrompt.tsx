// 點數不足提示區塊元件
// 當 consume_credits 回傳 false 時顯示

import { Link } from 'react-router-dom'
import { PLANS } from '@/config'
import { getPlanChars } from '@/lib/usagePlans'
import PrimaryButton from '@/components/ui/PrimaryButton'

interface InsufficientCreditsPromptProps {
  /** 語言設定 */
  lang?: 'zh-tw' | 'en'
  /** 自訂 className */
  className?: string
}

export default function InsufficientCreditsPrompt({
  lang = 'zh-tw',
  className = '',
}: InsufficientCreditsPromptProps) {
  return (
    <div className={`mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-6 shadow-md ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          {lang === 'zh-tw' ? '你的點數已不足完成本次操作' : 'Insufficient credits to complete this operation'}
        </h2>
        <p className="text-gray-700 text-sm leading-relaxed">
          {lang === 'zh-tw' 
            ? '如果你會持續使用，建議直接選擇 30 萬字方案，中途不會再被中斷' 
            : 'If you will continue using, we recommend choosing the 300,000 character plan directly to avoid interruptions'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
        {/* 按鈕 1：NT$199（主要按鈕樣式） */}
        <Link to="/pricing" className="flex-1">
          <PrimaryButton fullWidth className="bg-purple-600 hover:bg-purple-700">
            {lang === 'zh-tw' ? `NT$${PLANS.plan199.price} - ${getPlanChars('pack199').toLocaleString()} 字` : `NT$${PLANS.plan199.price} - ${getPlanChars('pack199').toLocaleString()} chars`}
          </PrimaryButton>
        </Link>

        {/* 按鈕 2：NT$99（次要按鈕樣式） */}
        <Link to="/pricing" className="flex-1">
          <PrimaryButton 
            fullWidth 
            className="bg-white text-blue-700 border-2 border-blue-300 hover:bg-blue-50"
          >
            {lang === 'zh-tw' ? `NT$${PLANS.plan99.price} - ${getPlanChars('pack99').toLocaleString()} 字` : `NT$${PLANS.plan99.price} - ${getPlanChars('pack99').toLocaleString()} chars`}
          </PrimaryButton>
        </Link>
      </div>
    </div>
  )
}

