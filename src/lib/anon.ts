// ⚠️ 已停用：匿名使用者功能已移除
// 原因：不再支援匿名使用者，只支援正式登入使用者

/**
 * @deprecated 已停用，不再支援匿名使用者
 */
export function getAnonToken(): string {
  console.warn('[anon] getAnonToken 已停用，不再支援匿名使用者')
  return ''
}
