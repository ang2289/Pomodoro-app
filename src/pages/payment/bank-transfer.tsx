import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PLANS } from '../../config'
import { getPlanChars } from '../../lib/usagePlans'
import PrimaryButton from '@/components/ui/PrimaryButton'
import DigitalProductBankTransfer from './DigitalProductBankTransfer'

const BANK_ACCOUNT = {
  bankName: '中華郵政',
  bankCode: '700',
  branchName: '基隆分行',
  accountName: '陳麗芳',
  accountNumber: '00110810137508',
}

export default function BankTransferPage() {
  const [searchParams] = useSearchParams()
  const productParam = searchParams.get('product')
  const planParam = searchParams.get('plan')
  const [showReminder, setShowReminder] = useState(false)

  if (productParam) {
    return <DigitalProductBankTransfer productCode={productParam} />
  }

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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('複製失敗：', err)
    }
  }

  useEffect(() => {
    if (!planParam || !['99', '199'].includes(planParam)) return

    const reminderShown = localStorage.getItem('payment_reminder_shown')
    if (reminderShown === 'true') return

    const visitKey = `payment_visit_${planParam}`
    const visitTimeStr = localStorage.getItem(visitKey)

    if (!visitTimeStr) {
      localStorage.setItem(visitKey, Date.now().toString())
      return
    }

    const visitTime = Number(visitTimeStr)
    if (!Number.isFinite(visitTime)) {
      localStorage.setItem(visitKey, Date.now().toString())
      return
    }

    const hoursPassed = (Date.now() - visitTime) / (1000 * 60 * 60)
    if (hoursPassed >= 48) setShowReminder(true)
  }, [planParam])

  useEffect(() => {
    if (!planParam || !['99', '199'].includes(planParam)) return

    const visitKey = `payment_visit_${planParam}`
    const existingTime = Number(localStorage.getItem(visitKey))
    if (!existingTime || (Date.now() - existingTime) / (1000 * 60 * 60) >= 48) {
      localStorage.setItem(visitKey, Date.now().toString())
    }
  }, [planParam])

  const bankRows = [
    ['銀行名稱', BANK_ACCOUNT.bankName],
    ['銀行代碼', BANK_ACCOUNT.bankCode],
    ['分行', BANK_ACCOUNT.branchName],
    ['戶名', BANK_ACCOUNT.accountName],
    ['匯款帳號', BANK_ACCOUNT.accountNumber],
  ] as const

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {showReminder && (
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg mb-6">
            <p className="text-sm text-amber-800 mb-3">
              如果已完成匯款，請記得填寫回報表單，我們才能核對並完成加點。
            </p>
            <Link
              to={`/payment/report?plan=${planValue}`}
              onClick={() => localStorage.setItem('payment_reminder_shown', 'true')}
            >
              <PrimaryButton fullWidth={false} className="bg-amber-600 hover:bg-amber-700 text-white">
                前往填寫匯款回報
              </PrimaryButton>
            </Link>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800 text-center leading-7">
            <span className="font-medium">流程說明：</span>
            ① 選擇方案　② 完成匯款　③ 填寫後五碼回報　④ 人工核對後完成加點
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {planName} NT${planPrice} / {planChars.toLocaleString()} 字
          </h1>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">匯款帳戶</h2>
          <p className="text-xs text-gray-500 mb-4">點選可複製，匯款金額請使用本次方案金額。</p>
          <div className="space-y-3">
            {bankRows.map(([label, value]) => (
              <div key={label} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">{label}</p>
                  <p className="font-semibold text-gray-900 break-all">{value}</p>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(value)}
                  className="shrink-0 border border-emerald-300 text-emerald-700 rounded-lg px-3 py-2 text-sm font-medium hover:bg-emerald-50"
                >
                  複製
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-bold text-amber-900 mb-3">匯款前請確認</h2>
          <ul className="space-y-2 text-amber-900 text-sm">
            <li>• 匯款金額：NT${planPrice}</li>
            <li>• 完成匯款後，請填寫匯出帳號後五碼。</li>
            <li>• 以實際銀行入帳為準，核對前不會加點。</li>
          </ul>
        </div>

        <Link to={`/payment/report?plan=${planValue}`}>
          <PrimaryButton fullWidth className="max-w-md mx-auto">
            我已完成匯款，送出回報
          </PrimaryButton>
        </Link>
      </div>
    </div>
  )
}
