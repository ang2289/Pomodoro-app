import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '@/components/SEO'

type PointTransfer = {
  id: string
  planId: string
  amountNtd: number
  status: string
  transferredAt?: string | null
  createdAt?: string | null
}

type PaidProductOrder = {
  orderNo: string
  amountNtd: number
  points: number
  status: string
  createdAt?: string | null
}

type BusinessCardOrder = {
  id: string
  orderCode: string
  templateTitle?: string | null
  totalAmountNtd: number
  status: string
  createdAt?: string | null
  updatedAt?: string | null
}

type Storefront = {
  id: string
  slug: string
  displayName: string
  pageMode: string
  status: string
  isPublic: boolean
  expiresAt?: string | null
}

type ServiceAction = {
  key: string
  title: string
  description: string
  href: string
  tone: string
}

type CustomerServiceStatus = {
  pointTransfers: PointTransfer[]
  paidProductImageOrders: PaidProductOrder[]
  businessCardOrders: BusinessCardOrder[]
  productImageGenerations: Array<{ id: string; pointsUsed: number; createdAt?: string | null }>
  storefront?: Storefront | null
  entitlement?: { planCode: string; maxItems: number; expiresAt?: string | null } | null
  nextActions?: ServiceAction[]
  generationHistoryReady: boolean
}

function token() {
  if (typeof window === 'undefined') return ''
  return String(localStorage.getItem('auth_token') || localStorage.getItem('token') || '').trim()
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function pointStatusLabel(status: string) {
  const map: Record<string, string> = {
    pending: '已回報匯款，等待核對',
    reported: '已回報匯款，等待核對',
    approved: '已確認入帳',
    verified: '已確認入帳',
    rejected: '匯款資料需重新確認',
  }
  return map[String(status || '').toLowerCase()] || status || '處理中'
}

function businessStatusLabel(status: string) {
  const map: Record<string, string> = {
    submitted: '已送出需求',
    reviewing: '資料確認中',
    awaiting_payment: '等待匯款',
    payment_reported: '已回填匯款，等待核對',
    payment_verified: '已確認入帳，準備排版',
    designing: '排版中',
    preview_ready: '預覽稿已完成',
    awaiting_customer_confirmation: '等待確認預覽',
    revision_requested: '等待修改',
    printing: '已送印',
    shipped: '已寄出',
    completed: '已完成',
    cancelled: '已取消',
  }
  return map[String(status || '').toLowerCase()] || status || '處理中'
}

function statusClass(status: string) {
  const value = String(status || '').toLowerCase()
  if (['approved', 'verified', 'success', 'paid', 'payment_verified', 'printing', 'shipped', 'completed'].includes(value)) {
    return 'bg-emerald-100 text-emerald-800'
  }
  if (['pending', 'reported', 'awaiting_payment', 'payment_reported', 'preview_ready', 'awaiting_customer_confirmation'].includes(value)) {
    return 'bg-amber-100 text-amber-900'
  }
  if (['rejected', 'cancelled'].includes(value)) return 'bg-rose-100 text-rose-800'
  return 'bg-cyan-100 text-cyan-800'
}

function CardRow({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">{children}</div>
}

export default function MyServicesPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<CustomerServiceStatus | null>(null)

  const load = async () => {
    const auth = token()
    if (!auth) {
      navigate('/login?returnTo=%2Fmy-services')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/main?action=get-my-customer-service-status', {
        headers: { Authorization: `Bearer ${auth}` },
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(String(result?.error || '讀取服務與訂單紀錄失敗。'))
      setData({
        pointTransfers: Array.isArray(result?.pointTransfers) ? result.pointTransfers : [],
        paidProductImageOrders: Array.isArray(result?.paidProductImageOrders) ? result.paidProductImageOrders : [],
        businessCardOrders: Array.isArray(result?.businessCardOrders) ? result.businessCardOrders : [],
        productImageGenerations: Array.isArray(result?.productImageGenerations) ? result.productImageGenerations : [],
        storefront: result?.storefront || null,
        entitlement: result?.entitlement || null,
        nextActions: Array.isArray(result?.nextActions) ? result.nextActions : [],
        generationHistoryReady: result?.generationHistoryReady !== false,
      })
    } catch (err: any) {
      setError(err?.message || '讀取服務與訂單紀錄失敗。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [navigate])

  const totalPointsUsed = useMemo(
    () => (data?.productImageGenerations || []).reduce((sum, row) => sum + Math.max(0, Number(row.pointsUsed || 0)), 0),
    [data],
  )

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <SEO title="我的服務與訂單｜RXV 夢想創作工作室" description="查看個人／公司介紹頁、商品圖方案、名片訂單與商品圖生成紀錄。" />
      <div className="mx-auto max-w-6xl">
        <header className="rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-800">登入帳號專用</span>
              <h1 className="mt-3 text-3xl font-black text-slate-950">我的服務與訂單</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-700">這裡保留你的商品圖方案、匯款回報、名片訂單、個人／公司介紹頁與已生成商品圖紀錄。</p>
            </div>
            <button type="button" onClick={() => void load()} className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
              重新整理
            </button>
          </div>
        </header>

        {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-800">{error}</div> : null}
        {loading ? <div className="mt-6 rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">正在讀取服務與訂單紀錄…</div> : null}

        {!loading && data ? (
          <div className="mt-6 space-y-6">
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black text-slate-950">個人／公司介紹頁</h2>
                {data.storefront ? <Link to="/settings/storefront" className="text-sm font-black text-emerald-700 hover:underline">前往設定 →</Link> : null}
              </div>
              {data.storefront ? (
                <CardRow>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-slate-950">{data.storefront.displayName || '個人／公司介紹頁'}</p>
                      <p className="mt-1 text-sm text-slate-600">專屬網址：/shop/{data.storefront.slug}</p>
                      <p className="mt-1 text-sm text-slate-600">使用期限至：{formatDate(data.storefront.expiresAt)}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1.5 text-sm font-black ${data.storefront.isPublic ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                      {data.storefront.isPublic ? '已公開' : '待設定／未公開'}
                    </span>
                  </div>
                  {!data.storefront.isPublic ? <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold leading-relaxed text-amber-900">請補齊 Logo、介紹與聯絡方式，儲存後勾選公開，網址與 QR Code 才能分享給客戶。</p> : null}
                </CardRow>
              ) : (
                <CardRow>
                  <p className="font-black text-slate-900">目前尚未開通個人／公司介紹頁</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">名片贈送方案或商品圖方案開通後，會在這裡顯示同一個專屬網址。</p>
                </CardRow>
              )}
            </section>

            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black text-slate-950">商品圖方案與匯款紀錄</h2>
                <Link to="/my-product-images" className="text-sm font-black text-cyan-700 hover:underline">查看已生成商品圖 →</Link>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <CardRow>
                  <h3 className="font-black text-slate-950">銀行匯款回報</h3>
                  {data.pointTransfers.length ? <div className="mt-3 space-y-2">{data.pointTransfers.map((row) => <div key={row.id} className="rounded-xl bg-slate-50 px-3 py-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-black text-slate-900">方案 NT${Number(row.amountNtd || 0).toLocaleString()}</p><span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusClass(row.status)}`}>{pointStatusLabel(row.status)}</span></div><p className="mt-1 text-sm text-slate-600">匯款日期：{formatDate(row.transferredAt)}・回報：{formatDate(row.createdAt)}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-600">目前沒有商品圖銀行匯款回報。</p>}
                </CardRow>
                <CardRow>
                  <h3 className="font-black text-slate-950">已完成商品圖方案</h3>
                  {data.paidProductImageOrders.length ? <div className="mt-3 space-y-2">{data.paidProductImageOrders.map((row) => <div key={row.orderNo || `${row.createdAt}-${row.amountNtd}`} className="rounded-xl bg-slate-50 px-3 py-3"><p className="font-black text-slate-900">NT${Number(row.amountNtd || 0).toLocaleString()}・{Number(row.points || 0).toLocaleString()} 點</p><p className="mt-1 text-sm text-slate-600">訂單：{row.orderNo || '—'}・{formatDate(row.createdAt)}</p></div>)}</div> : <p className="mt-3 text-sm text-slate-600">目前沒有已完成商品圖方案。</p>}
                </CardRow>
              </div>
            </section>

            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black text-slate-950">名片訂單紀錄</h2>
                <Link to="/tools/business-card-order" className="text-sm font-black text-violet-700 hover:underline">新增名片需求 →</Link>
              </div>
              {data.businessCardOrders.length ? <div className="grid gap-3 md:grid-cols-2">{data.businessCardOrders.map((row) => <Link key={row.id} to={`/my-business-card-orders?orderId=${encodeURIComponent(row.id)}`} className="rounded-2xl border border-violet-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50"><div className="flex flex-wrap items-center justify-between gap-2"><p className="font-mono font-black text-slate-950">{row.orderCode}</p><span className={`rounded-full px-2.5 py-1 text-xs font-black ${statusClass(row.status)}`}>{businessStatusLabel(row.status)}</span></div><p className="mt-2 font-bold text-slate-900">{row.templateTitle || '人工名片'}</p><p className="mt-1 text-sm text-slate-600">NT${Number(row.totalAmountNtd || 0).toLocaleString()}・最後更新 {formatDate(row.updatedAt || row.createdAt)}</p></Link>)}</div> : <CardRow><p className="text-sm text-slate-600">目前沒有名片訂單。</p></CardRow>}
            </section>

            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-black text-slate-950">已生成商品圖</h2>
                <Link to="/my-product-images" className="text-sm font-black text-cyan-700 hover:underline">查看全部與下載 →</Link>
              </div>
              <CardRow>
                {data.generationHistoryReady ? <><p className="text-lg font-black text-slate-950">已保留 {data.productImageGenerations.length} 筆商品圖紀錄</p><p className="mt-1 text-sm text-slate-600">目前列出的紀錄合計已使用 {totalPointsUsed.toLocaleString()} 點。原圖與結果圖請到「我的商品圖紀錄」查看。</p></> : <p className="text-sm font-bold text-amber-800">商品圖紀錄資料表尚未建立或尚未完成同步，請稍後再試。</p>}
              </CardRow>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  )
}
