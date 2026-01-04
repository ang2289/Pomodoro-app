// ⚠️ 已停用：此組件已不再使用
// 原因：移除 Supabase Auth 和舊點數系統
// 如需顯示使用紀錄，請使用 src/lib/userCredits.ts 的 logUsage()

import { useState } from 'react'

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
  const [usageLogs] = useState<UsageLog[]>([])
  const [loading] = useState(false)

  if (loading) {
    return (
      <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
        <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6">
          💳 {lang === 'zh-tw' ? '使用額度狀況' : 'Usage Quota Status'}
        </h2>
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            {lang === 'zh-tw' ? '載入中…' : 'Loading...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
      <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6">
        💳 {lang === 'zh-tw' ? '使用額度狀況' : 'Usage Quota Status'}
      </h2>

      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">
          {lang === 'zh-tw' 
            ? '此功能已停用' 
            : 'This feature has been disabled'}
        </p>
      </div>
    </div>
  )
}
