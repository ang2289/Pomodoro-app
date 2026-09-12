import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '@/components/SEO'
import { getAuthToken, groupBuyApi } from '@/lib/groupBuyApi'
import GroupBuyProductImageManager from './GroupBuyProductImageManager'

const paymentStatusText: Record<string, string> = {
  not_open: '尚未開放付款',
  pending: '待付款',
  reported: '付款核對中',
  verified: '已確認付款',
  rejected: '需重新回報',
  payment_overdue: '付款已逾期',
  refunded: '已退款',
}

const paymentReportStatusText: Record<string, string> = {
  reported: '待核對',
  verified: '已確認',
  rejected: '已退回',
  cancelled: '已取消',
}

const emailDeliveryMessage = (result: any) => {
  if (result?.notificationStatus === 'notification_sent' && result?.notificationProvider === 'resend') {
    return 'Email 已寄出。'
  }
  if (result?.notificationStatus === 'notification_pending') {
    return 'Email 尚未寄出，請確認 RESEND_API_KEY 與寄件者設定。'
  }
  if (result?.notificationStatus === 'notification_failed') {
    return `Email 寄送失敗${result?.notificationError ? `：${result.notificationError}` : '。'}`
  }
  return '未建立 Email 通知。'
}

const emptyProduct = () => ({
  title: '',
  description: '',
  imageUrl: '',
  unitLabel: '條',
  salePriceNtd: 0,
  costPriceNtd: null as number | null,
  thresholdWeight: 1,
  isActive: true,
})


const emptyPickupStore = () => ({
  clientKey: `store-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  storeCode: '',
  city: '',
  district: '',
  name: '',
  address: '',
  phone: '',
  businessHours: '',
  sourceUrl: '',
  isActive: true,
  sortOrder: 0,
})

const emptyPickupSlot = (pickupStoreRef = '') => ({
  pickupStoreId: pickupStoreRef,
  pickupStoreRef,
  pickupDate: '',
  startTime: '',
  endTime: '',
  notice: '',
  capacity: null as number | null,
  isActive: true,
  sortOrder: 0,
})

const defaultShipping = () => ([
  {
    methodType: 'home_delivery',
    label: '冷凍宅配',
    isActive: true,
    feeMode: 'quantity_free_threshold',
    baseFeeNtd: 200,
    freeThresholdQuantity: 10,
    freeThresholdAmountNtd: null,
    pickupName: '',
    pickupAddress: '',
    pickupPhone: '',
    pickupMapUrl: '',
    pickupTimeText: '',
    pickupNotice: '',
  },
  {
    methodType: 'store_pickup',
    label: '指定亞尼克門市自取（免運）',
    isActive: false,
    feeMode: 'fixed',
    baseFeeNtd: 0,
    freeThresholdQuantity: null,
    freeThresholdAmountNtd: null,
    pickupName: '',
    pickupAddress: '',
    pickupPhone: '',
    pickupMapUrl: '',
    pickupTimeText: '',
    pickupNotice: '登記時先選門市；實際取貨日期於主辦方向供應商下單後，再由網站通知選擇。',
  },
])

const toLocalDateTimeInput = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const yannickFirstCampaign = () => {
  const registrationStart = new Date()
  registrationStart.setMinutes(0, 0, 0)
  const registrationEnd = new Date(registrationStart)
  registrationEnd.setDate(registrationEnd.getDate() + 14)
  registrationEnd.setHours(23, 59, 0, 0)
  const paymentDeadline = new Date(registrationEnd)
  paymentDeadline.setDate(paymentDeadline.getDate() + 3)

  return {
    id: '',
    title: '亞尼克生乳捲第一團｜官網 76 折',
    slug: 'yannick-first-group-buy',
    description: '第一團採網站登記制：先選口味與數量，達到後台設定的成團門檻後，由管理員確認並開放付款。全體款項核對完成後才向供應商訂貨及安排冷凍宅配。商品圖片來源為亞尼克官網，實際商品以供應商出貨為準。',
    coverImageUrl: '/group-buy/yannick/original.jpg',
    noticeText: '1. 本頁完成登記即可，不需私訊粉絲團。\n2. 未達後台設定的成團門檻前不需匯款，也不會顯示銀行帳號。\n3. 達門檻後由管理員開放付款，請在期限內匯款並回報末五碼。\n4. 全體有效訂單付款確認後才統一向亞尼克訂貨。\n5. 冷凍宅配每筆訂單未滿 10 條運費 200 元，滿 10 條免運。\n6. 冷凍食品及期間限定品依供應商實際供貨為準；特殊問題請由訂單頁聯絡客服。',
    status: 'draft',
    registrationStartsAt: toLocalDateTimeInput(registrationStart),
    registrationEndsAt: toLocalDateTimeInput(registrationEnd),
    paymentDeadline: toLocalDateTimeInput(paymentDeadline),
    estimatedArrivalText: '全體付款確認並完成訂貨後，依亞尼克實際排程通知出貨',
    thresholdMode: 'quantity',
    minRegistrationValue: 0,
    minPaidValue: 0,
    allowMixedProducts: true,
    showProgress: true,
    addressCollectionStage: 'registration',
    paymentOpenMode: 'manual',
    pickupDateSelectionOpen: false,
    pickupDateSelectionNotice: '主辦方向供應商正式下單後，將於會員訂單頁開放選擇取貨日期。',
    pickupStores: [],
    pickupSlots: [],
    bankName: '中華郵政',
    bankCode: '700',
    bankBranch: '',
    bankAccount: '',
    bankAccountName: '',
    products: [
      { title: '原味生乳捲', description: '亞尼克經典原味生乳捲。官網定價 392 元，本團 76 折。', imageUrl: '/group-buy/yannick/original.jpg', unitLabel: '條', salePriceNtd: 298, costPriceNtd: 267, thresholdWeight: 1, isActive: true },
      { title: '特黑巧克力生乳捲', description: '濃郁巧克力風味。官網定價 420 元，本團 76 折。', imageUrl: '/group-buy/yannick/dark-chocolate.jpg', unitLabel: '條', salePriceNtd: 319, costPriceNtd: 286, thresholdWeight: 1, isActive: true },
      { title: '茶拿鐵布丁生乳捲', description: '茶拿鐵與布丁風味。官網定價 420 元，本團 76 折。', imageUrl: '/group-buy/yannick/tea-latte-pudding.jpg', unitLabel: '條', salePriceNtd: 319, costPriceNtd: 286, thresholdWeight: 1, isActive: true },
      { title: '北海道黑酷曲', description: '北海道黑酷曲風味。官網定價 450 元，本團 76 折。', imageUrl: '/group-buy/yannick/hokkaido-black-cookie.jpg', unitLabel: '條', salePriceNtd: 342, costPriceNtd: 306, thresholdWeight: 1, isActive: true },
      { title: '宇治抹茶生乳捲', description: '宇治抹茶風味。官網定價 699 元，本團 76 折。', imageUrl: '/group-buy/yannick/uji-matcha.jpg', unitLabel: '條', salePriceNtd: 531, costPriceNtd: 475, thresholdWeight: 1, isActive: true },
      { title: '香草布丁生乳捲', description: '香草布丁風味。官網定價 420 元，本團 76 折。', imageUrl: '/group-buy/yannick/vanilla-pudding.jpg', unitLabel: '條', salePriceNtd: 319, costPriceNtd: 286, thresholdWeight: 1, isActive: true },
      { title: '期間限定－三顆布丁生乳捲', description: '期間限定品。官網定價 465 元，本團 76 折；依供應商實際供貨為準。', imageUrl: '/group-buy/yannick/three-pudding.jpg', unitLabel: '條', salePriceNtd: 353, costPriceNtd: 316, thresholdWeight: 1, isActive: true },
      { title: '期間限定－特濃薄荷巧克力脆片生乳捲', description: '期間限定品。官網定價 565 元，本團 76 折；依供應商實際供貨為準。', imageUrl: '/group-buy/yannick/mint-chocolate-crunch.jpg', unitLabel: '條', salePriceNtd: 429, costPriceNtd: 384, thresholdWeight: 1, isActive: true },
      { title: '期間限定－薄荷巧克力北海道黑酷曲', description: '期間限定品。官網定價 535 元，本團 76 折；依供應商實際供貨為準。', imageUrl: '/group-buy/yannick/mint-black-cookie.jpg', unitLabel: '條', salePriceNtd: 407, costPriceNtd: 364, thresholdWeight: 1, isActive: true },
    ],
    shippingMethods: defaultShipping().map((method) => method.methodType === 'home_delivery'
      ? { ...method, label: '冷凍宅配｜未滿 10 條運費 200 元，滿 10 條免運' }
      : { ...method, isActive: false }),
    progress: { registrationValue: 0, paidValue: 0, registrationPercent: 0, paidPercent: 0, activeOrderCount: 0, verifiedOrderCount: 0, allActiveOrdersPaid: false },
  }
}

export default function AdminGroupBuyPage() {
  const navigate = useNavigate()
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [form, setForm] = useState<any>({
    id: '',
    title: '',
    slug: '',
    description: '',
    coverImageUrl: '',
    noticeText: '',
    status: 'draft',
    registrationStartsAt: '',
    registrationEndsAt: '',
    paymentDeadline: '',
    estimatedArrivalText: '',
    thresholdMode: 'quantity',
    minRegistrationValue: 0,
    minPaidValue: 0,
    allowMixedProducts: true,
    showProgress: true,
    addressCollectionStage: 'payment',
    paymentOpenMode: 'manual',
    pickupDateSelectionOpen: false,
    pickupDateSelectionNotice: '主辦方向供應商正式下單後，將於會員訂單頁開放選擇取貨日期。',
    pickupStores: [],
    pickupSlots: [],
    bankName: '中華郵政',
    bankCode: '700',
    bankBranch: '',
    bankAccount: '',
    bankAccountName: '',
    products: [emptyProduct()],
    shippingMethods: defaultShipping(),
    progress: { registrationValue: 0, paidValue: 0, registrationPercent: 0, paidPercent: 0 },
  })
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [shippingFilter, setShippingFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [exporting, setExporting] = useState<'all' | 'filtered' | ''>('')
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [batchShipping, setBatchShipping] = useState(false)

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const keyword = search.trim().toLowerCase()
    const matchesSearch = !keyword || [order.orderCode, order.customerName, order.customerPhone, order.customerEmail]
      .some((value) => String(value || '').toLowerCase().includes(keyword))
    return matchesSearch && (!paymentFilter || order.paymentStatus === paymentFilter) &&
      (!shippingFilter || order.shippingLabel === shippingFilter) && (!statusFilter || order.status === statusFilter)
  }), [orders, paymentFilter, search, shippingFilter, statusFilter])

  const batchShippableOrders = useMemo(
    () => filteredOrders.filter((order) =>
      order.paymentStatus === 'verified' &&
      !['shipped', 'completed', 'cancelled', 'refunded'].includes(String(order.status || '')),
    ),
    [filteredOrders],
  )

  const allFilteredShippableSelected =
    batchShippableOrders.length > 0 &&
    batchShippableOrders.every((order) => selectedOrderIds.includes(String(order.id)))

  const loadList = async () => {
    const data = await groupBuyApi.adminListCampaigns()
    setCampaigns(data.campaigns || [])
  }

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login?returnTo=%2Fadmin%2Fgroup-buy')
      return
    }
    void (async () => {
      try {
        await groupBuyApi.adminBootstrap()
        setAuthorized(true)
        await loadList()
      } catch (err: any) {
        setAuthorized(false)
        setError(err?.message || '載入團購後台失敗。')
      } finally {
        setLoading(false)
      }
    })()
  }, [navigate])

  const edit = async (id: string) => {
    setError('')
    const data = await groupBuyApi.adminGetCampaign(id)
    setSelectedId(id)
    setSelectedOrderIds([])
    setForm({
      ...data.campaign,
      registrationStartsAt: data.campaign.registrationStartsAt?.slice(0, 16) || '',
      registrationEndsAt: data.campaign.registrationEndsAt?.slice(0, 16) || '',
      paymentDeadline: data.campaign.paymentDeadline?.slice(0, 16) || '',
      products: data.products.length ? data.products : [emptyProduct()],
      shippingMethods: data.shippingMethods.length ? data.shippingMethods : defaultShipping(),
      pickupDateSelectionOpen: Boolean(data.campaign.pickupDateSelectionOpen),
      pickupDateSelectionNotice: data.campaign.pickupDateSelectionNotice || '',
      pickupStores: data.pickupStores || [],
      pickupSlots: data.pickupSlots || [],
    })
    const orderData = await groupBuyApi.adminListOrders(id)
    setOrders(orderData.orders || [])
  }

  const newCampaign = () => {
    setSelectedId('')
    setOrders([])
    setSelectedOrderIds([])
    setForm({
      id: '',
      title: '',
      slug: '',
      description: '',
      coverImageUrl: '',
      noticeText: '',
      status: 'draft',
      registrationStartsAt: '',
      registrationEndsAt: '',
      paymentDeadline: '',
      estimatedArrivalText: '',
      thresholdMode: 'quantity',
      minRegistrationValue: 0,
      minPaidValue: 0,
      allowMixedProducts: true,
      showProgress: true,
      addressCollectionStage: 'payment',
      paymentOpenMode: 'manual',
      pickupDateSelectionOpen: false,
      pickupDateSelectionNotice: '主辦方向供應商正式下單後，將於會員訂單頁開放選擇取貨日期。',
      pickupStores: [],
      pickupSlots: [],
      bankName: '中華郵政',
      bankCode: '700',
      bankBranch: '',
      bankAccount: '',
      bankAccountName: '',
      products: [emptyProduct()],
      shippingMethods: defaultShipping(),
      progress: { registrationValue: 0, paidValue: 0, registrationPercent: 0, paidPercent: 0 },
    })
  }

  const loadYannickFirstCampaign = () => {
    if ((form.title || form.products?.some((product: any) => product.title)) && !window.confirm('要以亞尼克第一團範本取代目前尚未儲存的表單內容嗎？')) return
    setSelectedId('')
    setOrders([])
    setSelectedOrderIds([])
    setError('')
    setMessage('已載入亞尼克第一團範本；請確認登記日期、付款期限及銀行帳號後儲存。')
    setForm(yannickFirstCampaign())
  }

  const save = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    if (!form.title.trim()) return setError('請填寫團購名稱。')
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) return setError('網址代碼只能使用小寫英文、數字與連字號。')
    if (Number(form.minRegistrationValue) <= 0 || Number(form.minPaidValue) <= 0) return setError('請設定大於 0 的登記門檻與正式成團門檻。')
    if (!form.products.some((p: any) => p.title.trim() && Number(p.salePriceNtd) >= 0)) return setError('請至少建立一項商品。')
    if (!form.shippingMethods.some((m: any) => m.isActive)) return setError('請至少開啟一種配送方式。')
    const storePickupEnabled = form.shippingMethods.some((m: any) => m.isActive && m.methodType === 'store_pickup')
    if (storePickupEnabled && !(form.pickupStores || []).some((store: any) => store.isActive && store.name?.trim() && store.city?.trim() && store.address?.trim())) {
      return setError('已開放門市自取，請至少建立一間啟用中的可取貨門市。')
    }
    if (form.pickupDateSelectionOpen && !(form.pickupSlots || []).some((slot: any) => slot.isActive && slot.pickupDate && (slot.pickupStoreId || slot.pickupStoreRef))) {
      return setError('開放取貨日期選擇前，請至少建立一個啟用中的門市取貨日期。')
    }

    setSaving(true)
    try {
      const data = await groupBuyApi.adminSaveCampaign({
        ...form,
        registrationStartsAt: form.registrationStartsAt ? new Date(form.registrationStartsAt).toISOString() : null,
        registrationEndsAt: form.registrationEndsAt ? new Date(form.registrationEndsAt).toISOString() : null,
        paymentDeadline: form.paymentDeadline ? new Date(form.paymentDeadline).toISOString() : null,
      })
      setSelectedId(data.id)
      await loadList()
      await edit(data.id)
      setMessage('團購活動已儲存。')
    } catch (err: any) {
      setError(err?.message || '儲存失敗。')
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (status: string) => {
    if (!selectedId) return
    setError('')
    setMessage('')

    let force = false
    if (status === 'payment_open' && Number(form.progress?.registrationValue || 0) < Number(form.minRegistrationValue || 0)) {
      force = window.confirm('目前登記數量尚未達門檻，仍要強制開放付款嗎？')
      if (!force) return
    }
    if (status === 'confirmed' && Number(form.progress?.paidValue || 0) < Number(form.minPaidValue || 0)) {
      force = window.confirm('目前已確認付款數量尚未達正式成團門檻，仍要強制正式成團嗎？')
      if (!force) return
    }

    try {
      await groupBuyApi.adminSetCampaignStatus(selectedId, status, force)
      await loadList()
      await edit(selectedId)
      setMessage(`狀態已改為 ${status}。`)
    } catch (err: any) {
      setError(err?.message || '狀態更新失敗。')
    }
  }

  const verify = async (orderId: string, reportId: string, accepted: boolean, currentReportStatus = '') => {
    setError('')
    setMessage('')

    let note = ''
    if (!accepted) {
      if (currentReportStatus === 'verified' && !window.confirm('這筆款項目前已確認付款。確定要撤銷已付款並退回，讓客戶重新回報嗎？')) return
      const entered = window.prompt('請輸入退回原因：', '匯款資料不符，請重新回報。')
      if (entered === null) return
      note = entered.trim() || '匯款資料不符，請重新回報。'
    }

    try {
      const result = await groupBuyApi.adminVerifyPayment(orderId, reportId, accepted, note) as any
      await loadList()
      await edit(selectedId)
      setMessage(accepted
        ? `付款已確認（${result?.paymentStatus || 'verified'}）。${emailDeliveryMessage(result)}`
        : `付款確認已退回，訂單已改為待付款／需重新回報（${result?.paymentStatus || 'rejected'}）。`)
    } catch (err: any) {
      setError(err?.message || '付款審核失敗。')
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    setError('')
    setMessage('')
    try {
      const result = await groupBuyApi.adminUpdateOrderStatus(orderId, status)
      await edit(selectedId)
      setMessage(status === 'shipped'
        ? `訂單已標記為已出貨。${emailDeliveryMessage(result)}`
        : `訂單狀態已更新為 ${status}。`)
    } catch (err: any) {
      setError(err?.message || '訂單狀態更新失敗。')
    }
  }

  const updateOrderNote = async (order: any) => {
    const adminNote = window.prompt('特殊狀況聯絡備註', order.adminNote || '')
    if (adminNote === null) return
    await groupBuyApi.adminUpdateOrderNote(order.id, adminNote)
    await edit(selectedId)
  }

  const copyOrderLink = async (orderPath: string) => {
    if (!orderPath) return setError('此訂單尚無可複製的查詢連結。')
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${orderPath}`)
      setMessage('已複製客戶訂單／付款連結。')
    } catch {
      setError('瀏覽器無法自動複製，請改用手動開啟連結。')
    }
  }


  const copyText = async (textValue: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(textValue)
      setMessage(successMessage)
      setError('')
    } catch {
      setError('瀏覽器無法自動複製，請改用手動選取文字。')
    }
  }

  const customerOrderUrl = (orderCode: string) =>
    `${window.location.origin}/group-buy/order/${encodeURIComponent(orderCode)}`

  const copyPaymentConfirmedNotice = async (order: any) => {
    const notice = [
      '【團購付款確認通知】',
      '',
      `${order.customerName || '您好'}，您的團購款項已核對完成。`,
      `訂單編號：${order.orderCode}`,
      `付款金額：NT$${Number(order.totalAmountNtd || 0).toLocaleString('zh-TW')}`,
      '目前狀態：已確認付款',
      '',
      '後續訂貨與出貨進度，請登入網站「我的團購訂單」查看。',
      `訂單頁：${customerOrderUrl(order.orderCode)}`,
    ].join('\n')
    await copyText(notice, `已複製 ${order.orderCode} 的付款確認通知文字。`)
  }

  const copyPaymentRejectedNotice = async (order: any, reviewNote = '') => {
    const notice = [
      '【團購付款資料需重新回報】',
      '',
      `${order.customerName || '您好'}，這筆訂單的匯款資料目前無法完成核對。`,
      `訂單編號：${order.orderCode}`,
      `退回原因：${reviewNote || '匯款資料不符，請重新確認後再次送出。'}`,
      '',
      '網站內的付款回報表單已重新開放，請登入「我的團購訂單」，修正匯款人姓名、帳號後五碼或匯款時間後重新送出。',
      `訂單頁：${customerOrderUrl(order.orderCode)}`,
    ].join('\n')
    await copyText(notice, `已複製 ${order.orderCode} 的退回重報通知文字。`)
  }

  const copyShippedNotice = async (order: any) => {
    const notice = [
      '【團購商品出貨通知】',
      '',
      `${order.customerName || '您好'}，您的團購商品已安排出貨。`,
      `訂單編號：${order.orderCode}`,
      `商品內容：${order.itemSummary || '請至訂單頁查看'}`,
      '',
      '配送進度請以物流實際作業為準；收到商品後，請依商品包裝上的保存方式處理。',
      '最新出貨進度請登入網站「我的團購訂單」查看。',
      `訂單頁：${customerOrderUrl(order.orderCode)}`,
    ].join('\n')
    await copyText(notice, `已複製 ${order.orderCode} 的出貨通知文字。`)
  }

  const toggleOrderSelection = (orderId: string, checked: boolean) => {
    setSelectedOrderIds((current) =>
      checked
        ? [...new Set([...current, orderId])]
        : current.filter((id) => id !== orderId),
    )
  }

  const toggleAllFilteredShippable = (checked: boolean) => {
    const ids = batchShippableOrders.map((order) => String(order.id))
    setSelectedOrderIds((current) => {
      if (checked) return [...new Set([...current, ...ids])]
      const removeIds = new Set(ids)
      return current.filter((id) => !removeIds.has(id))
    })
  }

  const batchMarkSelectedShipped = async () => {
    const selected = batchShippableOrders.filter((order) => selectedOrderIds.includes(String(order.id)))
    if (!selected.length) return setError('請先勾選至少一筆已確認付款且尚未出貨的訂單。')
    if (!window.confirm(`確定將 ${selected.length} 筆訂單批次標記為已出貨，並建立站內通知及寄送 Email 嗎？`)) return

    setBatchShipping(true)
    setError('')
    setMessage('')
    try {
      const result = await groupBuyApi.adminBatchMarkOrdersShipped(selected.map((order) => String(order.id)))
      await edit(selectedId)
      setSelectedOrderIds([])
      const emailSummary = [
        `Email 已寄出 ${result.emailSentCount || 0} 筆`,
        result.emailPendingCount ? `待設定／待寄 ${result.emailPendingCount} 筆` : '',
        result.emailFailedCount ? `寄送失敗 ${result.emailFailedCount} 筆` : '',
      ].filter(Boolean).join('，')
      setMessage(`已將 ${result.updatedCount} 筆訂單標記為已出貨並建立站內通知。${emailSummary}。`)
    } catch (err: any) {
      setError(err?.message || '批次出貨處理失敗。')
    } finally {
      setBatchShipping(false)
    }
  }


  const exportOrdersExcel = async (scope: 'all' | 'filtered') => {
    if (!selectedId) return setError('請先選擇要匯出的團購活動。')

    const token = getAuthToken()
    if (!token) {
      navigate('/login?returnTo=%2Fadmin%2Fgroup-buy')
      return
    }

    setError('')
    setMessage('')
    setExporting(scope)

    try {
      const params = new URLSearchParams({
        action: 'admin-export-orders-xlsx',
        campaignId: selectedId,
      })

      if (scope === 'filtered') {
        if (search.trim()) params.set('search', search.trim())
        if (paymentFilter) params.set('paymentStatus', paymentFilter)
        if (shippingFilter) params.set('shippingLabel', shippingFilter)
        if (statusFilter) params.set('orderStatus', statusFilter)
      }

      const response = await fetch(`/api/group-buy?${params.toString()}`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(String(data?.error || `匯出失敗（HTTP ${response.status}）`))
      }

      const blob = await response.blob()
      const contentDisposition = response.headers.get('content-disposition') || ''
      const encodedName = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1]
      const fallbackDate = new Date().toISOString().slice(0, 10).replace(/-/g, '')
      const fallbackName = `${String(form.title || '團購').replace(/[\\/:*?"<>|]/g, '_')}_${scope === 'filtered' ? '目前篩選' : '全部訂單'}_${fallbackDate}.xlsx`
      const fileName = encodedName ? decodeURIComponent(encodedName) : fallbackName

      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fileName
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)

      setMessage(
        scope === 'filtered'
          ? `已匯出目前篩選的 ${filteredOrders.length} 筆訂單 Excel 報表。`
          : `已匯出本團全部 ${orders.length} 筆訂單 Excel 報表。`,
      )
    } catch (err: any) {
      setError(err?.message || 'Excel 報表匯出失敗。')
    } finally {
      setExporting('')
    }
  }

  if (loading) return <main className="min-h-screen bg-slate-50 p-8 text-center">載入團購後台中…</main>

  if (!authorized) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <SEO title="團購管理權限｜RXV" description="團購建立與管理僅開放指定管理者。" />
        <div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-4 text-2xl font-black text-slate-950">團購建立功能未對外開放</h1>
          <p className="mt-3 leading-7 text-slate-600">只有指定管理者帳號可以建立及管理團購。團友仍可查看商品、登記數量及查詢自己的訂單。</p>
          {error && <div className="mt-5 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link to="/group-buy/yannick-first-group-buy" className="rounded-xl bg-orange-600 px-4 py-3 font-black text-white">查看亞尼克第一團</Link>
            <Link to="/my/group-buy-orders" className="rounded-xl border border-slate-300 px-4 py-3 font-black text-slate-700">我的團購訂單</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <SEO title="團購管理｜RXV 管理後台" description="建立團購、管理登記、付款與配送。" />
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-800">管理者專用</span>
              <h1 className="mt-2 text-3xl font-black text-slate-950">團購管理工具</h1>
              <p className="mt-2 text-slate-600">先登記、達門檻後開放付款；支援宅配與可關閉的到店取貨。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={loadYannickFirstCampaign} className="rounded-xl border border-orange-300 bg-orange-50 px-5 py-3 font-black text-orange-800">載入亞尼克第一團範本</button>
              <button type="button" onClick={newCampaign} className="rounded-xl bg-orange-600 px-5 py-3 font-black text-white">＋新增團購</button>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl bg-white p-4 shadow-sm">
            <h2 className="px-2 py-2 font-black text-slate-950">團購活動</h2>
            <div className="space-y-2">
              {campaigns.map((row) => (
                <button key={row.id} onClick={() => void edit(row.id)} className={`w-full rounded-2xl border p-3 text-left ${selectedId === row.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200'}`}>
                  <div className="font-black text-slate-950">{row.title}</div>
                  <div className="mt-1 text-xs text-slate-500">{row.status}｜登記 {row.registrationValue}｜已付款 {row.paidValue}</div>
                </button>
              ))}
              {campaigns.length === 0 && <p className="p-3 text-sm text-slate-500">尚未建立團購。</p>}
            </div>
          </aside>

          <div className="space-y-6">
            <form onSubmit={save} className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-black text-slate-950">{selectedId ? '編輯團購' : '建立新團購'}</h2>
                {selectedId && <Link to={`/group-buy/${form.slug}`} target="_blank" className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700">開啟前台</Link>}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">團購名稱 *
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700">網址代碼 *
                  <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} placeholder="cake-group-202607" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700 sm:col-span-2">團購說明
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={5} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700 sm:col-span-2">團購注意事項
                  <textarea value={form.noticeText} onChange={(e) => setForm({ ...form, noticeText: e.target.value })} rows={4} placeholder="例如：冷凍商品、成團後通知付款、付款後不接受任意取消。" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700 sm:col-span-2">封面圖網址
                  <input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700">登記開始
                  <input type="datetime-local" value={form.registrationStartsAt} onChange={(e) => setForm({ ...form, registrationStartsAt: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700">登記截止
                  <input type="datetime-local" value={form.registrationEndsAt} onChange={(e) => setForm({ ...form, registrationEndsAt: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700">付款期限
                  <input type="datetime-local" value={form.paymentDeadline} onChange={(e) => setForm({ ...form, paymentDeadline: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700">預計到貨
                  <input value={form.estimatedArrivalText} onChange={(e) => setForm({ ...form, estimatedArrivalText: e.target.value })} placeholder="付款完成後約 7～10 個工作天" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700">成團計算方式
                  <select value={form.thresholdMode} onChange={(e) => setForm({ ...form, thresholdMode: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3">
                    <option value="quantity">依商品總數量</option>
                    <option value="order_count">依登記人數／訂單數</option>
                    <option value="amount">依商品總金額</option>
                    <option value="points">依商品換算點數</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-slate-700">通知付款門檻
                  <input type="number" value={form.minRegistrationValue} onChange={(e) => setForm({ ...form, minRegistrationValue: Number(e.target.value) })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700">正式成團已付款門檻
                  <input type="number" value={form.minPaidValue} onChange={(e) => setForm({ ...form, minPaidValue: Number(e.target.value) })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700">地址填寫時機
                  <select value={form.addressCollectionStage} onChange={(e) => setForm({ ...form, addressCollectionStage: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3">
                    <option value="payment">成團付款時填寫</option>
                    <option value="registration">登記時填寫</option>
                  </select>
                </label>
                <label className="text-sm font-bold text-slate-700">達登記門檻後
                  <select value={form.paymentOpenMode || 'manual'} onChange={(e) => setForm({ ...form, paymentOpenMode: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3">
                    <option value="manual">管理員確認後開放付款</option>
                    <option value="automatic">自動開放付款</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 pt-7 text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={form.allowMixedProducts} onChange={(e) => setForm({ ...form, allowMixedProducts: e.target.checked })} />
                  不同品項可合併計算成團門檻
                </label>
                <label className="flex items-center gap-3 pt-7 text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={form.showProgress} onChange={(e) => setForm({ ...form, showProgress: e.target.checked })} />
                  前台顯示成團進度
                </label>
              </div>

              <div className="mt-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-950">商品</h3>
                  <button type="button" onClick={() => setForm({ ...form, products: [...form.products, emptyProduct()] })} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-bold">＋商品</button>
                </div>
                <div className="mt-3 space-y-4">
                  {form.products.map((product: any, index: number) => (
                    <div key={index} className="rounded-2xl border border-slate-200 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input placeholder="商品名稱" value={product.title} onChange={(e) => { const rows=[...form.products]; rows[index]={...product,title:e.target.value}; setForm({...form,products:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input placeholder="圖片網址" value={product.imageUrl} onChange={(e) => { const rows=[...form.products]; rows[index]={...product,imageUrl:e.target.value}; setForm({...form,products:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input type="number" min="0" placeholder="團購售價" value={product.salePriceNtd} onChange={(e) => { const rows=[...form.products]; rows[index]={...product,salePriceNtd:Number(e.target.value)}; setForm({...form,products:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input type="number" min="0" placeholder="進貨成本（管理用，可不填）" value={product.costPriceNtd ?? ''} onChange={(e) => { const rows=[...form.products]; rows[index]={...product,costPriceNtd:e.target.value === '' ? null : Number(e.target.value)}; setForm({...form,products:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input placeholder="單位，例如：條" value={product.unitLabel} onChange={(e) => { const rows=[...form.products]; rows[index]={...product,unitLabel:e.target.value}; setForm({...form,products:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input type="number" min="0" step="0.1" placeholder="成團換算值（一般填 1）" value={product.thresholdWeight ?? 1} onChange={(e) => { const rows=[...form.products]; rows[index]={...product,thresholdWeight:Number(e.target.value)}; setForm({...form,products:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                      </div>
                      <textarea placeholder="商品說明" value={product.description} onChange={(e) => { const rows=[...form.products]; rows[index]={...product,description:e.target.value}; setForm({...form,products:rows}) }} rows={2} className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3" />

                      {selectedId && product.id ? (
                        <div className="mt-4">
                          <GroupBuyProductImageManager product={product} campaignSlug={form.slug} />
                        </div>
                      ) : (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold leading-6 text-amber-900">
                          請先儲存團購活動，建立商品資料後，即可上傳六張商品圖片。
                        </div>
                      )}

                      <button type="button" onClick={() => setForm({ ...form, products: form.products.filter((_: any, i: number) => i !== index) })} className="mt-3 text-sm font-bold text-red-700">刪除商品</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-black text-slate-950">配送方式</h3>
                <div className="mt-3 space-y-4">
                  {form.shippingMethods.map((method: any, index: number) => (
                    <div key={index} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <b>{method.methodType === 'home_delivery' ? '宅配' : '到店取貨'}</b>
                        <label className="flex items-center gap-2 text-sm font-bold">
                          <input type="checkbox" checked={method.isActive} onChange={(e) => { const rows=[...form.shippingMethods]; rows[index]={...method,isActive:e.target.checked}; setForm({...form,shippingMethods:rows}) }} />
                          開放此方式
                        </label>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <input placeholder="前台名稱" value={method.label} onChange={(e) => { const rows=[...form.shippingMethods]; rows[index]={...method,label:e.target.value}; setForm({...form,shippingMethods:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input type="number" placeholder="基本運費" value={method.baseFeeNtd} onChange={(e) => { const rows=[...form.shippingMethods]; rows[index]={...method,baseFeeNtd:Number(e.target.value)}; setForm({...form,shippingMethods:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        {method.methodType === 'home_delivery' && (
                          <>
                            <select value={method.feeMode} onChange={(e) => { const rows=[...form.shippingMethods]; rows[index]={...method,feeMode:e.target.value}; setForm({...form,shippingMethods:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3">
                              <option value="fixed">固定運費</option>
                              <option value="quantity_free_threshold">滿件免運</option>
                              <option value="amount_free_threshold">滿額免運</option>
                            </select>
                            {method.feeMode === 'quantity_free_threshold' && <input type="number" placeholder="免運件數" value={method.freeThresholdQuantity || ''} onChange={(e) => { const rows=[...form.shippingMethods]; rows[index]={...method,freeThresholdQuantity:Number(e.target.value)}; setForm({...form,shippingMethods:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />}
                            {method.feeMode === 'amount_free_threshold' && <input type="number" placeholder="免運金額" value={method.freeThresholdAmountNtd || ''} onChange={(e) => { const rows=[...form.shippingMethods]; rows[index]={...method,freeThresholdAmountNtd:Number(e.target.value)}; setForm({...form,shippingMethods:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />}
                          </>
                        )}
                        {method.methodType === 'store_pickup' && (
                          <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
                            <div className="font-black">門市自取使用下方「可選門市清單」</div>
                            <p className="mt-1">不要在這裡填單一地址。客戶登記時只能從啟用中的門市清單選擇，取貨日期則於結團並向供應商下單後再開放。</p>
                            <input
                              placeholder="前台注意事項"
                              value={method.pickupNotice || ''}
                              onChange={(e) => { const rows=[...form.shippingMethods]; rows[index]={...method,pickupNotice:e.target.value}; setForm({...form,shippingMethods:rows}) }}
                              className="mt-3 w-full rounded-xl border border-emerald-300 bg-white px-4 py-3"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-emerald-950">可選門市清單</h3>
                    <p className="mt-1 text-sm leading-6 text-emerald-900">客戶只能選擇此清單中「啟用」的門市；未列入的門市不會出現在前台。</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, pickupStores: [...(form.pickupStores || []), emptyPickupStore()] })}
                    className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white"
                  >
                    ＋新增門市
                  </button>
                </div>
                <div className="mt-4 space-y-4">
                  {(form.pickupStores || []).map((store: any, index: number) => {
                    const storeRef = store.id || store.clientKey
                    return (
                      <div key={storeRef || index} className="rounded-2xl border border-emerald-200 bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <b>{store.name || `門市 ${index + 1}`}</b>
                          <label className="flex items-center gap-2 text-sm font-bold">
                            <input
                              type="checkbox"
                              checked={store.isActive !== false}
                              onChange={(e) => { const rows=[...(form.pickupStores || [])]; rows[index]={...store,isActive:e.target.checked}; setForm({...form,pickupStores:rows}) }}
                            />
                            前台開放
                          </label>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <input placeholder="縣市，例如：台北市" value={store.city || ''} onChange={(e) => { const rows=[...(form.pickupStores || [])]; rows[index]={...store,city:e.target.value}; setForm({...form,pickupStores:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                          <input placeholder="行政區，例如：北投區" value={store.district || ''} onChange={(e) => { const rows=[...(form.pickupStores || [])]; rows[index]={...store,district:e.target.value}; setForm({...form,pickupStores:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                          <input placeholder="門市名稱" value={store.name || ''} onChange={(e) => { const rows=[...(form.pickupStores || [])]; rows[index]={...store,name:e.target.value}; setForm({...form,pickupStores:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                          <input placeholder="門市電話" value={store.phone || ''} onChange={(e) => { const rows=[...(form.pickupStores || [])]; rows[index]={...store,phone:e.target.value}; setForm({...form,pickupStores:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                          <input placeholder="完整地址" value={store.address || ''} onChange={(e) => { const rows=[...(form.pickupStores || [])]; rows[index]={...store,address:e.target.value}; setForm({...form,pickupStores:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-2" />
                          <input placeholder="營業時間（選填）" value={store.businessHours || ''} onChange={(e) => { const rows=[...(form.pickupStores || [])]; rows[index]={...store,businessHours:e.target.value}; setForm({...form,pickupStores:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3 sm:col-span-2" />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const removingRef = store.id || store.clientKey
                            setForm({
                              ...form,
                              pickupStores: (form.pickupStores || []).filter((_: any, rowIndex: number) => rowIndex !== index),
                              pickupSlots: (form.pickupSlots || []).filter((slot: any) => String(slot.pickupStoreId || slot.pickupStoreRef) !== String(removingRef)),
                            })
                          }}
                          className="mt-3 text-sm font-bold text-red-700"
                        >
                          移除此門市
                        </button>
                      </div>
                    )
                  })}
                  {!(form.pickupStores || []).length && (
                    <div className="rounded-xl bg-white px-4 py-3 text-sm font-bold text-amber-800">尚未建立門市。開放門市自取前，請先新增可取貨門市。</div>
                  )}
                </div>
              </div>

              <div className="mt-8 rounded-3xl border border-violet-200 bg-violet-50 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-violet-950">結團後取貨日期</h3>
                    <p className="mt-1 text-sm leading-6 text-violet-900">登記時不讓客戶選日期。等你確定向供應商下單後，再建立日期並勾選開放。</p>
                  </div>
                  <button
                    type="button"
                    disabled={!(form.pickupStores || []).some((store: any) => store.isActive !== false)}
                    onClick={() => {
                      const firstStore = (form.pickupStores || []).find((store: any) => store.isActive !== false)
                      const storeRef = firstStore?.id || firstStore?.clientKey || ''
                      setForm({ ...form, pickupSlots: [...(form.pickupSlots || []), emptyPickupSlot(storeRef)] })
                    }}
                    className="rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-black text-white disabled:bg-slate-300"
                  >
                    ＋新增取貨日期
                  </button>
                </div>
                <label className="mt-4 flex items-start gap-3 rounded-xl bg-white p-4 text-sm font-bold text-violet-950">
                  <input
                    type="checkbox"
                    checked={Boolean(form.pickupDateSelectionOpen)}
                    onChange={(e) => setForm({ ...form, pickupDateSelectionOpen: e.target.checked })}
                    className="mt-1"
                  />
                  <span>開放已付款客戶在會員訂單頁選擇取貨日期</span>
                </label>
                <textarea
                  value={form.pickupDateSelectionNotice || ''}
                  onChange={(e) => setForm({ ...form, pickupDateSelectionNotice: e.target.value })}
                  placeholder="取貨日期說明"
                  rows={2}
                  className="mt-3 w-full rounded-xl border border-violet-200 bg-white px-4 py-3"
                />
                <div className="mt-4 space-y-3">
                  {(form.pickupSlots || []).map((slot: any, index: number) => (
                    <div key={slot.id || index} className="rounded-2xl border border-violet-200 bg-white p-4">
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <select
                          value={slot.pickupStoreId || slot.pickupStoreRef || ''}
                          onChange={(e) => { const rows=[...(form.pickupSlots || [])]; rows[index]={...slot,pickupStoreId:e.target.value,pickupStoreRef:e.target.value}; setForm({...form,pickupSlots:rows}) }}
                          className="rounded-xl border border-slate-300 px-4 py-3"
                        >
                          <option value="">請選擇門市</option>
                          {(form.pickupStores || []).filter((store: any) => store.isActive !== false).map((store: any) => {
                            const value = store.id || store.clientKey
                            return <option key={value} value={value}>{store.city}｜{store.name}</option>
                          })}
                        </select>
                        <input type="date" value={slot.pickupDate || ''} onChange={(e) => { const rows=[...(form.pickupSlots || [])]; rows[index]={...slot,pickupDate:e.target.value}; setForm({...form,pickupSlots:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input type="time" value={slot.startTime || ''} onChange={(e) => { const rows=[...(form.pickupSlots || [])]; rows[index]={...slot,startTime:e.target.value}; setForm({...form,pickupSlots:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input type="time" value={slot.endTime || ''} onChange={(e) => { const rows=[...(form.pickupSlots || [])]; rows[index]={...slot,endTime:e.target.value}; setForm({...form,pickupSlots:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input type="number" min="1" placeholder="名額上限（選填）" value={slot.capacity ?? ''} onChange={(e) => { const rows=[...(form.pickupSlots || [])]; rows[index]={...slot,capacity:e.target.value === '' ? null : Number(e.target.value)}; setForm({...form,pickupSlots:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input placeholder="日期備註（選填）" value={slot.notice || ''} onChange={(e) => { const rows=[...(form.pickupSlots || [])]; rows[index]={...slot,notice:e.target.value}; setForm({...form,pickupSlots:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3 lg:col-span-2" />
                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold">
                          <input type="checkbox" checked={slot.isActive !== false} onChange={(e) => { const rows=[...(form.pickupSlots || [])]; rows[index]={...slot,isActive:e.target.checked}; setForm({...form,pickupSlots:rows}) }} />
                          啟用此日期
                        </label>
                      </div>
                      <button type="button" onClick={() => setForm({ ...form, pickupSlots: (form.pickupSlots || []).filter((_: any, rowIndex: number) => rowIndex !== index) })} className="mt-3 text-sm font-bold text-red-700">移除此日期</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-black text-slate-950">收款帳號（成團開放付款後才顯示）</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input placeholder="銀行名稱" value={form.bankName} onChange={(e) => setForm({ ...form, bankName: e.target.value })} className="rounded-xl border border-slate-300 px-4 py-3" />
                  <input placeholder="銀行代碼" value={form.bankCode} onChange={(e) => setForm({ ...form, bankCode: e.target.value })} className="rounded-xl border border-slate-300 px-4 py-3" />
                  <input placeholder="分行（選填）" value={form.bankBranch} onChange={(e) => setForm({ ...form, bankBranch: e.target.value })} className="rounded-xl border border-slate-300 px-4 py-3" />
                  <input placeholder="帳號" value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value.replace(/\D/g, '') })} className="rounded-xl border border-slate-300 px-4 py-3" />
                  <input placeholder="戶名" value={form.bankAccountName} onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })} className="rounded-xl border border-slate-300 px-4 py-3" />
                </div>
              </div>

              {error && <div className="mt-5 rounded-xl bg-red-50 p-3 font-bold text-red-700">{error}</div>}
              {message && <div className="mt-5 rounded-xl bg-emerald-50 p-3 font-bold text-emerald-800">{message}</div>}
              <button disabled={saving} className="mt-6 w-full rounded-2xl bg-orange-600 px-5 py-4 text-lg font-black text-white disabled:bg-slate-300">
                {saving ? '儲存中…' : '儲存團購活動'}
              </button>
            </form>

            {selectedId && (
              <>
                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-slate-950">團購進度與流程控制</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-2xl bg-orange-50 p-4"><div className="text-xs font-bold text-orange-700">已登記</div><div className="mt-1 text-2xl font-black text-orange-950">{Number(form.progress?.registrationValue || 0)}</div></div>
                    <div className="rounded-2xl bg-cyan-50 p-4"><div className="text-xs font-bold text-cyan-700">已確認付款</div><div className="mt-1 text-2xl font-black text-cyan-950">{Number(form.progress?.paidValue || 0)}</div></div>
                    <div className="rounded-2xl bg-slate-100 p-4"><div className="text-xs font-bold text-slate-600">通知付款門檻</div><div className="mt-1 text-2xl font-black text-slate-950">{Number(form.minRegistrationValue || 0)}</div></div>
                    <div className="rounded-2xl bg-violet-50 p-4"><div className="text-xs font-bold text-violet-700">正式成團門檻</div><div className="mt-1 text-2xl font-black text-violet-950">{Number(form.minPaidValue || 0)}</div></div>
                  </div>
                  <div className={`mt-4 rounded-2xl p-4 text-sm font-bold ${form.progress?.allActiveOrdersPaid ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'}`}>
                    有效訂單付款：{Number(form.progress?.verifiedOrderCount || 0)}／{Number(form.progress?.activeOrderCount || 0)} 筆。
                    {form.progress?.allActiveOrdersPaid ? ' 已可向供應商訂貨及進入出貨流程。' : ' 尚有未確認款項，系統會阻擋正式成團、供應商訂貨及出貨。'}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={() => void setStatus('registration_open')} className="rounded-xl bg-emerald-600 px-4 py-3 font-black text-white">開放登記</button>
                    <button onClick={() => void setStatus('registration_closed')} className="rounded-xl bg-slate-700 px-4 py-3 font-black text-white">關閉登記</button>
                    <button onClick={() => void setStatus('payment_open')} className="rounded-xl bg-cyan-700 px-4 py-3 font-black text-white">成團，開放付款</button>
                    <button onClick={() => void setStatus('payment_closed')} className="rounded-xl bg-amber-600 px-4 py-3 font-black text-white">關閉付款</button>
                    <button disabled={!form.progress?.allActiveOrdersPaid} onClick={() => void setStatus('confirmed')} className="rounded-xl bg-violet-700 px-4 py-3 font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">全部付款完成，正式成團</button>
                    <button onClick={() => void setStatus('completed')} className="rounded-xl bg-slate-950 px-4 py-3 font-black text-white">完成團購</button>
                  </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-slate-950">登記與付款名單</h2>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Excel 內含訂單總表、商品彙總、付款核對與配送名單四個工作表。
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={Boolean(exporting) || orders.length === 0}
                        onClick={() => void exportOrdersExcel('all')}
                        className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {exporting === 'all' ? '匯出中…' : '匯出全部訂單 Excel'}
                      </button>
                      <button
                        type="button"
                        disabled={Boolean(exporting) || filteredOrders.length === 0}
                        onClick={() => void exportOrdersExcel('filtered')}
                        className="rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-black text-emerald-800 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                      >
                        {exporting === 'filtered' ? '匯出中…' : `匯出目前結果（${filteredOrders.length}）`}
                      </button>
                      <button
                        type="button"
                        disabled={batchShipping || selectedOrderIds.length === 0}
                        onClick={() => void batchMarkSelectedShipped()}
                        className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-black text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {batchShipping ? '批次處理中…' : `批次標記已出貨＋寄 Email（${selectedOrderIds.length}）`}
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-4">
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜尋訂單、姓名、手機、Email" className="rounded-xl border border-slate-300 px-3 py-2" />
                    <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2">
                      <option value="">全部付款狀態</option><option value="not_open">未開放</option><option value="pending">待付款</option><option value="reported">核對中</option><option value="verified">已確認</option><option value="rejected">需重新回報</option><option value="payment_overdue">已逾期</option>
                    </select>
                    <select value={shippingFilter} onChange={(e) => setShippingFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2">
                      <option value="">全部配送方式</option>{[...new Set(orders.map((order) => order.shippingLabel))].map((label) => <option key={label} value={label}>{label}</option>)}
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-300 px-3 py-2">
                      <option value="">全部訂單狀態</option><option value="waiting_group">等待成團</option><option value="payment_open">待付款</option><option value="payment_reported">付款核對中</option><option value="payment_verified">已確認付款</option><option value="confirmed">正式成團</option><option value="shipped">已出貨</option><option value="ready_for_pickup">可取貨</option><option value="completed">已完成</option><option value="cancelled">已取消</option>
                    </select>
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-[1040px] w-full text-sm">
                      <thead><tr className="border-b text-left"><th className="p-3"><input type="checkbox" aria-label="全選目前可出貨訂單" checked={allFilteredShippableSelected} onChange={(e) => toggleAllFilteredShippable(e.target.checked)} /></th><th className="p-3">訂單</th><th className="p-3">客戶／商品</th><th className="p-3">數量</th><th className="p-3">配送</th><th className="p-3">金額</th><th className="p-3">狀態</th><th className="p-3">付款審核</th></tr></thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id} className="border-b align-top">
                            <td className="p-3">
                              <input
                                type="checkbox"
                                aria-label={`選取訂單 ${order.orderCode}`}
                                disabled={order.paymentStatus !== 'verified' || ['shipped', 'completed', 'cancelled', 'refunded'].includes(String(order.status || ''))}
                                checked={selectedOrderIds.includes(String(order.id))}
                                onChange={(e) => toggleOrderSelection(String(order.id), e.target.checked)}
                              />
                            </td>
                            <td className="p-3 font-bold">
                              <div>{order.orderCode}</div>
                              <details className="mt-2 text-xs font-normal">
                                <summary className="cursor-pointer font-black text-slate-700">查看訂單明細</summary>
                                <div className="mt-2 space-y-1 rounded-lg bg-slate-50 p-2">
                                  <div>登記時間：{new Date(order.createdAt).toLocaleString('zh-TW')}</div>
                                  <div>收件人：{order.recipientName || '付款階段填寫'}</div>
                                  <div>收件電話：{order.recipientPhone || '—'}</div>
                                  <div>地址：{order.shippingAddress || '—'}</div>
                                  <div>客戶備註：{order.customerNote || '—'}</div>
                                </div>
                              </details>
                              {order.orderPath ? (
                                <button type="button" onClick={() => void copyOrderLink(order.orderPath)} className="mt-2 rounded-lg border border-cyan-300 px-2 py-1 text-xs font-black text-cyan-800">
                                  複製客戶連結
                                </button>
                              ) : null}
                              <button type="button" onClick={() => void updateOrderNote(order)} className="mt-2 block rounded-lg border border-amber-300 px-2 py-1 text-xs font-black text-amber-800">特殊備註</button>
                              {order.paymentStatus === 'verified' && (
                                <button type="button" onClick={() => void copyPaymentConfirmedNotice(order)} className="mt-2 block rounded-lg border border-emerald-300 px-2 py-1 text-xs font-black text-emerald-800">
                                  複製付款確認文字
                                </button>
                              )}
                              {order.paymentStatus === 'rejected' && (
                                <button
                                  type="button"
                                  onClick={() => void copyPaymentRejectedNotice(order, order.paymentReports?.find((report: any) => report.status === 'rejected')?.reviewNote || '')}
                                  className="mt-2 block rounded-lg border border-red-300 px-2 py-1 text-xs font-black text-red-700"
                                >
                                  複製退回重報文字
                                </button>
                              )}
                              {order.status === 'shipped' && (
                                <button type="button" onClick={() => void copyShippedNotice(order)} className="mt-2 block rounded-lg border border-cyan-300 px-2 py-1 text-xs font-black text-cyan-800">
                                  複製出貨通知文字
                                </button>
                              )}
                            </td>
                            <td className="p-3">{order.customerName}<div className="text-slate-500">{order.customerPhone}</div><div className="text-slate-500">{order.customerEmail}</div><div className="mt-2 max-w-[260px] text-xs leading-5 text-slate-600">{order.itemSummary || '—'}</div>{order.adminNote && <div className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-900">特殊備註：{order.adminNote}</div>}</td>
                            <td className="p-3">{order.totalQuantity}</td>
                            <td className="p-3">
                              <div>{order.shippingLabel}</div>
                              {order.pickupStoreName && <div className="mt-1 text-xs font-bold text-emerald-800">{order.pickupStoreCity}｜{order.pickupStoreName}</div>}
                              {order.pickupDate && <div className="mt-1 text-xs text-slate-500">取貨日：{order.pickupDate}</div>}
                            </td>
                            <td className="p-3">
                              <div className="font-black">{Number(order.totalAmountNtd).toLocaleString()}</div>
                              {Number(order.estimatedProductCostNtd || 0) > 0 ? (
                                <div className="mt-1 text-xs leading-5 text-slate-500">
                                  商品成本 {Number(order.estimatedProductCostNtd).toLocaleString()}<br />
                                  商品毛利 {Number(order.estimatedProductGrossProfitNtd || 0).toLocaleString()}
                                </div>
                              ) : null}
                            </td>
                            <td className="p-3">
                              <div className={`mb-2 rounded-lg px-2 py-1 text-xs font-black ${order.paymentStatus === 'verified' ? 'bg-emerald-50 text-emerald-800' : order.paymentStatus === 'rejected' ? 'bg-red-50 text-red-800' : 'bg-slate-100 text-slate-600'}`}>
                                付款：{paymentStatusText[order.paymentStatus] || order.paymentStatus}
                              </div>
                              <select value={order.status} onChange={(e) => void updateOrderStatus(order.id, e.target.value)} className="rounded-lg border border-slate-300 px-2 py-2 text-xs">
                                <option value="waiting_group">等待成團</option>
                                <option value="payment_open" disabled>待付款（付款流程控制）</option>
                                <option value="payment_reported" disabled>付款核對中（付款流程控制）</option>
                                <option value="payment_verified" disabled>已付款（付款流程控制）</option>
                                <option value="confirmed">正式成團</option>
                                <option value="supplier_ordered">已向供應商訂貨</option>
                                <option value="preparing">準備中</option>
                                <option value="shipped">已出貨</option>
                                <option value="ready_for_pickup">可取貨</option>
                                <option value="completed">已完成</option>
                                <option value="cancelled">已取消</option>
                              </select>
                            </td>
                            <td className="p-3">
                              {order.paymentReports?.map((report: any) => (
                                <div key={report.id} className="mb-2 rounded-lg bg-slate-50 p-2">
                                  <div className="font-bold">{report.accountLastFive}／{report.amountNtd}</div>
                                  <div className={`mt-1 text-xs font-black ${report.status === 'verified' ? 'text-emerald-700' : report.status === 'rejected' ? 'text-red-700' : 'text-slate-500'}`}>
                                    回報狀態：{paymentReportStatusText[report.status] || report.status}
                                  </div>
                                  {report.reviewNote && <div className="mt-1 text-xs leading-5 text-slate-600">審核備註：{report.reviewNote}</div>}
                                  {report.status === 'reported' && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <button type="button" onClick={() => void verify(order.id, report.id, true, report.status)} className="rounded bg-emerald-600 px-2 py-1 font-bold text-white">確認付款</button>
                                      <button type="button" onClick={() => void verify(order.id, report.id, false, report.status)} className="rounded bg-red-600 px-2 py-1 font-bold text-white">退回重報</button>
                                    </div>
                                  )}
                                  {report.status === 'verified' && order.paymentStatus === 'verified' && (
                                    <button type="button" onClick={() => void verify(order.id, report.id, false, report.status)} className="mt-2 rounded border border-red-300 bg-white px-2 py-1 text-xs font-black text-red-700">
                                      撤銷已付款並退回
                                    </button>
                                  )}
                                </div>
                              ))}
                              {order.notifications?.length > 0 && (
                                <details className="mt-2 text-xs">
                                  <summary className="cursor-pointer font-bold text-cyan-800">查看通知紀錄（{order.notifications.length}）</summary>
                                  {order.notifications.map((notification: any) => <div key={notification.id} className="mt-1 rounded bg-cyan-50 p-2">{notification.eventType}／{notification.status === 'notification_sent' ? '站內通知已建立' : notification.status === 'notification_pending' ? '站內通知待處理' : notification.status === 'notification_failed' ? '站內通知失敗' : notification.status}</div>)}
                                </details>
                              )}
                            </td>
                          </tr>
                        ))}
                        {filteredOrders.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-slate-500">沒有符合條件的登記資料。</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
