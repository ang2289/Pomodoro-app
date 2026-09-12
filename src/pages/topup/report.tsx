/*
⚠️ DEPRECATED（已棄用）
此頁面已由新版流程取代，請勿再使用或修改。
正式流程請見：
- 方案頁：/pricing
- 匯款頁：/payment/bank-transfer
- 匯款回報：/payment/report
- 後台管理：/admin/payments
*/

// 匯款回報頁面
// 使用者填寫金額、帳號後五碼，提交後等待管理者審核

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import PrimaryButton from '@/components/ui/PrimaryButton'

export default function TopupReportPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [amountNtd, setAmountNtd] = useState<string>('')
  const [accountLastFive, setAccountLastFive] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  // 計算對應的字數（根據方案）
  const calculateChars = (ntd: number): number => {
    if (ntd >= 199) {
      return 300000 // NT$199 方案：300,000 字
    } else if (ntd >= 99) {
      return 100000 // NT$99 方案：100,000 字
    }
    return 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // 驗證登入狀態
    if (!user) {
      setError('請先登入')
      navigate('/login')
      return
    }

    // 驗證輸入
    const ntd = parseInt(amountNtd, 10)
    if (!ntd || ntd < 99) {
      setError('金額至少需 NT$99')
      return
    }

    if (!accountLastFive || accountLastFive.length !== 5 || !/^\d{5}$/.test(accountLastFive)) {
      setError('請輸入正確的帳號後五碼（5 位數字）')
      return
    }

    const amountChars = calculateChars(ntd)
    if (amountChars === 0) {
      setError('金額不符合方案（NT$99 或 NT$199）')
      return
    }

    setLoading(true)

    try {
      // 插入 credit_topups 記錄
      const { error: insertError } = await supabase
        .from('credit_topups')
        .insert({
          user_id: user.id,
          amount_chars: amountChars,
          amount_ntd: ntd,
          account_last_five: accountLastFive,
          status: 'pending',
        })

      if (insertError) {
        console.error('❌ 提交匯款回報失敗：', insertError)
        setError(insertError.message || '提交失敗，請稍後再試')
        setLoading(false)
        return
      }

      // 成功
      setSuccess(true)
      setAmountNtd('')
      setAccountLastFive('')
      
      // 3 秒後導向首頁
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err: any) {
      console.error('❌ 提交匯款回報失敗：', err)
      setError(err.message || '提交失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  const ntd = parseInt(amountNtd, 10) || 0
  const calculatedChars = calculateChars(ntd)

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          匯款回報
        </h1>

        {success ? (
          <div className="text-center py-8">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <p className="text-lg font-semibold text-gray-900 mb-2">
              匯款回報已提交
            </p>
            <p className="text-sm text-gray-600 mb-4">
              我們會在收到匯款後盡快為您加點，請稍候。
            </p>
            <p className="text-xs text-gray-500">
              3 秒後自動返回首頁...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>匯款資訊：</strong>
              </p>
              <p className="text-sm text-blue-700">
                {/* TODO: 這裡應該顯示實際的匯款帳號 */}
                請匯款至：XXX-XXX-XXXXX
              </p>
              <p className="text-xs text-blue-600 mt-2">
                匯款完成後，請填寫下方表單回報，我們會在收到匯款後為您加點。
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="amountNtd" className="block text-sm font-medium text-gray-700 mb-1">
                  匯款金額（新台幣）
                </label>
                <select
                  id="amountNtd"
                  value={amountNtd}
                  onChange={(e) => setAmountNtd(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">請選擇金額</option>
                  <option value="99">NT$99（100,000 字）</option>
                  <option value="199">NT$199（300,000 字）</option>
                </select>
                {ntd > 0 && calculatedChars > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    將獲得 {calculatedChars.toLocaleString()} 字的使用額度
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="accountLastFive" className="block text-sm font-medium text-gray-700 mb-1">
                  匯款帳號後五碼
                </label>
                <input
                  id="accountLastFive"
                  type="text"
                  value={accountLastFive}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 5)
                    setAccountLastFive(value)
                  }}
                  disabled={loading}
                  required
                  placeholder="12345"
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  請輸入您匯款帳號的後五碼數字
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div className="pt-4">
                <PrimaryButton
                  type="submit"
                  disabled={loading || !amountNtd || !accountLastFive}
                  fullWidth
                >
                  {loading ? '提交中...' : '提交匯款回報'}
                </PrimaryButton>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate('/')}
                className="w-full text-sm text-gray-600 hover:text-gray-900"
              >
                ← 返回首頁
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

