import { useEffect, useMemo, useState } from 'react'
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

function savePendingPointTransfer(input: { planId: '99' | '199'; amount: number; email?: string; mode?: 'product-image' | 'storefront' }) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(PENDING_POINT_TRANSFER_KEY, JSON.stringify({
      ...input,
      email: String(input.email || '').trim().toLowerCase() || undefined,
      createdAt: new Date().toISOString(),
    }))
    window.dispatchEvent(new Event('rxv-pending-payment-changed'))
  } catch {
    // 暫存失敗不影響正常銀行匯款流程。
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
  bank: {
    name: string
    code: string
    branch?: string
    account: string
    accountName: string
  }
  plans: Partial<Record<PlanId, Plan>>
  error?: string
}

type ImageBundleBankInfoResponse = {
  ok: boolean
  bank: {
    name: string
    code: string
    branch?: string
    account: string
    accountName: string
  }
  product: {
    code: ImageBundlePlanId
    displayName: string
    amountNtd: number
  }
  error?: string
}


function getAuthToken() {
  if (typeof window === 'undefined') return ''
  return (window.localStorage.getItem('auth_token') || window.localStorage.getItem('token') || '').trim()
}

async function apiGet<T>(action: string): Promise<T> {
  const token = getAuthToken()
  if (!token) throw new Error('請先登入後再選擇銀行轉帳。')

  const response = await fetch(`/api/main?action=${encodeURIComponent(action)}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(String(data?.error || '讀取資料失敗。'))
  return data as T
}

async function publicApiGet<T>(action: string): Promise<T> {
  const response = await fetch(`/api/main?action=${encodeURIComponent(action)}`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(String(data?.error || '讀取資料失敗。'))
  return data as T
}

function DoublePointsPromoCard({ plan }: { plan: Plan | null }) {
  if (!DOUBLE_POINTS_PROMO_ACTIVE || !plan) return null

  const totalPoints = getPromoTotalPoints(Number(plan.points || 0))

  return (
    <section className="mb-6 rounded-2xl border-2 border-rose-200 bg-gradient-to-br from-rose-50 via-white to-amber-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-rose-600 px-3 py-1.5 text-sm font-black !text-white" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>
          🔥 限時活動｜商品圖額度雙倍送
        </span>
        <span className="text-sm font-black text-rose-700">{DOUBLE_POINTS_PROMO_END_TEXT}</span>
      </div>
      <p className="mt-3 text-xl font-black leading-relaxed text-slate-950">
        NT${plan.amount} 方案核准後，商品圖額度直接加倍
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-sm font-bold text-slate-500">原有商品圖額度</p>
          <p className="mt-1 text-xl font-black text-slate-700">{Number(plan.points || 0).toLocaleString()} 點</p>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-100/70 p-4">
          <p className="text-sm font-bold text-rose-700">活動後核准入帳</p>
          <p className="mt-1 text-2xl font-black text-rose-700">共 {totalPoints.toLocaleString()} 點</p>
        </div>
      </div>
      <ul className="mt-4 space-y-2 text-base font-bold leading-relaxed text-slate-700">
        <li>✓ 白底商品圖約 {getWhiteImageEstimate(totalPoints)} 張</li>
        <li>✓ 高級商業／社群／外送主圖約 {getCommercialImageEstimate(totalPoints)} 張</li>
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-rose-800">
        請於 {DOUBLE_POINTS_PROMO_END_TEXT} 前完成匯款並送出回報；活動資格以系統建立匯款回報時間及站方核准結果為準。
      </p>
    </section>
  )
}

function CopyValue({ label, value }: { label: string; value?: string }) {
  const [copied, setCopied] = useState(false)
  const canCopy = Boolean(value)

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
          disabled={!canCopy}
          onClick={copy}
          className="shrink-0 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {copied ? '已複製' : '複製'}
        </button>
      </div>
    </div>
  )
}

export default function BankTransferPage() {
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<BankInfoResponse | null>(null)
  const [bundleData, setBundleData] = useState<ImageBundleBankInfoResponse | null>(null)

  const plan = useMemo<Plan | null>(() => {
    if (isImageBundleMode && bundleData?.product) {
      return { id: 'image-bundle-full', amount: bundleData.product.amountNtd, points: 0, maxItems: 0, grantedMonths: 0, productType: 'image_bundle', displayName: '1,584+ 高畫質圖片素材庫完整版' }
    }
    return planId && data?.plans ? data.plans[planId] || null : null
  }, [planId, data, bundleData, isImageBundleMode])

  useEffect(() => {
    if (!planId) return

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        if (isImageBundleMode) {
          const info = await publicApiGet<ImageBundleBankInfoResponse>('get-image-bundle-bank-transfer-info')
          setBundleData(info)
          return
        }

        if (!getAuthToken()) {
          navigate('/login')
          return
        }
        const info = await apiGet<BankInfoResponse>('get-bank-transfer-info')
        setData(info)
        const selectedPlan = info?.plans?.[planId]
        if (selectedPlan && !isRelationshipMode) {
          savePendingPointTransfer({
            planId: planId as ProductImagePlanId,
            amount: Number(selectedPlan.amount || 0),
            email: info.accountEmail,
            mode,
          })
        }
      } catch (err: any) {
        setError(err?.message || '讀取銀行轉帳資訊失敗。')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [navigate, planId, mode, isRelationshipMode, isImageBundleMode])

  if (!planId) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
          <h1 className="text-xl font-black text-slate-950">請先選擇方案</h1>
          <Link to={product === "image-bundle-full" ? "/images" : product ? "/relationship-ai" : isStorefrontMode ? "/tools/product-showcase-page" : "/pricing"} className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-black !text-white">
            返回方案頁
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 text-center">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-800">銀行轉帳／人工核對</span>
          <h1 className="mt-3 text-3xl font-black text-slate-950">完成匯款後再送出回報</h1>
          <p className="mt-2 text-slate-600">{isImageBundleMode ? "完成匯款後送出回報；站方確認入帳後會核准完整圖片素材庫訂單。" : isRelationshipMode ? "站方確認銀行入帳後，將人工開通 AI 回覆軍師方案 30 天。" : isStorefrontMode ? "站方確認銀行入帳後，預計 1～2 天內人工開通或展延商品展示頁。" : "站方確認銀行入帳後，預計 1～2 天內加點並人工開通店家商品展示頁。"}</p>
        </header>

        {loading ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm text-slate-600">正在讀取匯款資訊…</div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center shadow-sm">
            <p className="font-black text-rose-800">{error}</p>
            <Link to={isImageBundleMode ? "/images" : isRelationshipMode ? "/relationship-ai" : isStorefrontMode ? "/tools/product-showcase-page" : "/pricing"} className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-black !text-white">
              返回方案頁
            </Link>
          </div>
        ) : (
          <>
            <section className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 shadow-sm">
              <p className="text-sm font-bold text-blue-700">本次選擇方案</p>
              <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-slate-950">{isImageBundleMode ? plan?.displayName : isRelationshipMode ? plan?.displayName : isStorefrontMode ? `NT${plan?.amount} 商品展示頁正式版` : `NT${plan?.amount} 商品圖點數方案`}</h2>
                  <p className="mt-1 text-slate-700">{isImageBundleMode ? `一次買斷 NT$${plan?.amount}｜完整素材包` : isRelationshipMode ? `NT$${plan?.amount}／30 天` : isStorefrontMode ? "首波方案：3 個月，付款確認後預計 1～2 天內人工開通／展延" : `原有 ${Number(plan?.points || 0).toLocaleString()} 點`}</p>
                </div>
                {isImageBundleMode ? <span className="rounded-full bg-white px-3 py-1.5 text-sm font-black text-emerald-700 shadow-sm">分類整理・一次下載</span> : !isRelationshipMode ? <span className="rounded-full bg-white px-3 py-1.5 text-sm font-black text-emerald-700 shadow-sm">
                  {isStorefrontMode ? "商品展示頁：可放商品、價格、LINE 詢問與 QR Code" : `加贈商品展示頁：${plan?.maxItems} 個商品／${plan?.grantedMonths} 個月`}
                </span> : null}
              </div>
            </section>

            {!isImageBundleMode && !isStorefrontMode && !isRelationshipMode ? <DoublePointsPromoCard plan={plan} /> : null}

            <section className="rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="text-xl font-black text-slate-950">匯款帳戶</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">可點選複製，匯款金額請使用本次方案金額。</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <CopyValue label="銀行名稱" value={(isImageBundleMode ? bundleData?.bank.name : data?.bank.name)} />
                <CopyValue label="銀行代碼" value={(isImageBundleMode ? bundleData?.bank.code : data?.bank.code)} />
                <CopyValue label="分行" value={(isImageBundleMode ? bundleData?.bank.branch : data?.bank.branch)} />
                <CopyValue label="戶名" value={(isImageBundleMode ? bundleData?.bank.accountName : data?.bank.accountName)} />
                <div className="sm:col-span-2">
                  <CopyValue label="匯款帳號" value={(isImageBundleMode ? bundleData?.bank.account : data?.bank.account)} />
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
                <p className="font-black">匯款前請確認</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  <li>匯款金額：NT${plan?.amount}</li>
                  <li>完成匯款後，請填寫匯出帳號後五碼與匯款日期。</li>
                  {DOUBLE_POINTS_PROMO_ACTIVE && !isImageBundleMode && !isStorefrontMode && !isRelationshipMode ? <li>請於 {DOUBLE_POINTS_PROMO_END_TEXT} 前完成匯款並送出回報，符合活動資格者核准後雙倍入帳。</li> : null}
                  <li>{isImageBundleMode ? "請以實際銀行入帳為準；確認收款後才會核准素材庫訂單。" : isRelationshipMode ? "匯款回報送出後，站方會依實際入帳人工核對；確認後開通 AI 回覆軍師方案 30 天。" : isStorefrontMode ? "請以實際銀行入帳為準；確認入帳後預計 1～2 天內開通或展延商品展示頁，未核對前不會開通或展延。" : "請以實際銀行入帳為準；確認入帳後預計 1～2 天內加點或開通商品頁，未核對前不會加點或開通。"}</li>
                </ul>
              </div>

              <div className="mt-6 flex">
                <Link
                  to={isImageBundleMode ? "/payment/report?product=image-bundle-full" : isRelationshipMode ? `/payment/report?product=${planId}` : `/payment/report?plan=${planId}&mode=${mode}` }
                  className="inline-flex min-h-[52px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
                  style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}
                >
                  我已完成匯款，送出回報
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
