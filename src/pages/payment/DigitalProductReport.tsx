import { useState } from 'react'
import { Link } from 'react-router-dom'
import PrimaryButton from '@/components/ui/PrimaryButton'
import { supabase } from '@/lib/supabase'
import { getDigitalProduct } from '@/lib/digitalProducts'

interface Props {
  productCode: string
}

export default function DigitalProductReport({ productCode }: Props) {
  const product = getDigitalProduct(productCode)
  const [email, setEmail] = useState('')
  const [accountLastFive, setAccountLastFive] = useState('')
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-700 mb-4">無效的數位商品</p>
          <Link to="/images">
            <PrimaryButton>返回圖片素材</PrimaryButton>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('請輸入有效的 Email')
      return
    }

    if (!/^\d{5}$/.test(accountLastFive)) {
      setError('請輸入匯出帳號後五碼（5 位數字）')
      return
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(transferDate)) {
      setError('請選擇匯款日期')
      return
    }

    setLoading(true)

    try {
      const { error: insertError } = await supabase
        .from('digital_product_orders')
        .insert({
          product_code: product.code,
          email: normalizedEmail,
          amount_ntd: product.priceNtd,
          account_last_five: accountLastFive,
          transfer_date: transferDate,
          status: 'pending',
          note: note.trim() || null,
        })

      if (insertError) {
        console.error('數位商品匯款回報失敗', insertError)
        setError(insertError.message || '送出失敗，請稍後再試')
        return
      }

      setSuccess(true)
    } catch (submitError: any) {
      console.error('數位商品匯款回報失敗', submitError)
      setError(submitError?.message || '送出失敗，請稍後再試')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-5xl text-emerald-600 mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">已收到匯款回報</h1>
          <p className="text-gray-600 leading-relaxed mb-3">
            我們會依照你填寫的後五碼、匯款日期與金額 NT${product.priceNtd} 核對入帳。
          </p>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            核對完成後，管理端會產生專屬 ZIP 下載連結；連結有效 {product.downloadDays} 天，最多下載 {product.downloadLimit} 次。
          </p>
          <Link to="/images">
            <PrimaryButton fullWidth>返回圖片素材</PrimaryButton>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">匯款回報</h1>
          <p className="text-center text-gray-600">{product.shortName}</p>
          <p className="text-center text-xl font-bold text-gray-900 mt-2">NT${product.priceNtd}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <div>
            <label htmlFor="product-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="product-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="your@email.com"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="mt-1 text-xs text-gray-500">請填可聯絡到你的 Email，方便核對訂單。</p>
          </div>

          <div>
            <label htmlFor="product-last-five" className="block text-sm font-medium text-gray-700 mb-1">
              匯出帳號後五碼 <span className="text-red-500">*</span>
            </label>
            <input
              id="product-last-five"
              type="text"
              inputMode="numeric"
              value={accountLastFive}
              onChange={(e) => setAccountLastFive(e.target.value.replace(/\D/g, '').slice(0, 5))}
              required
              disabled={loading}
              maxLength={5}
              placeholder="12345"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
            />
          </div>

          <div>
            <label htmlFor="product-transfer-date" className="block text-sm font-medium text-gray-700 mb-1">
              匯款日期 <span className="text-red-500">*</span>
            </label>
            <input
              id="product-transfer-date"
              type="date"
              value={transferDate}
              onChange={(e) => setTransferDate(e.target.value)}
              required
              disabled={loading}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">匯款金額</label>
            <input
              type="text"
              value={`NT$${product.priceNtd}`}
              readOnly
              disabled
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 font-semibold"
            />
          </div>

          <div>
            <label htmlFor="product-note" className="block text-sm font-medium text-gray-700 mb-1">備註（選填）</label>
            <textarea
              id="product-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={loading}
              rows={3}
              maxLength={500}
              placeholder="例如：匯款人姓名或其他需要協助核對的資訊"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
          )}

          <PrimaryButton
            type="submit"
            fullWidth
            disabled={loading || !email || accountLastFive.length !== 5 || !transferDate}
          >
            {loading ? '送出中...' : '提交匯款回報'}
          </PrimaryButton>
        </form>
      </div>
    </div>
  )
}
