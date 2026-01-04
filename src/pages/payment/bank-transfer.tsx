// 匯款資訊頁面
// 根據 URL 參數 plan 顯示對應的方案資訊

import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { PLANS } from '../../config'
import { getPlanChars } from '../../lib/usagePlans'
import PrimaryButton from '@/components/ui/PrimaryButton'
import { supabase } from '@/lib/supabase'
// ⚠️ 已移除 useAuth

export default function BankTransferPage() {
  const [searchParams] = useSearchParams()
  const planParam = searchParams.get('plan')
  const [showReminder, setShowReminder] = useState(false)

  // 根據 URL 參數決定方案
  let planName = ''
  let planPrice = 0
  let planChars = 0
  let planValue = ''

  if (planParam === '99') {
    planName = '標準方案'
    planPrice = PLANS.plan99.price
    planChars = getPlanChars('pack99')
    planValue = '99'
  } else if (planParam === '199') {
    planName = '進階方案'
    planPrice = PLANS.plan199.price
    planChars = getPlanChars('pack199')
    planValue = '199'
  } else {
    // 如果沒有有效的 plan 參數，導向 pricing 頁面
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-700 mb-4">無效的方案參數</p>
          <Link to="/pricing">
            <PrimaryButton>返回方案選擇</PrimaryButton>
          </Link>
        </div>
      </div>
    )
  }

  // 複製到剪貼簿的函數
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // 可以選擇顯示一個簡短的提示，但用戶要求不需要動畫
    } catch (err) {
      console.error('複製失敗：', err)
    }
  }

  // 48 小時未回報提醒機制
  useEffect(() => {
    const checkReminder = async () => {
      // 如果沒有有效的 plan 參數，不檢查
      if (!planParam || (planParam !== '99' && planParam !== '199')) {
        return
      }

      // 檢查是否已經顯示過提醒
      const reminderShown = localStorage.getItem('payment_reminder_shown')
      if (reminderShown === 'true') {
        return
      }

      // 檢查是否有選擇方案的記錄
      const visitKey = `payment_visit_${planParam}`
      const visitTimeStr = localStorage.getItem(visitKey)
      
      if (!visitTimeStr) {
        // 首次訪問，記錄時間戳
        localStorage.setItem(visitKey, Date.now().toString())
        return
      }

      // 檢查是否超過 48 小時（48 * 60 * 60 * 1000 毫秒）
      const visitTime = parseInt(visitTimeStr, 10)
      const now = Date.now()
      const hoursPassed = (now - visitTime) / (1000 * 60 * 60)

      if (hoursPassed >= 48) {
        // ⚠️ 已移除回報記錄檢查邏輯
        let hasReport = false

        // 如果沒有回報記錄，顯示提醒
        if (!hasReport) {
          setShowReminder(true)
        }
      }
    }

    checkReminder()
  }, [planParam, user])

  // 記錄使用者訪問此頁面（選擇方案）
  useEffect(() => {
    if (planParam && (planParam === '99' || planParam === '199')) {
      const visitKey = `payment_visit_${planParam}`
      const existingTime = localStorage.getItem(visitKey)
      
      // 如果沒有記錄，或記錄超過 48 小時，更新為當前時間
      if (!existingTime) {
        localStorage.setItem(visitKey, Date.now().toString())
      } else {
        const visitTime = parseInt(existingTime, 10)
        const hoursPassed = (Date.now() - visitTime) / (1000 * 60 * 60)
        // 如果超過 48 小時，重新記錄（表示使用者可能重新考慮）
        if (hoursPassed >= 48) {
          localStorage.setItem(visitKey, Date.now().toString())
        }
      }
    }
  }, [planParam])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 48 小時未回報提醒 */}
        {showReminder && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-amber-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-amber-800 mb-3">
                  提醒你，如果已完成匯款，記得填寫回報表單，我們才能為你完成加點。
                </p>
                <Link to={`/payment/report?plan=${planValue}`} onClick={() => {
                  // 點擊後標記為已顯示，避免重複提醒
                  localStorage.setItem('payment_reminder_shown', 'true')
                }}>
                  <PrimaryButton 
                    fullWidth={false}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    前往填寫匯款回報
                  </PrimaryButton>
                </Link>
                <p className="text-xs text-amber-700 mt-2">
                  填寫回報後，通常會在 24 小時內完成加點
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 流程安心提示 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 text-center">
            <span className="font-medium">流程說明：</span>
            <span className="ml-2">1️⃣ 選擇方案</span>
            <span className="mx-2">2️⃣ 完成匯款</span>
            <span className="mx-2">3️⃣ 填寫回報</span>
            <span className="mx-2">4️⃣ 24 小時內完成加點</span>
          </p>
        </div>

        {/* 方案資訊 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            {planName} NT${planPrice} / {planChars.toLocaleString()} 字
          </h1>
        </div>

        {/* 匯款資訊區塊 */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            匯款資訊
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            點擊可複製，避免輸入錯誤
          </p>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="text-gray-700 font-medium w-24">銀行：</span>
              <span 
                className="text-gray-900 flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => copyToClipboard('玉山銀行')}
                title="點擊複製"
              >
                玉山銀行
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-700 font-medium w-24">銀行代號：</span>
              <span 
                className="text-gray-900 flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => copyToClipboard('808')}
                title="點擊複製"
              >
                808
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-700 font-medium w-24">銀行分行：</span>
              <span 
                className="text-gray-900 flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => copyToClipboard('基隆分行')}
                title="點擊複製"
              >
                基隆分行
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-700 font-medium w-24">帳號：</span>
              <span 
                className="text-gray-900 flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => copyToClipboard('0783979283619')}
                title="點擊複製"
              >
                0783979283619
              </span>
            </div>
            <div className="flex items-start">
              <span className="text-gray-700 font-medium w-24">戶名：</span>
              <span 
                className="text-gray-900 flex-1 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={() => copyToClipboard('林雨晴')}
                title="點擊複製"
              >
                林雨晴
              </span>
            </div>
          </div>
        </div>

        {/* 匯款說明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-blue-900 mb-3">
            匯款說明
          </h2>
          <ul className="space-y-2 text-blue-800 mb-3">
            <li>• 請於匯款備註填寫「註冊 Email」</li>
            <li>• 匯款完成後 24 小時內人工加點</li>
          </ul>
          <p className="text-sm text-blue-700 font-medium mt-4 pt-3 border-t border-blue-300">
            請務必使用「註冊 Email」進行回報，避免無法對帳
          </p>
        </div>

        {/* 按鈕 */}
        <div className="text-center">
          {/* 信心文案 */}
          <p className="text-sm text-gray-600 mb-4">
            填寫回報後，系統會為你人工確認並加點
          </p>
          
          <Link to={`/payment/report?plan=${planValue}`}>
            <PrimaryButton fullWidth className="max-w-md mx-auto">
              我已完成匯款，送出回報
            </PrimaryButton>
          </Link>
          
          {/* 安心感補充文案 */}
          <p className="mt-4 text-xs text-gray-500 text-center">
            匯款後 24 小時內完成加點，通常更快
          </p>
        </div>
      </div>
    </div>
  )
}

