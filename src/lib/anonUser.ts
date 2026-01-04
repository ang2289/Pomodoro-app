// ⚠️ 已停用：匿名使用者功能已移除
// 原因：不再支援匿名使用者，只支援正式登入使用者

/**
 * @deprecated 已停用，不再支援匿名使用者
 */
export async function initAnonUser(): Promise<{
  anonToken: string
  remainingChars: number
}> {
  console.warn('[anonUser] initAnonUser 已停用，不再支援匿名使用者')
  return {
    anonToken: '',
    remainingChars: 0,
  }
}
