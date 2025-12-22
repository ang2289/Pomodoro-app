/**
 * 環境判斷工具函數
 * 統一判斷是否為正式環境（production）
 * 
 * 規則：
 * - 正式網域（非 localhost、127.x.x.x、192.168.x.x）→ 強制視為 production
 * - localhost 或內網 IP → 視為開發環境
 * - 不依賴 NODE_ENV 或 VITE_ 環境變數（因為這些可能在正式網域上也被設為 development）
 */

/**
 * 判斷是否為正式環境（production）
 * 
 * @returns true 表示正式環境，false 表示開發/測試環境
 */
export function isProduction(): boolean {
  if (typeof window === 'undefined') {
    // SSR 環境：根據 NODE_ENV 判斷（但這不應該影響前端扣點邏輯）
    return import.meta.env.PROD === true
  }

  const hostname = window.location.hostname.toLowerCase()

  // 正式網域判斷：非 localhost、非 127.x.x.x、非 192.168.x.x → 強制視為 production
  const isLocalhost = 
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('127.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('172.16.') ||
    hostname.startsWith('172.17.') ||
    hostname.startsWith('172.18.') ||
    hostname.startsWith('172.19.') ||
    hostname.startsWith('172.20.') ||
    hostname.startsWith('172.21.') ||
    hostname.startsWith('172.22.') ||
    hostname.startsWith('172.23.') ||
    hostname.startsWith('172.24.') ||
    hostname.startsWith('172.25.') ||
    hostname.startsWith('172.26.') ||
    hostname.startsWith('172.27.') ||
    hostname.startsWith('172.28.') ||
    hostname.startsWith('172.29.') ||
    hostname.startsWith('172.30.') ||
    hostname.startsWith('172.31.')

  // 如果不是 localhost 或內網 IP，強制視為 production
  return !isLocalhost
}

/**
 * 判斷是否為開發/測試環境
 * 
 * @returns true 表示開發/測試環境，false 表示正式環境
 */
export function isDevelopment(): boolean {
  return !isProduction()
}

