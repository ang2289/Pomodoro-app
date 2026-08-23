import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SEO from '@/components/SEO'
import { getAuthToken, groupBuyApi } from '@/lib/groupBuyApi'

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
    label: '到店取貨',
    isActive: true,
    feeMode: 'fixed',
    baseFeeNtd: 0,
    freeThresholdQuantity: null,
    freeThresholdAmountNtd: null,
    pickupName: '',
    pickupAddress: '',
    pickupPhone: '',
    pickupMapUrl: '',
    pickupTimeText: '',
    pickupNotice: '請收到可取貨通知後再前往。',
  },
])

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
    showProgress: true,
    addressCollectionStage: 'payment',
    bankName: '中華郵政',
    bankCode: '700',
    bankBranch: '',
    bankAccount: '',
    bankAccountName: '',
    products: [emptyProduct()],
    shippingMethods: defaultShipping(),
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

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
        await loadList()
      } catch (err: any) {
        setError(err?.message || '載入團購後台失敗。')
      } finally {
        setLoading(false)
      }
    })()
  }, [navigate])

  const edit = async (id: string) => {
    setError('')
    setMessage('')
    const data = await groupBuyApi.adminGetCampaign(id)
    setSelectedId(id)
    setForm({
      ...data.campaign,
      registrationStartsAt: data.campaign.registrationStartsAt?.slice(0, 16) || '',
      registrationEndsAt: data.campaign.registrationEndsAt?.slice(0, 16) || '',
      paymentDeadline: data.campaign.paymentDeadline?.slice(0, 16) || '',
      products: data.products.length ? data.products : [emptyProduct()],
      shippingMethods: data.shippingMethods.length ? data.shippingMethods : defaultShipping(),
    })
    const orderData = await groupBuyApi.adminListOrders(id)
    setOrders(orderData.orders || [])
  }

  const newCampaign = () => {
    setSelectedId('')
    setOrders([])
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
      showProgress: true,
      addressCollectionStage: 'payment',
      bankName: '中華郵政',
      bankCode: '700',
      bankBranch: '',
      bankAccount: '',
      bankAccountName: '',
      products: [emptyProduct()],
      shippingMethods: defaultShipping(),
    })
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

    setSaving(true)
    try {
      const data = await groupBuyApi.adminSaveCampaign({
        ...form,
        registrationStartsAt: form.registrationStartsAt ? new Date(form.registrationStartsAt).toISOString() : null,
        registrationEndsAt: form.registrationEndsAt ? new Date(form.registrationEndsAt).toISOString() : null,
        paymentDeadline: form.paymentDeadline ? new Date(form.paymentDeadline).toISOString() : null,
      })
      setSelectedId(data.id)
      setMessage('團購活動已儲存。')
      await loadList()
      await edit(data.id)
    } catch (err: any) {
      setError(err?.message || '儲存失敗。')
    } finally {
      setSaving(false)
    }
  }

  const setStatus = async (status: string) => {
    if (!selectedId) return
    setError('')
    try {
      await groupBuyApi.adminSetCampaignStatus(selectedId, status)
      setMessage(`狀態已改為 ${status}。`)
      await loadList()
      await edit(selectedId)
    } catch (err: any) {
      setError(err?.message || '狀態更新失敗。')
    }
  }

  const verify = async (orderId: string, reportId: string, accepted: boolean) => {
    const note = accepted ? '' : window.prompt('請輸入退回原因：') || '匯款資料不符，請重新回報。'
    await groupBuyApi.adminVerifyPayment(orderId, reportId, accepted, note)
    await edit(selectedId)
  }

  if (loading) return <main className="min-h-screen bg-slate-50 p-8 text-center">載入團購後台中…</main>

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
            <button onClick={newCampaign} className="rounded-xl bg-orange-600 px-5 py-3 font-black text-white">＋新增團購</button>
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
                        <input type="number" placeholder="團購售價" value={product.salePriceNtd} onChange={(e) => { const rows=[...form.products]; rows[index]={...product,salePriceNtd:Number(e.target.value)}; setForm({...form,products:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                        <input placeholder="單位，例如：條" value={product.unitLabel} onChange={(e) => { const rows=[...form.products]; rows[index]={...product,unitLabel:e.target.value}; setForm({...form,products:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                      </div>
                      <textarea placeholder="商品說明" value={product.description} onChange={(e) => { const rows=[...form.products]; rows[index]={...product,description:e.target.value}; setForm({...form,products:rows}) }} rows={2} className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3" />
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
                          <>
                            <input placeholder="取貨地點名稱" value={method.pickupName} onChange={(e) => { const rows=[...form.shippingMethods]; rows[index]={...method,pickupName:e.target.value}; setForm({...form,shippingMethods:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                            <input placeholder="取貨地址" value={method.pickupAddress} onChange={(e) => { const rows=[...form.shippingMethods]; rows[index]={...method,pickupAddress:e.target.value}; setForm({...form,shippingMethods:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                            <input placeholder="取貨時間" value={method.pickupTimeText} onChange={(e) => { const rows=[...form.shippingMethods]; rows[index]={...method,pickupTimeText:e.target.value}; setForm({...form,shippingMethods:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                            <input placeholder="取貨注意事項" value={method.pickupNotice} onChange={(e) => { const rows=[...form.shippingMethods]; rows[index]={...method,pickupNotice:e.target.value}; setForm({...form,shippingMethods:rows}) }} className="rounded-xl border border-slate-300 px-4 py-3" />
                          </>
                        )}
                      </div>
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
                  <h2 className="text-xl font-black text-slate-950">流程控制</h2>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={() => void setStatus('registration_open')} className="rounded-xl bg-emerald-600 px-4 py-3 font-black text-white">開放登記</button>
                    <button onClick={() => void setStatus('registration_closed')} className="rounded-xl bg-slate-700 px-4 py-3 font-black text-white">關閉登記</button>
                    <button onClick={() => void setStatus('payment_open')} className="rounded-xl bg-cyan-700 px-4 py-3 font-black text-white">成團，開放付款</button>
                    <button onClick={() => void setStatus('payment_closed')} className="rounded-xl bg-amber-600 px-4 py-3 font-black text-white">關閉付款</button>
                    <button onClick={() => void setStatus('confirmed')} className="rounded-xl bg-violet-700 px-4 py-3 font-black text-white">正式成團</button>
                    <button onClick={() => void setStatus('completed')} className="rounded-xl bg-slate-950 px-4 py-3 font-black text-white">完成團購</button>
                  </div>
                </section>

                <section className="rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-slate-950">登記與付款名單</h2>
                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-[960px] w-full text-sm">
                      <thead><tr className="border-b text-left"><th className="p-3">訂單</th><th className="p-3">客戶</th><th className="p-3">數量</th><th className="p-3">配送</th><th className="p-3">金額</th><th className="p-3">付款</th><th className="p-3">處理</th></tr></thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b align-top">
                            <td className="p-3 font-bold">{order.orderCode}</td>
                            <td className="p-3">{order.customerName}<div className="text-slate-500">{order.customerPhone}</div></td>
                            <td className="p-3">{order.totalQuantity}</td>
                            <td className="p-3">{order.shippingLabel}</td>
                            <td className="p-3">{Number(order.totalAmountNtd).toLocaleString()}</td>
                            <td className="p-3">{order.paymentStatus}</td>
                            <td className="p-3">
                              {order.paymentReports?.map((report: any) => (
                                <div key={report.id} className="mb-2 rounded-lg bg-slate-50 p-2">
                                  <div>{report.accountLastFive}／{report.amountNtd}</div>
                                  {report.status === 'reported' && (
                                    <div className="mt-2 flex gap-2">
                                      <button onClick={() => void verify(order.id, report.id, true)} className="rounded bg-emerald-600 px-2 py-1 font-bold text-white">確認</button>
                                      <button onClick={() => void verify(order.id, report.id, false)} className="rounded bg-red-600 px-2 py-1 font-bold text-white">退回</button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </td>
                          </tr>
                        ))}
                        {orders.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-500">尚無登記資料。</td></tr>}
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
