import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { trackPageView, trackEvent, trackToolClick } from "../utils/analytics"
import type { ToolClickParams, ToolClickPosition } from "../utils/analytics"

// 重新匯出類型，保持向後兼容
export type { ToolClickParams, ToolClickPosition }

/**
 * GA4 頁面瀏覽追蹤 Hook
 * 當路由變化時自動發送頁面瀏覽事件
 */
export function useGATracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageView(`${location.pathname}${location.search}`)
  }, [location])
}

// ============================================
// GA4 共用事件追蹤函式（重新匯出，保持向後兼容）
// ============================================

/**
 * 追蹤工具點擊事件
 * @param params 事件參數
 * 
 * @example
 * // 在番茄鐘完成時點擊 AI 摘要工具
 * trackToolClick({
 *   tool_name: 'ai_summary',
 *   page_name: 'pomodoro',
 *   position: 'timer_end'
 * })
 */
export { trackToolClick }

/**
 * 通用 GA4 事件追蹤函式
 * @param eventName 事件名稱
 * @param eventParams 事件參數
 * 
 * @example
 * // 追蹤自訂事件
 * trackEvent('button_click', { button_id: 'start_timer', action: 'click' })
 */
export { trackEvent }
