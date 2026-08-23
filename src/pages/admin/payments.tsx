import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

type BankTransferReport = {
  id: string
  user_id: string
  email: string
  plan_id: '99' | '199' | 'relationship_pro' | 'relationship_business'
  amount_ntd: number
  account_last_five: string
  transferred_at: string
  note: string | null
  status: 'pending'
  created_at: string
}

type DigitalProductOrder = {
  id: string
  order_no: string
  product_code: 'image-bundle-full'
  product_name: string
  email: string
  amount_ntd: number
  account_last_five: string
  transfer_date: string
  status: 'pending' | 'approved' | 'rejected'
  note: string | null
  created_at: string
  processed_at?: string | null
  download_expires_at?: string | null
  download_count?: number
  download_limit?: number
}

type DigitalProductBundleSummary = {
  bundleFile: null | { id: string; version: string; fileName: string; sizeBytes: number; contentType: string; status: string; uploadedAt: string }
  pendingPaymentCount: number
  pendingDeliveryCount: number
  approvedCount: number
}

async function copyTextWithFallback(text: string) {
  const fallbackCopy = () => {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    textarea.remove()
    if (!copied) throw new Error('CLIPBOARD_COPY_FAILED')
  }

  if (!navigator.clipboard?.writeText) {
    fallbackCopy()
    return
  }

  const clipboardResult = await Promise.race([
    navigator.clipboard.writeText(text).then(() => 'copied'),
    new Promise<'timeout'>((resolve) => window.setTimeout(() => resolve('timeout'), 1500)),
  ])
  if (clipboardResult === 'timeout') fallbackCopy()
}

type PaidStorefrontOrder = {
  id: string
  user_id: string
  email: string
  order_no: string
  amount: number
  points: number
  status: string
  created_at: string
}

type StorefrontTrialRequest = {
  id: string
  user_id: string
  email: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | string
  request_note: string | null
  review_note: string | null
  storefront_id: string | null
  entitlement_id: string | null
  reviewed_at: string | null
  created_at: string | null
  updated_at: string | null
}

type BusinessCardOrderStatus =
  | 'submitted'
  | 'reviewing'
  | 'designing'
  | 'preview_ready'
  | 'revision_requested'
  | 'awaiting_customer_confirmation'
  | 'awaiting_payment'
  | 'payment_reported'
  | 'payment_verified'
  | 'printing'
  | 'shipped'
  | 'completed'
  | 'cancelled'

type BusinessCardOrder = {
  id: string
  orderCode: string
  customerEmail: string
  serviceType: 'layout' | 'print' | string
  printSide: 'single' | 'double' | string
  finishType: 'gloss' | 'matte' | string
  quantityCards: number
  boxCount: number
  templateTitle: string | null
  needQr: boolean
  qrLink: string | null
  itemAmountNtd: number
  shippingFeeNtd: number
  totalAmountNtd: number
  brandName: string | null
  fullName: string | null
  jobTitle: string | null
  cardPhone: string | null
  lineId: string | null
  cardEmail: string | null
  websiteUrl: string | null
  serviceText: string | null
  recipientName: string | null
  recipientPhone: string | null
  shippingAddress: string | null
  customerNote: string | null
  adminNote: string | null
  previewNote: string | null
  status: BusinessCardOrderStatus
  revisionCount: number
  filesCount: number
  createdAt: string | null
  updatedAt: string | null
}

type BusinessCardOrderFile = {
  id: string
  fileRole: string
  originalFileName: string
  contentType: string
  sizeBytes: number
  uploadedByRole: string
  isCustomerVisible: boolean
  createdAt: string | null
  signedUrl: string
}

type BusinessCardOrdersResponse = {
  orders: BusinessCardOrder[]
  summary?: {
    newCount?: number
    activeCount?: number
    awaitingPaymentCount?: number
  }
}


type MemberLookupResult = {
  ok: boolean
  found: boolean
  searched_email: string
  member?: {
    email: string
    registered_at: string | null
    remaining_points: number
  }
  purchases?: {
    has_successful_purchase: boolean
    successful_order_count: number
    total_paid_ntd: number
    total_purchased_points: number
    latest_successful_purchase_at: string | null
    latest_order_no: string | null
  }
  bank_transfer_reports?: {
    total_count: number
    pending_count: number
    latest_status: string | null
    latest_created_at: string | null
  }
  storefront?: {
    slug: string
    display_name: string
    status: string
    is_public: boolean
    expires_at: string | null
  } | null
  entitlement?: {
    plan_code: string | null
    max_items: number
    status: string | null
    expires_at: string | null
  } | null
}

function getAuthToken() {
  if (typeof window === 'undefined') return ''
  return (window.localStorage.getItem('auth_token') || window.localStorage.getItem('token') || '').trim()
}

async function apiRequest<T>(action: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const token = getAuthToken()
  if (!token) throw new Error('登入已失效，請重新登入。')

  const response = await fetch(`/api/main?action=${encodeURIComponent(action)}`, {
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

const IMAGE_ADMIN_KEY_STORAGE = 'rxv_image_admin_key'

function getImageBundleAdminKey() {
  if (typeof window === 'undefined') return ''
  let key = (window.sessionStorage.getItem(IMAGE_ADMIN_KEY_STORAGE) || '').trim()
  if (!key) {
    key = window.prompt('請輸入圖片後台管理金鑰（NT$399 素材庫訂單使用）：')?.trim() || ''
    if (key) window.sessionStorage.setItem(IMAGE_ADMIN_KEY_STORAGE, key)
  }
  return key
}

function resetImageBundleAdminKey() {
  if (typeof window === 'undefined') return
  window.sessionStorage.removeItem(IMAGE_ADMIN_KEY_STORAGE)
}

async function imageBundleAdminRequest<T>(action: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const key = getImageBundleAdminKey()
  if (!key) throw new Error('需要圖片後台管理金鑰才能查看 NT$399 素材庫訂單。')

  const response = await fetch(`/api/main?action=image-bundle-r2-${encodeURIComponent(action)}`, {
    method,
    headers: {
      'x-rxv-image-admin-key': key,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      window.sessionStorage.removeItem(IMAGE_ADMIN_KEY_STORAGE)
    }
    throw new Error(String(data?.error || 'NT$399 素材庫訂單操作失敗。'))
  }
  return data as T
}

function formatDate(value: string | null | undefined) {
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

function noticeText(email: string) {
  return `您好，已確認您的付款，並已完成您購買方案的核准與店家商品展示頁開通／展延。

若本次方案包含商品圖點數，點數也已完成加值。

請使用付款時的同一個帳號（${email}）登入後，前往「設定我的商品頁」填寫店名、商品、聯絡方式與封面圖。

完成公開後，可下載 QR Code，用於名片、小卡、菜單、桌牌或社群貼文。

—
RxV 夢想創作工作室
AI 商品圖工具｜LINE 貼圖設計｜店家商品展示頁
官方網站：https://pomodoro-app-eight-rouge.vercel.app
聯絡信箱：rxv0227@gmail.com`
}

function isStorefrontPaymentReport(report: Pick<BankTransferReport, 'note' | 'amount_ntd' | 'plan_id'>) {
  return String(report.note || '').includes('商品展示頁正式版') || (report.plan_id === '199' && Number(report.amount_ntd || 0) === 199 && String(report.note || '').includes('商品展示頁'))
}

function isRelationshipPaymentReport(report: Pick<BankTransferReport, 'plan_id'>) {
  return report.plan_id === 'relationship_pro' || report.plan_id === 'relationship_business'
}

function getBankTransferPlanLabel(report: BankTransferReport) {
  if (report.plan_id === 'relationship_pro') return 'AI 回覆軍師 Pro NT$99／30 天'
  if (report.plan_id === 'relationship_business') return 'AI 回覆軍師 Business Pro NT$299／30 天'
  if (isStorefrontPaymentReport(report)) return '商品展示頁正式版 NT$199／3 個月'
  return `商品圖方案 NT$${report.plan_id}`
}

function formatDateOnly(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

const BUSINESS_CARD_STATUS_OPTIONS: Array<{ id: BusinessCardOrderStatus; label: string }> = [
  { id: 'submitted', label: '已送出需求' },
  { id: 'reviewing', label: '資料確認中' },
  { id: 'designing', label: '排版中' },
  { id: 'preview_ready', label: '預覽稿已上傳' },
  { id: 'revision_requested', label: '客戶要求修改' },
  { id: 'awaiting_customer_confirmation', label: '等待客戶確認' },
  { id: 'awaiting_payment', label: '等待匯款' },
  { id: 'payment_reported', label: '客戶已回填匯款' },
  { id: 'payment_verified', label: '已確認入帳' },
  { id: 'printing', label: '已送印' },
  { id: 'shipped', label: '已寄出' },
  { id: 'completed', label: '已完成' },
  { id: 'cancelled', label: '已取消' },
]

function businessCardStatusLabel(status: string) {
  return BUSINESS_CARD_STATUS_OPTIONS.find((item) => item.id === status)?.label || status || '—'
}

function businessCardStatusClass(status: string) {
  if (status === 'submitted') return 'bg-rose-100 text-rose-800'
  if (['reviewing', 'designing', 'revision_requested'].includes(status)) return 'bg-amber-100 text-amber-800'
  if (['preview_ready', 'awaiting_customer_confirmation', 'awaiting_payment', 'payment_reported'].includes(status)) return 'bg-violet-100 text-violet-800'
  if (['payment_verified', 'printing', 'shipped'].includes(status)) return 'bg-sky-100 text-sky-800'
  if (status === 'completed') return 'bg-emerald-100 text-emerald-800'
  return 'bg-slate-100 text-slate-700'
}

function businessCardServiceLabel(value: string) {
  return value === 'layout' ? '人工排版＋代印' : value === 'print' ? '自備完稿代印' : value || '—'
}

function businessCardSideLabel(value: string) {
  return value === 'double' ? '雙面名片' : value === 'single' ? '單面名片' : value || '—'
}

function businessCardFinishLabel(value: string) {
  return value === 'matte' ? '雙面霧膜' : value === 'gloss' ? '水晶亮膜' : value || '—'
}

function formatFileSize(value: number) {
  if (!value) return '—'
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

export default function AdminPaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [reports, setReports] = useState<BankTransferReport[]>([])
  const [digitalOrders, setDigitalOrders] = useState<DigitalProductOrder[]>([])
  const [digitalBundleSummary, setDigitalBundleSummary] = useState<DigitalProductBundleSummary | null>(null)
  const [bundleFile, setBundleFile] = useState<File | null>(null)
  const bundleFileInputRef = useRef<HTMLInputElement | null>(null)
  const [orders, setOrders] = useState<PaidStorefrontOrder[]>([])
  const [trialRequests, setTrialRequests] = useState<StorefrontTrialRequest[]>([])
  const [businessCardOrders, setBusinessCardOrders] = useState<BusinessCardOrder[]>([])
  const [businessCardFilter, setBusinessCardFilter] = useState<'active' | 'submitted' | 'all'>('active')
  const [selectedBusinessCardOrderId, setSelectedBusinessCardOrderId] = useState('')
  const [businessCardFiles, setBusinessCardFiles] = useState<BusinessCardOrderFile[]>([])
  const [businessCardFilesLoading, setBusinessCardFilesLoading] = useState(false)
  const [processingKey, setProcessingKey] = useState('')
  const [lastCustomerEmail, setLastCustomerEmail] = useState('')
  const [memberEmail, setMemberEmail] = useState('')
  const [memberLookupLoading, setMemberLookupLoading] = useState(false)
  const [memberLookup, setMemberLookup] = useState<MemberLookupResult | null>(null)
  const [legacyNotice, setLegacyNotice] = useState('')

  const loadImageBundleOrders = async () => {
    const [digitalOrderData, digitalBundleData] = await Promise.all([
      imageBundleAdminRequest<{ orders: DigitalProductOrder[] }>('list', 'GET'),
      imageBundleAdminRequest<DigitalProductBundleSummary>('summary', 'GET'),
    ])
    setDigitalOrders(Array.isArray(digitalOrderData.orders) ? digitalOrderData.orders : [])
    setDigitalBundleSummary(digitalBundleData)
  }

  const load = async () => {
    setLoading(true)
    setError('')
    setLegacyNotice('')

    let r2Loaded = false
    try {
      await loadImageBundleOrders()
      r2Loaded = true
    } catch (err: any) {
      setError(err?.message || '讀取 NT$399 素材庫 R2 訂單失敗。')
    }

    const token = getAuthToken()
    if (!token) {
      setLegacyNotice('Supabase 會員／其他付款功能目前維護中；NT$399 圖片素材庫訂單已獨立使用 R2，可正常收件與核款。')
      setLoading(false)
      return
    }

    try {
      const [reportData, orderData, trialData, businessCardData] = await Promise.all([
        apiRequest<{ reports: BankTransferReport[] }>('admin-list-bank-transfer-reports', 'GET'),
        apiRequest<{ orders: PaidStorefrontOrder[] }>('admin-list-paid-storefront-orders', 'GET'),
        apiRequest<{ requests: StorefrontTrialRequest[] }>('admin-list-storefront-trial-requests', 'GET'),
        apiRequest<BusinessCardOrdersResponse>('admin-list-business-card-orders', 'GET'),
      ])
      setReports(Array.isArray(reportData.reports) ? reportData.reports : [])
      setOrders(Array.isArray(orderData.orders) ? orderData.orders : [])
      setTrialRequests(Array.isArray(trialData.requests) ? trialData.requests : [])
      setBusinessCardOrders(Array.isArray(businessCardData.orders) ? businessCardData.orders : [])
    } catch (err: any) {
      setLegacyNotice(
        r2Loaded
          ? 'Supabase 目前受額度限制，會員／其他付款資料暫時無法讀取；NT$399 圖片素材庫 R2 訂單仍可正常管理。'
          : (err?.message || '讀取其他付款管理資料失敗。'),
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const lookupMember = async () => {
    const email = memberEmail.trim().toLowerCase()
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMemberLookup(null)
      setError('請輸入要查詢的會員 Email。')
      return
    }

    const token = getAuthToken()
    if (!token) {
      setError('登入已失效，請重新登入。')
      return
    }

    setMemberLookupLoading(true)
    setError('')
    setMessage('')

    try {
      const response = await fetch(
        `/api/main?action=admin-member-lookup&email=${encodeURIComponent(email)}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(String(data?.error || '查詢會員資料失敗。'))
      setMemberLookup(data as MemberLookupResult)
    } catch (err: any) {
      setMemberLookup(null)
      setError(err?.message || '查詢會員資料失敗。')
    } finally {
      setMemberLookupLoading(false)
    }
  }

  const clearMemberLookup = () => {
    setMemberEmail('')
    setMemberLookup(null)
  }

  const approveDigitalOrder = async (order: DigitalProductOrder) => {
    if (!window.confirm(`請先確認銀行實際入帳 NT$399。\n確認後將核准此訂單；可再複製 7 天有效的 R2 ZIP 下載連結。\n\n訂單：${order.order_no}\nEmail：${order.email}`)) return
    setProcessingKey(`digital-${order.id}`)
    setError('')
    setMessage('')
    try {
      await imageBundleAdminRequest('approve', 'POST', { orderId: order.id })
      setMessage(`已確認收款：${order.order_no}／${order.email}。`)
      await loadImageBundleOrders()
    } catch (err: any) {
      setError(err?.message || '確認素材庫收款失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const rejectDigitalOrder = async (order: DigitalProductOrder) => {
    const reviewNote = window.prompt('請輸入拒絕原因（可留白）：') ?? ''
    if (!window.confirm(`確定要拒絕 ${order.order_no} 的匯款回報？`)) return
    setProcessingKey(`digital-reject-${order.id}`)
    setError('')
    setMessage('')
    try {
      await imageBundleAdminRequest('reject', 'POST', { orderId: order.id, reviewNote })
      setMessage(`已拒絕 ${order.order_no} 的匯款回報。`)
      await loadImageBundleOrders()
    } catch (err: any) {
      setError(err?.message || '拒絕素材庫匯款回報失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const uploadDigitalBundle = async () => {
    if (!bundleFile) {
      setError('請先選擇 ZIP 檔。')
      return
    }
    if (!bundleFile.name.toLowerCase().endsWith('.zip')) {
      setError('交付檔必須是 ZIP 檔。')
      return
    }
    setProcessingKey('digital-bundle-upload')
    setError('')
    setMessage('')
    try {
      const prepare = await imageBundleAdminRequest<{ objectKey: string; fileName: string; uploadUrl: string }>('prepare-bundle-upload', 'POST', { fileName: bundleFile.name })
      const upload = await fetch(prepare.uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'application/zip' }, body: bundleFile })
      if (!upload.ok) throw new Error(`私有 ZIP 上傳失敗（HTTP ${upload.status}）`)
      await imageBundleAdminRequest('complete-bundle-upload', 'POST', { objectKey: prepare.objectKey, fileName: prepare.fileName })
      setBundleFile(null)
      if (bundleFileInputRef.current) bundleFileInputRef.current.value = ''
      setMessage('圖片素材庫 ZIP 已更新，已核准訂單現在可交付。')
      await loadImageBundleOrders()
    } catch (err: any) {
      setError(err?.message || '上傳圖片素材庫 ZIP 失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const deleteDigitalBundle = async () => {
    if (!digitalBundleSummary?.bundleFile) return
    if (!window.confirm('確定要刪除目前的圖片素材庫交付 ZIP 嗎？已核准訂單將暫時無法下載。')) return
    setProcessingKey('digital-bundle-delete')
    setError('')
    setMessage('')
    try {
      await imageBundleAdminRequest('delete-bundle', 'POST')
      setMessage('圖片素材庫交付 ZIP 已刪除。')
      await loadImageBundleOrders()
    } catch (err: any) {
      setError(err?.message || '刪除圖片素材庫交付 ZIP 失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const deleteDigitalTestOrder = async (order: DigitalProductOrder) => {
    setProcessingKey(`digital-test-delete-${order.id}`)
    setError('')
    setMessage('')
    try {
      await imageBundleAdminRequest('delete-test-order', 'POST', { orderId: order.id })
      setMessage('TEST order deleted.')
      await loadImageBundleOrders()
    } catch (err: any) {
      setError(err?.message || 'Unable to delete the TEST order.')
    } finally {
      setProcessingKey('')
    }
  }

  const copyDigitalOrderDownloadLink = async (order: DigitalProductOrder) => {
    setProcessingKey(`digital-link-${order.id}`)
    setError('')
    setMessage('')
    try {
      const data = await imageBundleAdminRequest<{ downloadUrl: string }>('download-link', 'POST', { orderId: order.id })
      await copyTextWithFallback(data.downloadUrl)
      setMessage(`已複製 ${order.order_no} 的客戶下載連結。`)
    } catch (err: any) {
      setError(err?.message || '複製客戶下載連結失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const approveReport = async (report: BankTransferReport) => {
    const relationshipPlan = isRelationshipPaymentReport(report)
    const storefrontOnly = isStorefrontPaymentReport(report)
    const confirmText = relationshipPlan
      ? `確認已收到 ${report.email} 的 ${getBankTransferPlanLabel(report)} 匯款？\n\n確認後會開通或續期 AI 回覆軍師 30 天；同一筆回報不會重複展延。`
      : storefrontOnly
      ? `確認已收到 ${report.email} 的 NT$${report.amount_ntd} 商品展示頁匯款？\n\n確認後會開通或展延商品展示頁；此操作不能重複執行。`
      : `確認已收到 ${report.email} 的 NT$${report.amount_ntd} 匯款？\n\n確認後會：\n1. 加點\n2. 開通或展延商品展示頁\n3. 此操作不能重複執行`
    if (!window.confirm(confirmText)) {
      return
    }

    setProcessingKey(`report-${report.id}`)
    setError('')
    setMessage('')
    try {
      await apiRequest('admin-approve-bank-transfer-report', 'POST', { reportId: report.id })
      setLastCustomerEmail(report.email)
      setMessage(relationshipPlan
        ? `已確認收款：已開通／續期 ${report.email} 的 AI 回覆軍師方案 30 天。`
        : storefrontOnly
        ? `已確認收款：已開通／展延 ${report.email} 的商品展示頁。`
        : `已確認收款：已加點並開通／展延 ${report.email} 的商品展示頁。`)
      await load()
    } catch (err: any) {
      setError(err?.message || '確認收款失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const rejectReport = async (report: BankTransferReport) => {
    const reviewNote = window.prompt('請輸入拒絕原因（會保留在後台紀錄，可留白）：') ?? ''
    if (!window.confirm(`確定要拒絕 ${report.email} 的匯款回報？`)) return

    setProcessingKey(`reject-${report.id}`)
    setError('')
    setMessage('')
    try {
      await apiRequest('admin-reject-bank-transfer-report', 'POST', { reportId: report.id, reviewNote })
      setMessage(`已拒絕 ${report.email} 的匯款回報。`)
      await load()
    } catch (err: any) {
      setError(err?.message || '拒絕匯款回報失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const grantOrder = async (order: PaidStorefrontOrder) => {
    if (!window.confirm(`確認為 ${order.email || '此帳號'} 開通商品展示頁？\n\n此筆刷卡訂單的點數已經自動加值；這個動作只開通／展延商品展示頁。`)) {
      return
    }

    setProcessingKey(`order-${order.order_no}`)
    setError('')
    setMessage('')
    try {
      await apiRequest('admin-grant-storefront-for-purchase', 'POST', { orderNo: order.order_no })
      setLastCustomerEmail(order.email)
      setMessage(`已開通／展延 ${order.email || '客戶'} 的商品展示頁。`)
      await load()
    } catch (err: any) {
      setError(err?.message || '開通商品展示頁失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const approveTrialRequest = async (request: StorefrontTrialRequest) => {
    if (!window.confirm(`確認開通 ${request.email} 的 7 天免費試用？\n\n開通後最多可建立 1 個展示商品，同一帳號不能重複試用。`)) return

    setProcessingKey(`trial-${request.id}`)
    setError('')
    setMessage('')
    try {
      const data = await apiRequest<{ expiresAt?: string; publicPath?: string; message?: string }>('admin-approve-storefront-trial-request', 'POST', { requestId: request.id })
      setMessage(`${data.message || '已開通 7 天試用。'} 到期日：${formatDate(data.expiresAt)}${data.publicPath ? `｜網址：${data.publicPath}` : ''}`)
      await load()
    } catch (err: any) {
      setError(err?.message || '開通 7 天試用失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const rejectTrialRequest = async (request: StorefrontTrialRequest) => {
    const reviewNote = window.prompt('請輸入拒絕原因（內部備註，可留白）：') ?? ''
    if (!window.confirm(`確定要拒絕 ${request.email} 的 7 天試用申請？`)) return

    setProcessingKey(`trial-reject-${request.id}`)
    setError('')
    setMessage('')
    try {
      await apiRequest('admin-reject-storefront-trial-request', 'POST', { requestId: request.id, reviewNote })
      setMessage(`已拒絕 ${request.email} 的 7 天試用申請。`)
      await load()
    } catch (err: any) {
      setError(err?.message || '拒絕 7 天試用申請失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const copyNotice = async () => {
    if (!lastCustomerEmail) return
    try {
      await navigator.clipboard.writeText(noticeText(lastCustomerEmail))
      setMessage('已複製通知文字，可貼到 Gmail 寄給客戶。')
    } catch {
      setError('無法自動複製通知文字，請手動複製。')
    }
  }

  const updateBusinessCardStatus = async (order: BusinessCardOrder, status: BusinessCardOrderStatus) => {
    if (status === order.status) return
    if (!window.confirm(`要將名片訂單 ${order.orderCode} 更新為「${businessCardStatusLabel(status)}」嗎？`)) return

    setProcessingKey(`business-card-${order.id}`)
    setError('')
    setMessage('')
    try {
      await apiRequest('admin-update-business-card-order', 'POST', { orderId: order.id, status })
      setMessage(`已更新名片訂單 ${order.orderCode}：${businessCardStatusLabel(status)}。`)
      await load()
    } catch (err: any) {
      setError(err?.message || '更新名片訂單狀態失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const updateBusinessCardAdminNote = async (order: BusinessCardOrder) => {
    const nextNote = window.prompt(`更新 ${order.orderCode} 的內部備註（客戶不會看到）：`, order.adminNote || '')
    if (nextNote === null) return

    setProcessingKey(`business-card-note-${order.id}`)
    setError('')
    setMessage('')
    try {
      await apiRequest('admin-update-business-card-order', 'POST', {
        orderId: order.id,
        status: order.status,
        adminNote: nextNote,
      })
      setMessage(`已更新名片訂單 ${order.orderCode} 的內部備註。`)
      await load()
    } catch (err: any) {
      setError(err?.message || '更新名片訂單備註失敗。')
    } finally {
      setProcessingKey('')
    }
  }

  const toggleBusinessCardFiles = async (order: BusinessCardOrder) => {
    if (selectedBusinessCardOrderId === order.id) {
      setSelectedBusinessCardOrderId('')
      setBusinessCardFiles([])
      return
    }

    const token = getAuthToken()
    if (!token) {
      setError('登入已失效，請重新登入。')
      return
    }

    setSelectedBusinessCardOrderId(order.id)
    setBusinessCardFiles([])
    setBusinessCardFilesLoading(true)
    setError('')
    try {
      const response = await fetch(
        `/api/main?action=admin-get-business-card-order-files&orderId=${encodeURIComponent(order.id)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(String(data?.error || '讀取名片附件失敗。'))
      setBusinessCardFiles(Array.isArray(data?.files) ? data.files : [])
    } catch (err: any) {
      setSelectedBusinessCardOrderId('')
      setBusinessCardFiles([])
      setError(err?.message || '讀取名片附件失敗。')
    } finally {
      setBusinessCardFilesLoading(false)
    }
  }

  const filteredBusinessCardOrders = businessCardOrders.filter((order) => {
    if (businessCardFilter === 'all') return true
    if (businessCardFilter === 'submitted') return order.status === 'submitted'
    return !['completed', 'cancelled'].includes(order.status)
  })
  const newBusinessCardOrderCount = businessCardOrders.filter((order) => order.status === 'submitted').length
  const activeBusinessCardOrderCount = businessCardOrders.filter((order) => !['completed', 'cancelled'].includes(order.status)).length

  if (loading) {
    return <main className="min-h-screen bg-slate-50 px-4 py-12 text-center text-slate-600">正在讀取付款管理資料…</main>
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-sm font-black text-violet-800">管理者專用</span>
            <h1 className="mt-2 text-3xl font-black text-slate-950">付款、商品頁與名片訂單管理</h1>
            <p className="mt-1 text-slate-600">銀行轉帳核對、商品展示頁開通與人工名片訂單都在這裡處理。</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/admin/business-card-orders"
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-rose-600 px-5 py-3 font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-rose-700 hover:shadow-md"
              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
            >
              名片訂單完整處理
            </Link>
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-black text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-md"
            >
              重新整理
            </button>
          </div>
        </header>

        <a href="#image-bundle" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-5 shadow-sm transition hover:bg-amber-100">
          <div>
            <p className="text-sm font-black text-amber-700">R2 獨立收款｜不受 Supabase 402 影響</p>
            <p className="mt-1 text-xl font-black text-slate-950">NT$399 圖片素材庫訂單</p>
          </div>
          <span className="rounded-full bg-amber-600 px-4 py-2 font-black !text-white">{digitalOrders.filter((order) => order.status === 'pending').length} 筆待核款</span>
        </a>

        {legacyNotice ? <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 font-semibold text-amber-900">{legacyNotice}</div> : null}

        <section className="mb-6 rounded-2xl border border-violet-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-sm font-black text-violet-800">會員查詢</span>
              <h2 className="mt-2 text-xl font-black text-slate-950">查詢會員點數、購買與商品頁狀態</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                輸入完整 Email，可查看註冊日期、目前剩餘點數、成功購買摘要、匯款回報與商品展示頁狀態。
              </p>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] lg:max-w-2xl">
              <input
                type="email"
                value={memberEmail}
                onChange={(event) => setMemberEmail(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void lookupMember()
                }}
                placeholder="輸入會員 Email，例如 customer@example.com"
                className="min-h-[46px] min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
              <button
                type="button"
                disabled={memberLookupLoading}
                onClick={() => void lookupMember()}
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-violet-600 px-5 py-3 font-black !text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
              >
                {memberLookupLoading ? '查詢中…' : '查詢會員'}
              </button>
              {memberLookup ? (
                <button
                  type="button"
                  onClick={clearMemberLookup}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  清除
                </button>
              ) : null}
            </div>
          </div>

          {memberLookup ? (
            <div className="mt-5">
              {!memberLookup.found || !memberLookup.member ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
                  找不到 <span className="break-all font-black">{memberLookup.searched_email}</span> 的會員帳號。
                </div>
              ) : (
                <div className="grid gap-4 xl:grid-cols-2">
                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-black text-slate-950">會員與可用點數</h3>
                    <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                      <div>
                        <dt className="font-bold text-slate-500">會員 Email</dt>
                        <dd className="mt-1 break-all font-black text-slate-950">{memberLookup.member.email}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-500">註冊日期</dt>
                        <dd className="mt-1 font-black text-slate-950">{formatDate(memberLookup.member.registered_at)}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-500">目前剩餘點數</dt>
                        <dd className="mt-1 text-lg font-black text-emerald-700">
                          {Number(memberLookup.member.remaining_points || 0).toLocaleString()} 點
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-500">是否已有成功刷卡訂單</dt>
                        <dd className={`mt-1 font-black ${memberLookup.purchases?.has_successful_purchase ? 'text-emerald-700' : 'text-slate-600'}`}>
                          {memberLookup.purchases?.has_successful_purchase ? '是' : '尚未查到'}
                        </dd>
                      </div>
                    </dl>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <h3 className="text-lg font-black text-slate-950">付款與匯款回報</h3>
                    <dl className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                      <div>
                        <dt className="font-bold text-slate-500">成功刷卡訂單</dt>
                        <dd className="mt-1 font-black text-slate-950">{Number(memberLookup.purchases?.successful_order_count || 0)} 筆</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-500">成功刷卡累積金額</dt>
                        <dd className="mt-1 font-black text-slate-950">NT${Number(memberLookup.purchases?.total_paid_ntd || 0).toLocaleString()}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-500">累積刷卡購買點數</dt>
                        <dd className="mt-1 font-black text-slate-950">
                          {Number(memberLookup.purchases?.total_purchased_points || 0).toLocaleString()} 點
                        </dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-500">最近成功刷卡</dt>
                        <dd className="mt-1 font-black text-slate-950">{formatDate(memberLookup.purchases?.latest_successful_purchase_at)}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-500">最近訂單編號</dt>
                        <dd className="mt-1 break-all font-mono text-xs font-bold text-slate-800">{memberLookup.purchases?.latest_order_no || '—'}</dd>
                      </div>
                      <div>
                        <dt className="font-bold text-slate-500">匯款回報</dt>
                        <dd className={`mt-1 font-black ${Number(memberLookup.bank_transfer_reports?.pending_count || 0) > 0 ? 'text-rose-700' : 'text-slate-700'}`}>
                          共 {Number(memberLookup.bank_transfer_reports?.total_count || 0)} 筆／待核對 {Number(memberLookup.bank_transfer_reports?.pending_count || 0)} 筆
                        </dd>
                      </div>
                    </dl>
                  </article>

                  <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
                    <h3 className="text-lg font-black text-slate-950">店家商品展示頁</h3>
                    {memberLookup.storefront ? (
                      <div className="mt-3 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                        <p><span className="font-bold">店名：</span>{memberLookup.storefront.display_name || '尚未填寫'}</p>
                        <p>
                          <span className="font-bold">頁面狀態：</span>
                          {memberLookup.storefront.status || 'draft'}{memberLookup.storefront.is_public ? '｜已公開' : '｜未公開'}
                        </p>
                        <p><span className="font-bold">商品上限：</span>{Number(memberLookup.entitlement?.max_items || 0)} 個</p>
                        <p><span className="font-bold">到期日：</span>{formatDate(memberLookup.storefront.expires_at || memberLookup.entitlement?.expires_at)}</p>
                        <p className="sm:col-span-2"><span className="font-bold">方案：</span>{memberLookup.entitlement?.plan_code || '—'}</p>
                        {memberLookup.storefront.slug ? (
                          <p className="sm:col-span-2">
                            <Link
                              to={`/shop/${memberLookup.storefront.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex min-h-[42px] items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 py-2 font-black text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md"
                            >
                              查看公開商品頁
                            </Link>
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-600">尚未開通店家商品展示頁。</p>
                    )}
                  </article>
                </div>
              )}
            </div>
          ) : null}
        </section>

        {error ? <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-800">{error}</div> : null}
        {message ? <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 font-semibold text-emerald-800">{message}</div> : null}

        {lastCustomerEmail ? (
          <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <h2 className="text-lg font-black text-blue-950">通知客戶</h2>
            <p className="mt-1 text-sm text-blue-800">已處理帳號：{lastCustomerEmail}。可複製固定通知文字，貼到 Gmail 後寄出。</p>
            <button
              type="button"
              onClick={() => void copyNotice()}
              className="mt-4 inline-flex min-h-[44px] rounded-xl bg-blue-600 px-5 py-2.5 font-black !text-white shadow-sm transition hover:bg-blue-700"
              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
            >
              複製通知文字
            </button>
          </section>
        ) : null}

        <section className="mb-8 rounded-2xl border border-emerald-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-950">7 天試用申請待審核</h2>
              <p className="mt-1 text-sm text-slate-600">客戶送出申請後會出現在這裡；審核通過才會開通 1 個商品展示頁、有效 7 天。</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-black text-emerald-800">{trialRequests.length} 筆待處理</span>
          </div>

          {trialRequests.length === 0 ? (
            <p className="mt-6 rounded-xl bg-slate-50 p-5 text-center text-slate-500">目前沒有待審核的 7 天試用申請。</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {trialRequests.map((request) => (
                <article key={request.id} className="rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="break-all text-lg font-black text-slate-950">{request.email}</p>
                      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                        <p><span className="font-bold">狀態：</span>{request.status || 'pending'}</p>
                        <p><span className="font-bold">申請時間：</span>{formatDate(request.created_at)}</p>
                        <p><span className="font-bold">會員 ID：</span><span className="font-mono text-xs">{request.user_id}</span></p>
                        <p><span className="font-bold">試用內容：</span>7 天／最多 1 個展示商品</p>
                      </div>
                      {request.request_note ? <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><span className="font-bold">申請備註：</span>{request.request_note}</p> : null}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                      <button
                        type="button"
                        disabled={Boolean(processingKey)}
                        onClick={() => void approveTrialRequest(request)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-black !text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                      >
                        {processingKey === `trial-${request.id}` ? '開通中…' : '審核通過、開通試用'}
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(processingKey)}
                        onClick={() => void rejectTrialRequest(request)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-rose-300 bg-white px-5 py-3 font-black text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingKey === `trial-reject-${request.id}` ? '處理中…' : '拒絕試用'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="image-bundle" className="mb-8 rounded-2xl border border-amber-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-950">圖片素材庫 NT$399 訂單</h2>
              <p className="mt-1 text-sm text-slate-600">請先確認銀行實際入帳 NT$399；核准後可產生 7 天有效的 R2 ZIP 下載連結。</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-black text-amber-800">{digitalBundleSummary?.pendingPaymentCount ?? digitalOrders.filter((order) => order.status === 'pending').length} 筆待核款</span>
              <button
                type="button"
                onClick={() => {
                  resetImageBundleAdminKey()
                  setMessage('已清除圖片後台管理金鑰；重新整理或再次操作時會重新詢問。')
                }}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-black text-slate-700 transition hover:bg-slate-50"
              >
                重設圖片管理金鑰
              </button>
            </div>
          </div>

          <div className={`mt-5 rounded-2xl border p-4 ${digitalBundleSummary?.bundleFile ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black text-slate-950">圖片素材庫交付檔</p>
                {digitalBundleSummary?.bundleFile ? (
                  <div className="mt-1 text-sm leading-6 text-slate-700">
                    <p>目前版本：{digitalBundleSummary.bundleFile.version}</p>
                    <p className="break-all">檔名：{digitalBundleSummary.bundleFile.fileName}</p>
                    <p>檔案大小：{formatFileSize(digitalBundleSummary.bundleFile.sizeBytes)}　上傳時間：{formatDate(digitalBundleSummary.bundleFile.uploadedAt)}</p>
                    <p className="font-bold text-emerald-700">狀態：可交付</p>
                  </div>
                ) : (
                  <p className="mt-1 font-bold text-rose-700">已收款，尚無可交付檔（{digitalBundleSummary?.pendingDeliveryCount || 0} 筆待交付）</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input ref={bundleFileInputRef} type="file" accept="application/zip,.zip" onChange={(event) => setBundleFile(event.target.files?.[0] || null)} className="max-w-[220px] text-sm" />
                <button type="button" disabled={Boolean(processingKey) || !bundleFile} onClick={() => void uploadDigitalBundle()} className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-slate-900 px-4 py-3 font-black !text-white disabled:opacity-50">
                  {processingKey === 'digital-bundle-upload' ? '上傳中…' : '上傳／更新完整版 ZIP'}
                </button>
                {digitalBundleSummary?.bundleFile ? <button type="button" disabled={Boolean(processingKey)} onClick={() => void deleteDigitalBundle()} className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-rose-300 bg-white px-4 py-3 font-black text-rose-700 disabled:opacity-50">
                  {processingKey === 'digital-bundle-delete' ? '刪除中…' : '刪除目前 ZIP'}
                </button> : null}
              </div>
            </div>
          </div>

          {digitalOrders.length === 0 ? (
            <p className="mt-6 rounded-xl bg-slate-50 p-5 text-center text-slate-500">目前沒有圖片素材庫訂單。</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {digitalOrders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-amber-200 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-amber-700">{order.order_no}</p>
                      <p className="mt-1 break-all text-lg font-black text-slate-950">{order.email}</p>
                      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                        <p><span className="font-bold">商品：</span>1,583+ 高畫質圖片素材庫完整版</p>
                        <p><span className="font-bold">金額：</span>NT${order.amount_ntd}</p>
                        <p><span className="font-bold">帳號末五碼：</span><span className="font-mono">{order.account_last_five}</span></p>
                        <p><span className="font-bold">匯款日期：</span>{formatDateOnly(order.transfer_date)}</p>
                        <p><span className="font-bold">送出時間：</span>{formatDate(order.created_at)}</p>
                        <p><span className="font-bold">狀態：</span>{order.status === 'approved' ? '已確認收款' : order.status === 'rejected' ? '已拒絕' : '待核對'}</p>
                        {order.status === 'approved' ? <p><span className="font-bold">下載連結期限：</span>{formatDate(order.download_expires_at)}　<span className="text-slate-500">已下載 {Number(order.download_count || 0)} / {Number(order.download_limit || 3)} 次</span></p> : null}
                        {order.status === 'approved' ? <p className={digitalBundleSummary?.bundleFile ? 'font-bold text-emerald-700' : 'font-bold text-rose-700'}>{digitalBundleSummary?.bundleFile ? '可交付' : '已收款，尚無可交付檔'}</p> : null}
                      </div>
                      {order.note ? <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><span className="font-bold">備註：</span>{order.note}</p> : null}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                      {order.status === 'pending' ? <button
                        type="button"
                        disabled={Boolean(processingKey)}
                        onClick={() => void approveDigitalOrder(order)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-black !text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        {processingKey === `digital-${order.id}` ? '處理中…' : '確認已收款'}
                      </button>
                      : null}
                      {order.status === 'pending' ? <button
                        type="button"
                        disabled={Boolean(processingKey)}
                        onClick={() => void rejectDigitalOrder(order)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-rose-300 bg-white px-5 py-3 font-black text-rose-700 transition hover:bg-rose-50 disabled:opacity-50"
                      >
                        {processingKey === `digital-reject-${order.id}` ? '處理中…' : '拒絕'}
                      </button>
                      : null}
                      {order.status === 'pending' && /CODEX DELIVERY E2E TEST/i.test(order.note || '') ? <button
                        type="button"
                        disabled={Boolean(processingKey)}
                        onClick={() => void deleteDigitalTestOrder(order)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-amber-300 bg-white px-5 py-3 font-black text-amber-800 transition hover:bg-amber-50 disabled:opacity-50"
                      >
                        {processingKey === `digital-test-delete-${order.id}` ? 'Cleaning…' : 'Delete TEST order'}
                      </button> : null}
                      {order.status === 'approved' ? <button
                        type="button"
                        disabled={Boolean(processingKey) || !digitalBundleSummary?.bundleFile}
                        onClick={() => void copyDigitalOrderDownloadLink(order)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-sky-300 bg-white px-5 py-3 font-black text-sky-800 transition hover:bg-sky-50 disabled:opacity-50"
                      >
                        {processingKey === `digital-link-${order.id}` ? '取得中…' : '複製客戶下載連結'}
                      </button> : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mb-8 rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-950">銀行轉帳待核對</h2>
              <p className="mt-1 text-sm text-slate-600">確認銀行實際入帳後，再按「確認收款並處理」。商品展示頁專用匯款會以備註辨識。</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-black text-amber-800">{reports.length} 筆待處理</span>
          </div>

          {reports.length === 0 ? (
            <p className="mt-6 rounded-xl bg-slate-50 p-5 text-center text-slate-500">目前沒有待核對的銀行轉帳回報。</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {reports.map((report) => (
                <article key={report.id} className="rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="break-all text-lg font-black text-slate-950">{report.email}</p>
                      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                        <p><span className="font-bold">方案：</span>{getBankTransferPlanLabel(report)}</p>
                        <p><span className="font-bold">回報金額：</span>NT${report.amount_ntd}</p>
                        <p><span className="font-bold">帳號末五碼：</span><span className="font-mono">{report.account_last_five}</span></p>
                        <p><span className="font-bold">匯款日期：</span>{formatDateOnly(report.transferred_at)}</p>
                        <p><span className="font-bold">送出時間：</span>{formatDate(report.created_at)}</p>
                      </div>
                      {report.note ? <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><span className="font-bold">備註：</span>{report.note}</p> : null}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                      <button
                        type="button"
                        disabled={Boolean(processingKey)}
                        onClick={() => void approveReport(report)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-black !text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                        style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                      >
                        {processingKey === `report-${report.id}` ? '處理中…' : isRelationshipPaymentReport(report) ? '確認收款、開通 AI 方案' : isStorefrontPaymentReport(report) ? '確認收款、開通展示頁' : '確認收款、加點並開通'}
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(processingKey)}
                        onClick={() => void rejectReport(report)}
                        className="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-rose-300 bg-white px-5 py-3 font-black text-rose-700 shadow-sm transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {processingKey === `reject-${report.id}` ? '處理中…' : '拒絕回報'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-slate-950">刷卡成功待開通商品頁</h2>
              <p className="mt-1 text-sm text-slate-600">綠界付款成功時已自動加點；你確認訂單後，在這裡人工開通或展延商品展示頁。</p>
            </div>
            <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sm font-black text-sky-800">{orders.length} 筆待開通</span>
          </div>

          {orders.length === 0 ? (
            <p className="mt-6 rounded-xl bg-slate-50 p-5 text-center text-slate-500">目前沒有待開通的刷卡訂單。</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <p className="break-all text-lg font-black text-slate-950">{order.email || '未取得 Email'}</p>
                      <div className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
                        <p><span className="font-bold">訂單編號：</span><span className="font-mono">{order.order_no}</span></p>
                        <p><span className="font-bold">付款金額：</span>NT${order.amount}</p>
                        <p><span className="font-bold">點數：</span>{Number(order.points || 0).toLocaleString()} 點</p>
                        <p><span className="font-bold">付款時間：</span>{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={Boolean(processingKey)}
                      onClick={() => void grantOrder(order)}
                      className="inline-flex min-h-[46px] shrink-0 items-center justify-center rounded-xl bg-sky-600 px-5 py-3 font-black !text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                    >
                      {processingKey === `order-${order.order_no}` ? '處理中…' : '開通商品展示頁'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="inline-flex rounded-full bg-rose-100 px-3 py-1 text-sm font-black text-rose-800">人工名片訂單</span>
              <h2 className="mt-2 text-2xl font-black text-slate-950">名片訂單待處理</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">可查看客戶資料、宅配資訊與私有附件，並更新排版、付款、送印與寄件進度。</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-rose-100 px-3 py-1.5 text-sm font-black text-rose-800">新需求 {newBusinessCardOrderCount} 筆</span>
              <span className="rounded-full bg-sky-100 px-3 py-1.5 text-sm font-black text-sky-800">進行中 {activeBusinessCardOrderCount} 筆</span>
              <select
                value={businessCardFilter}
                onChange={(event) => setBusinessCardFilter(event.target.value as 'active' | 'submitted' | 'all')}
                className="min-h-[40px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-700 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-100"
              >
                <option value="active">顯示進行中</option>
                <option value="submitted">只看新需求</option>
                <option value="all">顯示全部</option>
              </select>
            </div>
          </div>

          {filteredBusinessCardOrders.length === 0 ? (
            <p className="mt-6 rounded-xl bg-slate-50 p-5 text-center text-slate-500">目前沒有符合條件的名片訂單。</p>
          ) : (
            <div className="mt-6 grid gap-5">
              {filteredBusinessCardOrders.map((order) => {
                const isFilesOpen = selectedBusinessCardOrderId === order.id
                const isProcessing = Boolean(processingKey)
                return (
                  <article key={order.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-mono text-lg font-black text-slate-950">{order.orderCode}</p>
                            <span className={`rounded-full px-3 py-1 text-xs font-black ${businessCardStatusClass(order.status)}`}>{businessCardStatusLabel(order.status)}</span>
                            {order.filesCount > 0 ? <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-800">附件 {order.filesCount} 個</span> : null}
                          </div>
                          <p className="mt-2 break-all text-sm font-bold text-slate-700">{order.customerEmail || '未取得會員 Email'}</p>
                          <p className="mt-1 text-xs text-slate-500">送出時間：{formatDate(order.createdAt)}／最後更新：{formatDate(order.updatedAt)}</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row lg:w-[260px] lg:flex-col">
                          <select
                            value={order.status}
                            disabled={isProcessing}
                            onChange={(event) => void updateBusinessCardStatus(order, event.target.value as BusinessCardOrderStatus)}
                            className="min-h-[44px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {BUSINESS_CARD_STATUS_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                          </select>
                          <button
                            type="button"
                            disabled={isProcessing}
                            onClick={() => void updateBusinessCardAdminNote(order)}
                            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processingKey === `business-card-note-${order.id}` ? '儲存中…' : '內部備註'}
                          </button>
                          <button
                            type="button"
                            disabled={businessCardFilesLoading && isFilesOpen}
                            onClick={() => void toggleBusinessCardFiles(order)}
                            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-cyan-600 px-4 py-2 text-sm font-black !text-white shadow-sm transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                          >
                            {businessCardFilesLoading && isFilesOpen ? '讀取附件中…' : isFilesOpen ? '收合附件' : `查看附件${order.filesCount ? `（${order.filesCount}）` : ''}`}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 p-5 xl:grid-cols-3">
                      <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <h3 className="font-black text-slate-950">印刷與金額</h3>
                        <dl className="mt-3 grid gap-2 text-sm text-slate-700">
                          <p><span className="font-bold">服務：</span>{businessCardServiceLabel(order.serviceType)}</p>
                          <p><span className="font-bold">規格：</span>{businessCardSideLabel(order.printSide)}／{businessCardFinishLabel(order.finishType)}</p>
                          <p><span className="font-bold">數量：</span>{order.boxCount} 盒（{order.quantityCards.toLocaleString()} 張）</p>
                          <p><span className="font-bold">模板：</span>{order.templateTitle || (order.serviceType === 'print' ? '自備完稿' : '未選擇')}</p>
                          <p><span className="font-bold">名片費：</span>NT${order.itemAmountNtd.toLocaleString()}／運費：{order.shippingFeeNtd ? `NT$${order.shippingFeeNtd}` : '免運'}</p>
                          <p className="text-base font-black text-emerald-700">合計：NT${order.totalAmountNtd.toLocaleString()}</p>
                        </dl>
                      </section>

                      <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <h3 className="font-black text-slate-950">名片內容</h3>
                        <dl className="mt-3 grid gap-2 text-sm text-slate-700">
                          <p><span className="font-bold">品牌：</span>{order.brandName || '—'}</p>
                          <p><span className="font-bold">姓名／職稱：</span>{[order.fullName, order.jobTitle].filter(Boolean).join('／') || '—'}</p>
                          <p><span className="font-bold">電話：</span>{order.cardPhone || '—'}</p>
                          <p><span className="font-bold">LINE：</span>{order.lineId || '—'}</p>
                          <p><span className="font-bold">QR Code：</span>{order.needQr ? (order.qrLink || '客戶尚未填寫連結') : '不需要'}</p>
                          {order.websiteUrl ? <p className="break-all"><span className="font-bold">網站／社群：</span>{order.websiteUrl}</p> : null}
                        </dl>
                      </section>

                      <section className="rounded-xl border border-slate-200 bg-white p-4">
                        <h3 className="font-black text-slate-950">宅配與備註</h3>
                        <dl className="mt-3 grid gap-2 text-sm text-slate-700">
                          <p><span className="font-bold">收件人：</span>{order.recipientName || '—'}</p>
                          <p><span className="font-bold">收件電話：</span>{order.recipientPhone || '—'}</p>
                          <p className="break-words"><span className="font-bold">宅配地址：</span>{order.shippingAddress || '—'}</p>
                          <p><span className="font-bold">文字修改：</span>{order.revisionCount}／1 次</p>
                        </dl>
                      </section>
                    </div>

                    {(order.serviceText || order.customerNote || order.adminNote) ? (
                      <div className="grid gap-3 border-t border-slate-100 bg-slate-50 p-5 lg:grid-cols-3">
                        {order.serviceText ? <div className="rounded-xl bg-white p-3 text-sm leading-relaxed text-slate-700"><p className="font-black text-slate-900">名片服務內容</p><p className="mt-1 whitespace-pre-wrap">{order.serviceText}</p></div> : null}
                        {order.customerNote ? <div className="rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-950"><p className="font-black">客戶備註</p><p className="mt-1 whitespace-pre-wrap">{order.customerNote}</p></div> : null}
                        {order.adminNote ? <div className="rounded-xl bg-violet-50 p-3 text-sm leading-relaxed text-violet-950"><p className="font-black">內部備註</p><p className="mt-1 whitespace-pre-wrap">{order.adminNote}</p></div> : null}
                      </div>
                    ) : null}

                    {isFilesOpen ? (
                      <div className="border-t border-cyan-100 bg-cyan-50 p-5">
                        <p className="font-black text-cyan-950">客戶附件</p>
                        <p className="mt-1 text-xs leading-relaxed text-cyan-800">附件連結為私有短時效連結，請只在需要查看時開啟。</p>
                        {businessCardFilesLoading ? (
                          <p className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-600">正在取得安全附件連結…</p>
                        ) : businessCardFiles.length === 0 ? (
                          <p className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-600">這筆訂單尚未上傳附件。</p>
                        ) : (
                          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                            {businessCardFiles.map((file) => (
                              <a
                                key={file.id}
                                href={file.signedUrl || undefined}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-xl border border-cyan-200 bg-white p-4 text-sm text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-400 hover:shadow-md"
                              >
                                <p className="break-all font-black text-slate-950">{file.originalFileName || '未命名附件'}</p>
                                <p className="mt-2 text-xs text-slate-500">類型：{file.fileRole || 'other'}／{file.contentType || '未知格式'}／{formatFileSize(file.sizeBytes)}</p>
                                <p className="mt-1 text-xs text-slate-500">上傳者：{file.uploadedByRole === 'customer' ? '客戶' : file.uploadedByRole === 'admin' ? '管理者' : file.uploadedByRole || '—'}／{formatDate(file.createdAt)}</p>
                                <p className="mt-3 font-black text-cyan-700">開啟安全附件 →</p>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <div className="mt-6 text-center">
          <Link to="/pricing" className="text-sm font-bold text-blue-700 hover:text-blue-900">返回點數方案</Link>
        </div>
      </div>
    </main>
  )
}
