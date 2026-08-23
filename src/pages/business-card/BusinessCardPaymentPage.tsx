import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
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
  createdAt?: string | null
}

type OrderDetail = {
  order: OrderSummary
}

type BankInfo = {
  amountNtd: number
  orderCode: string
  bank: {
    name: string
    code: string
    branch?: string
    account: string
    accountName: string
  }
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
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(String(data?.error || '操作失敗，請稍後再試。'))
  return data as T
}

function taipeiDateLocal() {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const get = (type: string) => parts.find((part) => part.type === type)?.value || ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('讀取付款證明失敗。'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsDataURL(file)
  })
}

function sideLabel(value: string) {
  return value === 'double' ? '雙面名片' : '單面名片'
}

function finishLabel(value: string) {
  return value === 'matte' ? '雙面霧膜' : '水晶亮膜'
}

function serviceLabel(value: string) {
  return value === 'print' ? '自備完稿代印' : '人工排版＋代印'
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    awaiting_payment: '等待匯款',
    payment_reported: '已回填匯款，等待核對',
    payment_verified: '已確認入帳',
    designing: '排版中',
    awaiting_customer_confirmation: '等待確認預覽',
    printing: '已送印',
    shipped: '已寄出',
    completed: '已完成',
  }
  return map[status] || status || '處理中'
}

function CopyValue({ label, value }: { label: string; value?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    if (!value) return
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      window.alert('無法自動複製，請手動選取文字。')
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="min-w-0 break-all text-base font-black text-slate-900">{value || '—'}</p>
        <button
          type="button"
          onClick={copy}
          disabled={!value}
          className="shrink-0 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? '已複製' : '複製'}
        </button>
      </div>
    </div>
  )
}

export default function BusinessCardPaymentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const requestedOrderId = String(searchParams.get('orderId') || '').trim()
  const created = searchParams.get('created') === '1'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [orderId, setOrderId] = useState('')
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [payerName, setPayerName] = useState('')
  const [accountLastFive, setAccountLastFive] = useState('')
  const [transferDate, setTransferDate] = useState(taipeiDateLocal())
  const [note, setNote] = useState('')
  const [paymentProof, setPaymentProof] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const pendingOrders = useMemo(
    () => orders.filter((order) => order.status === 'awaiting_payment'),
    [orders],
  )

  const loadPayment = async (preferredOrderId?: string) => {
    setLoading(true)
    setError('')
    try {
      const listData = await api<{ orders: OrderSummary[] }>('get-my-business-card-orders')
      const rows = Array.isArray(listData.orders) ? listData.orders : []
      setOrders(rows)

      const wanted = preferredOrderId || requestedOrderId
      const nextOrder =
        rows.find((order) => order.id === wanted) ||
        rows.find((order) => order.status === 'awaiting_payment') ||
        null

      if (!nextOrder) {
        setOrderId('')
        setDetail(null)
        setBankInfo(null)
        setError('目前沒有待匯款名片訂單。')
        return
      }

      setOrderId(nextOrder.id)
      const detailData = await api<OrderDetail>(
        'get-my-business-card-order-detail',
        'GET',
        undefined,
        { orderId: nextOrder.id },
      )
      setDetail(detailData)

      if (detailData.order.status === 'awaiting_payment') {
        const bank = await api<BankInfo>(
          'get-business-card-bank-transfer-info',
          'GET',
          undefined,
          { orderId: nextOrder.id },
        )
        setBankInfo(bank)
      } else {
        setBankInfo(null)
      }
    } catch (err: any) {
      setError(err?.message || '讀取名片匯款資訊失敗。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!getToken()) {
      const returnTo = `/business-card/payment${requestedOrderId ? `?orderId=${encodeURIComponent(requestedOrderId)}` : ''}`
      navigate(`/login?returnTo=${encodeURIComponent(returnTo)}`)
      return
    }
    void loadPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, requestedOrderId])

  const chooseOrder = (nextId: string) => {
    navigate(`/business-card/payment?orderId=${encodeURIComponent(nextId)}`)
  }

  const selectPaymentProof = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
    if (!allowed.includes(file.type) || file.size > MAX_FILE_BYTES) {
      setPaymentProof(null)
      setError('付款證明僅支援 JPG、PNG、WebP、PDF，且單一檔案不可超過 3MB。')
      event.target.value = ''
      return
    }
    setPaymentProof(file)
  }

  const submitPayment = async (event: FormEvent) => {
    event.preventDefault()
    if (!orderId || !bankInfo || !detail) return

    if (!payerName.trim()) {
      setError('請填寫匯款人姓名。')
      return
    }
    if (!/^\d{5}$/.test(accountLastFive)) {
      setError('請輸入匯出帳號後五碼（5 位數字）。')
      return
    }
    if (!transferDate) {
      setError('請填寫匯款日期。')
      return
    }

    setSubmitting(true)
    setError('')
    setNotice('')

    try {
      let paymentProofFileId = ''
      if (paymentProof) {
        const base64 = await fileToDataUrl(paymentProof)
        const uploaded = await api<{ file: { id: string } }>('upload-business-card-order-file', 'POST', {
          orderId,
          fileName: paymentProof.name,
          contentType: paymentProof.type,
          base64,
          fileRole: 'payment_proof',
        })
        paymentProofFileId = uploaded.file?.id || ''
      }

      await api('create-business-card-payment-report', 'POST', {
        orderId,
        payerName: payerName.trim(),
        amountNtd: bankInfo.amountNtd,
        accountLastFive,
        transferDate,
        note,
        paymentProofFileId: paymentProofFileId || undefined,
      })

      setNotice('已收到匯款回報。工作室核對實際入帳後才會開始人工排版。')
      setPaymentProof(null)
      await loadPayment(orderId)
    } catch (err: any) {
      setError(err?.message || '送出名片匯款回報失敗。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <SEO title="名片訂單匯款｜RXV 夢想創作工作室" description="查看名片訂單金額、匯款帳號並回填匯款資料。" />
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 rounded-3xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-sky-100 p-6 shadow-sm sm:p-8">
          <span className="inline-flex rounded-full border border-cyan-200 bg-cyan-100 px-3 py-1 text-xs font-black tracking-[.14em] text-cyan-800">名片訂單匯款</span>
          <h1 className="mt-3 text-3xl font-black text-slate-950">請先完成匯款，再回填資料</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {created ? '名片訂單已建立。' : ''}
            工作室核對實際入帳後才會開始人工排版；未核對前不會製作預覽稿。核對完成後約 2～3 個工作天提供預覽，確認後印刷與宅配約 4～7 個工作天，整體約 7～10 個工作天送達。
          </p>
        </header>

        {error ? <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-800">{error}</div> : null}
        {notice ? <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800">{notice}</div> : null}

        {loading ? (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">正在讀取名片訂單匯款資訊…</div>
        ) : detail ? (
          <>
            {pendingOrders.length > 1 ? (
              <section className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="font-black text-amber-950">你有 {pendingOrders.length} 筆名片訂單等待匯款</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pendingOrders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => chooseOrder(order.id)}
                      className={`rounded-xl border px-3 py-2 text-sm font-black ${
                        order.id === orderId
                          ? 'border-cyan-500 bg-cyan-600 text-white'
                          : 'border-amber-200 bg-white text-amber-900 hover:bg-amber-100'
                      }`}
                    >
                      {order.orderCode}・NT${order.totalAmountNtd.toLocaleString()}
                    </button>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-500">名片訂單編號</p>
                  <h2 className="mt-1 font-mono text-2xl font-black text-slate-950">{detail.order.orderCode}</h2>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-sm font-black ${
                  detail.order.status === 'awaiting_payment'
                    ? 'bg-amber-100 text-amber-900'
                    : detail.order.status === 'payment_reported'
                      ? 'bg-cyan-100 text-cyan-800'
                      : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {statusLabel(detail.order.status)}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">訂購規格</p>
                  <p className="mt-1 font-black text-slate-950">{serviceLabel(detail.order.serviceType)}／{sideLabel(detail.order.printSide)}</p>
                  <p className="mt-1 text-sm text-slate-600">{finishLabel(detail.order.finishType)}・{detail.order.boxCount} 盒（{detail.order.quantityCards.toLocaleString()} 張）</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-500">選擇風格</p>
                  <p className="mt-1 font-black text-slate-950">{detail.order.templateTitle || '自備完稿／未選模板'}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4 sm:col-span-2">
                  <p className="text-xs font-bold text-emerald-700">本次應匯金額</p>
                  <p className="mt-1 text-3xl font-black text-emerald-700">NT${detail.order.totalAmountNtd.toLocaleString()}</p>
                  <p className="mt-1 text-sm text-emerald-800">含宅配運費：{detail.order.shippingFeeNtd ? `NT$${detail.order.shippingFeeNtd}` : '免運'}</p>
                </div>
              </div>
            </section>

            {detail.order.status === 'awaiting_payment' ? (
              <>
                {bankInfo ? (
                  <>
                    <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                      <h2 className="text-xl font-black text-slate-950">匯款帳號</h2>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">請依本筆訂單金額匯款。各欄位可點「複製」。</p>
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <CopyValue label="銀行名稱" value={bankInfo.bank.name} />
                        <CopyValue label="銀行代碼" value={bankInfo.bank.code} />
                        <CopyValue label="分行" value={bankInfo.bank.branch} />
                        <CopyValue label="戶名" value={bankInfo.bank.accountName} />
                        <div className="sm:col-span-2">
                          <CopyValue label="匯款帳號" value={bankInfo.bank.account} />
                        </div>
                      </div>
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                        <p className="font-black">匯款前請確認</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5">
                          <li>訂單編號：{bankInfo.orderCode}</li>
                          <li>匯款金額：NT${bankInfo.amountNtd.toLocaleString()}</li>
                          <li>匯款後請填寫匯出帳號後五碼與匯款日期。</li>
                          <li>工作室核對實際入帳後，才開始人工排版。</li>
                        </ul>
                      </div>
                      <div className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm leading-relaxed text-violet-900">
                        <p className="font-black">製作與配送時間</p>
                        <ol className="mt-2 list-decimal space-y-1 pl-5">
                          <li>匯款核對：通常 1 個工作天內完成。</li>
                          <li>人工排版初稿：核對入帳後約 2～3 個工作天。</li>
                          <li>確認預覽後印刷與宅配：約 4～7 個工作天。</li>
                          <li>一般訂單整體約 7～10 個工作天送達；假日、客戶修改確認或物流延誤將順延。</li>
                        </ol>
                      </div>
                    </section>

                    <form onSubmit={submitPayment} className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:p-6">
                      <h2 className="text-xl font-black text-emerald-950">我已完成匯款，回填資料</h2>
                      <p className="mt-2 text-sm leading-relaxed text-emerald-800">回填後狀態會變成「等待核對」，請勿重複送出同一筆回報。</p>
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <label className="text-sm font-black text-slate-800">
                          匯款人姓名
                          <input value={payerName} onChange={(event) => setPayerName(event.target.value)} required className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900" />
                        </label>
                        <label className="text-sm font-black text-slate-800">
                          匯出帳號後五碼
                          <input value={accountLastFive} onChange={(event) => setAccountLastFive(event.target.value.replace(/\D/g, '').slice(0, 5))} required inputMode="numeric" maxLength={5} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900" />
                        </label>
                        <label className="text-sm font-black text-slate-800">
                          匯款日期
                          <input type="date" value={transferDate} onChange={(event) => setTransferDate(event.target.value)} required className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900" />
                        </label>
                        <label className="text-sm font-black text-slate-800">
                          付款證明（選填）
                          <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={selectPaymentProof} className="mt-1.5 block w-full rounded-xl border border-dashed border-slate-300 bg-white p-2 text-sm font-normal" />
                          <span className="mt-1 block text-xs font-normal text-slate-500">JPG、PNG、WebP、PDF，3MB 以下。</span>
                        </label>
                        <label className="sm:col-span-2 text-sm font-black text-slate-800">
                          備註（選填）
                          <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} maxLength={500} placeholder="例如：匯款人姓名與訂購人不同時，可在此說明。" className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900" />
                        </label>
                      </div>
                      <button type="submit" disabled={submitting} className="mt-5 inline-flex min-h-[52px] w-full items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50" style={{ color: '#fff', WebkitTextFillColor: '#fff' }}>
                        {submitting ? '送出中…' : '已匯款，送出回報'}
                      </button>
                    </form>
                  </>
                ) : <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800">暫時無法讀取匯款帳號，請重新整理後再試。</div>}
              </>
            ) : detail.order.status === 'payment_reported' ? (
              <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-xl font-black text-amber-950">已收到匯款回報</h2>
                <p className="mt-2 text-sm leading-relaxed text-amber-900">工作室會依實際入帳核對。確認後才會開始人工排版與製作正、背面預覽稿；核對完成後約 2～3 個工作天提供預覽，確認後印刷與宅配約 4～7 個工作天。</p>
              </section>
            ) : (
              <section className="mt-6 rounded-3xl border border-cyan-200 bg-cyan-50 p-6">
                <h2 className="text-xl font-black text-cyan-950">此筆訂單目前不需要再次匯款</h2>
                <p className="mt-2 text-sm leading-relaxed text-cyan-900">目前狀態：{statusLabel(detail.order.status)}。</p>
              </section>
            )}

            <Link to={`/my-business-card-orders?orderId=${encodeURIComponent(orderId)}`} className="mt-6 inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm hover:bg-slate-50">
              返回我的名片訂單
            </Link>
          </>
        ) : (
          <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-xl font-black text-slate-950">目前沒有待匯款名片訂單</h2>
            <p className="mt-2 text-slate-600">可先查看已建立的名片訂單，或新增一筆名片需求。</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link to="/my-business-card-orders" className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-700 hover:bg-slate-50">查看我的名片訂單</Link>
              <Link to="/tools/business-card-order" className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-cyan-600 px-5 py-3 font-black !text-white hover:bg-cyan-700" style={{ color: '#fff', WebkitTextFillColor: '#fff' }}>新增名片需求</Link>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
