import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SEO from '@/components/SEO'
import { getAuthToken, groupBuyApi } from '@/lib/groupBuyApi'
import { orderStatusText, paymentStatusText } from '@/lib/groupBuyStatus'

const money = (value: number) => `NT$${Number(value || 0).toLocaleString('zh-TW')}`

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


type SortMode = 'newest' | 'oldest' | 'amount_desc' | 'amount_asc'

export default function MyGroupBuyOrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [openingCode, setOpeningCode] = useState('')
  const [error, setError] = useState('')

  const [keyword, setKeyword] = useState('')
  const [orderStatus, setOrderStatus] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('newest')

  useEffect(() => {
    if (!getAuthToken()) {
      navigate('/login?returnTo=%2Fmy%2Fgroup-buy-orders', { replace: true })
      return
    }

    void groupBuyApi.listMyOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err?.message || '訂單載入失敗。'))
      .finally(() => setLoading(false))
  }, [navigate])

  const filteredOrders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    const start = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null
    const end = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null

    const result = orders.filter((order) => {
      const createdAt = new Date(order.createdAt).getTime()
      const matchesKeyword =
        !normalizedKeyword ||
        String(order.orderCode || '').toLowerCase().includes(normalizedKeyword) ||
        String(order.campaignTitle || '').toLowerCase().includes(normalizedKeyword)

      return (
        matchesKeyword &&
        (!orderStatus || order.status === orderStatus) &&
        (!paymentStatus || order.paymentStatus === paymentStatus) &&
        (start == null || createdAt >= start) &&
        (end == null || createdAt <= end)
      )
    })

    return result.sort((a, b) => {
      if (sortMode === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      if (sortMode === 'amount_desc') {
        return Number(b.totalAmountNtd || 0) - Number(a.totalAmountNtd || 0)
      }
      if (sortMode === 'amount_asc') {
        return Number(a.totalAmountNtd || 0) - Number(b.totalAmountNtd || 0)
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [orders, keyword, orderStatus, paymentStatus, dateFrom, dateTo, sortMode])

  const summary = useMemo(() => ({
    all: orders.length,
    waiting: orders.filter((order) =>
      ['waiting_group', 'threshold_reached'].includes(order.status),
    ).length,
    actionRequired: orders.filter((order) =>
      ['pending', 'rejected'].includes(order.paymentStatus),
    ).length,
    reviewing: orders.filter((order) => order.paymentStatus === 'reported').length,
    delivery: orders.filter((order) =>
      ['confirmed', 'supplier_ordered', 'preparing', 'shipped', 'ready_for_pickup'].includes(order.status),
    ).length,
    completed: orders.filter((order) => order.status === 'completed').length,
  }), [orders])

  const openOrder = async (orderCode: string) => {
    setOpeningCode(orderCode)
    setError('')
    try {
      const data = await groupBuyApi.openMyOrder(orderCode)
      navigate(data.orderPath)
    } catch (err: any) {
      setError(err?.message || '無法開啟訂單。')
    } finally {
      setOpeningCode('')
    }
  }

  const resetFilters = () => {
    setKeyword('')
    setOrderStatus('')
    setPaymentStatus('')
    setDateFrom('')
    setDateTo('')
    setSortMode('newest')
  }


  const exportFilteredOrders = () => {
    if (!filteredOrders.length) return

    const rows: unknown[][] = [
      [
        '團購名稱',
        '訂單編號',
        '登記日期',
        '商品數量',
        '訂單總金額',
        '訂單狀態',
        '付款狀態',
      ],
      ...filteredOrders.map((order) => [
        order.campaignTitle,
        order.orderCode,
        new Date(order.createdAt).toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        Number(order.totalQuantity || 0),
        Number(order.totalAmountNtd || 0),
        order.campaignStatus === 'confirmed'
          ? '正式成團'
          : orderStatusText[order.status] || order.status,
        paymentStatusText[order.paymentStatus] || order.paymentStatus,
      ]),
    ]

    downloadCsv(`我的團購訂單_${dateStamp()}.csv`, rows)
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <SEO title="我的團購訂單" description="登入後查看、篩選及管理自己的團購訂單。" />

      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black text-slate-950">我的團購訂單</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              這裡只會顯示目前登入會員名下的訂單。點擊「查看訂單」即可查看付款、配送與完整進度。
            </p>
          </div>

          <button
            type="button"
            onClick={exportFilteredOrders}
            disabled={!filteredOrders.length}
            className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            匯出目前結果（Excel CSV）
          </button>
        </div>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {[
            ['全部訂單', summary.all],
            ['等待成團', summary.waiting],
            ['需要付款', summary.actionRequired],
            ['付款核對中', summary.reviewing],
            ['備貨／配送中', summary.delivery],
            ['已完成', summary.completed],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs font-bold text-slate-500">{label}</div>
              <div className="mt-1 text-2xl font-black text-slate-950">{value}</div>
            </div>
          ))}
        </section>

        <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <label className="text-sm font-bold text-slate-700 xl:col-span-2">
              關鍵字
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="訂單編號或團購名稱"
                className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>

            <label className="text-sm font-bold text-slate-700">
              訂單狀態
              <select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3">
                <option value="">全部</option>
                <option value="waiting_group">等待成團</option>
                <option value="threshold_reached">已達登記門檻</option>
                <option value="payment_open">請完成付款</option>
                <option value="payment_reported">付款核對中</option>
                <option value="payment_verified">已確認付款</option>
                <option value="confirmed">正式成團</option>
                <option value="supplier_ordered">已向供應商下單</option>
                <option value="preparing">備貨中</option>
                <option value="shipped">已出貨</option>
                <option value="ready_for_pickup">可取貨</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
                <option value="refund_pending">退款處理中</option>
                <option value="refunded">已退款</option>
              </select>
            </label>

            <label className="text-sm font-bold text-slate-700">
              付款狀態
              <select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3">
                <option value="">全部</option>
                <option value="not_open">尚未開放</option>
                <option value="pending">待付款</option>
                <option value="reported">核對中</option>
                <option value="verified">已付款</option>
                <option value="rejected">需重新回報</option>
                <option value="refunded">已退款</option>
              </select>
            </label>

            <label className="text-sm font-bold text-slate-700">
              開始日期
              <input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3" />
            </label>

            <label className="text-sm font-bold text-slate-700">
              結束日期
              <input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3" />
            </label>

            <label className="text-sm font-bold text-slate-700">
              排序
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3">
                <option value="newest">最新訂單</option>
                <option value="oldest">最舊訂單</option>
                <option value="amount_desc">金額高到低</option>
                <option value="amount_asc">金額低到高</option>
              </select>
            </label>

            <div className="flex items-end">
              <button type="button" onClick={resetFilters} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50">
                清除條件
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm font-bold text-slate-600">
            <span>共找到 {filteredOrders.length} 筆訂單</span>
            <span className="font-normal text-slate-500">
              匯出內容會依目前的查詢與篩選條件產生，可直接用 Excel 開啟。
            </span>
          </div>
        </section>

        {error && <div className="mt-5 rounded-xl bg-red-50 p-4 font-bold text-red-700">{error}</div>}

        {loading ? (
          <p className="mt-8 text-center">載入訂單中…</p>
        ) : (
          <div className="mt-5 overflow-x-auto rounded-3xl bg-white shadow-sm">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="p-4">團購名稱</th>
                  <th className="p-4">訂單編號／日期</th>
                  <th className="p-4">數量／總金額</th>
                  <th className="p-4">訂單狀態</th>
                  <th className="p-4">付款狀態</th>
                  <th className="p-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.orderCode} className="border-b last:border-0 hover:bg-slate-50">
                    <td className="p-4 font-black">{order.campaignTitle}</td>
                    <td className="p-4">
                      <b>{order.orderCode}</b>
                      <div className="mt-1 text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleString('zh-TW')}
                      </div>
                    </td>
                    <td className="p-4">
                      {order.totalQuantity} 件
                      <div className="font-black">{money(order.totalAmountNtd)}</div>
                    </td>
                    <td className="p-4">
                      {order.campaignStatus === 'confirmed'
                        ? '正式成團'
                        : orderStatusText[order.status] || order.status}
                    </td>
                    <td className="p-4">
                      {paymentStatusText[order.paymentStatus] || order.paymentStatus}
                    </td>
                    <td className="p-4">
                      <button
                        type="button"
                        disabled={openingCode === order.orderCode}
                        onClick={() => void openOrder(order.orderCode)}
                        className="rounded-xl bg-cyan-700 px-4 py-2 font-black text-white disabled:bg-slate-300"
                      >
                        {openingCode === order.orderCode ? '開啟中…' : '查看訂單'}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-500">
                      {orders.length === 0 ? '目前沒有團購訂單。' : '沒有符合查詢條件的訂單。'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
