import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { buildSEO } from '../../lib/seo'
import { PLANS, getPlanChars, getPlanLabel, getAllPlans, type PlanId } from '../../lib/usagePlans'
import { getCurrentUserId, isLoggedIn } from '../../lib/auth'
import { trackEvent } from '@/utils/analytics'

const seo = buildSEO({
  title: '使用額度方案',
  description: '一次購買使用額度，依實際使用的文字量扣除，不限使用期限、不自動續費。',
  url: 'https://pomodoro-app-eight-rouge.vercel.app/pricing',
  image: '/seo/pricing.png',
})

// 僅此清單內的管理員帳號可看到 NT$10 測試方案。
// 不因 localhost 自動顯示，避免客戶在本機測試時看見。
const TEST_PAYMENT_ADMIN_EMAILS = new Set([
  'ang2289@gmail.com',
])

function canSeeTestPayment(email?: string | null) {
  return TEST_PAYMENT_ADMIN_EMAILS.has(String(email || '').trim().toLowerCase())
}

function getAuthToken() {
  if (typeof window === 'undefined') return ''
  return String(window.localStorage.getItem('auth_token') || window.localStorage.getItem('token') || '').trim()
}

// 綠界金流結帳函式（中英文共用同一套付款流程）
// ⚠️ 重要：此函式同時支援中文版和英文版，都導向 /api/ecpay/create-credit-order
async function startEcpayCheckout(
  planId: PlanId | 'pack1', // 支援測試方案 pack1
  event?: React.MouseEvent<HTMLButtonElement>,
  lang: 'zh-tw' | 'en' = 'zh-tw', // 新增 lang 參數以正確顯示載入和錯誤訊息
  userId?: string, // 從 session 取得的使用者 ID
  sourcePage?: string // 來源頁面（用於 GA4 追蹤）
) {
  try {
    // 追蹤點擊定價事件
    trackEvent('click_pricing', {
      plan_id: planId,
      source_page: sourcePage || 'pricing',
    })
    
    // console.log('🛒 開始綠界金流結帳流程：', planId, lang)
    
    // 檢查登入狀態（使用 localStorage 的 userId）
    if (!userId) {
      userId = getCurrentUserId() || ''
    }
    
    // 如果仍然沒有 userId，則檢查是否已登入
    if (!userId) {
      // 再次嘗試從 localStorage 讀取
      const storedUserId = localStorage.getItem('userId')
      if (storedUserId) {
        userId = storedUserId
      }
    }
    
    // 驗證 userId 是否存在且不為空
    if (!userId || userId.trim() === '') {
      throw new Error(lang === 'en' ? 'Please log in first' : '請先登入')
    }
    
    // 顯示載入狀態（多語言支援）
    const button = event?.currentTarget as HTMLButtonElement
    const originalText = button?.textContent || ''
    if (button) {
      // 儲存原始按鈕文字
      button.setAttribute('data-original-text', originalText)
      button.disabled = true
      button.textContent = lang === 'en' ? 'Processing...' : '處理中...'
    }
    
    // 呼叫後端 API 創建綠界付款表單（一次性付款）
    // ✅ 中英文版本都使用同一支 API
    const authToken = getAuthToken()
    if (!authToken) throw new Error(lang === 'en' ? 'Please log in first' : '請先登入')

    const response = await fetch('/api/ecpay', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
        }),
      })

    if (!response.ok) {
      // 嘗試解析錯誤響應，但如果失敗則使用狀態文本
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorText = await response.text()
        // 嘗試解析為 JSON
        try {
          const error = JSON.parse(errorText)
          errorMessage = error.message || error.error || errorMessage
        } catch {
          // 如果不是 JSON，使用原始文本（截取前 200 字元避免過長）
          errorMessage = errorText.length > 200 
            ? errorText.substring(0, 200) + '...' 
            : errorText || errorMessage
        }
      } catch {
        // 如果連文本都讀取失敗，使用預設錯誤訊息
        errorMessage = `建立訂單失敗 (HTTP ${response.status})`
      }
      throw new Error(errorMessage)
    }

    // 解析成功響應
    let data
    try {
      const responseText = await response.text()
      data = JSON.parse(responseText)
    } catch (parseError: any) {
      throw new Error(`無法解析伺服器響應：${parseError.message || '無效的 JSON 格式'}`)
    }
    
    if (!data.success) {
      throw new Error('建立訂單失敗')
    }

    // 建立表單並自動提交到綠界
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = data.apiUrl
    form.style.display = 'none'

    // 將表單資料加入
    Object.keys(data.formData).forEach(key => {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = data.formData[key]
      form.appendChild(input)
    })

    // 加入表單到頁面並提交
    document.body.appendChild(form)
    form.submit()
  } catch (error: any) {
    console.error('❌ 結帳流程失敗：', error)
    
    // 恢復按鈕狀態（多語言支援）
    const button = event?.currentTarget as HTMLButtonElement
    if (button) {
      button.disabled = false
      // 恢復按鈕原始文字
      const originalText = button.getAttribute('data-original-text') || ''
      button.textContent = originalText || (
        planId === 'pack1' 
          ? '測試用方案'
          : planId === 'pack99' 
            ? (lang === 'en' ? 'Purchase NT$99 Plan' : '購買 99 方案')
            : (lang === 'en' ? 'Purchase NT$199 Plan' : '購買 199 方案')
      )
    }
    
    // 顯示友善錯誤提示（多語言）
    const errorMsg = lang === 'en' 
      ? `Checkout failed: ${error.message || 'Please try again later'}\n\nIf the problem persists, please contact support.`
      : `結帳失敗：${error.message || '請稍後再試'}\n\n若問題持續發生，請聯繫客服。`
    alert(errorMsg)
  }
}

export default function PricingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [lang, setLang] = useState<'zh-tw' | 'en'>('zh-tw')
  const target = new URLSearchParams(location.search).get('target') // plan99 | plan199，來自圖片頁被鎖導向
  const [userEmail, setUserEmail] = useState<string | null>(null) // 用戶 email，用於判斷是否顯示測試方案
  const [isTestUser, setIsTestUser] = useState(false) // 僅管理員帳號可看到 NT$10 測試方案

  // 追蹤頁面瀏覽事件
  useEffect(() => {
    trackEvent('view_pricing')
  }, [])

  // 檢查使用者是否在試用期間，並取得用戶 email
  useEffect(() => {
    const checkTrialStatusAndEmail = async () => {
      // 取得當前登入的 userId
      const userId = getCurrentUserId()
      const authToken = getAuthToken()
      
      if (!userId || !authToken) {
        setIsTestUser(false)
        return
      }

      try {
        // 查詢用戶 email
        const profileResponse = await fetch('/api/main?action=get-current-user-profile', {
          method: 'GET',
          headers: { Authorization: `Bearer ${authToken}` },
        })
        const profileData = await profileResponse.json().catch(() => ({}))
        const verifiedUserId = String(profileData?.user?.id || '').trim()
        const email = String(profileData?.user?.email || '').trim().toLowerCase()

        if (profileResponse.ok && verifiedUserId && email) {
          setUserEmail(email)
          setIsTestUser(canSeeTestPayment(email))
          // 僅白名單管理員可看到測試方案；localhost 不再自動顯示。
        } else {
          setUserEmail(null)
          setIsTestUser(false)
          return
        }
      } catch (err) {
        console.error('❌ 檢查試用狀態或取得 email 失敗:', err)
        setIsTestUser(false)
      }
    }

    checkTrialStatusAndEmail()
  }, [])

  return (
    <>
      <Helmet>
        <title>{seo.title}</title>
      </Helmet>
      
      {/* 語系選擇 */}
      <div className="flex justify-end mb-4 p-4">
        <div className="flex flex-col items-end">
          <label className="text-sm text-gray-600 mb-1">
            🌐 選擇語言 / Choose Language
          </label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            className="w-[150px] p-2 border rounded-lg bg-white shadow-sm"
          >
            <option value="zh-tw">繁體中文</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* ===== Container ===== */}
      <div className="max-w-6xl mx-auto px-4 py-8 bg-[#EFF5FF] min-h-screen">
        {/* 主要標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {lang === 'zh-tw' ? '點數方案（一次購買，用完為止）' : 'Point Plans (One-time Purchase, Use Until Exhausted)'}
          </h1>
          {/* 指令 4：依 target 顯示提示（從圖片頁被鎖導向時） */}
          {target === 'plan99' && (
            <p className="text-base text-blue-700 font-medium mt-2">
              {lang === 'zh-tw' ? '此為會員圖片（NT$99 以上可下載），升級即可下載' : 'Member images (NT$99+); upgrade to download.'}
            </p>
          )}
          {target === 'plan199' && (
            <p className="text-base text-purple-700 font-medium mt-2">
              {lang === 'zh-tw' ? '此為高級圖片（NT$199 專屬），升級即可下載' : 'Premium images (NT$199 only); upgrade to download.'}
            </p>
          )}
        </div>

        {/* 綠界合規說明 */}
        <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-lg">
          <h2 className="text-lg font-bold text-red-900 mb-4">
            {lang === 'zh-tw' ? '⚠️ 重要購買說明' : '⚠️ Important Purchase Information'}
          </h2>
          <ul className="list-disc ml-6 space-y-2 text-red-800 text-sm leading-relaxed">
            <li>
              {lang === 'zh-tw' 
                ? '本站提供 AI 數位服務，採點數制'
                : 'This site provides AI digital services using a usage quota system'}
            </li>
            <li>
              {lang === 'zh-tw' 
                ? '點數僅限本站使用，無使用期限'
                : 'Points are only valid on this site and have no expiration date'}
            </li>
            <li>
              {lang === 'zh-tw' 
                ? '文字工具依輸入與輸出字數扣點，圖片工具依生成類型固定扣點'
                : 'Text tools deduct by character count, and image tools deduct fixed points by generation type'}
            </li>
            <li className="font-semibold">
              {lang === 'zh-tw' 
                ? '點數一經使用即視為服務完成，恕不退款'
                : 'Once points are used, the service is considered completed and no refunds will be provided'}
            </li>
          </ul>
        </div>

        {/* 點數包加贈商品展示頁：付款前顯示附加價值。 */}
        {lang === 'zh-tw' && (
          <section className="mb-8 w-full rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm sm:p-6">
            <div className="w-full min-w-0">
              <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-sm">
                🎁 指定點數包加贈
              </span>

              <h2 className="mt-3 break-words text-2xl font-black leading-snug text-slate-950">
                購買商品圖點數包，加贈店家商品展示頁
              </h2>

              <p className="mt-3 w-full break-words text-sm leading-7 text-slate-700 sm:text-base">
                NT$99／NT$199 指定商品圖點數方案，加贈專屬商品展示頁、公開網址與 QR Code。
                可放商品介紹、LINE、電話、Email、Facebook、蝦皮或下單連結，方便用在名片、小卡、菜單、桌牌與社群貼文。
              </p>

              <div className="mt-5 grid w-full gap-3 sm:grid-cols-3">
                <span className="flex min-h-[58px] items-center justify-center rounded-xl bg-white px-4 py-3 text-base font-black text-emerald-700 shadow-sm sm:text-lg">
                  專屬商品頁
                </span>
                <span className="flex min-h-[58px] items-center justify-center rounded-xl bg-white px-4 py-3 text-base font-black text-sky-700 shadow-sm sm:text-lg">
                  公開網址
                </span>
                <span className="flex min-h-[58px] items-center justify-center rounded-xl bg-white px-4 py-3 text-base font-black text-violet-700 shadow-sm sm:text-lg">
                  QR Code 下載
                </span>
              </div>

              <div className="mt-5">
                <Link
                  to="/shop/rxv"
                  className="inline-flex min-h-[54px] w-full items-center justify-center rounded-xl border border-emerald-700 bg-emerald-600 px-6 py-3 text-base font-black !text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg sm:w-auto"
                  style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                >
                  <span className="!text-white" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
                    看看商品頁示範
                  </span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* 方案卡片區塊 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* 免費方案卡已隱藏：生圖與 AI 工具皆有成本，價格頁不再顯示免費體驗方案。 */}

          {/* NT$99 方案卡（target=plan99 時高亮） */}
          <div className={`min-w-0 shadow-md border-2 rounded-2xl p-6 bg-blue-50 hover:shadow-lg transition ${target === 'plan99' ? 'border-blue-500 ring-2 ring-blue-400 ring-offset-2' : 'border-blue-300'}`}>
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">💎</span>
              <h2 className="text-xl font-bold text-blue-900 mb-2">
                {/* ✅ 價格數字和幣別固定為 NT$99，僅文字說明會切換 */}
                NT${PLANS.pack99.price} {lang === 'zh-tw' ? '方案' : '/ One-time purchase'}
              </h2>
              <p className="text-2xl font-bold text-blue-900">
                {/* ✅ 字數固定，僅單位文字會切換 */}
                {getPlanChars('pack99').toLocaleString()} {lang === 'zh-tw' ? '點' : 'points'}
              </p>
              {/* 付款說明（英文版） */}
              {lang === 'en' && (
                <p className="text-xs text-blue-600 mt-2 italic">
                  Payment is processed in New Taiwan Dollar (TWD). Credit cards are accepted.
                </p>
              )}
            </div>
            
            <div className="text-blue-800 space-y-3 text-sm mb-6">
              <ul className="list-disc ml-5 space-y-2 text-left">
                <li>{lang === 'zh-tw' ? '一次購買' : 'One-time purchase'}</li>
                <li><strong>{lang === 'zh-tw' ? '不自動續費' : 'No expiration'}</strong></li>
                <li><strong>{lang === 'zh-tw' ? '不限使用期限' : 'Use until credits run out'}</strong></li>
              </ul>
              <p className="text-xs text-blue-600 mt-3 pt-3 border-t border-blue-200">
                {lang === 'zh-tw' 
                  ? '字數用完即停，不會超額扣款'
                  : 'Usage stops when credits are exhausted, no overcharge'}
              </p>
              {lang === 'zh-tw' && (
                <div className="rounded-xl border border-emerald-200 bg-white/90 p-3 text-left shadow-sm">
                  <p className="font-black text-emerald-700">🎁 加贈店家商品展示頁</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    可建立公開商品頁、加入聯絡方式並下載 QR Code，讓客人掃碼直接查看。
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={(e) => startEcpayCheckout('pack99', e, lang, undefined, 'pricing')}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-black text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
            >
              {lang === 'zh-tw' ? '刷卡／Apple Pay 購買 99 方案' : 'Purchase NT$99 Plan'}
            </button>
            {lang === 'zh-tw' && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => navigate('/payment/bank-transfer?plan=99')}
                  className="w-full rounded-lg border-2 border-blue-600 bg-white px-4 py-3 font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md"
                >
                  銀行轉帳（人工核對）
                </button>
                <p className="mt-2 text-center text-xs leading-relaxed text-slate-600">
                  完成匯款並回報後，站方核對入帳，再加點並開通商品展示頁。
                </p>
              </div>
            )}
          </div>

          {/* NT$199 方案卡（target=plan199 時高亮） */}
          <div className={`min-w-0 shadow-md border-2 rounded-2xl p-6 bg-purple-50 hover:shadow-lg transition ${target === 'plan199' ? 'border-purple-500 ring-2 ring-purple-400 ring-offset-2' : 'border-purple-300'}`}>
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">💎</span>
              <h2 className="text-xl font-bold text-purple-900 mb-2">
                {/* ✅ 價格數字和幣別固定為 NT$199，僅文字說明會切換 */}
                NT${PLANS.pack199.price} {lang === 'zh-tw' ? '方案' : '/ One-time purchase'}
              </h2>
              <p className="text-2xl font-bold text-purple-900">
                {/* ✅ 字數固定，僅單位文字會切換 */}
                {getPlanChars('pack199').toLocaleString()} {lang === 'zh-tw' ? '點' : 'points'}
              </p>
              {/* 付款說明（英文版） */}
              {lang === 'en' && (
                <p className="text-xs text-purple-600 mt-2 italic">
                  Payment is processed in New Taiwan Dollar (TWD). Credit cards are accepted.
                </p>
              )}
            </div>
            
            <div className="text-purple-800 space-y-3 text-sm mb-6">
              <ul className="list-disc ml-5 space-y-2 text-left">
                <li>{lang === 'zh-tw' ? '一次購買' : 'One-time purchase'}</li>
                <li><strong>{lang === 'zh-tw' ? '不自動續費' : 'No expiration'}</strong></li>
                <li><strong>{lang === 'zh-tw' ? '不限使用期限' : 'Use until credits run out'}</strong></li>
              </ul>
              <p className="text-xs text-purple-600 mt-3 pt-3 border-t border-purple-200">
                {lang === 'zh-tw' 
                  ? '字數用完即停，不會超額扣款'
                  : 'Usage stops when credits are exhausted, no overcharge'}
              </p>
              {lang === 'zh-tw' && (
                <div className="rounded-xl border border-emerald-200 bg-white/90 p-3 text-left shadow-sm">
                  <p className="font-black text-emerald-700">🎁 加贈店家商品展示頁</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    可建立公開商品頁、加入聯絡方式並下載 QR Code，讓客人掃碼直接查看。
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={(e) => startEcpayCheckout('pack199', e, lang, undefined, 'pricing')}
              className="w-full rounded-lg bg-purple-600 px-4 py-3 font-black text-white shadow-md transition hover:bg-purple-700 hover:shadow-lg"
              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
            >
              {lang === 'zh-tw' ? '刷卡／Apple Pay 購買 199 方案' : 'Purchase NT$199 Plan'}
            </button>
            {lang === 'zh-tw' && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => navigate('/payment/bank-transfer?plan=199')}
                  className="w-full rounded-lg border-2 border-purple-600 bg-white px-4 py-3 font-black text-purple-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-purple-50 hover:shadow-md"
                >
                  銀行轉帳（人工核對）
                </button>
                <p className="mt-2 text-center text-xs leading-relaxed text-slate-600">
                  完成匯款並回報後，站方核對入帳，再加點並開通商品展示頁。
                </p>
              </div>
            )}
          </div>
          {/* NT$10 測試刷卡方案：只在管理員帳號或 localhost 顯示，正式使用者看不到 */}
          {isTestUser && (
            <div className="md:col-span-2 shadow-md border-2 border-slate-300 rounded-2xl p-6 bg-white hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 mb-3">
                    管理員測試
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    NT$10 測試方案
                  </h2>
                  <p className="text-2xl font-bold text-slate-900">
                    10 點
                  </p>
                  <p className="text-sm text-slate-600 mt-2">
                    僅供付款流程測試使用，不對一般使用者顯示。
                  </p>
                </div>

                <button
                  onClick={(e) => startEcpayCheckout('pack1', e, lang, undefined, 'pricing-test')}
                  className="w-full md:w-[220px] bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                  style={{ color: '#ffffff' }}
                  title="NT$10 測試方案（10 點）"
                >
                  刷卡測試 NT$10
                </button>
              </div>
            </div>
          )}
</div>

        {/* 促購提示區塊 */}
        {lang === 'zh-tw' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800 text-center">
            💡 最多人選擇的方案！每 <strong>萬點</strong> 不到 <strong>NT$10</strong>，幫你節省大量時間。
            <br />
            ✅ 系統自動加值點數，付款成功後即可立即使用。
          </div>
        )}

        {/* 字數計算方式說明 / Payment Information */}
        <div className="mt-8 shadow-md border rounded-2xl p-6 bg-blue-50">
          {lang === 'zh-tw' ? (
            <>
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                📌 點數扣除方式說明
              </h2>
              
              <div className="text-blue-800 space-y-3 text-sm">
                <p>
                  文字工具會依「實際輸入＋輸出文字字數」扣點；圖片生成工具則依選擇風格固定扣點。
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="font-medium mb-2 text-blue-900">範例說明：</p>
                  <ul className="list-disc ml-5 space-y-1 text-blue-700">
                    <li>輸入與輸出合計 2,500 字文章摘要 → 扣 2,500 點</li>
                    <li>圖片生成白底商品圖 → 扣 20,000 點</li>
                  </ul>
                </div>
                
                <p className="font-medium text-blue-900">
                  點數為一次性使用額度，不限使用期限，用完為止。
                </p>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                💳 Payment Information
              </h2>
              
              <div className="text-blue-800 space-y-3 text-sm">
                <p className="font-medium text-blue-900">
                  Payment is processed in New Taiwan Dollar (TWD). Credit cards are accepted.
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="font-medium mb-2 text-blue-900">Character Usage:</p>
                  <ul className="list-disc ml-5 space-y-1 text-blue-700">
                    <li>Text tools deduct points by character count; image tools deduct fixed points by style</li>
                    <li>Example: Product white-background image generation → Deducts 20,000 points</li>
                  </ul>
                </div>
                
                <p className="font-medium text-blue-900">
                  Points are one-time purchases with no expiration date. Usage stops when points are exhausted.
                </p>
              </div>
            </>
          )}
        </div>

        {/* 使用說明與返回按鈕 */}
        <div className="mt-8 text-center space-y-4">
          <div>
            <Link
              to="/help"
              className="inline-flex min-h-[52px] items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-base font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
            >
              <span className="!text-white" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
                {lang === 'zh-tw' ? '📖 使用說明' : '📖 Help'}
              </span>
            </Link>
          </div>
          <div>
            <button
              onClick={() => navigate('/tools/product-image-generator')}
              className="inline-block px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
            >
              {lang === 'zh-tw' ? '返回商品圖工具' : 'Back to Product Image Tool'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
