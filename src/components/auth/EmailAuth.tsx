// ⚠️ 已停用：此組件已不再使用
// 原因：移除 Supabase Auth
// 如需登入功能，請使用本地登入系統（users.id）

import { useState } from 'react'

/**
 * @deprecated 已停用，不再支援 Supabase Auth
 */
export default function EmailAuth() {
  const [email] = useState('')
  const [password] = useState('')
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  return (
    <div className="p-4">
      <p className="text-gray-500 text-sm">
        此功能已停用
      </p>
    </div>
  )
}
