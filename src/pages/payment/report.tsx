import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const PENDING_POINT_TRANSFER_KEY = 'rxv_pending_point_transfer_v1'

const DOUBLE_POINTS_PROMO_ACTIVE = false
const DOUBLE_POINTS_PROMO_END_TEXT = '7/10 23:59 前'

function getPromoTotalPoints(points: number) {
  return DOUBLE_POINTS_PROMO_ACTIVE ? points * 2 : points
}

function getWhiteImageEstimate(points: number) {
  return Math.floor(points / 20000)
}

function getCommercialImageEstimate(points: number) {
  return Math.floor(points / 30000)
}

function clearPendingPointTransfer(planId: '99' | '199') {
  if (typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(PENDING_POINT_TRANSFER_KEY)
    const current = raw ? JSON.parse(raw) : null
    if (!current || current.planId === planId) {
      window.localStorage.removeItem(PENDING_POINT_TRANSFER_KEY)
      window.dispatchEvent(new Event('rxv-pending-payment-changed'))
    }
  } catch {
    window.localStorage.removeItem(PENDING_POINT_TRANSFER_KEY)
    window.dispatchEvent(new Event('rxv-pending-payment-changed'))
  }
}


type ProductImagePlanId = '99' | '199'
type RelationshipPlanId = 'relationship_pro' | 'relationship_business'
type ImageBundlePlanId = 'image-bundle-full'
type PlanId = ProductImagePlanId | RelationshipPlanId | ImageBundlePlanId

type Plan = {
  id: PlanId
  amount: number
  points: number
  maxItems: number
  grantedMonths: number
  durationDays?: number
  productType: 'product_image' | 'relationship_ai' | 'image_bundle'
  displayName: string
}

type BankInfoResponse = {
  ok: boolean
  accountEmail: string
  plans: Partial<Record<PlanId, Plan>>
}

type ImageBundleBankInfoResponse = {
  ok: boolean
  product: {
    code: ImageBundlePlanId
    displayName: string
    amountNtd: number
  }
}


function getAuthToken() {
  if (typeof window === 'undefined') return ''
  return (window.localStorage.getItem('auth_token') || window.localStorage.getItem('token') || '').trim()
}

async function apiRequest<T>(action: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const token = getAuthToken()
  if (!token) throw new Error('請先登入後再送出匯款回報。')

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

async function publicApiRequest<T>(action: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const response = await fetch(`/api/main?action=${encodeURIComponent(action)}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(String(data?.error || '操作失敗，請稍後再試。'))
  return data as T
}

async function imageBundleOrderRequest<T>(action: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const response = await fetch(`/api/main?action=image-bundle-r2-${encodeURIComponent(action)}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(String(data?.error || '素材庫匯款回報送出失敗，請稍後再試。'))
  return data as T
}

function DoublePointsPromoCard({ plan }: { plan: Plan | null }) {
  if (!DOUBLE_POINTS_PROMO_ACTIVE || !plan) return null

  const totalPoints = getPromoTotalPoints(Number(plan.points || 0))

  return (
    <section className="mt-5 rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-rose-600 px-3 py-1.5 text-sm font-black !text-white" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
          🔥 限時活動｜商品圖額度雙倍送
        </span>
        <span className="text-sm font-black text-rose-700">{DOUBLE_POINTS_PROMO_END_TEXT}</span>
      </div>
      <p className="mt-3 text-lg font-black leading-relaxed text-slate-950">
        本次回報核准後可入帳共 {totalPoints.toLocaleString()} 點
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
          白底商品圖約 {getWhiteImageEstimate(totalPoints)} 張
        </p>
        <p className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700">
          高級／社群／外送主圖約 {getCommercialImageEstimate(totalPoints)} 張
        </p>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-rose-800">
        請於 {DOUBLE_POINTS_PROMO_END_TEXT} 前完成匯款並送出回報；活動資格以系統建立匯款回報時間及站方核准結果為準。
      </p>
    </section>
  )
}

function taipeiDateLocal() {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())

  const value = (type: string) => parts.find((part) => part.type === type)?.value || ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

export default function PaymentReportPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const product = searchParams.get('product')
  const legacyPlan = searchParams.get('plan')
  const planId: PlanId | null = product === 'image-bundle-full'
    ? product
    : product === 'relationship_pro' || product === 'relationship_business'
      ? product
      : legacyPlan === '199' || legacyPlan === '99'
        ? legacyPlan
        : null
  const mode = searchParams.get('mode') === 'storefront' ? 'storefront' : 'product-image'
  const isImageBundleMode = planId === 'image-bundle-full'
  const isRelationshipMode = planId === 'relationship_pro' || planId === 'relationship_business'
  const isStorefrontMode = !isImageBundleMode && mode === 'storefront'

  const [loadingInfo, setLoadingInfo] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [plans, setPlans] = useState<Partial<Record<PlanId, Plan>> | null>(null)
  const [bundleData, setBundleData] = useState<ImageBundleBankInfoResponse | null>(null)
  const [email, setEmail] = useState('')
  const [accountLastFive, setAccountLastFive] = useState('')
  const [transferDate, setTransferDate] = useState(taipeiDateLocal())
  const [note, setNote] = useState('')
  const [submittedOrderNo, setSubmittedOrderNo] = useState('')

  const plan = useMemo<Plan | null>(() => {
    if (isImageBundleMode && bundleData?.product) {
      return { id: 'image-bundle-full', amount: bundleData.product.amountNtd, points: 0, maxItems: 0, grantedMonths: 0, productType: 'image_bundle', displayName: '1,584+ 高畫質圖片素材庫完整版' }
    }
    return planId && plans ? plans[planId] || null : null
  }, [planId, plans, bundleData, isImageBundleMode])

  useEffect(() => {
    if (!planId) return

    const load = async () => {
      setLoadingInfo(true)
      setError('')
      try {
        if (isImageBundleMode) {
          const data = await publicApiRequest<ImageBundleBankInfoResponse>('get-image-bundle-bank-transfer-info', 'GET')
          setBundleData(data)
          return
        }
        if (!getAuthToken()) {
          navigate('/login')
          return
        }
        const data = await apiRequest<BankInfoResponse>('get-bank-transfer-info', 'GET')
        setPlans(data.plans)
      } catch (err: any) {
        setError(err?.message || '讀取付款資料失敗。')
      } finally {
        setLoadingInfo(false)
      }
    }

    void load()
  }, [navigate, planId, isImageBundleMode])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!planId || !plan) return

    setError('')
    if (isImageBundleMode && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('請輸入正確的 Email。')
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
    try {
      if (isImageBundleMode) {
        const result = await imageBundleOrderRequest<{ order?: { orderNo?: string; status?: string } }>('create', 'POST', {
          productCode: 'image-bundle-full',
          email: email.trim().toLowerCase(),
          accountLastFive,
          transferDate,
          note,
        })
        setSubmittedOrderNo(String(result?.order?.orderNo || ''))
      } else {
        await apiRequest('create-bank-transfer-report', 'POST', {
          planId,
          amountNtd: plan.amount,
          accountLastFive,
          transferDate,
          note: isRelationshipMode ? note : isStorefrontMode ? `[商品展示頁正式版 NT$199／3個月] ${note}`.trim() : note,
          mode: isRelationshipMode ? 'relationship-ai' : mode,
        })
        if (!isRelationshipMode) clearPendingPointTransfer(planId as ProductImagePlanId)
      }
      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || '提交匯款回報失敗。')
    } finally {
      setSubmitting(false)
    }
  }

  if (!planId) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <p className="font-black text-slate-900">請先選擇付款方案。</p>
          <Link to={product === "image-bundle-full" ? "/images" : product ? "/relationship-ai" : isStorefrontMode ? "/tools/product-showcase-page" : "/pricing"} className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-black !text-white">
            返回方案頁
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <header className="mb-6 text-center">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">銀行轉帳回報</span>
          <h1 className="mt-3 text-3xl font-black text-slate-950">填寫匯款資料</h1>
          <p className="mt-2 text-slate-600">
            {isImageBundleMode
              ? "請填寫 Email、匯出帳號後五碼與匯款日期；確認入帳後會核准完整素材庫訂單。"
              : isRelationshipMode
              ? "匯款回報送出後，站方會依實際入帳人工核對。確認後將開通 AI 回覆軍師方案 30 天。"
              : isStorefrontMode
              ? "回報送出後，站方會依實際入帳人工核對；確認後預計 1～2 天內開通或展延商品展示頁。"
              : "回報送出後，站方會依實際入帳人工核對；確認後預計 1～2 天內加點並開通商品展示頁。"}
          </p>
        </header>

        {loadingInfo ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm text-slate-600">正在讀取帳號資料…</div>
        ) : success ? (
          <section className="rounded-2xl bg-white p-8 text-center shadow-lg">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✓</div>
            <h2 className="mt-5 text-2xl font-black text-slate-950">已收到匯款回報</h2>
            <p className="mt-3 leading-relaxed text-slate-600">
              {isImageBundleMode ? "站方會依實際入帳人工核對；確認收款後會提供 7 天有效的完整素材包 R2 下載連結。此回報不需要會員登入。" : isRelationshipMode ? "站方會依實際入帳人工核對；確認後將開通 AI 回覆軍師方案 30 天。" : isStorefrontMode ? "站方會核對實際入帳；確認後，預計 1～2 天內開通或展延商品展示頁設定與使用權限。" : "站方會核對實際入帳；確認後，預計 1～2 天內加點並開通店家商品展示頁設定與使用權限。"}
            </p>
            {isImageBundleMode && submittedOrderNo ? (
              <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 font-black text-emerald-800">訂單編號：{submittedOrderNo}</p>
            ) : null}
            {!isImageBundleMode && !isStorefrontMode && !isRelationshipMode && DOUBLE_POINTS_PROMO_ACTIVE && plan && (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-bold leading-relaxed text-rose-800">
                本次活動方案核准後預計入帳共 {getPromoTotalPoints(Number(plan.points || 0)).toLocaleString()} 點。
              </p>
            )}
            <Link
              to={isImageBundleMode ? "/images" : "/"}
              className="mt-6 inline-flex min-h-[50px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 font-black !text-white shadow-md transition hover:bg-emerald-700"
              style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
            >
              {isImageBundleMode ? "返回圖片素材庫" : "返回首頁"}
            </Link>
          </section>
        ) : (
          <form onSubmit={submit} className="rounded-2xl bg-white p-6 shadow-lg">
            <section className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-700">本次回報方案</p>
              <p className="mt-1 text-xl font-black text-slate-950">{isImageBundleMode ? `${plan?.displayName}／NT$${plan?.amount}` : isRelationshipMode ? `${plan?.displayName}／NT$${plan?.amount}／30 天` : isStorefrontMode ? `NT${plan?.amount}／商品展示頁正式版 3 個月` : `NT${plan?.amount}／原有 ${Number(plan?.points || 0).toLocaleString()} 點`}</p>
            </section>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-bold leading-relaxed text-amber-900">
              {isImageBundleMode
                ? "回報送出後仍需站方核對實際入帳；確認後才會核准完整素材庫訂單。"
                : isRelationshipMode
                ? "回報送出後，站方會依實際入帳人工核對。確認後將開通 AI 回覆軍師方案 30 天。"
                : isStorefrontMode
                ? "回報送出後仍需站方核對實際入帳；確認後預計 1～2 天內開通或展延商品展示頁。"
                : "回報送出後仍需站方核對實際入帳；確認後預計 1～2 天內加點並開通商品展示頁。"}
            </div>

            {!isImageBundleMode && !isStorefrontMode && !isRelationshipMode ? <DoublePointsPromoCard plan={plan} /> : null}

            <div className="mt-5 space-y-4">
              {isImageBundleMode ? (
                <div>
                  <label htmlFor="bundleEmail" className="mb-1.5 block text-sm font-black text-slate-800">
                    Email <span className="text-rose-600">*</span>
                  </label>
                  <input
                    id="bundleEmail"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="用來核對訂單與後續接收下載資訊"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    disabled={submitting}
                  />
                </div>
              ) : null}
              <div>
                <label htmlFor="accountLastFive" className="mb-1.5 block text-sm font-black text-slate-800">
                  匯出帳號後五碼 <span className="text-rose-600">*</span>
                </label>
                <input
                  id="accountLastFive"
                  inputMode="numeric"
                  value={accountLastFive}
                  onChange={(event) => setAccountLastFive(event.target.value.replace(/\D/g, '').slice(0, 5))}
                  maxLength={5}
                  placeholder="例如 12345"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="transferDate" className="mb-1.5 block text-sm font-black text-slate-800">
                  匯款日期 <span className="text-rose-600">*</span>
                </label>
                <input
                  id="transferDate"
                  type="date"
                  value={transferDate}
                  onChange={(event) => setTransferDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  disabled={submitting}
                />
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">只需填寫匯款日期，不需要填時間。</p>
              </div>

              <div>
                <label htmlFor="note" className="mb-1.5 block text-sm font-black text-slate-800">備註（選填）</label>
                <textarea
                  id="note"
                  rows={3}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  maxLength={500}
                  placeholder={isImageBundleMode ? "例如：匯款人姓名與 Email 不同時可在此說明" : isRelationshipMode ? "例如：匯款人姓名不同時可在此說明" : isStorefrontMode ? "例如：購買商品展示頁正式版；匯款人姓名不同時可在此說明" : "例如：匯款人姓名不同時可在此說明"}
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                  disabled={submitting}
                />
              </div>
            </div>

            {error ? <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</p> : null}

            <div className="mt-6 flex">
              <button
                type="submit"
                disabled={submitting || !plan || (isImageBundleMode && !email.trim()) || !accountLastFive || !transferDate}
                className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
              >
                {submitting ? '提交中…' : '送出匯款回報'}
              </button>
            </div>

            <p className="mt-3 text-center text-xs leading-relaxed text-slate-500">
              {isImageBundleMode ? "請以實際銀行入帳與站方核准結果為準；本頁不會自動判定是否已入帳。" : isRelationshipMode ? "請以實際銀行入帳與站方核准結果為準；核准後才會開通 AI 回覆軍師方案 30 天。" : isStorefrontMode ? "請以實際銀行入帳與站方核准結果為準；確認後預計 1～2 天內開通或展延商品展示頁，未核對前不會開通或展延。" : "請以實際銀行入帳與站方核准結果為準；確認入帳後預計 1～2 天內加點並開通商品展示頁。"}
            </p>
          </form>
        )}
      </div>
    </main>
  )
}
