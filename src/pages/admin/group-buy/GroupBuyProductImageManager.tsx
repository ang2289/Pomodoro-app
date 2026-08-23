import { useEffect, useMemo, useRef, useState } from 'react'
import imageCompression from 'browser-image-compression'
import { Link } from 'react-router-dom'
import { groupBuyApi } from '@/lib/groupBuyApi'
import { GROUP_BUY_PRODUCT_IMAGE_TYPES, type GroupBuyProductImageType } from '@/lib/groupBuyProductPrompts'

type Props = { product: { id: string; title: string }; campaignSlug: string }

type AdminImage = {
  id: string
  image_type: GroupBuyProductImageType
  image_url: string
  alt_text?: string | null
  sort_order: number
  is_active: boolean
}

type UploadStage = 'processing' | 'uploading' | ''

const MAX_IMAGES = 6
const MAX_DIRECT_UPLOAD_BYTES = 2 * 1024 * 1024
const MAX_SOURCE_BYTES = 12 * 1024 * 1024

const errorMessage = (reason: unknown, fallback: string) =>
  reason instanceof Error ? reason.message : fallback

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('圖片讀取失敗。'))
    reader.onerror = () => reject(new Error('圖片讀取失敗。'))
    reader.readAsDataURL(file)
  })
}

async function prepareUploadFile(file: File) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) throw new Error(`${file.name} 不是 JPG、PNG 或 WebP 圖片。`)
  if (file.size > MAX_SOURCE_BYTES) throw new Error(`${file.name} 超過 12MB，請先縮小圖片。`)
  if (file.size <= MAX_DIRECT_UPLOAD_BYTES) return file

  const compressed = await imageCompression(file, {
    maxSizeMB: 1.75,
    maxWidthOrHeight: 1600,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.8,
    preserveExif: false,
  })
  if (compressed.size <= MAX_DIRECT_UPLOAD_BYTES) return compressed

  const compressedAgain = await imageCompression(compressed, {
    maxSizeMB: 1.75,
    maxWidthOrHeight: 1400,
    useWebWorker: true,
    fileType: 'image/webp',
    initialQuality: 0.72,
    preserveExif: false,
  })
  if (compressedAgain.size > MAX_DIRECT_UPLOAD_BYTES) {
    throw new Error(`${file.name} 壓縮後仍超過 2MB，請先縮小原始圖片。`)
  }
  return compressedAgain
}

export default function GroupBuyProductImageManager({ product, campaignSlug }: Props) {
  const [images, setImages] = useState<AdminImage[]>([])
  const [bulkBusy, setBulkBusy] = useState(false)
  const [busyType, setBusyType] = useState<GroupBuyProductImageType | null>(null)
  const [uploadStage, setUploadStage] = useState<Record<string, UploadStage>>({})
  const [localPreviews, setLocalPreviews] = useState<Partial<Record<GroupBuyProductImageType, string>>>({})
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null)
  const previewUrlsRef = useRef<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const sortedImages = useMemo(
    () => [...images].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)),
    [images],
  )
  const isBusy = bulkBusy || busyType !== null
  const remainingCount = Math.max(0, MAX_IMAGES - images.length)

  const load = async () => {
    const data = await groupBuyApi.adminListProductImages(product.id)
    setImages(data.images || [])
  }

  useEffect(() => {
    let active = true
    void groupBuyApi.adminListProductImages(product.id)
      .then((data) => {
        if (active) {
          setImages(data.images || [])
          setError('')
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(errorMessage(reason, '圖片資料載入失敗。'))
      })
    return () => { active = false }
  }, [product.id])

  useEffect(() => () => {
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    previewUrlsRef.current.clear()
  }, [])

  const setPreview = (imageType: GroupBuyProductImageType, file: File) => {
    const nextUrl = URL.createObjectURL(file)
    previewUrlsRef.current.add(nextUrl)
    setLocalPreviews((current) => {
      const oldUrl = current[imageType]
      if (oldUrl) {
        URL.revokeObjectURL(oldUrl)
        previewUrlsRef.current.delete(oldUrl)
      }
      return { ...current, [imageType]: nextUrl }
    })
  }

  const clearPreview = (imageType: GroupBuyProductImageType) => {
    setLocalPreviews((current) => {
      const url = current[imageType]
      if (url) {
        URL.revokeObjectURL(url)
        previewUrlsRef.current.delete(url)
      }
      const next = { ...current }
      delete next[imageType]
      return next
    })
  }

  const saveFile = async (
    imageType: GroupBuyProductImageType,
    sortOrder: number,
    file: File,
    existing?: AdminImage,
  ) => {
    setPreview(imageType, file)
    setBusyType(imageType)
    setUploadStage((current) => ({ ...current, [imageType]: 'processing' }))
    try {
      const uploadFile = await prepareUploadFile(file)
      setUploadStage((current) => ({ ...current, [imageType]: 'uploading' }))
      const uploaded = await groupBuyApi.adminUploadProductImage(
        product.id,
        await fileToDataUrl(uploadFile),
      )
      await groupBuyApi.adminSaveProductImage({
        id: existing?.id,
        productId: product.id,
        imageType,
        imageUrl: uploaded.imageUrl,
        altText: `${product.title} 商品圖片 ${sortOrder}`,
        sortOrder,
        isAiGenerated: true,
        reviewStatus: 'approved',
        isActive: true,
        generationPrompt: null,
      })
    } finally {
      clearPreview(imageType)
      setUploadStage((current) => ({ ...current, [imageType]: '' }))
      setBusyType(null)
    }
  }

  const uploadMultiple = async (selectedFiles: File[]) => {
    if (!selectedFiles.length) return
    if (selectedFiles.length > remainingCount) {
      setError(`目前還可新增 ${remainingCount} 張；每項商品最多 ${MAX_IMAGES} 張。`)
      return
    }

    const files = [...selectedFiles].sort((a, b) =>
      a.name.localeCompare(b.name, 'zh-TW', { numeric: true, sensitivity: 'base' }),
    )
    const usedTypes = new Set(images.map((image) => image.image_type))
    const availableTypes = GROUP_BUY_PRODUCT_IMAGE_TYPES.filter((type) => !usedTypes.has(type))

    setBulkBusy(true)
    setError('')
    setMessage('')
    const failures: string[] = []
    let successCount = 0

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index]
        const imageType = availableTypes[index]
        const sortOrder = images.length + index + 1
        setBulkProgress({ current: index + 1, total: files.length })
        try {
          await saveFile(imageType, sortOrder, file)
          successCount += 1
        } catch (reason: unknown) {
          failures.push(`${file.name}：${errorMessage(reason, '上傳失敗')}`)
        }
      }

      await load()
      if (successCount) setMessage(`已新增 ${successCount} 張圖片；第一張會作為商品主圖。`)
      if (failures.length) setError(`有 ${failures.length} 張未完成：${failures.join('；')}`)
    } finally {
      setBulkProgress(null)
      setBulkBusy(false)
      setBusyType(null)
    }
  }

  const replaceImage = async (image: AdminImage, file?: File) => {
    if (!file) return
    setError('')
    setMessage('')
    try {
      await saveFile(image.image_type, Number(image.sort_order || 1), file, image)
      await load()
      setMessage('圖片已更換。')
    } catch (reason: unknown) {
      setError(errorMessage(reason, '圖片更換失敗。'))
    }
  }

  const remove = async (image: AdminImage) => {
    if (!window.confirm('確定刪除這張商品圖片嗎？')) return
    setBusyType(image.image_type)
    setError('')
    setMessage('')
    try {
      await groupBuyApi.adminDeleteProductImage(product.id, image.id)
      await load()
      setMessage('圖片已刪除。')
    } catch (reason: unknown) {
      setError(errorMessage(reason, '圖片刪除失敗。'))
    } finally {
      setBusyType(null)
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-black text-slate-950">商品圖片</h4>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            每項商品最多 6 張，不限制圖片內容或情境；不同商品可自行使用不同類型的圖片。
          </p>
          <p className="mt-1 text-xs text-slate-500">
            圖片依檔名順序排列，第一張作為主圖。上傳後直接顯示，不需要顯示／隱藏設定。
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {remainingCount > 0 && (
            <label className="cursor-pointer rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black text-white">
              選擇圖片（還可上傳 {remainingCount} 張）
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                disabled={isBusy}
                onChange={(event) => {
                  const files = Array.from(event.target.files || [])
                  event.currentTarget.value = ''
                  void uploadMultiple(files)
                }}
                className="sr-only"
              />
            </label>
          )}
          <Link
            target="_blank"
            to={`/group-buy/${campaignSlug}/product/${product.id}`}
            className="rounded-xl border bg-white px-3 py-2 text-sm font-black"
          >
            預覽商品頁
          </Link>
        </div>
      </div>

      {bulkProgress && (
        <div className="mt-3 rounded-xl bg-blue-50 p-3 text-sm font-bold text-blue-800">
          正在處理第 {bulkProgress.current}/{bulkProgress.total} 張圖片
        </div>
      )}
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
      {message && <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{message}</p>}

      {sortedImages.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedImages.map((image, index) => {
            const displayUrl = localPreviews[image.image_type] || image.image_url
            const stage = uploadStage[image.image_type]
            const isWorking = busyType === image.image_type

            return (
              <article key={image.id} className="rounded-2xl border bg-white p-3">
                <div className="flex items-center justify-between gap-2">
                  <b>圖片 {index + 1}</b>
                  {index === 0 && (
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-black text-orange-800">主圖</span>
                  )}
                </div>
                <img
                  src={displayUrl}
                  alt={image.alt_text || `${product.title}商品圖片${index + 1}`}
                  className="mt-3 aspect-[4/3] w-full rounded-xl bg-slate-100 object-contain"
                />
                {isWorking && (
                  <p className="mt-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">
                    {stage === 'processing' ? '圖片處理中…' : stage === 'uploading' ? '圖片上傳中…' : '資料更新中…'}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="cursor-pointer rounded-xl border px-3 py-2 text-xs font-black">
                    更換
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={isBusy}
                      onChange={(event) => {
                        const file = event.target.files?.[0]
                        event.currentTarget.value = ''
                        void replaceImage(image, file)
                      }}
                      className="sr-only"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => void remove(image)}
                    className="rounded-xl border border-red-300 px-3 py-2 text-xs font-black text-red-700 disabled:opacity-40"
                  >
                    刪除
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          尚未上傳商品圖片
        </div>
      )}
    </section>
  )
}
