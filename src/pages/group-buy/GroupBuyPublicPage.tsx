import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SEO from '@/components/SEO'
import { getAuthToken, groupBuyApi } from '@/lib/groupBuyApi'
import type { Campaign } from '@/lib/groupBuyTypes'
import { canRegisterOrder, resolveCampaignRegistrationPhase } from '@/lib/groupBuyRules'

const money = (value: number) => `NT$${Number(value || 0).toLocaleString('zh-TW')}`
const fmtTaipei = (value?: string | null) => value
  ? new Intl.DateTimeFormat('zh-TW', { timeZone: 'Asia/Taipei', dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(value))
  : '尚未設定'

function countdownText(target?: string | null, nowMs = Date.now()) {
  if (!target) return '尚未設定'
  const remaining = new Date(target).getTime() - nowMs
  if (remaining <= 0) return '預計結團時間已到，主辦方尚未正式結團'
  const totalMinutes = Math.floor(remaining / 60000)
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  return `${days} 天 ${hours} 小時 ${minutes} 分`
}

function shippingFee(campaign: Campaign | null, shippingMethodId: string, quantities: Record<string, number>) {
  if (!campaign) return 0
  const method = campaign.shippingMethods.find((row) => row.id === shippingMethodId)
  if (!method) return 0
  const quantity = campaign.products.reduce((sum, p) => sum + Number(quantities[p.id] || 0), 0)
  const subtotal = campaign.products.reduce(
    (sum, p) => sum + Number(quantities[p.id] || 0) * p.salePriceNtd,
    0,
  )
  if (method.methodType === 'store_pickup') return method.baseFeeNtd || 0
  if (method.feeMode === 'quantity_free_threshold' && method.freeThresholdQuantity) {
    return quantity >= method.freeThresholdQuantity ? 0 : method.baseFeeNtd
  }
  if (method.feeMode === 'amount_free_threshold' && method.freeThresholdAmountNtd) {
    return subtotal >= method.freeThresholdAmountNtd ? 0 : method.baseFeeNtd
  }
  return method.baseFeeNtd
}

export default function GroupBuyPublicPage() {
  const { slug = '' } = useParams()
  const navigate = useNavigate()
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [shippingMethodId, setShippingMethodId] = useState('')
  const [pickupCity, setPickupCity] = useState('')
  const [pickupStoreId, setPickupStoreId] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [shippingAddress, setShippingAddress] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(Boolean(getAuthToken()))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [nowMs, setNowMs] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        const data = await groupBuyApi.getCampaign(slug)
        setCampaign(data.campaign)

        const storageKey = `group_buy_draft_${slug}`
        const rawDraft = sessionStorage.getItem(storageKey)
        let restoredShippingMethodId = ''

        if (rawDraft) {
          try {
            const draft = JSON.parse(rawDraft)
            setQuantities(draft.quantities || {})
            setCustomerName(draft.customerName || '')
            setCustomerPhone(draft.customerPhone || '')
            setRecipientName(draft.recipientName || '')
            setRecipientPhone(draft.recipientPhone || '')
            setPostalCode(draft.postalCode || '')
            setShippingAddress(draft.shippingAddress || '')
            setPickupCity(draft.pickupCity || '')
            setPickupStoreId(draft.pickupStoreId || '')
            setCustomerNote(draft.customerNote || '')
            setAccepted(Boolean(draft.accepted))
            restoredShippingMethodId = String(draft.shippingMethodId || '')
          } catch {
            sessionStorage.removeItem(storageKey)
          }
        }

        const validRestoredShipping = data.campaign.shippingMethods.some(
          (method) => method.id === restoredShippingMethodId,
        )
        const first = data.campaign.shippingMethods[0]
        setShippingMethodId(validRestoredShipping ? restoredShippingMethodId : first?.id || '')

        if (getAuthToken()) {
          try {
            const profile = await groupBuyApi.getMyProfile()
            setCustomerEmail(profile.email)
          } catch (profileError: any) {
            setError(profileError?.message || '會員資料載入失敗，請重新登入。')
          } finally {
            setProfileLoading(false)
          }
        } else {
          setProfileLoading(false)
        }
      } catch (err: any) {
        setError(err?.message || '團購資料載入失敗。')
      } finally {
        setLoading(false)
      }
    })()
  }, [slug])

  const selectedShipping = campaign?.shippingMethods.find((row) => row.id === shippingMethodId)
  const pickupCities = useMemo(
    () => [...new Set((campaign?.pickupStores || []).filter((store) => store.isActive).map((store) => store.city))],
    [campaign],
  )
  const pickupStoresInCity = useMemo(
    () => (campaign?.pickupStores || []).filter((store) => store.isActive && (!pickupCity || store.city === pickupCity)),
    [campaign, pickupCity],
  )
  const selectedPickupStore = campaign?.pickupStores?.find((store) => store.id === pickupStoreId)
  const totalQuantity = useMemo(
    () => campaign?.products.reduce((sum, p) => sum + Number(quantities[p.id] || 0), 0) || 0,
    [campaign, quantities],
  )
  const subtotal = useMemo(
    () =>
      campaign?.products.reduce(
        (sum, p) => sum + Number(quantities[p.id] || 0) * p.salePriceNtd,
        0,
      ) || 0,
    [campaign, quantities],
  )
  const fee = shippingFee(campaign, shippingMethodId, quantities)
  const total = subtotal + fee
  const registrationPhase = campaign
    ? resolveCampaignRegistrationPhase(campaign, campaign.progress, new Date(nowMs))
    : 'not_started'
  const acceptsRegistration = campaign
    ? canRegisterOrder(campaign, new Date(nowMs))
    : false

  const saveDraft = () => {
    if (!campaign) return
    sessionStorage.setItem(`group_buy_draft_${campaign.slug}`, JSON.stringify({
      quantities, shippingMethodId, pickupCity, pickupStoreId, customerName, customerPhone, recipientName,
      recipientPhone, postalCode, shippingAddress, customerNote, accepted,
    }))
  }

  const openProductDetail = (productId: string) => {
    if (!campaign) return
    saveDraft()
    navigate(`/group-buy/${campaign.slug}/product/${productId}`)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!campaign) return
    setError('')

    if (!getAuthToken()) {
      sessionStorage.setItem(
        `group_buy_draft_${campaign.slug}`,
        JSON.stringify({
          quantities,
          shippingMethodId,
          pickupCity,
          pickupStoreId,
          customerName,
          customerPhone,
          recipientName,
          recipientPhone,
          postalCode,
          shippingAddress,
          customerNote,
          accepted,
        }),
      )
      navigate(`/login?returnTo=${encodeURIComponent(`/group-buy/${campaign.slug}`)}`)
      return
    }

    if (!acceptsRegistration) return setError('主辦方已正式結團或目前未開放登記。')
    if (!customerName.trim()) return setError('請填寫訂購人姓名。')
    if (!/^09\d{8}$/.test(customerPhone.replace(/\D/g, ''))) return setError('請填寫正確的手機號碼。')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) return setError('請填寫正確的 Email。')
    if (!shippingMethodId) return setError('請選擇配送方式。')
    if (selectedShipping?.methodType === 'store_pickup' && !pickupStoreId) {
      return setError('請選擇門市自取地點。')
    }
    if (selectedShipping?.methodType === 'store_pickup' && !selectedPickupStore?.isActive) {
      return setError('所選門市目前未開放，請重新選擇。')
    }
    if (totalQuantity <= 0) return setError('請至少選擇一項商品。')
    if (!accepted) return setError('請先勾選同意團購規則。')

    if (
      campaign.addressCollectionStage === 'registration' &&
      selectedShipping?.methodType === 'home_delivery' &&
      (!recipientName.trim() || !recipientPhone.trim() || !shippingAddress.trim())
    ) {
      return setError('宅配訂單請填寫完整收件資料。')
    }

    setSubmitting(true)
    try {
      const data = await groupBuyApi.registerOrder({
        campaignSlug: campaign.slug,
        shippingMethodId,
        pickupStoreId: selectedShipping?.methodType === 'store_pickup' ? pickupStoreId : null,
        customerName,
        customerPhone,
        customerEmail,
        rulesAccepted: accepted,
        recipientName,
        recipientPhone,
        postalCode,
        shippingAddress,
        customerNote,
        items: campaign.products
          .map((product) => ({ productId: product.id, quantity: Number(quantities[product.id] || 0) }))
          .filter((item) => item.quantity > 0),
      })
      sessionStorage.removeItem(`group_buy_draft_${campaign.slug}`)
      navigate(data.orderPath)
    } catch (err: any) {
      setError(err?.message || '送出登記失敗。')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <main className="min-h-screen bg-slate-50 p-8 text-center">載入團購資料中…</main>
  if (!campaign) return <main className="min-h-screen bg-slate-50 p-8 text-center text-red-700">{error || '找不到團購。'}</main>

  const remaining = Math.max(0, campaign.minRegistrationValue - campaign.progress.registrationValue)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <SEO title={`${campaign.title}｜團購登記`} description={campaign.description || '先登記，成團後再付款。'} />
      <div className="mx-auto max-w-5xl">
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          {campaign.coverImageUrl && (
            <img src={campaign.coverImageUrl} alt={campaign.title} className="h-60 w-full object-cover sm:h-80" />
          )}
          <div className="p-6 sm:p-8">
            <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-800">
              先登記・成團後付款
            </span>
            <h1 className="mt-3 text-3xl font-black text-slate-950">{campaign.title}</h1>
            {campaign.description && <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{campaign.description}</p>}
            {campaign.organizerDisclaimer && <p className="mt-3 text-sm leading-6 text-slate-500">{campaign.organizerDisclaimer}</p>}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                    免運自取
                  </span>
                  <span className="font-black text-emerald-950">
                    指定亞尼克門市自取，買 1 條也免運
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-emerald-900">
                  登記時先選取貨門市；實際取貨日期將於成團、付款完成並向供應商下單後通知。
                </p>
              </div>

              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cyan-700 px-3 py-1 text-xs font-black text-white">
                    冷凍宅配
                  </span>
                  <span className="font-black text-cyan-950">
                    未滿 10 條運費 200 元，滿 10 條免運
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-cyan-900">
                  門市自取與冷凍宅配可擇一；「買 1 條免運」僅適用指定門市自取。
                </p>
              </div>
            </div>

            {campaign.showProgress && (
              <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-slate-800">
                  <div className="min-w-0 text-sm font-black leading-6">
                    <span className="block sm:inline">
                      目前已登記 {campaign.progress.registrationValue} 條
                    </span>
                    <span className="block sm:ml-2 sm:inline">
                      成團門檻 {campaign.minRegistrationValue} 條
                    </span>
                  </div>
                  <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-white px-3 py-1 text-base font-black text-orange-700">
                    {Math.min(100, campaign.progress.registrationPercent)}%
                  </span>
                </div>
                <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, campaign.progress.registrationPercent)}%` }} />
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  {remaining > 0
                    ? `目前已登記 ${campaign.progress.registrationValue} 條，尚差 ${remaining} 條達到最低成團門檻。`
                    : '本團已達最低成團門檻，仍可繼續登記。主辦方正式結團後才會通知付款，請勿先行匯款。'}
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 sm:grid-cols-3">
              <div><span className="block text-xs font-bold text-slate-500">開放登記時間</span><b>{fmtTaipei(campaign.registrationStartsAt)}</b></div>
              <div><span className="block text-xs font-bold text-slate-500">預計結團時間</span><b>{fmtTaipei(campaign.registrationEndsAt)}</b></div>
              <div><span className="block text-xs font-bold text-slate-500">預計結團倒數</span><b>{countdownText(campaign.registrationEndsAt, nowMs)}</b></div>
            </div>

            {registrationPhase === 'registration_deadline_soon' && (
              <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">距離預計結團時間剩不到24小時，目前仍可登記。</div>
            )}
            {['deadline_reached_threshold', 'deadline_reached_can_extend', 'deadline_reached_unreached_final'].includes(registrationPhase) && (
              <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm leading-6 text-slate-700">預計結團時間已到，主辦方正在確認最終數量。正式結團前仍可登記，但可能隨時關閉。</div>
            )}

            {campaign.registrationExtensionCount > 0 && (
              <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4 text-sm leading-6 text-violet-950">
                <div className="font-black">本團已延長登記</div>
                <div>原預計結團時間：{fmtTaipei(campaign.originalRegistrationEndsAt)}</div>
                <div>新的預計結團時間：{fmtTaipei(campaign.registrationEndsAt)}</div>
                <div>延長原因：{campaign.lastRegistrationExtensionReason || '主辦方調整登記期限'}</div>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
              現在只完成數量登記，請勿先行匯款。成團後會通知正式付款金額與期限。
            </div>

            <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-bold leading-6 text-orange-950">
              達到{campaign.minRegistrationValue}條只代表已達成團門檻，不會自動結團或開放付款；主辦方正式結團前仍可繼續登記，且不會顯示銀行帳號。未達門檻時可能延長一次。
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-950">
              <div className="font-black">❄ 夏季配送提醒</div>
              <p className="mt-1">
                選擇宅配的訂單，夏季統一採冷凍宅配，以維持商品配送品質。
                商品圖片上的「冷藏」為商品保存標示，並非本團配送方式。
                收到商品後，請依商品包裝上的保存及食用說明處理。
              </p>
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="mt-6 space-y-6">
          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-slate-950">1. 選擇商品與數量</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {campaign.products.map((product) => {
                const quantity = Number(quantities[product.id] || 0)
                return (
                  <article key={product.id} className="rounded-2xl border border-slate-200 p-4">
                    {product.imageUrl && (
                      <button
                        type="button"
                        onClick={() => openProductDetail(product.id)}
                        aria-label={`查看${product.title}商品詳情`}
                        title={`查看${product.title}商品詳情`}
                        className="group mb-4 block w-full overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="h-44 w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        />
                      </button>
                    )}
                    <h3>
                      <button
                        type="button"
                        onClick={() => openProductDetail(product.id)}
                        className="text-left font-black text-slate-950 hover:text-orange-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                      >
                        {product.title}
                      </button>
                    </h3>
                    {product.description && <p className="mt-1 text-sm leading-6 text-slate-600">{product.description}</p>}
                    <p className="mt-3 text-lg font-black text-orange-700">{money(product.salePriceNtd)}／{product.unitLabel}</p>
                    <button
                      type="button"
                      onClick={() => openProductDetail(product.id)}
                      className="mt-3 rounded-xl border border-slate-300 px-4 py-2 text-sm font-black text-slate-700 hover:bg-slate-50"
                    >
                      查看商品詳情
                    </button>
                    <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold leading-5 text-cyan-950">
                      <div>❄ 宅配採冷凍配送；指定門市自取 1 條也免運</div>
                      <div className="font-normal">圖片「冷藏」為商品保存標示</div>
                    </div>
                    <div className="mt-4 flex items-center gap-3">
                      <button type="button" className="h-11 w-11 rounded-xl border border-slate-300 text-xl font-black" onClick={() => setQuantities((old) => ({ ...old, [product.id]: Math.max(0, quantity - 1) }))}>−</button>
                      <input
                        value={quantity}
                        onChange={(event) => setQuantities((old) => ({ ...old, [product.id]: Math.max(0, Number(event.target.value || 0)) }))}
                        type="number"
                        min={0}
                        className="h-11 w-20 rounded-xl border border-slate-300 text-center font-black"
                      />
                      <button type="button" className="h-11 w-11 rounded-xl border border-slate-300 text-xl font-black" onClick={() => setQuantities((old) => ({ ...old, [product.id]: quantity + 1 }))}>＋</button>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-slate-950">2. 配送方式</h2>
            <div
              role="radiogroup"
              aria-label="配送方式"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
                marginTop: '16px',
                width: '100%',
                minWidth: 0,
              }}
            >
              {campaign.shippingMethods.map((method) => {
                const selected = shippingMethodId === method.id

                return (
                  <div
                    key={method.id}
                    role="radio"
                    aria-checked={selected}
                    tabIndex={0}
                    onClick={() => setShippingMethodId(method.id)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        setShippingMethodId(method.id)
                      }
                    }}
                    style={{
                      display: 'block',
                      width: '100%',
                      minWidth: 0,
                      maxWidth: '100%',
                      height: 'auto',
                      minHeight: '136px',
                      boxSizing: 'border-box',
                      padding: '20px',
                      borderRadius: '16px',
                      border: selected ? '2px solid #f97316' : '2px solid #e2e8f0',
                      background: selected ? '#fff7ed' : '#ffffff',
                      boxShadow: selected ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      writingMode: 'horizontal-tb',
                      whiteSpace: 'normal',
                      overflow: 'hidden',
                      outline: 'none',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px',
                        width: '100%',
                        minWidth: 0,
                        writingMode: 'horizontal-tb',
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flex: '0 0 20px',
                          width: '20px',
                          height: '20px',
                          marginTop: '4px',
                          boxSizing: 'border-box',
                          borderRadius: '9999px',
                          border: selected ? '2px solid #ea580c' : '2px solid #cbd5e1',
                          background: '#ffffff',
                        }}
                      >
                        {selected && (
                          <span
                            style={{
                              display: 'block',
                              width: '10px',
                              height: '10px',
                              borderRadius: '9999px',
                              background: '#ea580c',
                            }}
                          />
                        )}
                      </span>

                      <div
                        style={{
                          display: 'block',
                          flex: '1 1 auto',
                          minWidth: 0,
                          width: 'auto',
                          writingMode: 'horizontal-tb',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            gap: '8px',
                            minWidth: 0,
                            writingMode: 'horizontal-tb',
                          }}
                        >
                          <span
                            style={{
                              display: 'inline',
                              minWidth: 0,
                              fontSize: '18px',
                              lineHeight: '28px',
                              fontWeight: 900,
                              color: '#0f172a',
                              writingMode: 'horizontal-tb',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                            }}
                          >
                            {method.label}
                          </span>
                          <span
                            style={{
                              display: 'inline-flex',
                              flex: '0 0 auto',
                              alignItems: 'center',
                              borderRadius: '9999px',
                              padding: '4px 10px',
                              fontSize: '12px',
                              lineHeight: '16px',
                              fontWeight: 900,
                              color: method.methodType === 'store_pickup' ? '#065f46' : '#164e63',
                              background: method.methodType === 'store_pickup' ? '#d1fae5' : '#cffafe',
                              writingMode: 'horizontal-tb',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {method.methodType === 'store_pickup' ? '免運自取' : '冷凍配送'}
                          </span>
                        </div>

                        <div
                          style={{
                            marginTop: '8px',
                            fontSize: '14px',
                            lineHeight: '24px',
                            color: '#475569',
                            writingMode: 'horizontal-tb',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {method.methodType === 'store_pickup'
                            ? '從本團已確認的亞尼克門市中選擇；登記時不需選取貨日期。'
                            : method.feeMode === 'quantity_free_threshold' && method.freeThresholdQuantity
                              ? `未滿 ${method.freeThresholdQuantity} 件運費 ${money(method.baseFeeNtd)}，滿 ${method.freeThresholdQuantity} 件免運。`
                              : `宅配運費 ${money(method.baseFeeNtd)}。`}
                        </div>

                        {method.pickupTimeText && (
                          <div
                            style={{
                              marginTop: '8px',
                              fontSize: '14px',
                              lineHeight: '24px',
                              fontWeight: 700,
                              color: '#334155',
                              writingMode: 'horizontal-tb',
                              whiteSpace: 'normal',
                            }}
                          >
                            取貨時間：{method.pickupTimeText}
                          </div>
                        )}

                        {method.methodType === 'home_delivery' && (
                          <div
                            style={{
                              marginTop: '10px',
                              fontSize: '12px',
                              lineHeight: '20px',
                              fontWeight: 700,
                              color: '#155e75',
                              writingMode: 'horizontal-tb',
                              whiteSpace: 'normal',
                            }}
                          >
                            夏季全程冷凍配送；圖片上的「冷藏」為商品保存方式。
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {selectedShipping?.methodType === 'store_pickup' && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="font-black text-emerald-950">選擇亞尼克取貨門市</div>
                <p className="mt-2 text-sm leading-6 text-emerald-900">
                  僅能選擇本頁清單中的門市。實際取貨日期須待結團、付款完成及主辦方向供應商正式下單後，再於會員訂單頁選擇。
                </p>
                {pickupCities.length ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label className="text-sm font-bold text-slate-700">縣市 *
                      <select
                        value={pickupCity}
                        onChange={(event) => {
                          setPickupCity(event.target.value)
                          setPickupStoreId('')
                        }}
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                      >
                        <option value="">請選擇縣市</option>
                        {pickupCities.map((city) => <option key={city} value={city}>{city}</option>)}
                      </select>
                    </label>
                    <label className="text-sm font-bold text-slate-700">取貨門市 *
                      <select
                        value={pickupStoreId}
                        onChange={(event) => setPickupStoreId(event.target.value)}
                        disabled={!pickupCity}
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 disabled:bg-slate-100"
                      >
                        <option value="">{pickupCity ? '請選擇門市' : '請先選擇縣市'}</option>
                        {pickupStoresInCity.map((store) => (
                          <option key={store.id} value={store.id}>{store.name}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900">
                    主辦方尚未建立可選門市，請改選冷凍宅配。
                  </div>
                )}
                {selectedPickupStore && (
                  <div className="mt-4 rounded-xl bg-white p-4 text-sm leading-6 text-slate-700">
                    <div className="font-black text-slate-950">{selectedPickupStore.city}｜{selectedPickupStore.name}</div>
                    <div>{selectedPickupStore.address}</div>
                    {selectedPickupStore.phone && <div>電話：{selectedPickupStore.phone}</div>}
                    {selectedPickupStore.businessHours && <div>營業時間：{selectedPickupStore.businessHours}</div>}
                  </div>
                )}
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-black text-slate-950">3. 登記資料</h2>
            {!getAuthToken() && (
              <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-950">
                可先選商品與數量；送出登記前需要登入會員。登入後會回到本頁，並保留目前填寫內容。
              </div>
            )}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">姓名 *
                <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="text-sm font-bold text-slate-700">手機 *
                <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} inputMode="numeric" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
              </label>
              <label className="text-sm font-bold text-slate-700">會員 Email
                <input
                  readOnly
                  value={profileLoading ? '會員資料載入中…' : customerEmail}
                  placeholder={getAuthToken() ? '會員 Email 載入中' : '登入後自動帶入'}
                  type="email"
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-100 px-4 py-3 text-slate-700"
                />
                <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">
                  訂單會自動綁定目前登入會員，不可改用其他 Email。
                </span>
              </label>
            </div>

            {campaign.addressCollectionStage === 'registration' && selectedShipping?.methodType === 'home_delivery' && (
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
              <textarea value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3" />
            </label>
          </section>

          <section className="sticky bottom-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="grid gap-2 text-sm text-slate-700 sm:grid-cols-4">
              <div>商品數量：<b>{totalQuantity}</b></div>
              <div>商品小計：<b>{money(subtotal)}</b></div>
              <div>配送費：<b>{money(fee)}</b></div>
              <div>預估總額：<b className="text-lg text-orange-700">{money(total)}</b></div>
            </div>
            <label className="mt-4 flex gap-3 text-sm leading-6 text-slate-700">
              <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
              <span>我了解本次為先登記、成團後付款；未收到付款通知前不先匯款。</span>
            </label>
            {error && <div className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</div>}
            <button disabled={submitting || profileLoading || !acceptsRegistration} className="mt-4 w-full rounded-2xl bg-orange-600 px-5 py-4 text-lg font-black text-white disabled:cursor-not-allowed disabled:bg-slate-300">
              {submitting
                ? '送出中…'
                : profileLoading
                  ? '會員資料載入中…'
                  : !acceptsRegistration
                    ? '主辦方已正式結團'
                    : getAuthToken()
                      ? '送出團購登記'
                      : '登入後送出團購登記'}
            </button>
          </section>
        </form>
      </div>
    </main>
  )
}
