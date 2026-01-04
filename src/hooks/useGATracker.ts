import { useEffect } from "react"
import { useLocation } from "react-router-dom"

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * GA4 頁面瀏覽追蹤 Hook
 * 當路由變化時自動發送頁面瀏覽事件
 */
export function useGATracker() {
  const location = useLocation()

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("config", "G-BDND2JZKLE", {
        page_path: `${location.pathname}${location.search}`,
      })
    }
  }, [location])
}

// ============================================
// GA4 共用事件追蹤函式
// ============================================

/**
 * 工具點擊位置類型
 */
export type ToolClickPosition = 
  | 'header'           // 頁面頂部工具列
  | 'timer_end'        // 番茄鐘完成提示
  | 'footer'           // 頁面底部區塊
  | 'extension_block'  // 延伸區塊
  | 'sidebar'          // 側邊欄
  | 'modal'            // 彈窗內
  | 'inline'           // 內文中

/**
 * 工具點擊事件參數
 */
export interface ToolClickParams {
  /** 工具名稱（例如：ai_summary, todo, focus_training） */
  tool_name: string
  /** 目前頁面（例如：pomodoro, summary, home） */
  page_name: string
  /** 點擊位置（例如：header, timer_end, footer） */
  position: ToolClickPosition | string
}

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
export function trackToolClick(params: ToolClickParams): void {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "tool_click", {
        tool_name: params.tool_name,
        page_name: params.page_name,
        position: params.position,
      })
      
      // 開發環境下輸出追蹤日誌
      if (import.meta.env.DEV) {
        // console.log('📊 [GA4] tool_click:', params)
      }
    }
  } catch (error) {
    // 安全忽略錯誤，避免影響使用者體驗
    if (import.meta.env.DEV) {
      // console.warn('⚠️ [GA4] 追蹤失敗:', error)
    }
  }
}

/**
 * 通用 GA4 事件追蹤函式
 * @param eventName 事件名稱
 * @param eventParams 事件參數
 * 
 * @example
 * // 追蹤自訂事件
 * trackEvent('button_click', { button_id: 'start_timer', action: 'click' })
 */
export function trackEvent(eventName: string, eventParams?: Record<string, unknown>): void {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", eventName, eventParams)
      
      // 開發環境下輸出追蹤日誌
      if (import.meta.env.DEV) {
        // console.log(`📊 [GA4] ${eventName}:`, eventParams)
      }
    }
  } catch (error) {
    // 安全忽略錯誤
    if (import.meta.env.DEV) {
      // console.warn('⚠️ [GA4] 追蹤失敗:', error)
    }
  }
}










