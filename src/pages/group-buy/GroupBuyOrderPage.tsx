import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import SEO from '@/components/SEO'
import { getAuthToken, groupBuyApi } from '@/lib/groupBuyApi'
import type { OrderDetail } from '@/lib/groupBuyTypes'
import { notificationStatusText, orderStatusText, paymentStatusText } from '@/lib/groupBuyStatus'

const money = (value: number) => `NT$${Number(value || 0).toLocaleString('zh-TW')}`

const siteNotificationStatusText: Record<string, string> = {
  ...notificationStatusText,
  notification_sent: '站內通知已建立',
  notification_pending: '站內通知待處理',
  notification_failed: '站內通知建立失敗',
}

function csvCell(value: unknown) {
  const text = String(value ?? '').replace(/\r?\n/g, ' ')
  return `"${text.replace(/"/g, '""')}"`
}

function downloadCsv(fileName: string, rows: unknown[][]) {
  const content = rows.map((row) => row.map(csvCell).join(',')).join('\r\n')
  const blob = new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function dateStamp() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function safeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, ' ').trim()
}

const fmt = (value?: string | null) => value ? new Date(value).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }) : '—'

export default function GroupBuyOrderPage() {
  const { orderCode = '' } = useParams()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [payerName, setPayerName] = useState('')
  const [amountNtd, setAmountNtd] = useState('')
  const [accountLastFive, setAccountLastFive] = useState('')
  const [transferredAt, setTransferredAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [copied, setCopied] = useState('')
  const [pickupSlotId, setPickupSlotId] = useState('')
  const [pickupSubmitting, setPickupSubmitting] = useState(false)
  const [pickupSuccess, setPickupSuccess] = useState('')

  const load = async () => {
    if (!getAuthToken()) {
      navigate(`/login?returnTo=${encodeURIComponent(`/group-buy/order/${orderCode}`)}`, { replace: true })
      return
    }
    try {
      setError('')
      const data = await groupBuyApi.getOrder(orderCode)
      setDetail(data)
      setPayerName(data.order.customerName)
      setAmountNtd(String(data.order.totalAmountNtd))
      setRecipientName(data.order.recipientName || data.order.customerName)
      setRecipientPhone(data.order.recipientPhone || data.order.customerPhone)
      setPostalCode(data.order.postalCode || '')
      setShippingAddress(data.order.shippingAddress || '')
      setPickupSlotId(data.order.pickupSlotId || '')

      const latestRejectedReport = data.paymentReports?.find((report) => report.status === 'rejected')
      if (data.order.paymentStatus === 'rejected' && latestRejectedReport) {
        setPayerName(latestRejectedReport.payerName || data.order.customerName)
        setAccountLastFive(latestRejectedReport.accountLastFive || '')
        if (latestRejectedReport.transferredAt) {
          const transferredDate = new Date(latestRejectedReport.transferredAt)
          if (!Number.isNaN(transferredDate.getTime())) {
            const localTime = new Date(transferredDate.getTime() - transferredDate.getTimezoneOffset() * 60000)
            setTransferredAt(localTime.toISOString().slice(0, 16))
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || '訂單載入失敗。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [orderCode])

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!detail) return
    setError('')
    if (!/^\d{5}$/.test(accountLastFive)) return setError('請輸入匯款帳號後五碼。')
    if (Number(amountNtd) !== detail.order.totalAmountNtd) return setError('匯款金額必須與訂單應付金額相同。')
    if (
      detail.shippingMethod.methodType === 'home_delivery' &&
      (!recipientName.trim() || !recipientPhone.trim() || !shippingAddress.trim())
    ) return setError('宅配訂單請填寫完整收件資料。')

    setSubmitting(true)
    try {
      await groupBuyApi.reportPayment({
        orderCode,
        payerName,
        amountNtd: Number(amountNtd),
        accountLastFive,
        transferredAt: new Date(transferredAt).toISOString(),
        recipientName,
        recipientPhone,
        postalCode,
        shippingAddress,
        note,
      })
      setSuccess(true)
      await load()
    } catch (err: any) {
      setError(err?.message || '付款回報失敗。')
    } finally {
      setSubmitting(false)
    }
  }

  const submitPickupDate = async (event: FormEvent) => {
    event.preventDefault()
    if (!pickupSlotId) return setError('請選擇取貨日期。')
    setError('')
    setPickupSuccess('')
    setPickupSubmitting(true)
    try {
      const result = await groupBuyApi.selectPickupSlot(orderCode, pickupSlotId)
      setPickupSuccess(`已選擇取貨日期：${result.pickupDate}`)
      await load()
    } catch (err: any) {
      setError(err?.message || '取貨日期儲存失敗。')
    } finally {
      setPickupSubmitting(false)
    }
  }

  if (loading) return <main className="min-h-screen bg-slate-50 p-8 text-center">載入訂單中…</main>
  if (!detail) return <main className="min-h-screen bg-slate-50 p-8 text-center text-red-700">{error || '找不到會員名下的訂單。'}<div className="mt-4"><Link to="/my/group-buy-orders" className="font-bold text-cyan-800">返回我的團購訂單</Link></div></main>

  const latestRejectedReport = detail.paymentReports.find((report) => report.status === 'rejected')
  const isPaymentRejected = detail.order.paymentStatus === 'rejected'
  const canPay =
    isPaymentRejected ||
    (detail.campaign.status === 'payment_open' && ['not_open', 'pending'].includes(detail.order.paymentStatus))
  const canSubmitPayment = canPay && (Boolean(detail.bank) || isPaymentRejected)
  const bankSetupIncomplete = Boolean((detail as OrderDetail & { bankSetupIncomplete?: boolean }).bankSetupIncomplete)
  const isStorePickup = detail.shippingMethod.methodType === 'store_pickup'
  const canSelectPickupDate = Boolean(
    isStorePickup &&
    detail.campaign.pickupDateSelectionOpen &&
    detail.order.paymentStatus === 'verified' &&
    !['cancelled', 'refunded', 'completed'].includes(detail.order.status) &&
    (detail.pickupSlots || []).length,
  )

  const exportOrderCsv = () => {
    const orderStatus = orderStatusText[detail.order.status] || detail.order.status
    const paymentStatus = paymentStatusText[detail.order.paymentStatus] || detail.order.paymentStatus

    const rows: unknown[][] = [
      [
        '團購名稱',
        '訂單編號',
        '登記時間',
        '商品名稱',
        '單價',
        '數量',
        '商品小計',
        '配送方式',
        '配送費',
        '應付總額',
        '訂單狀態',
        '付款狀態',
      ],
      ...detail.items.map((item) => [
        detail.campaign.title,
        detail.order.orderCode,
        fmt(detail.order.createdAt),
        item.productTitle,
        Number(item.unitPriceNtd || 0),
        Number(item.quantity || 0),
        Number(item.lineTotalNtd || 0),
        detail.shippingMethod.label,
        Number(detail.order.shippingFeeNtd || 0),
        Number(detail.order.totalAmountNtd || 0),
        orderStatus,
        paymentStatus,
      ]),
    ]

    const fileName = `${safeFileName(detail.campaign.title)}_${detail.order.orderCode}_${dateStamp()}.csv`
    downloadCsv(fileName, rows)
  }

  const printOrder = () => {
    window.print()
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <SEO title={`${detail.order.orderCode}｜團購訂單`} description="查看團購登記、付款與配送狀態。" />
      <div className="mx-auto max-w-3xl space-y-5">
        <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-800">
            {orderStatusText[detail.order.status] || detail.order.status}
          </span>
          <h1 className="mt-3 text-2xl font-black text-slate-950">{detail.campaign.title}</h1>
          <p className="mt-2 text-sm text-slate-600">訂單編號：{detail.order.orderCode}</p>
          <p className="mt-1 text-sm text-slate-600">登記時間：{fmt(detail.order.createdAt)}</p>
          <div className="mt-4 flex flex-wrap gap-2 print:hidden">
            <button type="button" onClick={() => void copy(detail.order.orderCode, '訂單編號')} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-black">複製訂單編號</button>
            <button type="button" onClick={() => void copy(window.location.href, '查詢連結')} className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-black text-white">專屬訂單查詢</button>
            <button type="button" onClick={exportOrderCsv} className="rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white hover:bg-emerald-800">
              下載訂單明細 CSV
            </button>
            <button type="button" onClick={printOrder} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 hover:bg-slate-50">
              列印／儲存 PDF
            </button>
            {copied && <span className="self-center text-sm font-bold text-emerald-700">已複製{copied}</span>}
          </div>
          <div className="mt-4 rounded-2xl bg-amber-50 p-4 font-bold text-amber-900">{paymentStatusText[detail.order.paymentStatus] || detail.order.paymentStatus}</div>
          <div className="mt-5 rounded-2xl border border-slate-200 p-4">
            {detail.items.map((item) => (
              <div key={`${item.productTitle}-${item.quantity}`} className="flex justify-between border-b border-slate-100 py-3 last:border-0">
                <div><b>{item.productTitle}</b><div className="text-sm text-slate-500">{money(item.unitPriceNtd)} × {item.quantity}</div></div>
                <b>{money(item.lineTotalNtd)}</b>
              </div>
            ))}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>商品小計</span><b>{money(detail.order.itemSubtotalNtd)}</b></div>
              <div className="flex justify-between"><span>配送費</span><b>{money(detail.order.shippingFeeNtd)}</b></div>
              <div className="flex justify-between text-lg"><span>應付總額</span><b className="text-orange-700">{money(detail.order.totalAmountNtd)}</b></div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-black text-slate-950">訂單狀態時間軸</h2>
          <ol className="mt-4 border-l-2 border-orange-200 pl-5">
            {detail.events.map((event) => (
              <li key={event.id} className="relative pb-5 last:pb-0">
                <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full bg-orange-500" />
                <div className="font-black text-slate-900">{orderStatusText[event.toStatus || ''] || event.message || event.eventType}</div>
                {event.message && <div className="mt-1 text-sm text-slate-600">{event.message}</div>}
                <time className="mt-1 block text-xs text-slate-500">{fmt(event.createdAt)}</time>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-black text-slate-950">站內通知紀錄</h2>
          {detail.notifications.length ? detail.notifications.map((notification) => (
            <div key={notification.id} className="mt-3 flex flex-wrap justify-between gap-2 rounded-xl border border-slate-200 p-3 text-sm">
              <span>{notification.eventType}</span>
              <b>{siteNotificationStatusText[notification.status] || notification.status}</b>
            </div>
          )) : <p className="mt-2 text-sm text-slate-500">尚無通知紀錄。</p>}
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-black text-slate-950">配送方式</h2>
          <p className="mt-2 text-slate-700">{detail.shippingMethod.label}</p>
          {detail.shippingMethod.methodType === 'home_delivery' && (
            <div className="mt-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-950">
              <div className="font-black">❄ 夏季冷凍宅配</div>
              <p className="mt-1">
                本團夏季統一採冷凍配送。商品圖片上的「冷藏」為商品保存標示，
                並非本團配送溫層。收到商品後請依商品包裝說明保存及食用。
              </p>
            </div>
          )}
          {detail.shippingMethod.methodType === 'store_pickup' && (
            <div className="mt-3 rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-emerald-950">
              <div className="font-black">指定亞尼克門市自取（免運）</div>
              <div>取貨門市：{detail.pickupStore?.name || detail.order.pickupStoreName || '待確認'}</div>
              <div>縣市：{detail.pickupStore?.city || detail.order.pickupStoreCity || '—'}</div>
              <div>地址：{detail.pickupStore?.address || detail.order.pickupStoreAddress || '—'}</div>
              {(detail.pickupStore?.phone || detail.order.pickupStorePhone) && <div>門市電話：{detail.pickupStore?.phone || detail.order.pickupStorePhone}</div>}
              {detail.order.pickupDate ? (
                <div className="mt-2 rounded-xl bg-white px-3 py-2 font-black text-emerald-900">已選取貨日期：{detail.order.pickupDate}</div>
              ) : (
                <div className="mt-2 rounded-xl bg-amber-50 px-3 py-2 font-bold text-amber-900">取貨日期尚未確認，請等待主辦方完成供應商下單並開放選擇。</div>
              )}
              {detail.shippingMethod.pickupNotice && <div className="mt-2">注意事項：{detail.shippingMethod.pickupNotice}</div>}
            </div>
          )}
        </section>

        {isStorePickup && (
          <section className="rounded-3xl bg-white p-6 shadow-sm print:hidden">
            <h2 className="font-black text-slate-950">門市取貨日期</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {detail.campaign.pickupDateSelectionNotice || '實際取貨日期須待主辦方向供應商正式下單後確認。'}
            </p>

            {pickupSuccess && <div className="mt-4 rounded-xl bg-emerald-50 p-3 font-bold text-emerald-800">{pickupSuccess}</div>}

            {detail.order.pickupDate ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
                <div>目前取貨日期：<b>{detail.order.pickupDate}</b></div>
                <div className="mt-1 text-sm">主辦方或門市另有通知時，請以網站最新狀態為準。</div>
              </div>
            ) : canSelectPickupDate ? (
              <form onSubmit={submitPickupDate} className="mt-4">
                <label className="block text-sm font-bold text-slate-700">選擇取貨日期 *</label>
                <select
                  value={pickupSlotId}
                  onChange={(event) => setPickupSlotId(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                >
                  <option value="">請選擇日期</option>
                  {(detail.pickupSlots || []).map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.pickupDate}{slot.startTime ? ` ${slot.startTime.slice(0, 5)}` : ''}{slot.endTime ? `～${slot.endTime.slice(0, 5)}` : ''}{slot.notice ? `｜${slot.notice}` : ''}
                    </option>
                  ))}
                </select>
                <button
                  disabled={pickupSubmitting || !pickupSlotId}
                  className="mt-4 w-full rounded-xl bg-emerald-700 px-4 py-3 font-black text-white disabled:bg-slate-300"
                >
                  {pickupSubmitting ? '儲存中…' : '確認取貨日期'}
                </button>
              </form>
            ) : detail.order.paymentStatus !== 'verified' ? (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">付款確認完成後，才能選擇取貨日期。</div>
            ) : !detail.campaign.pickupDateSelectionOpen ? (
              <div className="mt-4 rounded-xl bg-cyan-50 p-4 text-sm font-bold leading-6 text-cyan-900">主辦方尚未開放取貨日期，完成供應商下單後會再通知。</div>
            ) : (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm font-bold leading-6 text-amber-900">目前沒有可選日期，請稍後再查看。</div>
            )}
          </section>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-black text-slate-950">出貨進度</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            全團付款核對完成並向供應商下單後，預計 {detail.campaign.estimatedShipMinBusinessDays}～{detail.campaign.estimatedShipMaxBusinessDays} 個工作天內出貨。
          </p>
          {detail.order.shippedAt ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-950">
              <div>實際出貨日期：<b>{fmt(detail.order.shippedAt)}</b></div>
              <div>物流公司：<b>{detail.order.shippingCarrier || '未提供'}</b></div>
              <div>物流單號：<b>{detail.order.trackingNumber || '未提供'}</b></div>
              {detail.order.shipmentNote && <div>出貨備註：{detail.order.shipmentNote}</div>}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-7 text-cyan-950">
              <div>目前進度：<b>{orderStatusText[detail.order.status] || detail.order.status}</b></div>
              <div>已向供應商下單日期：<b>{fmt(detail.campaign.supplierOrderedAt)}</b></div>
              <div>預計最晚出貨日：<b>{fmt(detail.order.promisedShipBy || detail.campaign.estimatedLatestShipAt)}</b></div>
              <div>最新出貨公告：{detail.campaign.shippingNotice || '尚未向供應商下單，實際日期將於供應商回覆後更新。'}</div>
              {detail.campaign.shippingDelayReason && <div>延期／調整原因：{detail.campaign.shippingDelayReason}</div>}
              {detail.campaign.shippingNoticeUpdatedAt && <div>公告更新時間：{fmt(detail.campaign.shippingNoticeUpdatedAt)}</div>}
            </div>
          )}
          {detail.campaign.latestShippingEstimateEvent && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
              <div className="font-black">出貨預估更新</div>
              <div>原預計最晚出貨日：{fmt(detail.campaign.latestShippingEstimateEvent.previousEstimatedLatestShipAt)}</div>
              <div>更新後預計最晚出貨日：{fmt(detail.campaign.latestShippingEstimateEvent.newEstimatedLatestShipAt)}</div>
              <div>延期／調整原因：{detail.campaign.latestShippingEstimateEvent.reason || detail.campaign.shippingDelayReason || '主辦方更新供應商排程'}</div>
              <div>公告更新時間：{fmt(detail.campaign.latestShippingEstimateEvent.createdAt)}</div>
            </div>
          )}
        </section>

        {success && (
          <section className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 print:hidden">
            <h2 className="font-black text-emerald-950">付款資料已重新送出</h2>
            <p className="mt-2 text-sm leading-6 text-emerald-900">主辦方將再次核對匯款資料，核對完成後可在此頁查看最新狀態。</p>
          </section>
        )}

        {isPaymentRejected && (
          <section className="rounded-3xl border border-red-200 bg-red-50 p-6 print:hidden">
            <h2 className="text-lg font-black text-red-950">付款資料未核對成功，請重新回報</h2>
            <p className="mt-2 text-sm leading-6 text-red-900">
              退回原因：{latestRejectedReport?.reviewNote || '匯款資料不符，請重新確認後再次送出。'}
            </p>
            <p className="mt-2 text-sm leading-6 text-red-900">下方表單已重新開放，請修正匯款人、後五碼或匯款時間後再次送出。</p>
          </section>
        )}

        {!canPay && detail.order.paymentStatus === 'not_open' && (
          <section className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <h2 className="font-black text-amber-950">目前尚未開放付款</h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">您已完成數量登記。請勿先匯款，成團後主辦方會通知付款。</p>
          </section>
        )}

        {canPay && detail.bank && (
          <section className="rounded-3xl border border-cyan-200 bg-cyan-50 p-6">
            <h2 className="text-lg font-black text-cyan-950">匯款資料</h2>
            <div className="mt-4 grid gap-2 text-sm text-cyan-950 sm:grid-cols-2">
              <div>銀行：<b>{detail.bank.name}</b></div>
              <div>銀行代碼：<b>{detail.bank.code}</b></div>
              {detail.bank.branch && <div>分行：<b>{detail.bank.branch}</b></div>}
              <div>帳號：<b>{detail.bank.account}</b></div>
              <div>戶名：<b>{detail.bank.accountName}</b></div>
              <div>付款期限：<b>{fmt(detail.campaign.paymentDeadline)}</b></div>
            </div>
          </section>
        )}

        {canPay && !detail.bank && (
          <section className={`rounded-3xl border p-6 print:hidden ${
            isPaymentRejected
              ? 'border-amber-200 bg-amber-50 text-amber-950'
              : 'border-red-200 bg-red-50 text-red-950'
          }`}>
            <h2 className="font-black">
              {isPaymentRejected ? '付款回報已重新開放' : '收款帳號尚未完成設定'}
            </h2>
            <p className="mt-2 text-sm leading-6">
              {isPaymentRejected
                ? '您已完成匯款，本次只需依退回原因修正匯款人、後五碼或匯款時間後重新送出；如需再次確認收款帳號，請聯絡主辦方。'
                : '主辦方尚未完成收款帳號設定，目前暫時無法回報付款，請稍後再查看。'}
            </p>
            {bankSetupIncomplete && !isPaymentRejected && (
              <p className="mt-2 text-sm font-bold">訂單內容仍可正常查看，不會影響已登記的商品與數量。</p>
            )}
          </section>
        )}

        {canSubmitPayment && (
          <form onSubmit={submit} className="rounded-3xl bg-white p-6 shadow-sm sm:p-8 print:hidden">
            <h2 className="text-xl font-black text-slate-950">
              {isPaymentRejected ? '重新回報付款與收件資料' : '回報付款與收件資料'}
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">匯款人姓名 *
                <input value={payerName} onChange={(e) => setPayerName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="text-sm font-bold text-slate-700">匯款金額 *
                <input value={amountNtd} onChange={(e) => setAmountNtd(e.target.value)} type="number" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="text-sm font-bold text-slate-700">帳號後五碼 *
                <input value={accountLastFive} onChange={(e) => setAccountLastFive(e.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="text-sm font-bold text-slate-700">匯款時間 *
                <input value={transferredAt} onChange={(e) => setTransferredAt(e.target.value)} type="datetime-local" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
            </div>

            {detail.shippingMethod.methodType === 'home_delivery' && (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-bold text-slate-700">收件人 *
                  <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700">收件電話 *
                  <input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700">郵遞區號
                  <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
                <label className="text-sm font-bold text-slate-700 sm:col-span-2">宅配地址 *
                  <input value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
                </label>
              </div>
            )}

            <label className="mt-4 block text-sm font-bold text-slate-700">備註
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
            {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}
            <button disabled={submitting} className="mt-5 w-full rounded-2xl bg-cyan-700 px-5 py-4 font-black text-white disabled:bg-slate-300">
              {submitting ? '送出中…' : isPaymentRejected ? '重新送出付款回報' : '送出付款回報'}
            </button>
          </form>
        )}

        {detail.paymentReports.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="font-black text-slate-950">付款回報紀錄</h2>
            {detail.paymentReports.map((report) => (
              <div key={report.id} className="mt-3 rounded-2xl border border-slate-200 p-4 text-sm">
                <div>匯款人：{report.payerName}</div>
                <div>金額：{money(report.amountNtd)}</div>
                <div>後五碼：{report.accountLastFive}</div>
                <div>狀態：{report.status === 'verified' ? '已確認' : report.status === 'rejected' ? '已退回' : report.status === 'cancelled' ? '已取消' : '核對中'}</div>
                {report.reviewNote && <div className="mt-1 text-red-700">說明：{report.reviewNote}</div>}
              </div>
            ))}
          </section>
        )}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 print:hidden">
          <h2 className="font-black text-slate-950">網站站內聯絡</h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            如訂單資料、付款或配送有問題，請使用網站站內聯絡功能，並附上本頁的訂單編號。
          </p>
        </section>

        <Link to={`/group-buy/${detail.campaign.slug}`} className="block text-center font-bold text-orange-700 print:hidden">返回團購頁</Link>
      </div>
    </main>
  )
}
