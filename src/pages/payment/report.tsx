import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import PrimaryButton from '@/components/ui/PrimaryButton'
import { PLANS } from '../../config'
import { getPlanChars } from '../../lib/usagePlans'
import DigitalProductReport from './DigitalProductReport'

export default function PaymentReportPage() {
  const [searchParams] = useSearchParams()
  const productParam = searchParams.get('product')
  const planParam = searchParams.get('plan')
  const [email, setEmail] = useState('')
  const [amountNtd, setAmountNtd] = useState<string>('')
  const [accountLastFive, setAccountLastFive] = useState<string>('')
  const [note, setNote] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState(false)

  if (productParam) {
    return <DigitalProductReport productCode={productParam} />
  }

  let planName = ''
  let planPrice = 0
  let planChars = 0
  let planId = ''

  if (planParam === '99') {
    planName = '標準方案'
    planPrice = PLANS.plan99.price
    planChars = getPlanChars('pack99')
    planId = '99'
  } else if (planParam === '199') {
    planName = '進階方案'
    planPrice = PLANS.plan199.price
    planChars = getPlanChars('pack199')
    planId = '199'
  } else {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('請輸入有效的 Email')
      return
    }

    const ntd = parseInt(amountNtd, 10)
    if (!ntd || ntd <= 0) {
      setError('請輸入有效的匯款金額')
      return
    }

    if (!accountLastFive || accountLastFive.length !== 5 || !/^\d{5}$/.test(accountLastFive)) {
      setError('請輸入正確的帳號後五碼（5 位數字）')
      return
    }

    setLoading(true)

    try {
      const { error: insertError } = await supabase
        .from('payment_reports')
        .insert({
          email: email.trim(),
          amount_ntd: ntd,
          account_last_five: accountLastFive,
          plan_id: planId,
          status: 'pending',
          processed: false,
          note: note.trim() || null,
        })

      if (insertError) {
        console.error('提交匯款回報失敗：', insertError)
        setError(insertError.message || '提交失敗，請稍後再試')
        return
      }

      setSuccess(true)
      setEmail('')
      setAmountNtd('')
      setAccountLastFive('')
      setNote('')
      localStorage.removeItem('payment_reminder_shown')
      if (planId === '99' || planId === '199') {
        localStorage.removeItem(`payment_visit_${planId}`)
      }
    } catch (err: any) {
      console.error('提交匯款回報失敗：', err)
      setError(err.message || '提交失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">匯款回報</h1>
          <p className="text-center text-gray-600">
            {planName} NT${planPrice} / {planChars.toLocaleString()} 字
          </p>
        </div>

        {success ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">已收到你的匯款回報</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">我們會在確認後為你補充點數</p>
            <Link to="/">
              <PrimaryButton fullWidth>返回首頁</PrimaryButton>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="amountNtd" className="block text-sm font-medium text-gray-700 mb-1">
                匯款金額 <span className="text-red-500">*</span>
              </label>
              <input
                id="amountNtd"
                type="number"
                value={amountNtd}
                onChange={(e) => setAmountNtd(e.target.value)}
                disabled={loading}
                required
                min="1"
                placeholder={String(planPrice)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="accountLastFive" className="block text-sm font-medium text-gray-700 mb-1">
                匯款帳號後五碼 <span className="text-red-500">*</span>
              </label>
              <input
                id="accountLastFive"
                type="text"
                value={accountLastFive}
                onChange={(e) => setAccountLastFive(e.target.value.replace(/\D/g, '').slice(0, 5))}
                disabled={loading}
                required
                placeholder="12345"
                maxLength={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">購買方案</label>
              <input
                id="plan"
                type="text"
                value={`${planName} NT$${planPrice} / ${planChars.toLocaleString()} 點`}
                disabled
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">備註（選填）</label>
              <textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={loading}
                placeholder="如有其他需要說明的事項，請在此填寫"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="pt-4">
              <PrimaryButton
                type="submit"
                disabled={loading || !email || !amountNtd || !accountLastFive}
                fullWidth
              >
                {loading ? '提交中...' : '提交匯款回報'}
              </PrimaryButton>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
