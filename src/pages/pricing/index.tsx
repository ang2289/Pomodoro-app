import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import { buildSEO } from '../../lib/seo'
import { PLANS, getPlanChars, getPlanLabel, getAllPlans, type PlanId } from '../../lib/usagePlans'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { getCurrentUserId, isLoggedIn } from '../../lib/auth'
import PromoCountdown from '../../components/PromoCountdown'

const seo = buildSEO({
  title: '使用額度方案',
  description: '一次購買使用額度，依實際使用的文字量扣除，不限使用期限、不自動續費。',
  url: 'https://pomodoro-app-eight-rouge.vercel.app/pricing',
  image: '/seo/pricing.png',
})

// 綠界金流結帳函式（中英文共用同一套付款流程）
// ⚠️ 重要：此函式同時支援中文版和英文版，都導向 /api/ecpay/create-credit-order
async function startEcpayCheckout(
  planId: PlanId, 
  event?: React.MouseEvent<HTMLButtonElement>,
  lang: 'zh-tw' | 'en' = 'zh-tw', // 新增 lang 參數以正確顯示載入和錯誤訊息
  userId?: string // 從 session 取得的使用者 ID
) {
  try {
    // console.log('🛒 開始綠界金流結帳流程：', planId, lang)
    
    // 檢查登入狀態（使用 localStorage 的 userId）
    if (!userId) {
      userId = getCurrentUserId() || ''
    }
    
    if (!userId || !isLoggedIn()) {
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
    // 將 planId 轉換為 amount 和 points
    const response = await fetch('/api/ecpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: planId === 'pack99' ? 99 : 199,
          points: planId === 'pack99' ? 100000 : 300000,
          userId,
        }),
      })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || error.error || '建立訂單失敗')
    }

    const data = await response.json()
    
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
      button.textContent = originalText || (planId === 'pack99' 
        ? (lang === 'en' ? 'Purchase NT$99 Plan' : '購買 99 方案')
        : (lang === 'en' ? 'Purchase NT$199 Plan' : '購買 199 方案'))
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
  const [lang, setLang] = useState<'zh-tw' | 'en'>('zh-tw')
  const { user } = useAuth()
  const [isInTrial, setIsInTrial] = useState<boolean | null>(null) // null = 載入中

  // 檢查使用者是否在試用期間
  useEffect(() => {
    const checkTrialStatus = async () => {
      if (!user) {
        setIsInTrial(false)
        return
      }

      try {
        const { data, error } = await supabase.rpc('get_user_credits_info', {
          p_user_id: user.id,
        })

        if (error || !data) {
          setIsInTrial(false)
          return
        }

        // RPC 返回的是陣列，取第一筆
        const creditsInfo = Array.isArray(data) ? data[0] : data
        const trialExpiresAt = creditsInfo?.trial_expires_at

        // 檢查 trial_expires_at 是否尚未到期
        if (trialExpiresAt) {
          const expiresAt = new Date(trialExpiresAt).getTime()
          const now = new Date().getTime()
          setIsInTrial(expiresAt > now)
        } else {
          setIsInTrial(false)
        }
      } catch (err) {
        console.error('❌ 檢查試用狀態失敗:', err)
        setIsInTrial(false)
      }
    }

    checkTrialStatus()
  }, [user])

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
        {/* 限時活動倒數計時 */}
        <PromoCountdown />
        

        {/* 主要標題 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {lang === 'zh-tw' ? '使用額度方案（一次購買，用完為止）' : 'Usage Quota Plans (One-time Purchase, Use Until Exhausted)'}
          </h1>
        </div>

        {/* 綠界合規說明 */}
        <div className="mb-8 p-5 bg-red-50 border-2 border-red-200 rounded-lg">
          <h2 className="text-lg font-bold text-red-900 mb-4">
            {lang === 'zh-tw' ? '⚠️ 重要購買說明' : '⚠️ Important Purchase Information'}
          </h2>
          <ul className="list-disc ml-6 space-y-2 text-red-800 text-sm leading-relaxed">
            <li>
              {lang === 'zh-tw' 
                ? '本站提供 AI 數位服務，採使用額度制'
                : 'This site provides AI digital services using a usage quota system'}
            </li>
            <li>
              {lang === 'zh-tw' 
                ? '使用額度僅限本站使用，無使用期限'
                : 'Usage quota is only valid on this site and has no expiration date'}
            </li>
            <li>
              {lang === 'zh-tw' 
                ? '每次使用依輸入與輸出字數計算使用額度'
                : 'Each use calculates usage quota based on input and output character count'}
            </li>
            <li className="font-semibold">
              {lang === 'zh-tw' 
                ? '使用額度一經使用即視為服務完成，恕不退款'
                : 'Once usage quota is used, the service is considered completed and no refunds will be provided'}
            </li>
          </ul>
        </div>

        {/* 方案卡片區塊 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* 免費方案卡 */}
          <div className="shadow-md border rounded-2xl p-6 bg-white hover:shadow-lg transition">
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">🆓</span>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {lang === 'zh-tw' ? '免費體驗' : 'Free Trial'}
              </h2>
              <p className="text-2xl font-bold text-gray-900">
                {getPlanChars('free').toLocaleString()} {lang === 'zh-tw' ? '字' : 'chars'}
              </p>
            </div>
            
            <div className="text-gray-700 space-y-3 text-sm mb-6">
              <ul className="list-disc ml-5 space-y-2 text-left">
                <li>{lang === 'zh-tw' ? '不需信用卡' : 'No credit card required'}</li>
                <li>{lang === 'zh-tw' ? '不限使用期限' : 'No expiration date'}</li>
                <li>{lang === 'zh-tw' ? '摘要與作業解題共用' : 'Shared for summary and homework'}</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                {lang === 'zh-tw' 
                  ? '字數用完即停，不會超額扣款'
                  : 'Usage stops when credits are exhausted, no overcharge'}
              </p>
            </div>

            <button
              onClick={() => navigate('/summary')}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {lang === 'zh-tw' ? '立即使用' : 'Start Using'}
            </button>
            
            {/* 未登入使用者提示 */}
            {!user && (
              <p className="mt-3 text-xs text-center text-gray-600">
                {lang === 'zh-tw' ? '登入後即可啟用 10,000 字免費試用' : 'Log in to activate 10,000 characters free trial'}
              </p>
            )}
          </div>

          {/* NT$99 方案卡 */}
          <div className="shadow-md border-2 border-blue-300 rounded-2xl p-6 bg-blue-50 hover:shadow-lg transition">
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">💎</span>
              <h2 className="text-xl font-bold text-blue-900 mb-2">
                {/* ✅ 價格數字和幣別固定為 NT$99，僅文字說明會切換 */}
                NT${PLANS.pack99.price} {lang === 'zh-tw' ? '方案' : '/ One-time purchase'}
              </h2>
              <p className="text-2xl font-bold text-blue-900">
                {/* ✅ 字數固定，僅單位文字會切換 */}
                {getPlanChars('pack99').toLocaleString()} {lang === 'zh-tw' ? '字' : 'chars'}
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
            </div>

            <button
              onClick={(e) => startEcpayCheckout('pack99', e, lang)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {lang === 'zh-tw' ? '購買 99 方案' : 'Purchase NT$99 Plan'}
            </button>
          </div>

          {/* NT$199 方案卡 */}
          <div className="shadow-md border-2 border-purple-300 rounded-2xl p-6 bg-purple-50 hover:shadow-lg transition">
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">💎</span>
              <h2 className="text-xl font-bold text-purple-900 mb-2">
                {/* ✅ 價格數字和幣別固定為 NT$199，僅文字說明會切換 */}
                NT${PLANS.pack199.price} {lang === 'zh-tw' ? '方案' : '/ One-time purchase'}
              </h2>
              <p className="text-2xl font-bold text-purple-900">
                {/* ✅ 字數固定，僅單位文字會切換 */}
                {getPlanChars('pack199').toLocaleString()} {lang === 'zh-tw' ? '字' : 'chars'}
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
            </div>

            <button
              onClick={(e) => startEcpayCheckout('pack199', e, lang)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              {lang === 'zh-tw' ? '購買 199 方案' : 'Purchase NT$199 Plan'}
            </button>
          </div>
        </div>

        {/* 促購提示區塊 */}
        {lang === 'zh-tw' && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800 text-center">
            💡 最多人選擇的方案！每 <strong>萬字</strong> 不到 <strong>NT$1</strong>，幫你節省大量時間。
            <br />
            ✅ 系統自動加值點數，付款成功後即可立即使用。
          </div>
        )}

        {/* 字數計算方式說明 / Payment Information */}
        <div className="mt-8 shadow-md border rounded-2xl p-6 bg-blue-50">
          {lang === 'zh-tw' ? (
            <>
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                📌 字數計算方式說明
              </h2>
              
              <div className="text-blue-800 space-y-3 text-sm">
                <p>
                  每次使用時，系統會依「實際輸入的文字字數」計算使用額度。
                </p>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <p className="font-medium mb-2 text-blue-900">範例說明：</p>
                  <ul className="list-disc ml-5 space-y-1 text-blue-700">
                    <li>輸入 2,500 字文章摘要 → 扣 2,500 字</li>
                    <li>解題輸入 300 字題目 → 扣 300 字</li>
                  </ul>
                </div>
                
                <p className="font-medium text-blue-900">
                  字數為一次性使用額度，不限使用期限，用完為止。
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
                    <li>Characters are deducted based on actual input text length</li>
                    <li>Example: Summarizing a 2,500-character article → Deducts 2,500 characters</li>
                  </ul>
                </div>
                
                <p className="font-medium text-blue-900">
                  Credits are one-time purchases with no expiration date. Usage stops when credits are exhausted.
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
              className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              {lang === 'zh-tw' ? '📖 使用說明' : '📖 Help'}
            </Link>
          </div>
          <div>
            <button
              onClick={() => navigate('/summary')}
              className="inline-block px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition"
            >
              {lang === 'zh-tw' ? '返回摘要工具' : 'Back to Summary Tool'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

