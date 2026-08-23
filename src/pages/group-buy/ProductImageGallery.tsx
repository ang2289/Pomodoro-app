import { useEffect, useMemo, useRef, useState } from 'react'
import type { Product, ProductImage } from '@/lib/groupBuyTypes'

type ProductImageGalleryProps = {
  product: Product
  images: ProductImage[]
}

function SizeOverlay({ product }: { product: Product }) {
  const dimensions = String(product.dimensionsText || '').match(/[\d.]+/g) || []
  const [length, width, height] = dimensions
  if (!length || !width || !height) {
    return <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/90 px-3 py-2 text-center text-sm font-black text-slate-800 shadow">商品尺寸以實際包裝標示為準</div>
  }
  return (
    <div className="pointer-events-none absolute inset-0" aria-label={`商品尺寸：長 ${length} 公分、寬 ${width} 公分、高 ${height} 公分；重量 ${product.weightText || '以包裝標示為準'}`}>
      <svg viewBox="0 0 800 600" className="h-full w-full" role="img" aria-hidden="true">
        <defs><marker id="size-arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M8,0 L0,4 L8,8" fill="none" stroke="currentColor" strokeWidth="1.5" /></marker></defs>
        <g className="text-orange-700" stroke="currentColor" strokeWidth="3" fill="none">
          <line x1="190" y1="505" x2="640" y2="505" markerStart="url(#size-arrow)" markerEnd="url(#size-arrow)" />
          <line x1="675" y1="210" x2="675" y2="455" markerStart="url(#size-arrow)" markerEnd="url(#size-arrow)" />
          <line x1="150" y1="170" x2="270" y2="105" markerStart="url(#size-arrow)" markerEnd="url(#size-arrow)" />
        </g>
      </svg>
      <span className="absolute bottom-[10%] left-1/2 -translate-x-1/2 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-orange-800 shadow sm:text-sm">長 {length} 公分</span>
      <span className="absolute right-[4%] top-1/2 -translate-y-1/2 rounded-full bg-white/95 px-3 py-1 text-xs font-black text-orange-800 shadow sm:text-sm">高 {height} 公分</span>
      <span className="absolute left-[9%] top-[13%] rounded-full bg-white/95 px-3 py-1 text-xs font-black text-orange-800 shadow sm:text-sm">寬 {width} 公分</span>
      <span className="absolute bottom-[3%] right-[4%] rounded-full bg-slate-900/85 px-3 py-1 text-xs font-black text-white shadow sm:text-sm">重量 {product.weightText}</span>
    </div>
  )
}

export default function ProductImageGallery({ product, images }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set())
  const [loading, setLoading] = useState(true)
  const [zoomed, setZoomed] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const availableImages = useMemo(() => images.filter((image) => !failedUrls.has(image.imageUrl)), [failedUrls, images])
  const activeImage = availableImages[Math.min(activeIndex, Math.max(0, availableImages.length - 1))]
  const activeImageUrl = activeImage?.imageUrl

  useEffect(() => {
    if (activeIndex >= availableImages.length) setActiveIndex(Math.max(0, availableImages.length - 1))
  }, [activeIndex, availableImages.length])

  useEffect(() => setLoading(Boolean(activeImageUrl)), [activeImageUrl])

  useEffect(() => {
    if (!zoomed) return
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setZoomed(false) }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [zoomed])

  const failImage = (url: string) => setFailedUrls((current) => new Set(current).add(url))
  const changeImage = (delta: number) => {
    if (availableImages.length < 2) return
    setActiveIndex((current) => (current + delta + availableImages.length) % availableImages.length)
  }
  const finishSwipe = (clientX: number) => {
    if (touchStartX.current === null) return
    const distance = clientX - touchStartX.current
    if (Math.abs(distance) > 45) changeImage(distance > 0 ? -1 : 1)
    touchStartX.current = null
  }

  if (!activeImage) {
    return <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-slate-100 text-slate-500">商品圖片準備中</div>
  }

  const image = (
    <img
      src={activeImage.imageUrl}
      alt={activeImage.altText || product.title}
      className="max-h-full max-w-full object-contain"
      onLoad={() => setLoading(false)}
      onError={() => failImage(activeImage.imageUrl)}
      draggable={false}
    />
  )

  return (
    <section aria-label={`${product.title}商品圖集`}>
      <div
        className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100"
        onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null }}
        onTouchEnd={(event) => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}
      >
        {loading && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 text-sm font-bold text-slate-500">圖片載入中…</div>}
        <button type="button" onClick={() => setZoomed(true)} className="absolute inset-0 flex cursor-zoom-in items-center justify-center" aria-label={`放大第 ${activeIndex + 1} 張圖片`}>
          {image}
        </button>
        {activeImage.imageType === 'size_diagram' && <SizeOverlay product={product} />}
        <span className="absolute right-3 top-3 rounded-full bg-slate-950/75 px-3 py-1 text-xs font-black text-white">{activeIndex + 1}／{availableImages.length}</span>
        {availableImages.length > 1 && (
          <>
            <button type="button" onClick={() => changeImage(-1)} aria-label="上一張圖片" className="absolute left-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 text-xl font-black shadow">‹</button>
            <button type="button" onClick={() => changeImage(1)} aria-label="下一張圖片" className="absolute right-3 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-white/90 text-xl font-black shadow">›</button>
          </>
        )}
      </div>
      {availableImages.length > 1 && (
        <div className="mt-3 flex snap-x gap-2 overflow-x-auto pb-2" aria-label="商品圖片縮圖">
          {availableImages.map((item, index) => (
            <button type="button" key={item.id} onClick={() => setActiveIndex(index)} aria-label={`查看第 ${index + 1} 張圖片`} className={`aspect-[4/3] w-24 shrink-0 snap-start overflow-hidden rounded-xl border-2 bg-slate-100 p-1 ${index === activeIndex ? 'border-orange-500' : 'border-slate-200'}`}>
              <img src={item.imageUrl} alt="" loading="lazy" onError={() => failImage(item.imageUrl)} className="h-full w-full rounded-lg object-contain" />
            </button>
          ))}
        </div>
      )}
      <p className="mt-3 text-xs leading-5 text-slate-500">圖片為自製商品與情境示意圖，實際商品、配料、尺寸及包裝以供應商出貨與商品標示為準。</p>
      {zoomed && (
        <div role="dialog" aria-modal="true" aria-label="商品圖片放大檢視" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-3 sm:p-8" onClick={() => setZoomed(false)}>
          <button type="button" onClick={() => setZoomed(false)} className="absolute right-4 top-4 z-20 h-11 w-11 rounded-full bg-white text-2xl font-black" aria-label="關閉放大圖片">×</button>
          <div className="relative flex aspect-[4/3] max-h-full w-full max-w-6xl items-center justify-center" onClick={(event) => event.stopPropagation()}>
            {image}
            {activeImage.imageType === 'size_diagram' && <SizeOverlay product={product} />}
          </div>
        </div>
      )}
    </section>
  )
}
