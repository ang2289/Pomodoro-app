import { ChangeEvent, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type StorefrontProfileType = 'business' | 'supplier' | 'group_host'

type Storefront = {
  id: string
  slug: string
  profile_type?: StorefrontProfileType | string | null
  display_name: string
  contact_name?: string | null
  job_title?: string | null
  bio?: string | null
  logo_url?: string | null
  cover_image_url?: string | null
  tagline?: string | null
  line_id?: string | null
  address_text?: string | null
  map_url?: string | null
  business_hours_text?: string | null
  service_area_text?: string | null
  primary_cta_label?: string | null
  primary_cta_url?: string | null
  phone?: string | null
  line_url?: string | null
  email?: string | null
  website_url?: string | null
  facebook_url?: string | null
  instagram_url?: string | null
  shopee_url?: string | null
  delivery_url?: string | null
  is_public: boolean
  expires_at?: string | null
}

type Entitlement = { plan_code: string; max_items: number; starts_at?: string | null; expires_at?: string | null }

type SupplierProfile = {
  supply_types: string[]
  product_categories: string[]
  supplier_intro: string
  minimum_order_text: string
  shipping_origin: string
  delivery_regions: string[]
  lead_time_text: string
  cooperation_terms: string
  cooperation_button_label: string
  cooperation_button_url: string
  is_accepting_collaboration: boolean
}

type BasicItem = { id?: string; title: string; description: string; image_url?: string }
type FaqItem = { id?: string; question: string; answer: string }
type ProductItem = { id?: string; title: string; description: string; image_url: string; price_text: string; button_label: string; button_url: string }

type StorefrontStatsBucket = {
  views: number
  lineClicks: number
  phoneClicks: number
  websiteClicks: number
  facebookClicks: number
  instagramClicks: number
  shopeeClicks: number
  primaryCtaClicks: number
}

type StorefrontAnalytics = {
  today: StorefrontStatsBucket
  month: StorefrontStatsBucket
  total: StorefrontStatsBucket
}

type StorefrontResponse = {
  storefront: Storefront | null
  entitlement?: Entitlement | null
  supplierProfile?: Partial<SupplierProfile> | null
  serviceItems?: BasicItem[]
  portfolioItems?: BasicItem[]
  processSteps?: BasicItem[]
  faqItems?: FaqItem[]
  items?: ProductItem[]
  analytics?: StorefrontAnalytics
}

const fieldClass = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100'
const primaryButtonClass = 'inline-flex min-h-12 items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-extrabold !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50'
const secondaryButtonClass = 'inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-extrabold !text-emerald-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-500 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50'
const uploadButtonClass = 'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-extrabold !text-slate-800 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50'

function getAuthToken() {
  if (typeof window === 'undefined') return ''
  return String(localStorage.getItem('auth_token') || localStorage.getItem('token') || '').trim()
}

function normalizeUrl(value: string) {
  const text = value.trim()
  if (!text) return ''
  return /^(https?:|line:|tel:|mailto:)/i.test(text) ? text : `https://${text}`
}

function textToList(value: string) {
  return value.split(/[\n,、]/g).map((item) => item.trim()).filter(Boolean)
}

function listToText(value: string[] | null | undefined) {
  return Array.isArray(value) ? value.filter(Boolean).join('、') : ''
}

function emptySupplier(): SupplierProfile {
  return {
    supply_types: [], product_categories: [], supplier_intro: '', minimum_order_text: '', shipping_origin: '',
    delivery_regions: [], lead_time_text: '', cooperation_terms: '', cooperation_button_label: '申請團購合作',
    cooperation_button_url: '', is_accepting_collaboration: true,
  }
}

function normalizeSupplier(value: Partial<SupplierProfile> | null | undefined): SupplierProfile {
  const empty = emptySupplier()
  return {
    supply_types: Array.isArray(value?.supply_types) ? value.supply_types.filter(Boolean) : empty.supply_types,
    product_categories: Array.isArray(value?.product_categories) ? value.product_categories.filter(Boolean) : empty.product_categories,
    supplier_intro: typeof value?.supplier_intro === 'string' ? value.supplier_intro : '',
    minimum_order_text: typeof value?.minimum_order_text === 'string' ? value.minimum_order_text : '',
    shipping_origin: typeof value?.shipping_origin === 'string' ? value.shipping_origin : '',
    delivery_regions: Array.isArray(value?.delivery_regions) ? value.delivery_regions.filter(Boolean) : empty.delivery_regions,
    lead_time_text: typeof value?.lead_time_text === 'string' ? value.lead_time_text : '',
    cooperation_terms: typeof value?.cooperation_terms === 'string' ? value.cooperation_terms : '',
    cooperation_button_label: value?.cooperation_button_label?.trim() || empty.cooperation_button_label,
    cooperation_button_url: typeof value?.cooperation_button_url === 'string' ? value.cooperation_button_url : '',
    is_accepting_collaboration: value?.is_accepting_collaboration !== false,
  }
}

function emptyBasic(): BasicItem { return { title: '', description: '', image_url: '' } }
function emptyFaq(): FaqItem { return { question: '', answer: '' } }
function emptyProduct(): ProductItem { return { title: '', description: '', image_url: '', price_text: '', button_label: '立即詢問', button_url: '' } }

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('圖片讀取失敗。'))
    reader.onerror = () => reject(new Error('圖片讀取失敗。'))
    reader.readAsDataURL(file)
  })
}

async function apiRequest<T>(action: string, method: 'GET' | 'POST', body?: unknown): Promise<T> {
  const token = getAuthToken()
  if (!token) throw new Error('登入已失效，請重新登入後再設定公開頁。')
  const response = await fetch(`/api/main?action=${encodeURIComponent(action)}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(String(data?.error || '操作失敗，請稍後再試。'))
  return data as T
}

function formatDate(value?: string | null) {
  if (!value) return '尚未設定'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '尚未設定' : date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })
}

function normalizeProfile(value?: string | null): StorefrontProfileType {
  return value === 'supplier' || value === 'group_host' ? value : 'business'
}

function storefrontPlanLabel(value?: string | null) {
  if (value === 'storefront_trial_7d') return '7 天免費試用'
  if (value === 'product_showcase_standard') return '商品展示頁正式版'
  if (value === 'product_showcase_basic') return '商品展示基本版'
  if (value === 'brand_website_basic_gift_3m') return '名片贈送品牌網站 3 個月'
  if (value === 'digital_business_card_6m') return '一頁式品牌網站 6 個月'
  if (value === 'digital_business_card_3m') return '一頁式品牌網站 3 個月'
  return value || '尚未設定'
}


function emptyAnalytics(): StorefrontAnalytics {
  const bucket = () => ({ views: 0, lineClicks: 0, phoneClicks: 0, websiteClicks: 0, facebookClicks: 0, instagramClicks: 0, shopeeClicks: 0, primaryCtaClicks: 0 })
  return { today: bucket(), month: bucket(), total: bucket() }
}

function formatCount(value: number) {
  return Math.max(0, Number(value || 0)).toLocaleString('zh-TW')
}

function MoveButtons({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (to: number) => void; onRemove: () => void }) {
  return <div className="flex flex-wrap gap-2">
    {index > 0 ? <button type="button" onClick={() => onMove(index - 1)} className="rounded-full px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-100">上移</button> : null}
    {index < count - 1 ? <button type="button" onClick={() => onMove(index + 1)} className="rounded-full px-3 py-1.5 text-xs font-black text-slate-700 hover:bg-slate-100">下移</button> : null}
    <button type="button" onClick={onRemove} className="rounded-full px-3 py-1.5 text-xs font-black text-rose-700 hover:bg-rose-50">移除</button>
  </div>
}

export default function StorefrontSettingsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [storefront, setStorefront] = useState<Storefront | null>(null)
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null)
  const [supplier, setSupplier] = useState<SupplierProfile>(emptySupplier())
  const [services, setServices] = useState<BasicItem[]>([])
  const [portfolio, setPortfolio] = useState<BasicItem[]>([])
  const [processSteps, setProcessSteps] = useState<BasicItem[]>([])
  const [faqs, setFaqs] = useState<FaqItem[]>([])
  const [products, setProducts] = useState<ProductItem[]>([])
  const [analytics, setAnalytics] = useState<StorefrontAnalytics>(emptyAnalytics())

  const profileType = normalizeProfile(storefront?.profile_type)
  const isSupplier = profileType === 'supplier'
  const maxProducts = Math.max(0, Number(entitlement?.max_items || 0))
  const hasProductShowcase = maxProducts > 0
  const isTrialPlan = entitlement?.plan_code === 'storefront_trial_7d'
  const planLabel = storefrontPlanLabel(entitlement?.plan_code)
  const publicUrl = useMemo(() => storefront?.slug && typeof window !== 'undefined' ? `${window.location.origin}/shop/${storefront.slug}` : '', [storefront?.slug])
  const canShare = Boolean(storefront?.is_public && publicUrl)
  const qrUrl = useMemo(() => canShare ? `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(publicUrl)}` : '', [canShare, publicUrl])

  const load = async (withMessage = false) => {
    setLoading(true)
    setError('')
    try {
      const data = await apiRequest<StorefrontResponse>('get-my-storefront', 'GET')
      if (!data.storefront) throw new Error('目前尚未找到可設定的一頁式介紹網站資格。')
      setStorefront(data.storefront)
      setEntitlement(data.entitlement || null)
      setSupplier(normalizeSupplier(data.supplierProfile))
      setServices(Array.isArray(data.serviceItems) ? data.serviceItems.map((item) => ({ ...emptyBasic(), ...item })) : [])
      setPortfolio(Array.isArray(data.portfolioItems) ? data.portfolioItems.map((item) => ({ ...emptyBasic(), ...item })) : [])
      setProcessSteps(Array.isArray(data.processSteps) ? data.processSteps.map((item) => ({ ...emptyBasic(), ...item })) : [])
      setFaqs(Array.isArray(data.faqItems) ? data.faqItems.map((item) => ({ ...emptyFaq(), ...item })) : [])
      setProducts(Array.isArray(data.items) ? data.items.map((item) => ({ ...emptyProduct(), ...item })) : [])
      setAnalytics(data.analytics || emptyAnalytics())
      if (withMessage) setMessage('資料已重新讀取。')
    } catch (err: any) {
      setStorefront(null)
      setError(err?.message || '讀取公開頁設定失敗。')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!getAuthToken()) { navigate('/login'); return }
    void load()
  }, [navigate])

  const updateStorefront = <K extends keyof Storefront>(key: K, value: Storefront[K]) => {
    setStorefront((current) => current ? { ...current, [key]: value } : current)
  }

  const changeProfileType = (next: StorefrontProfileType) => {
    updateStorefront('profile_type', next)
    if (next !== 'supplier' && /團購.*合作|申請.*團購/.test(String(storefront?.primary_cta_label || ''))) {
      updateStorefront('primary_cta_label', '')
      updateStorefront('primary_cta_url', '')
    }
  }

  const updateBasic = (setter: Dispatch<SetStateAction<BasicItem[]>>, index: number, key: keyof BasicItem, value: string) => {
    setter((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  }
  const moveBasic = (setter: Dispatch<SetStateAction<BasicItem[]>>, from: number, to: number) => {
    setter((current) => { if (to < 0 || to >= current.length) return current; const next = [...current]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next })
  }
  const removeBasic = (setter: Dispatch<SetStateAction<BasicItem[]>>, index: number) => setter((current) => current.filter((_, itemIndex) => itemIndex !== index))

  const updateFaq = (index: number, key: keyof FaqItem, value: string) => setFaqs((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  const moveFaq = (from: number, to: number) => setFaqs((current) => { if (to < 0 || to >= current.length) return current; const next = [...current]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next })
  const updateProduct = (index: number, key: keyof ProductItem, value: string) => setProducts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item))
  const moveProduct = (from: number, to: number) => setProducts((current) => { if (to < 0 || to >= current.length) return current; const next = [...current]; const [item] = next.splice(from, 1); next.splice(to, 0, item); return next })

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>, target: 'logo' | 'cover' | { kind: 'portfolio' | 'product'; index: number }) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('請上傳 JPG、PNG 或 WebP 圖片。'); return }
    if (file.size > 5 * 1024 * 1024) { setError('圖片請控制在 5MB 以下。'); return }
    const key = typeof target === 'string' ? target : `${target.kind}-${target.index}`
    setUploading(key); setError(''); setMessage('')
    try {
      const base64 = await fileToDataUrl(file)
      const data = await apiRequest<{ imageUrl: string }>('upload-storefront-image', 'POST', { base64, fileName: file.name, kind: key })
      if (!data.imageUrl) throw new Error('圖片上傳後沒有取得網址。')
      if (target === 'logo') updateStorefront('logo_url', data.imageUrl)
      else if (target === 'cover') updateStorefront('cover_image_url', data.imageUrl)
      else if (target.kind === 'portfolio') updateBasic(setPortfolio, target.index, 'image_url', data.imageUrl)
      else updateProduct(target.index, 'image_url', data.imageUrl)
      setMessage('圖片已上傳，請記得按下最下方的「儲存並更新公開頁」。')
    } catch (err: any) { setError(err?.message || '圖片上傳失敗。') }
    finally { setUploading(''); event.target.value = '' }
  }

  const save = async () => {
    if (!storefront) return
    const displayName = storefront.display_name.trim()
    const slug = storefront.slug.trim().toLowerCase()
    if (!displayName) { setError('請填寫品牌／公司／店家名稱。'); return }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) { setError('公開網址只能使用英文小寫、數字與連字號。'); return }
    if (portfolio.some((item) => (item.title.trim() || item.description.trim() || item.image_url?.trim()) && !item.image_url?.trim())) { setError('每筆作品／案例都需要上傳圖片。'); return }
    if (products.some((item) => (item.title.trim() || item.description.trim() || item.image_url.trim() || item.price_text.trim() || item.button_url.trim()) && !item.image_url.trim())) { setError('每個展示商品都需要上傳圖片。'); return }
    setSaving(true); setError(''); setMessage('')
    try {
      const data = await apiRequest<StorefrontResponse>('save-storefront', 'POST', {
        slug,
        profileType,
        displayName,
        contactName: storefront.contact_name || '',
        jobTitle: storefront.job_title || '',
        bio: storefront.bio || '',
        logoUrl: storefront.logo_url || '',
        coverImageUrl: storefront.cover_image_url || '',
        tagline: storefront.tagline || '',
        lineId: storefront.line_id || '',
        addressText: storefront.address_text || '',
        mapUrl: normalizeUrl(storefront.map_url || ''),
        businessHoursText: storefront.business_hours_text || '',
        serviceAreaText: storefront.service_area_text || '',
        primaryCtaLabel: storefront.primary_cta_label || '',
        primaryCtaUrl: normalizeUrl(storefront.primary_cta_url || ''),
        phone: storefront.phone || '',
        lineUrl: normalizeUrl(storefront.line_url || ''),
        email: storefront.email || '',
        websiteUrl: normalizeUrl(storefront.website_url || ''),
        facebookUrl: normalizeUrl(storefront.facebook_url || ''),
        instagramUrl: normalizeUrl(storefront.instagram_url || ''),
        shopeeUrl: normalizeUrl(storefront.shopee_url || ''),
        deliveryUrl: normalizeUrl(storefront.delivery_url || ''),
        isPublic: storefront.is_public,
        supplierProfile: isSupplier ? {
          ...supplier,
          supplyTypes: supplier.supply_types,
          productCategories: supplier.product_categories,
          deliveryRegions: supplier.delivery_regions,
          cooperationButtonUrl: normalizeUrl(supplier.cooperation_button_url || ''),
        } : undefined,
        serviceItems: services.map((item) => ({ id: item.id, title: item.title.trim(), description: item.description.trim() })).filter((item) => item.title || item.description),
        portfolioItems: portfolio.map((item) => ({ id: item.id, title: item.title.trim(), description: item.description.trim(), image_url: item.image_url?.trim() || '' })).filter((item) => item.title || item.description || item.image_url),
        processSteps: processSteps.map((item) => ({ id: item.id, title: item.title.trim(), description: item.description.trim() })).filter((item) => item.title || item.description),
        faqItems: faqs.map((item) => ({ id: item.id, question: item.question.trim(), answer: item.answer.trim() })).filter((item) => item.question || item.answer),
        items: hasProductShowcase ? products.map((item, index) => ({ ...item, title: item.title.trim(), description: item.description.trim(), image_url: item.image_url.trim(), price_text: item.price_text.trim(), button_label: item.button_label.trim() || '立即詢問', button_url: normalizeUrl(item.button_url), sort_order: index })).filter((item) => item.title || item.description || item.image_url || item.price_text || item.button_url) : undefined,
      })
      if (data.storefront) setStorefront((current) => current ? { ...current, ...data.storefront, is_public: Boolean(data.storefront?.is_public) } : current)
      if (data.entitlement) setEntitlement(data.entitlement)
      if (data.supplierProfile) setSupplier(normalizeSupplier(data.supplierProfile))
      if (Array.isArray(data.serviceItems)) setServices(data.serviceItems.map((item) => ({ ...emptyBasic(), ...item })))
      if (Array.isArray(data.portfolioItems)) setPortfolio(data.portfolioItems.map((item) => ({ ...emptyBasic(), ...item })))
      if (Array.isArray(data.processSteps)) setProcessSteps(data.processSteps.map((item) => ({ ...emptyBasic(), ...item })))
      if (Array.isArray(data.faqItems)) setFaqs(data.faqItems.map((item) => ({ ...emptyFaq(), ...item })))
      if (Array.isArray(data.items)) setProducts(data.items.map((item) => ({ ...emptyProduct(), ...item })))
      if (data.analytics) setAnalytics(data.analytics)
      setMessage(data.storefront?.is_public ? '一頁式介紹網站已更新並公開。' : '介紹網站草稿已儲存。')
    } catch (err: any) { setError(err?.message || '儲存失敗。') }
    finally { setSaving(false) }
  }

  const copyUrl = async () => {
    if (!canShare) { setError('請先勾選公開並儲存。'); return }
    try { await navigator.clipboard.writeText(`${publicUrl}?share=${Date.now()}`); setMessage('分享網址已複製。') } catch { setError('無法自動複製網址。') }
  }
  const downloadQr = async () => {
    if (!canShare) { setError('請先勾選公開並儲存。'); return }
    try {
      const response = await fetch(qrUrl); const blob = await response.blob(); const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a'); link.href = objectUrl; link.download = `${storefront?.slug || 'storefront'}-QRCode.png`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(objectUrl)
    } catch { setError('QR Code 下載失敗。') }
  }

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-slate-600">正在讀取一頁式介紹網站資料…</div>
  if (!storefront) return <div className="mx-auto max-w-3xl px-4 py-16"><div className="rounded-3xl border border-amber-200 bg-amber-50 p-7 shadow-sm"><h1 className="text-2xl font-black text-slate-950">尚未找到可設定的介紹網站</h1><p className="mt-3 text-slate-700">{error || '請確認帳號資格或稍後重新讀取。'}</p><div className="mt-6 flex gap-3"><button type="button" onClick={() => void load(true)} className={primaryButtonClass}>重新讀取</button><Link to="/pricing" className={secondaryButtonClass}>回方案頁</Link></div></div></div>

  const renderBasicEditor = (title: string, helper: string, items: BasicItem[], setter: Dispatch<SetStateAction<BasicItem[]>>, limit: number, imageMode = false) => <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-black text-slate-950">{title}</h2><p className="mt-1 text-sm leading-relaxed text-slate-500">{helper}</p></div><button type="button" disabled={items.length >= limit} onClick={() => setter((current) => [...current, emptyBasic()])} className={secondaryButtonClass}>新增</button></div>{items.length ? <div className="mt-5 grid gap-4 md:grid-cols-2">{items.map((item, index) => <article key={item.id || `new-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-2"><p className="font-black text-slate-900">{title.replace('設定', '')} {index + 1}</p><MoveButtons index={index} count={items.length} onMove={(to) => moveBasic(setter, index, to)} onRemove={() => removeBasic(setter, index)} /></div>{imageMode ? <div className="mt-4"><div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">{item.image_url ? <img src={item.image_url} alt={item.title || '作品圖片'} className="h-52 w-full object-cover" /> : <div className="grid h-52 place-items-center text-sm text-slate-500">尚未上傳作品圖片</div>}</div><label className={`${uploadButtonClass} mt-3`}><input type="file" accept="image/*" className="hidden" onChange={(event) => void uploadImage(event, { kind: 'portfolio', index })} />{uploading === `portfolio-${index}` ? '上傳中…' : '上傳作品圖片'}</label></div> : null}<label className="mt-4 block"><span className="mb-1 block text-sm font-bold text-slate-700">{imageMode ? '作品／案例名稱（選填）' : '標題'}</span><input value={item.title} onChange={(event) => updateBasic(setter, index, 'title', event.target.value)} className={fieldClass} placeholder={imageMode ? '例如：2026 母親節禮盒' : '例如：每日新鮮製作'} /></label><label className="mt-3 block"><span className="mb-1 block text-sm font-bold text-slate-700">說明（選填）</span><textarea value={item.description} onChange={(event) => updateBasic(setter, index, 'description', event.target.value)} className={`${fieldClass} min-h-24`} placeholder="用一到兩句說明特色、成果或客戶能得到的價值。" /></label></article>)}</div> : <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">尚未新增內容；未填寫的區塊不會顯示在公開頁。</p>}</section>

  return <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
    <section className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6 shadow-sm sm:p-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-sm font-black text-emerald-700">{isTrialPlan ? '7 天試用中' : '名片贈送／可單獨販售'}</p><h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">{isTrialPlan ? '商品展示頁試用設定' : '一頁式品牌／公司介紹網站'}</h1><p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">{isTrialPlan ? '目前為 7 天免費試用，可先建立 1 個展示商品，確認是否適合日常接單；到期後可升級 NT$199／3 個月正式版。' : '完成品牌、服務、作品、合作流程、常見問題與聯絡資訊後，就能成為可分享的完整介紹網站。商品下單、團購與其他功能可日後在同網址加購。'}</p>{isTrialPlan ? <Link to="/payment/bank-transfer?plan=199&mode=storefront" className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-extrabold !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-cyan-700" style={{ color: '#ffffff', WebkitTextFillColor: '#ffffff' }}>升級正式版 NT$199／3 個月</Link> : null}</div><div className="rounded-2xl border border-emerald-100 bg-white p-4 text-sm shadow-sm"><p className="font-black text-slate-950">目前方案：{planLabel}</p><p className="mt-1 text-slate-600">商品展示額度：{hasProductShowcase ? `${maxProducts} 項` : '未開通'}</p><p className="mt-1 text-slate-600">有效至 {formatDate(storefront.expires_at || entitlement?.expires_at)}</p>{isTrialPlan ? <p className="mt-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">試用限制：最多 1 個展示商品</p> : null}</div></div></section>

    <section className="mt-6 rounded-[2rem] border border-sky-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-black text-sky-700">瀏覽統計</p>
          <h2 className="mt-1 text-2xl font-black text-slate-950">名片 QR Code 與公開頁成效</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">目前統計只在後台顯示，前台不公開人次，避免剛開站流量較少時影響信任感。</p>
        </div>
        <button type="button" onClick={() => void load(true)} className={secondaryButtonClass}>重新整理統計</button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-sky-50 p-4"><p className="text-xs font-black text-sky-700">今日瀏覽</p><p className="mt-2 text-3xl font-black text-slate-950">{formatCount(analytics.today.views)}</p></div>
        <div className="rounded-2xl bg-emerald-50 p-4"><p className="text-xs font-black text-emerald-700">本月瀏覽</p><p className="mt-2 text-3xl font-black text-slate-950">{formatCount(analytics.month.views)}</p></div>
        <div className="rounded-2xl bg-violet-50 p-4"><p className="text-xs font-black text-violet-700">累積瀏覽</p><p className="mt-2 text-3xl font-black text-slate-950">{formatCount(analytics.total.views)}</p></div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-black text-slate-500">LINE 點擊</p><p className="mt-2 text-2xl font-black text-slate-900">{formatCount(analytics.total.lineClicks)}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-black text-slate-500">電話點擊</p><p className="mt-2 text-2xl font-black text-slate-900">{formatCount(analytics.total.phoneClicks)}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-black text-slate-500">主要按鈕點擊</p><p className="mt-2 text-2xl font-black text-slate-900">{formatCount(analytics.total.primaryCtaClicks)}</p></div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-black text-slate-500">其他網站／社群點擊</p><p className="mt-2 text-2xl font-black text-slate-900">{formatCount(analytics.total.websiteClicks + analytics.total.facebookClicks + analytics.total.instagramClicks + analytics.total.shopeeClicks)}</p></div>
      </div>
    </section>

    {message ? <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800">{message}</div> : null}
    {error ? <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-800">{error}</div> : null}

    <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]"><div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800">1</span><div><h2 className="text-xl font-black text-slate-950">品牌與公開資料</h2><p className="mt-1 text-sm text-slate-500">讓訪客第一眼知道你是誰、提供什麼服務，以及如何聯絡。</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-black text-slate-800">公開頁身分</span><select value={profileType} onChange={(event) => changeProfileType(event.target.value as StorefrontProfileType)} className={fieldClass}><option value="business">一般店家／個人</option><option value="supplier">供應商／生產商／批發商</option><option value="group_host">團購主（功能準備中）</option></select><span className="mt-1.5 block text-xs text-slate-500">一般店家不顯示團購合作按鈕；供應商才顯示供應條件與合作申請。</span></label>
      <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-black text-slate-800">品牌／公司／店家名稱</span><input value={storefront.display_name} onChange={(event) => updateStorefront('display_name', event.target.value)} className={fieldClass} placeholder="例如：甜心點心工作室" /></label>
      <label><span className="mb-1.5 block text-sm font-black text-slate-800">聯絡人姓名</span><input value={storefront.contact_name || ''} onChange={(event) => updateStorefront('contact_name', event.target.value)} className={fieldClass} placeholder="例如：王小美" /></label>
      <label><span className="mb-1.5 block text-sm font-black text-slate-800">職稱／身份</span><input value={storefront.job_title || ''} onChange={(event) => updateStorefront('job_title', event.target.value)} className={fieldClass} placeholder="例如：店長／美睫師" /></label>
      <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-black text-slate-800">主標語</span><input value={storefront.tagline || ''} onChange={(event) => updateStorefront('tagline', event.target.value)} className={fieldClass} placeholder="例如：每日新鮮現做｜蛋塔、古早味蛋糕、節慶禮盒" /></label>
      <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-black text-slate-800">品牌／公司介紹</span><textarea value={storefront.bio || ''} onChange={(event) => updateStorefront('bio', event.target.value)} className={`${fieldClass} min-h-36`} placeholder="可介紹品牌故事、成立理念、服務對象、經驗與特色。這會顯示成公開頁的品牌介紹區塊。" /></label>
      <label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-black text-slate-800">公開網址名稱</span><div className="flex overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100"><span className="flex items-center bg-slate-50 px-3 text-sm font-bold text-slate-500">/shop/</span><input value={storefront.slug} onChange={(event) => updateStorefront('slug', event.target.value.toLowerCase())} className="min-w-0 flex-1 px-4 py-3 text-slate-900 outline-none" placeholder="sweet-dessert" /></div><span className="mt-1.5 block text-xs text-slate-500">只可使用英文小寫、數字與連字號。</span></label>
      <label><span className="mb-1.5 block text-sm font-black text-slate-800">主要按鈕文字</span><input value={storefront.primary_cta_label || ''} onChange={(event) => updateStorefront('primary_cta_label', event.target.value)} className={fieldClass} placeholder={isSupplier ? '例如：索取批發報價' : '例如：LINE 詢問／立即預約'} /></label>
      <label><span className="mb-1.5 block text-sm font-black text-slate-800">主要按鈕連結</span><input value={storefront.primary_cta_url || ''} onChange={(event) => updateStorefront('primary_cta_url', event.target.value)} className={fieldClass} placeholder="可放 LINE、電話、表單或其他網址" /></label>
    </div></div>

    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800">2</span><div><h2 className="text-xl font-black text-slate-950">封面與品牌圖片</h2><p className="mt-1 text-sm text-slate-500">建議封面放店面、代表作品或品牌主視覺。</p></div></div><div className="mt-5"><p className="text-sm font-black text-slate-800">封面圖</p><p className="mt-1 text-xs text-slate-500">建議 1600 × 700 px，文字放中間安全區域。</p><div className="mt-3 overflow-hidden rounded-3xl border border-dashed border-slate-300 bg-slate-50">{storefront.cover_image_url ? <img src={storefront.cover_image_url} alt="封面預覽" className="h-52 w-full object-cover" /> : <div className="grid h-52 place-items-center text-sm text-slate-500">尚未上傳封面圖</div>}</div><label className={`${uploadButtonClass} mt-3`}><input type="file" accept="image/*" className="hidden" onChange={(event) => void uploadImage(event, 'cover')} />{uploading === 'cover' ? '上傳中…' : '上傳封面圖'}</label></div><div className="mt-6"><p className="text-sm font-black text-slate-800">Logo／店家頭像</p><div className="mt-3 flex items-center gap-4">{storefront.logo_url ? <img src={storefront.logo_url} alt="Logo 預覽" className="h-24 w-24 rounded-3xl border border-slate-200 object-cover" /> : <div className="grid h-24 w-24 place-items-center rounded-3xl bg-emerald-100 text-2xl font-black text-emerald-700">{storefront.display_name.slice(0, 1)}</div>}<label className={uploadButtonClass}><input type="file" accept="image/*" className="hidden" onChange={(event) => void uploadImage(event, 'logo')} />{uploading === 'logo' ? '上傳中…' : '上傳 Logo'}</label></div></div></div></section>

    {renderBasicEditor('服務項目／主打特色設定', '最多 6 項。可填寫服務、主打產品、專長或品牌特色，例如每日現做、可客製、在地服務；空白項目不會公開。', services, setServices, 6)}
    {renderBasicEditor('作品／案例設定', '最多 6 張。基本介紹網站就可展示作品；商品展示加購才另有價格與外部按鈕。', portfolio, setPortfolio, 6, true)}
    {renderBasicEditor('合作流程設定', '最多 4 步。可填寫「詢問 → 確認需求 → 報價／預約 → 製作或服務」等流程。', processSteps, setProcessSteps, 4)}

    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-black text-slate-950">常見問題設定</h2><p className="mt-1 text-sm text-slate-500">最多 5 組。先回答交期、預約、保存、配送或客製等常見問題，可減少重複詢問。</p></div><button type="button" disabled={faqs.length >= 5} onClick={() => setFaqs((current) => [...current, emptyFaq()])} className={secondaryButtonClass}>新增問題</button></div>{faqs.length ? <div className="mt-5 space-y-4">{faqs.map((item, index) => <article key={item.id || `faq-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-2"><p className="font-black text-slate-900">問題 {index + 1}</p><MoveButtons index={index} count={faqs.length} onMove={(to) => moveFaq(index, to)} onRemove={() => setFaqs((current) => current.filter((_, itemIndex) => itemIndex !== index))} /></div><label className="mt-4 block"><span className="mb-1 block text-sm font-bold text-slate-700">問題</span><input value={item.question} onChange={(event) => updateFaq(index, 'question', event.target.value)} className={fieldClass} placeholder="例如：需要提前多久預訂？" /></label><label className="mt-3 block"><span className="mb-1 block text-sm font-bold text-slate-700">回答</span><textarea value={item.answer} onChange={(event) => updateFaq(index, 'answer', event.target.value)} className={`${fieldClass} min-h-24`} placeholder="例如：建議至少 3～5 天前預訂。" /></label></article>)}</div> : <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">尚未新增問題；此區塊不會顯示在公開頁。</p>}</section>

    <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm font-black text-emerald-800">3</span><div><h2 className="text-xl font-black text-slate-950">聯絡與營業資訊</h2><p className="mt-1 text-sm text-slate-500">公開頁同時顯示文字資料與可點擊按鈕，不會只剩下一排按鈕。</p></div></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-sm font-black text-slate-800">LINE 顯示文字／ID</span><input value={storefront.line_id || ''} onChange={(event) => updateStorefront('line_id', event.target.value)} className={fieldClass} placeholder="例如：@sweet123" /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">LINE 連結</span><input value={storefront.line_url || ''} onChange={(event) => updateStorefront('line_url', event.target.value)} className={fieldClass} placeholder="https://lin.ee/..." /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">電話</span><input value={storefront.phone || ''} onChange={(event) => updateStorefront('phone', event.target.value)} className={fieldClass} placeholder="02-1234-5678／0912-345-678" /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">Email</span><input value={storefront.email || ''} onChange={(event) => updateStorefront('email', event.target.value)} className={fieldClass} placeholder="hello@example.com" /></label><label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-black text-slate-800">地址／據點</span><input value={storefront.address_text || ''} onChange={(event) => updateStorefront('address_text', event.target.value)} className={fieldClass} placeholder="例如：基隆市暖暖區／預約制工作室（居家商家可不填完整門牌）" /></label><label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-black text-slate-800">Google 地圖連結（選填）</span><input value={storefront.map_url || ''} onChange={(event) => updateStorefront('map_url', event.target.value)} className={fieldClass} placeholder="可貼 Google Maps 分享網址" /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">營業／回覆時間</span><input value={storefront.business_hours_text || ''} onChange={(event) => updateStorefront('business_hours_text', event.target.value)} className={fieldClass} placeholder="例如：週一至週五 10:00～17:30" /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">服務／配送範圍</span><input value={storefront.service_area_text || ''} onChange={(event) => updateStorefront('service_area_text', event.target.value)} className={fieldClass} placeholder="例如：基隆、雙北／全台冷凍宅配" /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">Facebook</span><input value={storefront.facebook_url || ''} onChange={(event) => updateStorefront('facebook_url', event.target.value)} className={fieldClass} placeholder="https://facebook.com/..." /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">Instagram</span><input value={storefront.instagram_url || ''} onChange={(event) => updateStorefront('instagram_url', event.target.value)} className={fieldClass} placeholder="https://instagram.com/..." /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">官方網站</span><input value={storefront.website_url || ''} onChange={(event) => updateStorefront('website_url', event.target.value)} className={fieldClass} placeholder="https://..." /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">商品／下單連結（選填）</span><input value={storefront.shopee_url || ''} onChange={(event) => updateStorefront('shopee_url', event.target.value)} className={fieldClass} placeholder="可填蝦皮、菜單或表單網址" /></label></div></section>

    {isSupplier ? <section className="mt-6 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6"><div><h2 className="text-xl font-black text-amber-950">供應商／團購合作資料</h2><p className="mt-1 text-sm leading-relaxed text-amber-900">此區只在供應商公開頁顯示。切回一般店家時前台會完全隱藏，既有資料保留供之後再切回使用。</p></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label><span className="mb-1.5 block text-sm font-black text-slate-800">供應類型</span><input value={listToText(supplier.supply_types)} onChange={(event) => setSupplier((current) => ({ ...current, supply_types: textToList(event.target.value) }))} className={fieldClass} placeholder="自產、批發、代理、代工" /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">可供應商品分類</span><input value={listToText(supplier.product_categories)} onChange={(event) => setSupplier((current) => ({ ...current, product_categories: textToList(event.target.value) }))} className={fieldClass} placeholder="甜點、禮盒、冷凍食品" /></label><label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-black text-slate-800">生產／批發介紹</span><textarea value={supplier.supplier_intro} onChange={(event) => setSupplier((current) => ({ ...current, supplier_intro: event.target.value }))} className={`${fieldClass} min-h-28`} placeholder="介紹生產能力、特色與合作對象。" /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">最低訂購量 MOQ</span><input value={supplier.minimum_order_text} onChange={(event) => setSupplier((current) => ({ ...current, minimum_order_text: event.target.value }))} className={fieldClass} placeholder="例如：1 箱起／20 盒起" /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">出貨地</span><input value={supplier.shipping_origin} onChange={(event) => setSupplier((current) => ({ ...current, shipping_origin: event.target.value }))} className={fieldClass} placeholder="例如：基隆市" /></label><label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-black text-slate-800">可配送地區</span><input value={listToText(supplier.delivery_regions)} onChange={(event) => setSupplier((current) => ({ ...current, delivery_regions: textToList(event.target.value) }))} className={fieldClass} placeholder="例如：全台冷凍宅配、自取、雙北配送" /></label><label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-black text-slate-800">備貨與交期</span><textarea value={supplier.lead_time_text} onChange={(event) => setSupplier((current) => ({ ...current, lead_time_text: event.target.value }))} className={`${fieldClass} min-h-24`} placeholder="例如：確認訂單後 3～5 個工作天出貨。" /></label><label className="sm:col-span-2"><span className="mb-1.5 block text-sm font-black text-slate-800">團購合作條件</span><textarea value={supplier.cooperation_terms} onChange={(event) => setSupplier((current) => ({ ...current, cooperation_terms: event.target.value }))} className={`${fieldClass} min-h-28`} placeholder="例如：團購前請先確認檔期、數量與配送方式。" /></label><label className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-white p-4 sm:col-span-2"><input type="checkbox" checked={supplier.is_accepting_collaboration} onChange={(event) => setSupplier((current) => ({ ...current, is_accepting_collaboration: event.target.checked }))} className="mt-1 h-5 w-5 accent-emerald-600" /><span><span className="block font-black text-slate-950">目前接受團購合作申請</span><span className="mt-1 block text-xs text-slate-500">取消後公開頁會顯示暫停合作，不會顯示合作按鈕。</span></span></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">合作按鈕文字</span><input value={supplier.cooperation_button_label} onChange={(event) => setSupplier((current) => ({ ...current, cooperation_button_label: event.target.value }))} className={fieldClass} placeholder="申請團購合作" /></label><label><span className="mb-1.5 block text-sm font-black text-slate-800">合作申請連結</span><input value={supplier.cooperation_button_url} onChange={(event) => setSupplier((current) => ({ ...current, cooperation_button_url: event.target.value }))} className={fieldClass} placeholder="可放 LINE、Google 表單或聯絡表單" /></label></div></section> : null}

    {hasProductShowcase ? <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-xl font-black text-slate-950">{isTrialPlan ? '7 天試用商品展示' : '商品展示加購功能'}</h2><p className="mt-1 text-sm text-slate-500">目前最多 {maxProducts} 項。{isTrialPlan ? '試用版先建立 1 個商品確認流程；到期後可升級正式版。' : '此階段是商品展示與外部按鈕，不含網站內購物車／付款。'}</p></div><button type="button" disabled={products.length >= maxProducts} onClick={() => setProducts((current) => [...current, emptyProduct()])} className={secondaryButtonClass}>新增展示商品</button></div>{products.length ? <div className="mt-5 grid gap-5 md:grid-cols-2">{products.map((item, index) => <article key={item.id || `product-${index}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between gap-2"><p className="font-black text-slate-900">{index === 0 ? '主打展示商品' : `展示商品 ${index + 1}`}</p><MoveButtons index={index} count={products.length} onMove={(to) => moveProduct(index, to)} onRemove={() => setProducts((current) => current.filter((_, itemIndex) => itemIndex !== index))} /></div><div className="mt-4 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-white">{item.image_url ? <img src={item.image_url} alt={item.title || '商品圖片'} className="h-56 w-full object-contain" /> : <div className="grid h-56 place-items-center text-sm text-slate-500">尚未上傳商品圖片</div>}</div><label className={`${uploadButtonClass} mt-3`}><input type="file" accept="image/*" className="hidden" onChange={(event) => void uploadImage(event, { kind: 'product', index })} />{uploading === `product-${index}` ? '上傳中…' : '上傳商品圖'}</label><label className="mt-3 block"><span className="mb-1 block text-sm font-bold text-slate-700">商品名稱</span><input value={item.title} onChange={(event) => updateProduct(index, 'title', event.target.value)} className={fieldClass} /></label><label className="mt-3 block"><span className="mb-1 block text-sm font-bold text-slate-700">商品介紹</span><textarea value={item.description} onChange={(event) => updateProduct(index, 'description', event.target.value)} className={`${fieldClass} min-h-24`} /></label><div className="mt-3 grid gap-3 sm:grid-cols-2"><label><span className="mb-1 block text-sm font-bold text-slate-700">價格文字（選填）</span><input value={item.price_text} onChange={(event) => updateProduct(index, 'price_text', event.target.value)} className={fieldClass} placeholder="NT$65 起" /></label><label><span className="mb-1 block text-sm font-bold text-slate-700">按鈕文字（選填）</span><input value={item.button_label} onChange={(event) => updateProduct(index, 'button_label', event.target.value)} className={fieldClass} placeholder="立即詢問" /></label></div><label className="mt-3 block"><span className="mb-1 block text-sm font-bold text-slate-700">按鈕連結（選填）</span><input value={item.button_url} onChange={(event) => updateProduct(index, 'button_url', event.target.value)} className={fieldClass} placeholder="LINE、蝦皮、表單或其他網址" /></label></article>)}</div> : <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-500">尚未新增展示商品。</p>}</section> : <section className="mt-6 rounded-3xl border border-violet-100 bg-violet-50 p-5 shadow-sm sm:p-6"><h2 className="text-xl font-black text-violet-950">商品展示可日後加購</h2><p className="mt-2 text-sm leading-relaxed text-violet-900">名片贈送的完整一頁式網站已可展示品牌、作品與服務；日後開通商品展示後，商品圖片、價格與外部詢問按鈕會直接加在同一個網址下方。</p></section>}

    <section className="mt-6 rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-sm sm:p-7"><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px] lg:items-center"><div><div className="flex flex-wrap items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-sm font-black text-white">4</span><h2 className="text-2xl font-black text-slate-950">公開與分享</h2><span className={`rounded-full px-3 py-1 text-xs font-black ${storefront.is_public ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>{storefront.is_public ? '已勾選公開' : '目前為草稿'}</span></div><p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">儲存後，訪客可用網址與 QR Code 看到目前所有已填寫區塊。未填寫的區塊不會顯示。</p><label className="mt-5 inline-flex cursor-pointer items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-sm"><input type="checkbox" checked={storefront.is_public} onChange={(event) => updateStorefront('is_public', event.target.checked)} className="h-5 w-5 accent-emerald-600" /><span><span className="block font-black text-slate-950">公開一頁式介紹網站</span><span className="block text-xs text-slate-500">任何人都可透過網址或 QR Code 瀏覽。</span></span></label><div className="mt-5 rounded-2xl border border-white bg-white p-4 shadow-sm"><p className="text-xs font-bold text-slate-500">公開網址</p><p className="mt-1 break-all text-sm text-slate-700">{publicUrl}</p></div><div className="mt-4 grid w-full max-w-[620px] grid-cols-1 gap-3 sm:grid-cols-3"><button type="button" onClick={() => void copyUrl()} disabled={!canShare} className={`${secondaryButtonClass} w-full`}>複製分享網址</button><button type="button" onClick={() => void downloadQr()} disabled={!canShare} className={`${primaryButtonClass} w-full`}>下載 QR Code</button>{canShare ? <a href={publicUrl} target="_blank" rel="noreferrer" className={`${secondaryButtonClass} w-full`}>預覽公開頁</a> : null}</div></div><div className="mx-auto w-full max-w-[250px] rounded-[1.5rem] border border-white bg-white p-4 text-center shadow-sm">{canShare ? <><img src={qrUrl} alt="公開頁 QR Code" className="mx-auto h-52 w-52 rounded-xl" /><p className="mt-3 text-xs font-bold text-slate-600">掃碼查看公開頁</p></> : <div className="grid h-52 place-items-center rounded-xl bg-slate-50 px-5 text-center text-sm leading-relaxed text-slate-500">勾選公開並儲存後，即可產生可分享的 QR Code。</div>}</div></div><div className="mt-6 flex flex-col gap-3 border-t border-emerald-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-slate-600">全部完成後按儲存，公開頁才會同步更新。</p><button type="button" onClick={() => void save()} disabled={saving} className={`${primaryButtonClass} px-7 text-base`}>{saving ? '儲存中…' : storefront.is_public ? '儲存並更新公開頁' : '儲存公開頁草稿'}</button></div></section>
  </main>
}
