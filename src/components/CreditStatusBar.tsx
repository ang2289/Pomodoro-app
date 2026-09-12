// ⚠️ 已停用：此組件已不再使用
// 原因：移除 Supabase Auth 和舊點數系統
// 如需顯示點數狀態，請使用 src/lib/userCredits.ts

import { useState } from 'react'

interface CreditStatusBarProps {
  lang?: 'zh-tw' | 'en'
  className?: string
}

/**
 * @deprecated 已停用，不再支援舊點數系統
 */
export default function CreditStatusBar({
  lang = 'zh-tw',
  className = '',
}: CreditStatusBarProps) {
  return null
}
