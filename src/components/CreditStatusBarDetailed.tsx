// ⚠️ 已停用：此組件已不再使用
// 原因：移除 Supabase Auth 和舊點數系統
// 如需顯示點數狀態，請使用 src/lib/userCredits.ts

interface CreditStatusBarDetailedProps {
  inputChars: number
  isLoading: boolean
  featureName: 'summary' | 'homework'
  lang?: 'zh-tw' | 'en'
  anonRemainingChars?: number | null
}

/**
 * @deprecated 已停用，不再支援舊點數系統
 */
export default function CreditStatusBarDetailed({
  inputChars,
  isLoading,
  featureName,
  lang = 'zh-tw',
  anonRemainingChars,
}: CreditStatusBarDetailedProps) {
  return null
}

/**
 * @deprecated 已停用
 */
export const updateUsedCharsAfterSuccess = (usedPoints: number) => {
  // 已停用
}
