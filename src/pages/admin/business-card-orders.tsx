import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '@/components/SEO'

type AdminOrder = {
  id: string
  orderCode: string
  customerEmail: string
  serviceType: string
  printSide: string
  finishType: string
  quantityCards: number
  boxCount: number
  templateTitle?: string | null
  itemAmountNtd: number
  shippingFeeNtd: number
  totalAmountNtd: number
  brandName?: string | null
  fullName?: string | null
  jobTitle?: string | null
  cardPhone?: string | null
  lineId?: string | null
  websiteUrl?: string | null
  serviceText?: string | null
  recipientName?: string | null
  recipientPhone?: string | null
  shippingAddress?: string | null
  customerNote?: string | null
  adminNote?: string | null
  previewNote?: string | null
  status: string
  revisionCount: number
  digitalCardOptIn?: boolean
  shippingCarrier?: string | null
  trackingNumber?: string | null
  filesCount: number
  createdAt?: string | null
  updatedAt?: string | null
}

type PaymentReport = {
  id: string
  orderId: string
  orderCode: string
  customerEmail: string
  customerName: string
  expectedAmountNtd: number
  payerName: string
  payerEmail: string
  amountNtd: number
  accountLastFive: string
  transferredAt?: string | null
  note?: string | null
  paymentProofFileId?: string | null
  createdAt?: string | null
}

type OrderDetail = {
  order: AdminOrder
  files: Array<{ id: string; fileRole: string; originalFileName: string; contentType: string; sizeBytes: number; signedUrl: string; uploadedByRole: string; isCustomerVisible: boolean; createdAt?: string | null }>
  events: Array<{ id: string; actor_role?: string; actorRole?: string; event_type?: string; eventType?: string; message?: string; created_at?: string; createdAt?: string }>
  paymentReports: Array<{ id: string; status: string; payerName: string; amountNtd: number; accountLastFive: string; transferredAt?: string | null; reviewNote?: string | null; createdAt?: string | null }>
  digitalProfile?: { slug: string; publicPath: string; status: string; expiresAt?: string | null } | null
}

const STATUS_OPTIONS = [
  ['submitted', '已送出需求'], ['reviewing', '資料確認中'], ['designing', '排版中'], ['awaiting_customer_confirmation', '等待客戶確認預覽'], ['revision_requested', '客戶提出修改'], ['awaiting_payment', '等待匯款'], ['payment_reported', '已回填匯款'], ['payment_verified', '已確認入帳'], ['printing', '已送印'], ['shipped', '已寄出'], ['completed', '已完成'], ['cancelled', '已取消'],
]

function token() { return typeof window === 'undefined' ? '' : String(localStorage.getItem('auth_token') || localStorage.getItem('token') || '').trim() }
async function api<T>(action: string, method: 'GET' | 'POST' = 'GET', body?: unknown, query?: Record<string, string>) {
  const value = token(); if (!value) throw new Error('登入已失效，請重新登入。')
  const params = new URLSearchParams({ action, ...(query || {}) })
  const response = await fetch(`/api/main?${params.toString()}`, { method, headers: { Authorization: `Bearer ${value}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(String(data?.error || `操作失敗（HTTP ${response.status}）。`)) as Error & { status?: number }
    error.status = response.status
    throw error
  }
  return data as T
}
function fmt(value?: string | null) { if (!value) return '—'; const d = new Date(value); return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('zh-TW', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }
function size(value: number) { return value < 1024 * 1024 ? `${Math.max(1, Math.round(value / 1024))} KB` : `${(value / 1024 / 1024).toFixed(1)} MB` }
function statusLabel(status: string) { return STATUS_OPTIONS.find(([id]) => id === status)?.[1] || status }
function statusClass(status: string) { return ['payment_verified', 'printing', 'shipped', 'completed'].includes(status) ? 'bg-emerald-100 text-emerald-800' : ['awaiting_customer_confirmation', 'awaiting_payment', 'payment_reported'].includes(status) ? 'bg-amber-100 text-amber-900' : status === 'cancelled' ? 'bg-slate-200 text-slate-700' : 'bg-cyan-100 text-cyan-800' }
function readFile(file: File) { return new Promise<string>((resolve, reject) => { const r = new FileReader(); r.onerror = () => reject(new Error('讀取檔案失敗。')); r.onload = () => resolve(String(r.result || '')); r.readAsDataURL(file) }) }

type PreparedPreviewFile = {
  file: File
  originalName: string
  originalBytes: number
  optimizedBytes: number
}

const PREVIEW_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const PREVIEW_MAX_SOURCE_BYTES = 12 * 1024 * 1024
const PREVIEW_MAX_UPLOAD_BYTES = 1150 * 1024
const PREVIEW_MAX_DIMENSION = 1800
const PREVIEW_MAX_TWO_FILE_BYTES = PREVIEW_MAX_UPLOAD_BYTES * 2

function loadPreviewImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('圖片格式無法讀取。')) }
    image.src = url
  })
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('圖片壓縮失敗。')), 'image/jpeg', quality)
  })
}

async function optimizePreviewFile(source: File): Promise<PreparedPreviewFile> {
  if (!PREVIEW_ALLOWED_TYPES.includes(source.type)) throw new Error('預覽圖僅支援 JPG、PNG、WebP。')
  if (source.size > PREVIEW_MAX_SOURCE_BYTES) throw new Error('原始預覽圖不可超過 12MB。請先縮小圖片後再上傳。')

  const image = await loadPreviewImage(source)
  const scale = Math.min(1, PREVIEW_MAX_DIMENSION / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height))
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale))
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('目前瀏覽器無法處理圖片壓縮。')
  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  let blob: Blob | null = null
  for (const quality of [0.9, 0.84, 0.78, 0.7, 0.62]) {
    const next = await canvasToBlob(canvas, quality)
    blob = next
    if (next.size <= PREVIEW_MAX_UPLOAD_BYTES) break
  }
  if (!blob || blob.size > PREVIEW_MAX_UPLOAD_BYTES) throw new Error('圖片壓縮後仍超過可上傳大小，請先裁切或縮小圖片再試。')

  const baseName = source.name.replace(/\.[^/.]+$/, '') || 'preview'
  const optimized = new File([blob], `${baseName}-preview.jpg`, { type: 'image/jpeg', lastModified: Date.now() })
  return { file: optimized, originalName: source.name, originalBytes: source.size, optimizedBytes: optimized.size }
}

function getPreviewUploadErrorMessage(error: unknown) {
  const raw = String((error as any)?.message || '').trim()
  const status = Number((error as any)?.status || 0)
  if (status === 413 || /payload|entity too large|request body/i.test(raw)) return '預覽檔案內容仍過大，請重新選擇圖片；系統已限制每張約 1.1MB。'
  if (/核對客戶匯款|確認付款/i.test(raw)) return '此訂單尚未確認入帳，請先在「待核對名片匯款」按確認入帳後再上傳預覽。'
  if (/preview|預覽/i.test(raw)) return raw
  return raw || '上傳預覽稿失敗，請稍後再試。'
}

const BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT = 349
const BRAND_WEBSITE_GIFT_MONTHS = 3

function getDigitalGiftMonths(order: AdminOrder) {
  return order.serviceType === 'layout' && order.itemAmountNtd >= BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT
    ? BRAND_WEBSITE_GIFT_MONTHS
    : 0
}
function getDigitalGiftText(order: AdminOrder) {
  if (order.serviceType !== 'layout') return '自備完稿代印未含一頁式品牌網站贈送方案。'
  if (order.itemAmountNtd < BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT) return `人工排版名片費未滿 NT$${BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT}，未含贈送方案。`
  return `人工排版名片費滿 NT$${BRAND_WEBSITE_GIFT_MIN_ITEM_AMOUNT}，付款確認後自動贈送一頁式品牌網站基本版 ${BRAND_WEBSITE_GIFT_MONTHS} 個月。`
}

export default function AdminBusinessCardOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [reports, setReports] = useState<PaymentReport[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [filter, setFilter] = useState<'active' | 'all' | 'payment'>('active')
  const [previewFront, setPreviewFront] = useState<PreparedPreviewFile | null>(null)
  const [previewBack, setPreviewBack] = useState<PreparedPreviewFile | null>(null)
  const [preparingPreviewSide, setPreparingPreviewSide] = useState<'front' | 'back' | null>(null)
  const [previewNote, setPreviewNote] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [carrier, setCarrier] = useState('')
  const [tracking, setTracking] = useState('')
  const [previewEmailCopied, setPreviewEmailCopied] = useState(false)

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedId) || null, [orders, selectedId])
  const visibleOrders = useMemo(() => {
    if (filter === 'all') return orders
    if (filter === 'payment') return orders.filter((order) => ['awaiting_payment', 'payment_reported'].includes(order.status))
    return orders.filter((order) => !['completed', 'cancelled'].includes(order.status))
  }, [orders, filter])

  const load = async (preferId?: string) => {
    setLoading(true); setError('')
    try {
      const [orderData, paymentData] = await Promise.all([
        api<{ orders: AdminOrder[] }>('admin-list-business-card-orders'),
        api<{ reports: PaymentReport[] }>('admin-list-business-card-payment-reports'),
      ])
      const nextOrders = Array.isArray(orderData.orders) ? orderData.orders : []
      setOrders(nextOrders); setReports(Array.isArray(paymentData.reports) ? paymentData.reports : [])
      setSelectedId(preferId || selectedId || nextOrders[0]?.id || '')
    } catch (err: any) { setError(err?.message || '讀取名片訂單失敗。') }
    finally { setLoading(false) }
  }
  const loadDetail = async (id: string) => {
    if (!id) return
    setDetailLoading(true); setError('')
    try {
      const data = await api<OrderDetail>('admin-get-business-card-order-detail', 'GET', undefined, { orderId: id })
      setDetail(data); setPreviewNote(data.order.previewNote || ''); setAdminNote(data.order.adminNote || ''); setCarrier(data.order.shippingCarrier || ''); setTracking(data.order.trackingNumber || '')
    } catch (err: any) { setDetail(null); setError(err?.message || '讀取訂單詳細資料失敗。') }
    finally { setDetailLoading(false) }
  }
  useEffect(() => { if (!token()) { navigate('/login'); return }; void load() // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])
  useEffect(() => { if (selectedId) void loadDetail(selectedId) }, [selectedId])
  const refresh = async () => { await load(selectedId); if (selectedId) await loadDetail(selectedId) }

  const updateStatus = async (status: string) => {
    if (!selectedId || !selectedOrder || !window.confirm(`將 ${selectedOrder.orderCode} 更新為「${statusLabel(status)}」？`)) return
    setProcessing(true); setError(''); setNotice('')
    try { await api('admin-update-business-card-order', 'POST', { orderId: selectedId, status, adminNote }); setNotice(`已更新為「${statusLabel(status)}」。`); await refresh() }
    catch (err: any) { setError(err?.message || '更新訂單狀態失敗。') } finally { setProcessing(false) }
  }
  const saveNote = async () => {
    if (!selectedId || !detail) return
    setProcessing(true); setError(''); setNotice('')
    try { await api('admin-update-business-card-order', 'POST', { orderId: selectedId, status: detail.order.status, adminNote }); setNotice('內部備註已儲存。'); await refresh() }
    catch (err: any) { setError(err?.message || '儲存內部備註失敗。') } finally { setProcessing(false) }
  }
  const choosePreview = (side: 'front' | 'back', setter: (file: PreparedPreviewFile | null) => void) => async (event: ChangeEvent<HTMLInputElement>) => {
    const source = event.target.files?.[0] || null
    event.target.value = ''
    if (!source) return
    setPreparingPreviewSide(side); setError(''); setNotice('')
    try {
      const prepared = await optimizePreviewFile(source)
      setter(prepared)
      setNotice(`${side === 'front' ? '正面' : '背面'}預覽圖已自動壓縮：${size(prepared.originalBytes)} → ${size(prepared.optimizedBytes)}。`)
    } catch (err: any) {
      setter(null)
      setError(err?.message || '預覽圖處理失敗。')
    } finally { setPreparingPreviewSide(null) }
  }
  const uploadPreview = async () => {
    if (!selectedId || (!previewFront && !previewBack)) { setError('請至少選擇正面或背面預覽圖。'); return }
    const totalBytes = Number(previewFront?.optimizedBytes || 0) + Number(previewBack?.optimizedBytes || 0)
    if (totalBytes > PREVIEW_MAX_TWO_FILE_BYTES) { setError('正面與背面預覽圖合計仍過大，請重新選擇圖片。'); return }
    setProcessing(true); setError(''); setNotice('')
    try {
      const payload: any = { orderId: selectedId, previewNote }
      if (previewFront) payload.previewFront = { fileName: previewFront.file.name, contentType: previewFront.file.type, base64: await readFile(previewFront.file) }
      if (previewBack) payload.previewBack = { fileName: previewBack.file.name, contentType: previewBack.file.type, base64: await readFile(previewBack.file) }
      const result = await api<{ isReplacement?: boolean; replacedFilesCount?: number }>('admin-upload-business-card-preview', 'POST', payload)
      setNotice(result?.isReplacement ? '新版預覽稿已上傳，舊版同一面預覽已自動隱藏，客戶可重新確認。' : '預覽稿已上傳，客戶登入後可確認或提出一次文字修改。')
      setPreviewFront(null); setPreviewBack(null); setPreviewEmailCopied(false); await refresh()
    } catch (err: any) { setError(getPreviewUploadErrorMessage(err)) } finally { setProcessing(false) }
  }
  const reviewPayment = async (report: PaymentReport, decision: 'verified' | 'rejected') => {
    const note = decision === 'rejected' ? window.prompt('請輸入無法核對原因（會顯示給客戶）：') ?? '' : window.prompt('核對備註（選填）：') ?? ''
    if (!window.confirm(decision === 'verified' ? `確認 ${report.orderCode} 已入帳 NT$${report.amountNtd}？` : `拒絕 ${report.orderCode} 的匯款回報？`)) return
    setProcessing(true); setError(''); setNotice('')
    try { const result = await api<{ storefrontGift?: { eligible?: boolean; autoGranted?: boolean; publicPath?: string; error?: string } }>('admin-review-business-card-payment', 'POST', { reportId: report.id, decision, reviewNote: note }); const giftNotice = decision === 'verified' && result.storefrontGift?.eligible ? (result.storefrontGift.autoGranted ? ' 已同步開通一頁式品牌網站基本版 3 個月。' : ` 名片網站贈送資格待補開通：${result.storefrontGift.error || '請查看訂單詳情。'}`) : ''; setNotice(decision === 'verified' ? `已確認入帳，可安排送印。${giftNotice}` : '已退回匯款回報，客戶可重新回填。'); await refresh() }
    catch (err: any) { setError(err?.message || '核對匯款失敗。') } finally { setProcessing(false) }
  }
  const markShipped = async () => {
    if (!selectedId || !window.confirm('確認名片已寄出？')) return
    setProcessing(true); setError(''); setNotice('')
    try { await api('admin-ship-business-card-order', 'POST', { orderId: selectedId, carrier, trackingNumber: tracking }); setNotice('已標記名片寄出。'); await refresh() }
    catch (err: any) { setError(err?.message || '更新寄送資訊失敗。') } finally { setProcessing(false) }
  }
  const grantDigital = async (months: 3 | 6, manualOverride = false) => {
    if (!selectedId || !window.confirm(manualOverride ? `確認人工加碼開通一頁式品牌網站 ${months} 個月？` : `確認補開通一頁式品牌網站基本版 ${months} 個月？`)) return
    setProcessing(true); setError(''); setNotice('')
    try { const data = await api<{ digitalProfile: { publicPath: string } }>('admin-grant-business-card-digital-profile', 'POST', { orderId: selectedId, durationMonths: months, manualOverride }); setNotice(`一頁式品牌網站草稿已建立：${data.digitalProfile.publicPath}。請提醒客戶登入補齊資料後公開。`); await refresh() }
    catch (err: any) { setError(err?.message || '開通一頁式品牌網站失敗。') } finally { setProcessing(false) }
  }
  const copyDigitalPageMessage = async () => {
    if (!detail?.digitalProfile) return
    const isPublished = detail.digitalProfile.status === 'published'
    const url = `${window.location.origin}${detail.digitalProfile.publicPath}`
    const message = `主旨：您的一頁式品牌網站已開通

您好：

您的一頁式品牌網站已建立，使用期限至 ${fmt(detail.digitalProfile.expiresAt)}。

請登入 RXV 夢想創作工作室，前往「一頁式品牌網站設定」補齊或確認：
・品牌／公司名稱與介紹
・Logo、封面圖片
・電話、LINE、Email、網站與社群連結
・服務內容與詢問方式

完成後儲存並勾選「公開」，即可分享專屬網址與 QR Code。
日後加購商品展示功能時，商品會直接顯示在同一個頁面，不需要另外建立新網址。${isPublished ? `

目前公開網址：${url}` : ''}`
    try { await navigator.clipboard.writeText(message); setNotice('已複製一頁式品牌網站開通通知，可貼到 Gmail、LINE 或 Messenger。') } catch { setError('無法自動複製通知文字。') }
  }
  const copyPreviewEmailMessage = async () => {
    if (!detail) return
    const hasPreview = detail.files.some((file) => ['preview_front', 'preview_back'].includes(file.fileRole) && file.isCustomerVisible)
    if (!hasPreview) { setError('請先上傳至少一張排版預覽圖。'); return }
    const customerName = detail.order.recipientName || detail.order.fullName || detail.order.brandName || ''
    const greeting = customerName ? `您好 ${customerName}：` : '您好：'
    const previewDescription = (detail.order.previewNote || previewNote).trim()
    const message = `主旨：名片排版預覽請您確認｜RXV 夢想創作工作室

${greeting}

您的名片排版預覽已完成，請登入 RXV 夢想創作工作室查看並確認：
${window.location.origin}/login

請協助確認以下內容是否正確：
1. 姓名、職稱與公司／品牌名稱
2. 電話、LINE、Email、地址
3. QR Code 是否可正常掃描
4. 文字內容、圖片與整體排版${previewDescription ? `

本次預覽說明：
${previewDescription}` : ''}

如需修改，請登入訂單頁提出一次文字修改需求；確認無誤後，請在預覽頁按下「確認預覽」。

訂單編號：${detail.order.orderCode}

RXV 夢想創作工作室`
    try {
      await navigator.clipboard.writeText(message)
      setPreviewEmailCopied(true)
      setNotice('已複製 Email 通知文字，可直接貼到 Gmail。')
      window.setTimeout(() => setPreviewEmailCopied(false), 2000)
    } catch { setError('複製失敗，請手動複製通知文字。') }
  }

  const copyCustomerMessage = async () => {
    if (!detail) return
    const isPublished = detail.digitalProfile?.status === 'published'
    const publicPath = isPublished && detail.digitalProfile?.publicPath ? `${window.location.origin}${detail.digitalProfile.publicPath}` : ''
    const digitalMessage = detail.digitalProfile
      ? isPublished
        ? `\n一頁式品牌網站：${publicPath}`
        : `\n一頁式品牌網站已建立，請登入網站的「一頁式品牌網站設定」補齊資料並勾選公開；日後商品展示會使用同一個網址。`
      : ''
    const statusMessage = detail.order.status === 'awaiting_customer_confirmation'
      ? '請登入網站查看排版預覽並確認。'
      : detail.order.status === 'awaiting_payment'
        ? '請登入網站查看匯款資訊並回填。'
        : detail.order.status === 'shipped'
          ? `名片已寄出${detail.order.shippingCarrier ? `，物流：${detail.order.shippingCarrier}` : ''}${detail.order.trackingNumber ? `，追蹤號碼：${detail.order.trackingNumber}。` : '。'}`
          : ''
    const message = `您好，您的名片訂單 ${detail.order.orderCode} 目前狀態為「${statusLabel(detail.order.status)}」。${statusMessage}${digitalMessage}`
    try { await navigator.clipboard.writeText(message); setNotice('已複製客戶通知文字，可貼到 Gmail、LINE 或 Messenger。') } catch { setError('無法自動複製通知文字。') }
  }

  const pendingReports = reports.filter((report) => report.orderId === selectedId)
  const previewFiles = detail?.files.filter((file) => ['preview_front', 'preview_back'].includes(file.fileRole)) || []
  const visiblePreviewFiles = previewFiles.filter((file) => file.isCustomerVisible)
  const canUploadOrReplacePreview = Boolean(detail && ['payment_verified', 'awaiting_customer_confirmation', 'revision_requested'].includes(detail.order.status))
  const digitalGiftMonths = detail ? getDigitalGiftMonths(detail.order) : 0

  return <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6"><SEO title="名片訂單完整處理｜RXV 管理後台" description="人工名片訂單、預覽、匯款核對、寄送與數位名片頁管理。"/><div className="mx-auto max-w-7xl">
    <header className="mb-6 rounded-3xl bg-white p-6 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"><div><span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-sm font-black text-rose-800">管理者專用</span><h1 className="mt-2 text-3xl font-black text-slate-950">人工名片訂單完整處理</h1><p className="mt-1 text-slate-600">處理資料確認、預覽上傳、客戶確認、匯款核對、送印寄送與一頁式品牌網站。</p></div><div className="flex flex-wrap gap-2"><Link to="/admin/payments" className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-300 bg-white px-4 py-2 font-black text-slate-700 hover:bg-slate-50">付款與商品頁管理</Link><Link to="/admin/product-image-history" className="inline-flex min-h-[44px] items-center rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 font-black text-emerald-800 hover:bg-emerald-100">商品圖生成紀錄</Link><button type="button" onClick={() => void refresh()} className="inline-flex min-h-[44px] items-center rounded-xl bg-slate-900 px-4 py-2 font-black !text-white hover:bg-slate-800" style={{color:'#fff',WebkitTextFillColor:'#fff'}}>重新整理</button></div></div></header>
    {error ? <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-800">{error}</div> : null}{notice ? <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 font-bold text-emerald-800">{notice}</div> : null}
    <div className="mb-5 flex flex-wrap gap-2">{([['active','處理中'],['payment','待匯款／核對'],['all','全部訂單']] as const).map(([id,label]) => <button key={id} type="button" onClick={() => setFilter(id)} className={`rounded-full px-4 py-2 text-sm font-black ${filter===id ? 'bg-rose-600 text-white' : 'bg-white text-slate-700 shadow-sm border border-slate-200'}`}>{label}</button>)}<span className="self-center text-sm font-bold text-slate-500">待核對名片匯款：{reports.length} 筆</span></div>
    {loading ? <div className="rounded-3xl bg-white p-10 text-center text-slate-600 shadow-sm">正在讀取名片訂單…</div> : <div className="grid gap-6 xl:grid-cols-[330px_minmax(0,1fr)]"><aside className="space-y-3 xl:sticky xl:top-5 xl:h-fit"><p className="px-1 text-sm font-black text-slate-600">訂單清單（{visibleOrders.length}）</p>{visibleOrders.map(order => <button key={order.id} type="button" onClick={() => setSelectedId(order.id)} className={`w-full rounded-2xl border p-4 text-left shadow-sm transition ${selectedId===order.id ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-100' : 'border-slate-200 bg-white hover:border-rose-300'}`}><div className="flex flex-wrap gap-2"><p className="font-mono text-sm font-black text-slate-950">{order.orderCode}</p><span className={`rounded-full px-2 py-1 text-[11px] font-black ${statusClass(order.status)}`}>{statusLabel(order.status)}</span></div><p className="mt-2 text-sm font-bold text-slate-800">{order.brandName || order.fullName || order.customerEmail}</p><p className="mt-1 text-xs text-slate-500">{order.boxCount} 盒・NT${order.totalAmountNtd.toLocaleString()}・附件 {order.filesCount}</p></button>)}{visibleOrders.length===0?<div className="rounded-2xl bg-white p-5 text-center text-slate-500 shadow-sm">目前沒有符合條件的訂單。</div>:null}</aside>
    <section className="min-w-0 rounded-3xl bg-white p-5 shadow-sm sm:p-6">{detailLoading || !detail ? <p className="p-10 text-center text-slate-600">正在讀取訂單詳細內容…</p> : <>
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-mono text-2xl font-black text-slate-950">{detail.order.orderCode}</h2><span className={`rounded-full px-3 py-1 text-xs font-black ${statusClass(detail.order.status)}`}>{statusLabel(detail.order.status)}</span></div><p className="mt-2 break-all text-sm font-bold text-slate-700">{detail.order.customerEmail}</p><p className="mt-1 text-xs text-slate-500">送出：{fmt(detail.order.createdAt)}・最後更新：{fmt(detail.order.updatedAt)}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => void copyCustomerMessage()} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-cyan-300 bg-cyan-50 px-4 py-2 font-black text-cyan-800 hover:bg-cyan-100">複製客戶通知</button>{detail?.digitalProfile ? <button type="button" onClick={() => void copyDigitalPageMessage()} className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-violet-300 bg-violet-50 px-4 py-2 font-black text-violet-800 hover:bg-violet-100">複製個人／公司頁通知</button> : null}</div></div>
      <div className="mt-5 grid gap-4 xl:grid-cols-3"><article className="rounded-2xl border border-slate-200 p-4"><h3 className="font-black text-slate-950">印刷與金額</h3><p className="mt-3 text-sm text-slate-700">{detail.order.serviceType==='print'?'自備完稿代印':'人工排版＋代印'}／{detail.order.printSide==='double'?'雙面':'單面'}／{detail.order.finishType==='matte'?'雙面霧膜':'水晶亮膜'}</p><p className="mt-2 text-sm text-slate-700">{detail.order.boxCount} 盒（{detail.order.quantityCards.toLocaleString()} 張）</p><p className="mt-2 text-sm text-slate-700">模板：{detail.order.templateTitle || '自備完稿'}</p><p className="mt-3 text-xl font-black text-emerald-700">NT${detail.order.totalAmountNtd.toLocaleString()}</p></article><article className="rounded-2xl border border-slate-200 p-4"><h3 className="font-black text-slate-950">名片內容</h3><p className="mt-3 text-sm text-slate-700">品牌：{detail.order.brandName || '—'}</p><p className="mt-1 text-sm text-slate-700">姓名／職稱：{[detail.order.fullName,detail.order.jobTitle].filter(Boolean).join('／') || '—'}</p><p className="mt-1 text-sm text-slate-700">電話：{detail.order.cardPhone || '—'}</p><p className="mt-1 text-sm text-slate-700">LINE：{detail.order.lineId || '—'}</p></article><article className="rounded-2xl border border-slate-200 p-4"><h3 className="font-black text-slate-950">宅配與個人／公司頁</h3><p className="mt-3 text-sm text-slate-700">收件人：{detail.order.recipientName || '—'}</p><p className="mt-1 text-sm text-slate-700">電話：{detail.order.recipientPhone || '—'}</p><p className="mt-1 break-words text-sm text-slate-700">地址：{detail.order.shippingAddress || '—'}</p><p className={`mt-3 text-sm font-black ${detail.order.digitalCardOptIn?'text-violet-700':'text-slate-500'}`}>{detail.order.digitalCardOptIn?'客戶同意開通一頁式品牌網站':'客戶未勾選一頁式品牌網站'}</p></article></div>
      {detail.order.serviceText || detail.order.customerNote ? <div className="mt-4 grid gap-3 lg:grid-cols-2">{detail.order.serviceText?<div className="rounded-2xl bg-slate-50 p-4"><p className="font-black text-slate-950">服務內容</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{detail.order.serviceText}</p></div>:null}{detail.order.customerNote?<div className="rounded-2xl bg-amber-50 p-4"><p className="font-black text-amber-950">客戶備註</p><p className="mt-2 whitespace-pre-wrap text-sm text-amber-900">{detail.order.customerNote}</p></div>:null}</div>:null}
      <section className="mt-6 rounded-2xl border border-slate-200 p-5"><h3 className="font-black text-slate-950">處理狀態與內部備註</h3><div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]"><select value={detail.order.status} disabled={processing} onChange={(event)=>void updateStatus(event.target.value)} className="min-h-[46px] rounded-xl border border-slate-300 bg-white px-3 font-black text-slate-800">{STATUS_OPTIONS.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><button type="button" disabled={processing} onClick={()=>void saveNote()} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-black text-slate-700 hover:bg-slate-50">儲存內部備註</button></div><textarea value={adminNote} onChange={(event)=>setAdminNote(event.target.value)} rows={3} placeholder="只有管理者看得到，例如：缺少 Logo、已聯絡客戶…" className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-900"/></section>
      <section className="mt-6 rounded-2xl border border-cyan-200 bg-cyan-50 p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-black text-cyan-950">上傳排版預覽稿</h3>
            <p className="mt-1 text-sm leading-relaxed text-cyan-800">可上傳正面、背面或只更新其中一面。系統會自動壓縮圖片，降低 Base64 上傳過大造成失敗的情況。</p>
          </div>
          <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${canUploadOrReplacePreview ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
            {canUploadOrReplacePreview ? (detail.order.status === 'payment_verified' ? '可首次上傳' : '可更新新版預覽') : `目前：${statusLabel(detail.order.status)}`}
          </span>
        </div>

        {!canUploadOrReplacePreview ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold leading-relaxed text-amber-900">請先確認客戶匯款入帳；確認後即可首次上傳。客戶提出修改後，也可直接在此重新上傳新版預覽稿。</div> : null}

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="rounded-2xl border border-cyan-200 bg-white p-4 text-sm font-black text-slate-800">
            正面預覽
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={processing || preparingPreviewSide === 'front' || !canUploadOrReplacePreview} onChange={choosePreview('front', setPreviewFront)} className="mt-2 block w-full text-sm font-normal disabled:cursor-not-allowed disabled:opacity-50"/>
            <p className="mt-2 text-xs font-normal leading-relaxed text-slate-500">JPG／PNG／WebP，原檔最多 12MB；上傳前會自動轉成約 1.1MB 內的預覽圖。</p>
            {preparingPreviewSide === 'front' ? <span className="mt-2 block text-xs font-black text-cyan-700">正在壓縮正面預覽圖…</span> : null}
            {previewFront ? <span className="mt-2 block break-all text-xs font-bold leading-relaxed text-cyan-700">已選擇：{previewFront.originalName}<br />上傳大小：{size(previewFront.optimizedBytes)}（原檔 {size(previewFront.originalBytes)}）</span> : null}
          </label>
          <label className="rounded-2xl border border-cyan-200 bg-white p-4 text-sm font-black text-slate-800">
            背面預覽
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={processing || preparingPreviewSide === 'back' || !canUploadOrReplacePreview} onChange={choosePreview('back', setPreviewBack)} className="mt-2 block w-full text-sm font-normal disabled:cursor-not-allowed disabled:opacity-50"/>
            <p className="mt-2 text-xs font-normal leading-relaxed text-slate-500">JPG／PNG／WebP，原檔最多 12MB；上傳前會自動轉成約 1.1MB 內的預覽圖。</p>
            {preparingPreviewSide === 'back' ? <span className="mt-2 block text-xs font-black text-cyan-700">正在壓縮背面預覽圖…</span> : null}
            {previewBack ? <span className="mt-2 block break-all text-xs font-bold leading-relaxed text-cyan-700">已選擇：{previewBack.originalName}<br />上傳大小：{size(previewBack.optimizedBytes)}（原檔 {size(previewBack.originalBytes)}）</span> : null}
          </label>
        </div>

        <textarea value={previewNote} disabled={!canUploadOrReplacePreview || processing} onChange={(event)=>setPreviewNote(event.target.value)} rows={3} placeholder="給客戶的預覽說明，例如：請確認電話、LINE、QR Code 與文字內容。" className="mt-3 w-full rounded-xl border border-cyan-200 bg-white p-3 text-sm text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100"/>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" disabled={processing || Boolean(preparingPreviewSide) || !canUploadOrReplacePreview} onClick={()=>void uploadPreview()} className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-cyan-600 px-5 py-2.5 font-black !text-white hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50" style={{color:'#fff',WebkitTextFillColor:'#fff'}}>{processing?'上傳中…':visiblePreviewFiles.length?'更新預覽並請客戶重新確認':'上傳預覽並開放客戶確認'}</button>
          {visiblePreviewFiles.length?<button type="button" disabled={processing} onClick={()=>void copyPreviewEmailMessage()} className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-cyan-300 bg-white px-5 py-2.5 font-black text-cyan-800 hover:bg-cyan-100 disabled:opacity-50">{previewEmailCopied?'✓ 已複製':'✉ 複製 Email 通知'}</button>:null}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-cyan-800">重新上傳同一面時，舊版會自動改為僅管理者留存，客戶只會看到最新版。</p>
        {visiblePreviewFiles.length?<div className="mt-4 grid gap-3 md:grid-cols-2">{visiblePreviewFiles.map(file=><a key={file.id} href={file.signedUrl} target="_blank" rel="noreferrer" className="overflow-hidden rounded-xl border border-cyan-200 bg-white"><img src={file.signedUrl} alt={file.originalFileName} className="block h-auto w-full"/><p className="px-3 py-2 text-sm font-black text-cyan-800">目前客戶可見：{file.fileRole==='preview_front'?'正面':'背面'}預覽・開啟大圖</p></a>)}</div>:null}
      </section>
      {pendingReports.length?<section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h3 className="font-black text-amber-950">待核對名片匯款</h3><div className="mt-4 space-y-3">{pendingReports.map(report=><article key={report.id} className="rounded-xl bg-white p-4"><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><p className="font-black text-slate-950">{report.payerName}・NT${report.amountNtd.toLocaleString()}・帳號後五碼 {report.accountLastFive}</p><p className="mt-1 text-xs text-slate-500">匯款日期：{fmt(report.transferredAt)}／回報：{fmt(report.createdAt)}</p>{report.note?<p className="mt-2 text-sm text-slate-700">備註：{report.note}</p>:null}</div><div className="flex gap-2"><button type="button" disabled={processing} onClick={()=>void reviewPayment(report,'verified')} className="rounded-xl bg-emerald-600 px-4 py-2.5 font-black text-white hover:bg-emerald-700">確認入帳</button><button type="button" disabled={processing} onClick={()=>void reviewPayment(report,'rejected')} className="rounded-xl border border-rose-300 bg-white px-4 py-2.5 font-black text-rose-700 hover:bg-rose-50">退回</button></div></div></article>)}</div></section>:null}
      <section className="mt-6 grid gap-4 lg:grid-cols-2"><div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><h3 className="font-black text-emerald-950">送印／寄送</h3><p className="mt-1 text-sm text-emerald-900">確認入帳後可先將狀態改為「已送印」。合作印刷廠出貨後，再填物流資訊。</p><div className="mt-4 grid gap-3"><input value={carrier} onChange={(event)=>setCarrier(event.target.value)} placeholder="物流公司，例如：黑貓宅急便" className="rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-slate-900"/><input value={tracking} onChange={(event)=>setTracking(event.target.value)} placeholder="追蹤號碼（選填）" className="rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-slate-900"/><button type="button" disabled={processing} onClick={()=>void markShipped()} className="rounded-xl bg-emerald-600 px-4 py-3 font-black text-white hover:bg-emerald-700">標記已寄出</button></div></div><div className="rounded-2xl border border-violet-200 bg-violet-50 p-5"><h3 className="font-black text-violet-950">一頁式品牌網站</h3>{detail.digitalProfile?<>{detail.digitalProfile.status==='published'?<p className="mt-2 text-sm text-violet-900">已公開：<a href={detail.digitalProfile.publicPath} target="_blank" rel="noreferrer" className="font-black underline">{detail.digitalProfile.publicPath}</a></p>:<><p className="mt-2 text-sm text-violet-900">已建立草稿：{detail.digitalProfile.publicPath}</p><p className="mt-1 text-xs leading-relaxed text-violet-800">請通知客戶登入「一頁式品牌網站設定」補齊資料並勾選公開後，網址才會對外開啟；日後商品展示會使用同一個網址。</p></>}<p className="mt-1 text-xs text-violet-800">到期：{fmt(detail.digitalProfile.expiresAt)}</p></>:digitalGiftMonths===3?<><p className="mt-2 text-sm text-violet-900">本筆人工排版訂單符合贈送資格；付款確認時系統會自動建立 3 個月的一頁式品牌網站基本版草稿。</p><button type="button" disabled={processing} onClick={()=>void grantDigital(3)} className="mt-4 rounded-xl border border-violet-300 bg-white px-4 py-2.5 font-black text-violet-800 hover:bg-violet-100">補開通 3 個月</button><p className="mt-3 rounded-xl border border-violet-200 bg-white/80 p-3 text-sm font-black text-violet-900">本筆訂單應贈：3 個月<br /><span className="text-xs font-normal">{getDigitalGiftText(detail.order)}</span></p></>:<><p className="mt-2 text-sm text-slate-600">本筆訂單未含一頁式品牌網站贈送方案。</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={processing} onClick={()=>void grantDigital(3,true)} className="rounded-xl border border-violet-300 bg-white px-4 py-2.5 font-black text-violet-800 hover:bg-violet-100">人工加碼 3 個月</button><button type="button" disabled={processing} onClick={()=>void grantDigital(6,true)} className="rounded-xl border border-violet-300 bg-white px-4 py-2.5 font-black text-violet-800 hover:bg-violet-100">人工加碼 6 個月</button></div><p className="mt-3 text-xs leading-relaxed text-slate-500">人工加碼僅供特別活動、補償或單獨購買完成後使用。</p></>}</div></section>
      <section className="mt-6"><h3 className="font-black text-slate-950">訂單附件與處理紀錄</h3><div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{detail.files.map(file=><a key={file.id} href={file.signedUrl} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-cyan-300"><p className="break-all font-black text-slate-950">{file.originalFileName}</p><p className="mt-1 text-xs text-slate-500">{file.fileRole}・{file.uploadedByRole==='admin'?'管理者':'客戶'}・{size(file.sizeBytes)}</p><p className="mt-1 text-xs text-cyan-700">開啟私有安全附件 →</p></a>)}</div>{detail.events.length?<ol className="mt-5 space-y-3 border-t border-slate-100 pt-5">{detail.events.map((event:any)=><li key={event.id} className="border-l-2 border-slate-200 pl-4"><p className="text-sm font-bold text-slate-800">{event.message || '訂單狀態已更新。'}</p><p className="mt-1 text-xs text-slate-500">{fmt(event.created_at || event.createdAt)}</p></li>)}</ol>:null}</section>
    </>}</section></div>}
  </div></main>
}
