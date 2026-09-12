/**
 * GA4 事件追蹤工具
 * 集中管理所有 Google Analytics 4 事件追蹤
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * GA4 測量 ID
 */
const GA_MEASUREMENT_ID = 'G-BDND2JZKLE'

/**
 * 檢查 GA4 是否可用
 */
function isGAAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.gtag === 'function'
}

/**
 * 通用 GA4 事件追蹤函式
 * 這是所有 GA4 事件追蹤的基礎函式
 * 
 * @param eventName 事件名稱
 * @param eventParams 事件參數（可選）
 * 
 * @example
 * ```ts
 * // 追蹤按鈕點擊
 * trackEvent('button_click', { 
 *   button_id: 'start_timer', 
 *   action: 'click' 
 * })
 * 
 * // 追蹤頁面瀏覽
 * trackEvent('page_view', {
 *   page_title: 'Home',
 *   page_location: '/home'
 * })
 * ```
 */
export function trackEvent(
  eventName: string,
  eventParams?: Record<string, unknown>
): void {
  try {
    if (isGAAvailable()) {
      window.gtag!('event', eventName, eventParams || {})
      
      // 開發環境下輸出追蹤日誌（可選）
      if (import.meta.env.DEV) {
        // console.log(`📊 [GA4] ${eventName}:`, eventParams)
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
 * 追蹤頁面瀏覽
 * 
 * @param pagePath 頁面路徑
 * @param pageTitle 頁面標題（可選）
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  try {
    if (isGAAvailable()) {
      window.gtag!('config', GA_MEASUREMENT_ID, {
        page_path: pagePath,
        page_title: pageTitle,
      })
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      // console.warn('⚠️ [GA4] 頁面追蹤失敗:', error)
    }
  }
}

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
 * 
 * @param params 事件參數
 * 
 * @example
 * ```ts
 * trackToolClick({
 *   tool_name: 'ai_summary',
 *   page_name: 'pomodoro',
 *   position: 'timer_end'
 * })
 * ```
 */
export function trackToolClick(params: ToolClickParams): void {
  trackEvent('tool_click', {
    tool_name: params.tool_name,
    page_name: params.page_name,
    position: params.position,
  })
}

/**
 * 追蹤按鈕點擊事件
 * 
 * @param buttonId 按鈕 ID
 * @param buttonText 按鈕文字（可選）
 * @param location 點擊位置（可選）
 */
export function trackButtonClick(
  buttonId: string,
  buttonText?: string,
  location?: string
): void {
  trackEvent('button_click', {
    button_id: buttonId,
    button_text: buttonText,
    location: location,
  })
}

/**
 * 追蹤連結點擊事件
 * 
 * @param linkUrl 連結 URL
 * @param linkText 連結文字（可選）
 */
export function trackLinkClick(linkUrl: string, linkText?: string): void {
  trackEvent('link_click', {
    link_url: linkUrl,
    link_text: linkText,
  })
}

/**
 * 追蹤表單提交事件
 * 
 * @param formId 表單 ID
 * @param formName 表單名稱（可選）
 */
export function trackFormSubmit(formId: string, formName?: string): void {
  trackEvent('form_submit', {
    form_id: formId,
    form_name: formName,
  })
}

/**
 * 追蹤搜尋事件
 * 
 * @param searchTerm 搜尋關鍵字
 * @param searchCategory 搜尋類別（可選）
 */
export function trackSearch(searchTerm: string, searchCategory?: string): void {
  trackEvent('search', {
    search_term: searchTerm,
    search_category: searchCategory,
  })
}

/**
 * 追蹤文章閱讀事件
 * 
 * @param articleTitle 文章標題
 * @param articleCategory 文章類別（可選）
 */
export function trackArticleView(articleTitle: string, articleCategory?: string): void {
  trackEvent('article_view', {
    article_title: articleTitle,
    article_category: articleCategory,
  })
}

/**
 * 匯出所有追蹤函式作為預設物件，方便使用
 */
export const analytics = {
  trackEvent,
  trackPageView,
  trackToolClick,
  trackButtonClick,
  trackLinkClick,
  trackFormSubmit,
  trackSearch,
  trackArticleView,
}
