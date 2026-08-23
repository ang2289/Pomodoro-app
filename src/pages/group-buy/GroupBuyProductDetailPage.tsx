import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SEO from '@/components/SEO'
import { groupBuyApi } from '@/lib/groupBuyApi'
import type { Product, ProductImage } from '@/lib/groupBuyTypes'
import { mergeProductQuantityDraft } from '@/lib/groupBuyProductPrompts'
import ProductImageGallery from './ProductImageGallery'

const money = (value: number) => `NT$${Number(value || 0).toLocaleString('zh-TW')}`
const errorMessage = (reason: unknown, fallback: string) => reason instanceof Error ? reason.message : fallback

export default function GroupBuyProductDetailPage() {
  const { campaignSlug = '', productId = '' } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [images, setImages] = useState<ProductImage[]>([])
  const [campaignTitle, setCampaignTitle] = useState('')
  const [quantity, setQuantity] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    const raw = sessionStorage.getItem(`group_buy_draft_${campaignSlug}`)
    if (raw) {
      try { setQuantity(Number(JSON.parse(raw)?.quantities?.[productId] || 0)) } catch { /* 保留空白草稿 */ }
    }
    void groupBuyApi.getProductDetail(campaignSlug, productId)
      .then((data) => {
        setProduct(data.product)
        setImages(data.images || [])
        setCampaignTitle(data.campaign.title)
      })
      .catch((reason: unknown) => setError(errorMessage(reason, '商品資料載入失敗。')))
  }, [campaignSlug, productId])

  const displayImages = useMemo(() => {
    if (images.length) return images
    return product?.imageUrl ? [{ id: 'existing', imageType: 'hero' as const, imageUrl: product.imageUrl, altText: product.title, isAiGenerated: false }] : []
  }, [images, product])

  const saveQuantity = () => {
    const key = `group_buy_draft_${campaignSlug}`
    let draft: Record<string, unknown> = {}
    try { draft = JSON.parse(sessionStorage.getItem(key) || '{}') } catch { draft = {} }
    sessionStorage.setItem(key, JSON.stringify(mergeProductQuantityDraft(draft, productId, quantity)))
    navigate(`/group-buy/${campaignSlug}`)
  }

  if (error) return <main className="min-h-screen bg-slate-50 p-8 text-center text-red-700">{error}</main>
  if (!product) return <main className="min-h-screen bg-slate-50 p-8 text-center">載入商品詳情中…</main>

  const discount = product.originalPriceNtd && product.originalPriceNtd > 0
    ? Math.round((product.salePriceNtd / product.originalPriceNtd) * 100)
    : null
  const facts = [
    ['規格', product.unitLabel ? `1 ${product.unitLabel}` : null],
    ['淨重', product.weightText],
    ['商品尺寸', product.dimensionsText],
    ['保存方式', product.storageText],
    ['葷素類型', product.vegetarianText],
    ['過敏原提醒', product.allergenText],
    ['主要成分摘要', product.ingredientsSummary],
    ['食用建議', product.servingSuggestion],
  ].filter(([, value]) => Boolean(value))

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <SEO title={`${product.title}｜${campaignTitle}`} description={product.shortDescription || product.description || '團購商品詳情'} />
      <div className="mx-auto max-w-5xl">
        <button type="button" onClick={() => navigate(`/group-buy/${campaignSlug}`)} className="mb-5 text-sm font-black text-slate-700">← 返回團購登記</button>
        <div className="grid gap-8 rounded-3xl bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
          <section>
            <ProductImageGallery product={product} images={displayImages} />
          </section>
          <section>
            <p className="text-sm font-bold text-orange-700">{campaignTitle}</p>
            <h1 className="mt-2 text-3xl font-black text-slate-950">{product.title}</h1>
            {(product.shortDescription || product.description) && <p className="mt-4 leading-7 text-slate-700">{product.shortDescription || product.description}</p>}
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <b className="text-2xl text-orange-700">本團 {money(product.salePriceNtd)}</b>
              {product.originalPriceNtd && <span className="text-sm text-slate-500 line-through">參考售價 {money(product.originalPriceNtd)}</span>}
              {discount && <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-black text-orange-800">約 {discount} 折</span>}
            </div>
            {product.longDescription && <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-700">{product.longDescription}</p>}
            {facts.length > 0 ? <dl className="mt-6 divide-y rounded-2xl border border-slate-200 px-4">{facts.map(([label, value]) => <div key={label} className="grid grid-cols-[7rem_1fr] gap-3 py-3 text-sm"><dt className="font-black text-slate-700">{label}</dt><dd className="leading-6 text-slate-600">{value}</dd></div>)}</dl> : <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">商品規格以實際包裝標示為準。</p>}
            <div className="mt-5 rounded-2xl bg-cyan-50 p-4 text-sm leading-6 text-cyan-950">❄ 本團夏季採冷凍宅配；收到後請依商品實際包裝的保存與食用標示處理。</div>
            {product.productNotice && <p className="mt-4 text-sm leading-6 text-slate-600">{product.productNotice}</p>}
            <div className="mt-6 flex items-center gap-3">
              <button type="button" onClick={() => setQuantity((value) => Math.max(0, value - 1))} className="h-11 w-11 rounded-xl border text-xl font-black">−</button>
              <input type="number" min="0" value={quantity} onChange={(event) => setQuantity(Math.max(0, Number(event.target.value || 0)))} className="h-11 w-24 rounded-xl border text-center font-black" />
              <button type="button" onClick={() => setQuantity((value) => value + 1)} className="h-11 w-11 rounded-xl border text-xl font-black">＋</button>
            </div>
            <button type="button" onClick={saveQuantity} className="mt-4 w-full rounded-2xl bg-orange-600 px-5 py-4 font-black text-white">加入目前團購數量並返回</button>
          </section>
        </div>
      </div>
    </main>
  )
}
