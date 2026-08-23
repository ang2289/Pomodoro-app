import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import SEO from '@/components/SEO'

type OrderSummary = {
  id: string
  orderCode: string
  serviceType: string
  printSide: string
  finishType: string
  quantityCards: number
  boxCount: number
  templateTitle?: string | null
  itemAmountNtd: number
  shippingFeeNtd: number
  totalAmountNtd: number
  status: string
  revisionCount: number
  createdAt?: string | null
  updatedAt?: string | null
}

type Detail = {
  order: OrderSummary & {
    previewNote?: string | null
    digitalCardOptIn?: boolean
    shippingCarrier?: string | null
    trackingNumber?: string | null
    customerConfirmedAt?: string | null
    paymentVerifiedAt?: string | null
    shippedAt?: string | null
  }
  files: Array<{
    id: string
    fileRole: string
    originalFileName: string
    contentType: string
    sizeBytes: number
    signedUrl: string
    uploadedByRole: string
    createdAt?: string | null
  }>
  events: Array<{
    id: string
    actorRole: string
    eventType: string
    fromStatus?: string | null
    toStatus?: string | null
    message: string
    createdAt?: string | null
  }>
  paymentReports: Array<{
    id: string
    payerName: string
    amountNtd: number
    accountLastFive: string
    transferredAt?: string | null
    status: string
    reviewNote?: string | null
    reviewedAt?: string | null
  }>
  digitalProfile?: {
    slug: string
    displayName: string
    status: string
    expiresAt?: string | null
    publicPath: string
  } | null
}

type BankInfo = {
  amountNtd: number
  orderCode: string
  bank: { name: string; code: string; branch?: string; account: string; accountName: string }
}

const MAX_FILE_BYTES = 3 * 1024 * 1024

function getToken() {
  if (typeof window === 'undefined') return ''
  return String(window.localStorage.getItem('auth_token') || window.localStorage.getItem('token') || '').trim()
}

async function api<T>(action: string, method: 'GET' | 'POST' = 'GET', body?: unknown, query?: Record<string, string>) {
  const token = getToken()
  if (!token) throw new Error('請先登入。')
  const params = new URLSearchParams({ action, ...(query || {}) })
  const response = await fetch(`/api/main?${params.toString()}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(String(data?.error || '操作失敗，請稍後再試。'))
  return data as T
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function formatSize(value: number) {
  if (!value) return '—'
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / (1024 * 1024)).toFixed(1)} MB`
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    submitted: '等待匯款', reviewing: '資料確認中', designing: '排版中', preview_ready: '預覽稿已完成',
    revision_requested: '等待修改', awaiting_customer_confirmation: '等待確認預覽', awaiting_payment: '等待匯款',
    payment_reported: '已回填匯款，等待核對', payment_verified: '已確認入帳', printing: '已送印',
    shipped: '已寄出', completed: '已完成', cancelled: '已取消',
  }
  return map[status] || status || '處理中'
}

function statusStyle(status: string) {
  if (['payment_verified', 'printing', 'shipped', 'completed'].includes(status)) return 'bg-emerald-100 text-emerald-800'
  if (['submitted', 'awaiting_customer_confirmation', 'awaiting_payment', 'payment_reported', 'preview_ready'].includes(status)) return 'bg-amber-100 text-amber-900'
  if (status === 'cancelled') return 'bg-slate-200 text-slate-700'
  return 'bg-cyan-100 text-cyan-800'
}

function sideLabel(value: string) { return value === 'double' ? '雙面名片' : '單面名片' }
function finishLabel(value: string) { return value === 'matte' ? '雙面霧膜' : '水晶亮膜' }
function serviceLabel(value: string) { return value === 'print' ? '自備完稿代印' : '人工排版＋代印' }

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('讀取付款證明失敗。'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(file)
  })
}

export default function MyBusinessCardOrdersPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedOrderId = searchParams.get('orderId') || ''
  const createdFromOrderPage = searchParams.get('created') === '1'
  const createdNoticeShown = useRef(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [detail, setDetail] = useState<Detail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [revisionText, setRevisionText] = useState('')
  const [showRevision, setShowRevision] = useState(false)
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [bankLoading, setBankLoading] = useState(false)
  const [payerName, setPayerName] = useState('')
  const [accountLastFive, setAccountLastFive] = useState('')
  const [transferDate, setTransferDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [paymentNote, setPaymentNote] = useState('')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedId) || null, [orders, selectedId])
  const pendingPaymentOrder = useMemo(() => orders.find((order) => ['submitted', 'awaiting_payment'].includes(order.status)) || null, [orders])

  const loadOrders = async (preferId?: string) => {
    setLoading(true)
    setError('')
    try {
      const data = await api<{ orders: OrderSummary[] }>('get-my-business-card-orders')
      const rows = Array.isArray(data.orders) ? data.orders : []
      setOrders(rows)
      const nextId = preferId || requestedOrderId || selectedId || rows[0]?.id || ''
      setSelectedId(nextId)
      if (!nextId) setDetail(null)
    } catch (err: any) {
      setError(err?.message || '讀取名片訂單失敗。')
    } finally {
      setLoading(false)
    }
  }

  const loadDetail = async (orderId: string) => {
    if (!orderId) return
    setDetailLoading(true)
    setError('')
    try {
      const data = await api<Detail>('get-my-business-card-order-detail', 'GET', undefined, { orderId })
      setDetail(data)
      setPayerName((current) => current || '')
      if (['submitted', 'awaiting_payment', 'payment_reported'].includes(data.order.status)) {
        setBankLoading(true)
        try {
          const bank = await api<BankInfo>('get-business-card-bank-transfer-info', 'GET', undefined, { orderId })
          setBankInfo(bank)
        } catch (bankError: any) {
          setBankInfo(null)
          if (['submitted', 'awaiting_payment'].includes(data.order.status)) setError(bankError?.message || '讀取匯款資訊失敗。')
        } finally {
          setBankLoading(false)
        }
      } else {
        setBankInfo(null)
      }
    } catch (err: any) {
      setDetail(null)
      setError(err?.message || '讀取名片訂單詳細資料失敗。')
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    if (!getToken()) {
      navigate(`/login?returnTo=${encodeURIComponent('/my-business-card-orders')}`)
      return
    }
    void loadOrders(requestedOrderId || undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, requestedOrderId])

  useEffect(() => { if (selectedId) void loadDetail(selectedId) }, [selectedId])

  useEffect(() => {
    if (createdFromOrderPage && !createdNoticeShown.current) {
      createdNoticeShown.current = true
      setNotice('名片訂單已建立。請先依下方金額完成銀行匯款並回填資料；工作室核對入帳後才會開始人工排版。')
    }
  }, [createdFromOrderPage])

  const refreshCurrent = async () => {
    await loadOrders(selectedId)
    if (selectedId) await loadDetail(selectedId)
  }

  const handleTopOrderAction = () => {
    if (pendingPaymentOrder) {
      setSelectedId(pendingPaymentOrder.id)
      setNotice(`你有一筆 ${pendingPaymentOrder.orderCode} 尚未完成匯款；請先完成匯款與回填資料，避免重複建立訂單。`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate('/tools/business-card-order')
  }

  const requestRevision = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedId || !revisionText.trim()) return
    setSubmitting(true); setError(''); setNotice('')
    try {
      await api('request-business-card-revision', 'POST', { orderId: selectedId, message: revisionText.trim() })
      setNotice('已送出一次文字修改需求，工作室完成後會再上傳新的預覽稿。')
      setRevisionText(''); setShowRevision(false)
      await refreshCurrent()
    } catch (err: any) { setError(err?.message || '送出修改需求失敗。') }
    finally { setSubmitting(false) }
  }

  const confirmPreview = async () => {
    if (!selectedId || !window.confirm('確認排版內容無誤後，將安排送印。是否確認？')) return
    setSubmitting(true); setError(''); setNotice('')
    try {
      await api('confirm-business-card-preview', 'POST', { orderId: selectedId })
      setNotice('已確認預覽稿，工作室將安排送印。')
      await refreshCurrent()
    } catch (err: any) { setError(err?.message || '確認預覽稿失敗。') }
    finally { setSubmitting(false) }
  }

  const selectPaymentProof = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (!file) return
    const okType = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)
    if (!okType || file.size > MAX_FILE_BYTES) {
      setPaymentProof(null)
      setError('付款證明僅支援 JPG、PNG、WebP、PDF，且單一檔案不可超過 3MB。')
      event.target.value = ''
      return
    }
    setPaymentProof(file)
  }

  const submitPayment = async (event: FormEvent) => {
    event.preventDefault()
    if (!selectedId || !detail || !bankInfo) return
    if (!payerName.trim()) { setError('請填寫匯款人姓名。'); return }
    if (!/^\d{5}$/.test(accountLastFive)) { setError('請輸入匯出帳號後五碼（5 位數字）。'); return }
    setSubmitting(true); setError(''); setNotice('')
    try {
      let paymentProofFileId = ''
      if (paymentProof) {
        const base64 = await fileToDataUrl(paymentProof)
        const upload = await api<{ file: { id: string } }>('upload-business-card-order-file', 'POST', {
          orderId: selectedId, fileName: paymentProof.name, contentType: paymentProof.type, base64, fileRole: 'payment_proof',
        })
        paymentProofFileId = upload.file?.id || ''
      }
      await api('create-business-card-payment-report', 'POST', {
        orderId: selectedId,
        payerName: payerName.trim(),
        amountNtd: bankInfo.amountNtd,
        accountLastFive,
        transferDate,
        note: paymentNote,
        paymentProofFileId: paymentProofFileId || undefined,
      })
      setNotice('已收到匯款回報，工作室會核對實際入帳後開始人工排版。')
      setPaymentProof(null); setPaymentNote('')
      await refreshCurrent()
    } catch (err: any) { setError(err?.message || '送出匯款回報失敗。') }
    finally { setSubmitting(false) }
  }

  const previews = detail?.files.filter((file) => ['preview_front', 'preview_back'].includes(file.fileRole)) || []
  const otherFiles = detail?.files.filter((file) => !['preview_front', 'preview_back'].includes(file.fileRole)) || []
  const canReviewPreview = ['preview_ready', 'awaiting_customer_confirmation'].includes(detail?.order.status || '')
  const paymentRequired = ['submitted', 'awaiting_payment'].includes(detail?.order.status || '')

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <SEO title="我的名片訂單｜RXV 夢想創作工作室" description="查看人工名片訂單、排版預覽、匯款與送印進度。" />
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-black tracking-[.14em] text-cyan-100">登入帳號專用</span>
              <h1 className="mt-3 text-3xl font-black">我的名片訂單</h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-200">在這裡查看排版預覽、提出一次文字修改、確認送印、回填匯款與追蹤寄送進度。</p>
            </div>
            <button type="button" onClick={handleTopOrderAction} className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-cyan-400">{pendingPaymentOrder ? '先完成目前匯款' : '新增名片需求'}</button>
          </div>
        </header>

        {error ? <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-800">{error}</div> : null}
        {notice ? <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800">{notice}</div> : null}

        {loading ? <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">正在讀取你的名片訂單…</div> : orders.length === 0 ? (
          <section className="rounded-3xl bg-white p-10 text-center shadow-sm"><h2 className="text-xl font-black text-slate-950">目前還沒有名片訂單</h2><p className="mt-2 text-slate-600">可先選擇喜歡風格，填寫資料後建立第一筆需求。</p><Link to="/tools/business-card-order" className="mt-5 inline-flex rounded-xl bg-cyan-600 px-5 py-3 font-black !text-white" style={{ color: '#fff', WebkitTextFillColor: '#fff' }}>前往人工名片設計＋代印</Link></section>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[310px_minmax(0,1fr)]">
            <aside className="space-y-3 xl:sticky xl:top-5 xl:h-fit">
              <p className="px-1 text-sm font-black text-slate-600">我的訂單（{orders.length}）</p>
              {orders.map((order) => (
                <button key={order.id} type="button" onClick={() => setSelectedId(order.id)} className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${selectedId === order.id ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100' : 'border-slate-200 bg-white hover:border-cyan-300'}`}>
                  <div className="flex flex-wrap items-center gap-2"><p className="font-mono text-sm font-black text-slate-950">{order.orderCode}</p><span className={`rounded-full px-2.5 py-1 text-[11px] font-black ${statusStyle(order.status)}`}>{statusLabel(order.status)}</span></div>
                  <p className="mt-2 text-sm font-bold text-slate-800">{serviceLabel(order.serviceType)}／{order.boxCount} 盒</p>
                  <p className="mt-1 text-xs text-slate-500">{formatDate(order.createdAt)}・NT${order.totalAmountNtd.toLocaleString()}</p>
                </button>
              ))}
            </aside>

            <section className="min-w-0 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              {detailLoading || !detail || !selectedOrder ? <p className="p-8 text-center text-slate-600">正在讀取訂單內容…</p> : <>
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-mono text-2xl font-black text-slate-950">{detail.order.orderCode}</h2><span className={`rounded-full px-3 py-1 text-xs font-black ${statusStyle(detail.order.status)}`}>{statusLabel(detail.order.status)}</span></div><p className="mt-2 text-sm text-slate-600">建立於 {formatDate(detail.order.createdAt)}・最後更新 {formatDate(detail.order.updatedAt)}</p></div><button type="button" onClick={() => void refreshCurrent()} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50">重新整理</button></div>

                <div className="mt-5 grid gap-3 md:grid-cols-3"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">印刷規格</p><p className="mt-1 font-black text-slate-950">{sideLabel(detail.order.printSide)}／{finishLabel(detail.order.finishType)}</p><p className="mt-1 text-sm text-slate-600">{detail.order.boxCount} 盒（{detail.order.quantityCards.toLocaleString()} 張）</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-bold text-slate-500">訂單金額</p><p className="mt-1 text-xl font-black text-emerald-700">NT${detail.order.totalAmountNtd.toLocaleString()}</p><p className="mt-1 text-sm text-slate-600">含宅配：{detail.order.shippingFeeNtd ? `NT$${detail.order.shippingFeeNtd}` : '免運'}</p></div><div className="rounded-2xl bg-slate-50 p-4">{paymentRequired ? <><p className="text-xs font-bold text-amber-700">下一步</p><p className="mt-1 font-black text-amber-900">請先完成銀行匯款</p><p className="mt-1 text-sm text-slate-600">核對入帳後才會開始人工排版。</p></> : <><p className="text-xs font-bold text-slate-500">文字修改</p><p className="mt-1 font-black text-slate-950">已使用 {detail.order.revisionCount}／1 次</p><p className="mt-1 text-sm text-slate-600">預覽稿完成後可提出一次修改。</p></>}</div></div>

                {previews.length ? <section className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black text-cyan-950">排版預覽稿</h3><p className="mt-1 text-sm text-cyan-800">請仔細確認文字、電話、連結與 QR Code；確認後將安排送印。</p></div>{detail.order.previewNote ? <span className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-cyan-900">{detail.order.previewNote}</span> : null}</div><div className="mt-4 grid gap-4 md:grid-cols-2">{previews.map((file) => <a key={file.id} href={file.signedUrl} target="_blank" rel="noreferrer" className="overflow-hidden rounded-2xl border border-cyan-200 bg-white shadow-sm"><img src={file.signedUrl} alt={file.fileRole === 'preview_front' ? '名片正面預覽' : '名片背面預覽'} className="block h-auto w-full"/><p className="border-t border-cyan-100 px-3 py-2 text-sm font-black text-cyan-800">{file.fileRole === 'preview_front' ? '正面預覽' : '背面預覽'}・點圖放大</p></a>)}</div>{canReviewPreview ? <div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" disabled={submitting} onClick={() => void confirmPreview()} className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-black !text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50" style={{ color: '#fff', WebkitTextFillColor: '#fff' }}>確認排版，安排送印</button><button type="button" disabled={submitting || detail.order.revisionCount >= 1} onClick={() => setShowRevision((value) => !value)} className="inline-flex min-h-[48px] flex-1 items-center justify-center rounded-xl border border-amber-300 bg-white px-5 py-3 font-black text-amber-900 hover:bg-amber-50 disabled:opacity-50">{detail.order.revisionCount >= 1 ? '已使用一次文字修改' : '提出一次文字修改'}</button></div> : null}{showRevision ? <form onSubmit={requestRevision} className="mt-4 rounded-2xl border border-amber-200 bg-white p-4"><label className="block text-sm font-black text-slate-800">請清楚列出要改的文字或內容<textarea value={revisionText} onChange={(event) => setRevisionText(event.target.value)} rows={4} maxLength={1200} placeholder="例如：電話改成 0912-345-678；職稱改成品牌顧問…" className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-slate-900 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"/></label><div className="mt-3 flex gap-2"><button type="submit" disabled={submitting} className="rounded-xl bg-amber-500 px-4 py-2.5 font-black text-white hover:bg-amber-600 disabled:opacity-50">送出修改需求</button><button type="button" onClick={() => setShowRevision(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 font-black text-slate-700">取消</button></div></form> : null}</section> : <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-black text-slate-950">排版預覽</h3><p className="mt-2 text-sm text-slate-600">{paymentRequired ? '請先完成下方銀行匯款與回填；工作室核對入帳後才會開始人工排版。' : '目前尚未上傳預覽稿。工作室確認資料後會開始排版，完成後會顯示在這裡。'}</p></section>}

                {paymentRequired ? <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><h3 className="font-black text-emerald-950">請先完成銀行匯款</h3>{bankLoading ? <p className="mt-3 text-sm text-emerald-800">正在讀取匯款資訊…</p> : bankInfo ? <><div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-xl bg-white p-3"><p className="text-xs font-bold text-slate-500">匯款金額</p><p className="mt-1 text-xl font-black text-emerald-700">NT${bankInfo.amountNtd.toLocaleString()}</p></div><div className="rounded-xl bg-white p-3"><p className="text-xs font-bold text-slate-500">戶名</p><p className="mt-1 font-black text-slate-950">{bankInfo.bank.accountName}</p></div><div className="rounded-xl bg-white p-3"><p className="text-xs font-bold text-slate-500">銀行／代碼</p><p className="mt-1 font-black text-slate-950">{bankInfo.bank.name}／{bankInfo.bank.code}</p></div><div className="rounded-xl bg-white p-3"><p className="text-xs font-bold text-slate-500">匯款帳號</p><p className="mt-1 break-all font-black text-slate-950">{bankInfo.bank.account}</p></div></div><form onSubmit={submitPayment} className="mt-5 grid gap-4 rounded-2xl bg-white p-4 sm:grid-cols-2"><label className="text-sm font-black text-slate-800">匯款人姓名<input value={payerName} onChange={(event) => setPayerName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900" required /></label><label className="text-sm font-black text-slate-800">匯出帳號後五碼<input value={accountLastFive} onChange={(event) => setAccountLastFive(event.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" maxLength={5} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900" required /></label><label className="text-sm font-black text-slate-800">匯款日期<input type="date" value={transferDate} onChange={(event) => setTransferDate(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900" required /></label><label className="text-sm font-black text-slate-800">付款證明（選填）<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={selectPaymentProof} className="mt-1.5 block w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2 text-sm font-normal"/><span className="mt-1 block text-xs font-normal text-slate-500">JPG、PNG、WebP、PDF，3MB 以下。</span></label><label className="sm:col-span-2 text-sm font-black text-slate-800">備註（選填）<textarea value={paymentNote} onChange={(event) => setPaymentNote(event.target.value)} rows={3} className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 text-slate-900" placeholder="例如：匯款人姓名不同時可說明"/></label><button disabled={submitting} type="submit" className="sm:col-span-2 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-black !text-white hover:bg-emerald-700 disabled:opacity-50" style={{ color: '#fff', WebkitTextFillColor: '#fff' }}>{submitting ? '送出中…' : '已匯款，送出回報'}</button></form></> : <p className="mt-3 text-sm text-rose-700">暫時無法取得匯款資訊，請稍後重新整理。</p>}</section> : null}

                {detail.order.status === 'payment_reported' ? <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-black text-amber-950">已收到匯款回報</h3><p className="mt-2 text-sm leading-relaxed text-amber-900">工作室會依實際銀行入帳核對；確認後訂單會顯示「已確認入帳」，接著開始人工排版。</p></section> : null}
                {detail.order.status === 'payment_verified' ? <section className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-5"><h3 className="font-black text-cyan-950">匯款已確認，開始人工排版</h3><p className="mt-2 text-sm leading-relaxed text-cyan-900">工作室已核對入帳，正在依你選擇的模板與資料進行排版；完成後會在此顯示正、背面預覽稿。</p></section> : null}

                {detail.order.status === 'shipped' ? <section className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><h3 className="font-black text-emerald-950">名片已寄出</h3><p className="mt-2 text-sm text-emerald-900">{detail.order.shippingCarrier ? `物流：${detail.order.shippingCarrier}` : '合作印刷廠已安排宅配。'}{detail.order.trackingNumber ? `　追蹤號碼：${detail.order.trackingNumber}` : ''}</p></section> : null}

                {detail.digitalProfile?.status === 'active' ? <section className="mt-6 rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black text-violet-950">加贈基本數位名片頁已開通</h3><p className="mt-2 text-sm text-violet-900">可將此連結做成 QR Code 放在紙本名片，讓客戶掃碼查看聯絡方式與服務介紹。</p><a href={detail.digitalProfile.publicPath} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 font-black !text-white hover:bg-violet-700" style={{ color: '#fff', WebkitTextFillColor: '#fff' }}>開啟我的數位名片頁</a><p className="mt-2 text-xs text-violet-800">使用期限至：{formatDate(detail.digitalProfile.expiresAt)}</p></section> : null}

                {otherFiles.length ? <section className="mt-6"><h3 className="font-black text-slate-950">我的附件</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{otherFiles.map((file) => <a key={file.id} href={file.signedUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cyan-300"><p className="break-all font-black text-slate-900">{file.originalFileName}</p><p className="mt-1 text-xs text-slate-500">{file.fileRole}・{formatSize(file.sizeBytes)}・{formatDate(file.createdAt)}</p></a>)}</div></section> : null}

                {detail.events.length ? <section className="mt-6 border-t border-slate-100 pt-5"><h3 className="font-black text-slate-950">處理紀錄</h3><ol className="mt-4 space-y-3">{detail.events.map((event) => <li key={event.id} className="relative border-l-2 border-cyan-200 pl-4"><p className="text-sm font-bold text-slate-800">{event.message || statusLabel(event.toStatus || '')}</p><p className="mt-1 text-xs text-slate-500">{formatDate(event.createdAt)}</p></li>)}</ol></section> : null}
              </>}
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
