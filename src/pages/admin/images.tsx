import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

const IMAGE_ADMIN_KEY_STORAGE = 'rxv_image_admin_key'

function getImageAdminKey() {
  let key = sessionStorage.getItem(IMAGE_ADMIN_KEY_STORAGE) || ''
  if (!key) {
    key = window.prompt('請輸入圖片後台管理金鑰')?.trim() || ''
    if (key) sessionStorage.setItem(IMAGE_ADMIN_KEY_STORAGE, key)
  }
  return key
}

async function imageAdminFetch(url: string, init: RequestInit = {}) {
  const key = getImageAdminKey()
  if (!key) throw new Error('請輸入圖片後台管理金鑰')
  const headers = new Headers(init.headers || {})
  headers.set('X-RXV-Image-Admin-Key', key)
  const response = await fetch(url, { ...init, headers })
  if (response.status === 401 || response.status === 403) {
    sessionStorage.removeItem(IMAGE_ADMIN_KEY_STORAGE)
  }
  return response
}

interface ImageCategory {
  id: string
  name: string
  sort_order: number
  is_active: boolean
}

export default function AdminImagesPage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const [previewUrls, setPreviewUrls] = useState<{ file: File; url: string }[]>([])
  const [categories, setCategories] = useState<ImageCategory[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedPriceType, setSelectedPriceType] = useState<string>('bundle')
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const refreshCatalog = async () => {
    const response = await imageAdminFetch('/api/main?action=admin-list-images')
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data?.ok) throw new Error(data?.error || `HTTP ${response.status}`)
    const uniqueCategories = new Map<string, ImageCategory>()
    for (const image of Array.isArray(data?.images) ? data.images : []) {
      const id = String(image?.category_id || '').trim()
      const name = String(image?.category_name || '').trim()
      if (id && name && !uniqueCategories.has(id)) {
        uniqueCategories.set(id, { id, name, sort_order: uniqueCategories.size, is_active: true })
      }
    }
    const rows = [...uniqueCategories.values()]
    setCategories(rows)
    setSelectedCategoryId((current) => current || rows[0]?.id || '')
    return Number(data?.total || 0)
  }

  // 分類由同一次 R2 catalog 圖片清單去重取得，避免額外讀取 manifest。
  const fetchCategories = async () => {
    setLoadingCategories(true)
    try {
      await refreshCatalog()
    } catch (err: any) {
      console.error('載入分類時發生錯誤:', err)
      setUploadStatus('載入分類時發生錯誤：' + err.message)
    } finally {
      setLoadingCategories(false)
    }
  }

  useEffect(() => {
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 清理預覽 URL，避免記憶體洩漏
  useEffect(() => {
    return () => {
      previewUrls.forEach((preview) => {
        URL.revokeObjectURL(preview.url)
      })
    }
  }, [previewUrls])

  // 處理檔案選擇
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // 釋放之前的預覽 URL
    previewUrls.forEach((preview) => {
      URL.revokeObjectURL(preview.url)
    })

    // 檢查檔案類型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const validExtensions = ['.jpg', '.jpeg', '.png', '.webp']
    const validFiles: File[] = []
    const invalidFiles: string[] = []

    // 檢查每一張圖片
    Array.from(files).forEach((file) => {
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (validTypes.includes(file.type) || validExtensions.includes(fileExtension)) {
        validFiles.push(file)
      } else {
        invalidFiles.push(file.name)
      }
    })

    // 如果有無效檔案，顯示提示
    if (invalidFiles.length > 0) {
      alert(`以下檔案格式不支援，將被忽略：\n${invalidFiles.join('\n')}\n\n僅支援 JPG、PNG、WEBP 格式`)
    }

    // 如果沒有有效檔案，清空選擇
    if (validFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = ''
      setSelectedFiles([])
      setPreviewUrls([])
      return
    }

    setSelectedFiles(validFiles)
    setUploadStatus('')

    // 產生預覽 URL
    const previews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file)
    }))
    setPreviewUrls(previews)
  }

  // 原圖絕不經過 Vercel：瀏覽器只把它直接 PUT 到私有 R2，縮圖亦直接寫 public R2。
  const makeThumbnail = async (file: File): Promise<Blob> => {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, 480 / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.78))
    if (!blob) throw new Error('THUMBNAIL_GENERATION_FAILED')
    return blob
  }

  // 處理單張圖片上傳
  const uploadSingleImage = async (file: File, index: number, total: number) => {
    console.log(`[${index + 1}/${total}] 開始上傳圖片: ${file.name}`)
    console.log('檔案大小:', (file.size / 1024 / 1024).toFixed(2), 'MB')

    try {
      const categoryName = categories.find((category) => category.id === selectedCategoryId)?.name || selectedCategoryId
      const create = await imageAdminFetch('/api/main?action=create-image-upload-url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: selectedCategoryId,
          category_name: categoryName,
          price_type: 'bundle',
          file_name: file.name,
          mime_type: file.type,
          file_size: file.size,
        }),
      })
      const createData: any = await create.json().catch(() => ({}))
      if (!create.ok || !createData.success) {
        const errorMessage = createData.error || '建立 R2 上傳權限失敗'
        console.error(`[${index + 1}/${total}] 上傳失敗:`, errorMessage)
        throw new Error(`${file.name}: ${errorMessage}`)
      }

      const thumbnail = await makeThumbnail(file)
      const [originalUpload, thumbnailUpload] = await Promise.all([
        fetch(createData.originalUploadUrl, { method: 'PUT', headers: { 'Content-Type': file.type || 'image/jpeg' }, body: file }),
        fetch(createData.thumbnailUploadUrl, { method: 'PUT', headers: { 'Content-Type': 'image/webp' }, body: thumbnail }),
      ])
      if (!originalUpload.ok) throw new Error(`${file.name}: R2_PRIVATE_ORIGINAL_UPLOAD_FAILED:${originalUpload.status}`)
      if (!thumbnailUpload.ok) throw new Error(`${file.name}: R2_PUBLIC_THUMBNAIL_UPLOAD_FAILED:${thumbnailUpload.status}`)

      const response = await imageAdminFetch('/api/main?action=finalize-image-upload', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId: createData.imageId, category_id: selectedCategoryId, category_name: categoryName, file_name: file.name, mime_type: file.type, file_size: file.size, price_type: 'bundle' }),
      })
      const data: any = await response.json().catch(() => ({}))
      if (!response.ok || !data.success) throw new Error(`${file.name}: ${data.error || 'R2 catalog 更新失敗'}`)

      console.log(`[${index + 1}/${total}] 圖片已成功上傳並登錄:`, data)
      return { success: true, fileName: file.name, manifestCount: Number(data.manifest_count || 0) || undefined }
    } catch (err: any) {
      console.error(`[${index + 1}/${total}] 處理失敗:`, err)
      return { success: false, fileName: file.name, error: err.message }
    }
  }

  // 處理上傳
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('請先選擇圖片檔案')
      return
    }

    if (!selectedCategoryId) {
      setUploadStatus('請先選擇圖片分類')
      return
    }

    if (!selectedPriceType) {
      setUploadStatus('請先選擇圖片下載權限')
      return
    }

    setUploading(true)
    setUploadStatus('')
    setUploadProgress({ current: 0, total: selectedFiles.length })

    const results: { success: boolean; fileName: string; manifestCount?: number; error?: string }[] = []
    const errors: string[] = []

    try {
      // 逐一處理每張圖片
      for (let i = 0; i < selectedFiles.length; i++) {
        setUploadProgress({ current: i + 1, total: selectedFiles.length })
        const result = await uploadSingleImage(selectedFiles[i], i, selectedFiles.length)
        results.push(result)
        
        if (!result.success) {
          errors.push(result.error || '未知錯誤')
        }
      }

      // 統計結果
      const successCount = results.filter(r => r.success).length
      const failCount = results.filter(r => !r.success).length

      const manifestCount = results.reduce<number | undefined>((latest, result) => result.manifestCount ?? latest, undefined)
      if (failCount === 0) {
        setUploadStatus(`✅ 成功上傳 ${successCount} 張圖片${manifestCount ? `\n最新 manifest_count：${manifestCount}` : ''}`)
      } else if (successCount === 0) {
        setUploadStatus(`❌ 全部上傳失敗\n${errors.join('\n')}`)
      } else {
        setUploadStatus(`⚠️ 部分成功：成功 ${successCount} 張，失敗 ${failCount} 張\n${errors.join('\n')}`)
      }

      // 釋放預覽 URL 並清空選擇
      previewUrls.forEach((preview) => {
        URL.revokeObjectURL(preview.url)
      })

      if (fileInputRef.current) fileInputRef.current.value = ''
      setSelectedFiles([])
      setPreviewUrls([])
      await refreshCatalog()
      setSelectedPriceType('bundle')
      setUploadProgress(null)

    } catch (err: any) {
      console.error('上傳時發生錯誤:', err)
      setUploadStatus(`上傳失敗：${err.message || '未知錯誤'}`)
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回連結 */}
        <div className="mb-6">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            ← 返回管理後台
          </Link>
        </div>

        {/* 頁面標題 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              🖼️ 圖片上傳管理
            </h1>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => { sessionStorage.removeItem(IMAGE_ADMIN_KEY_STORAGE); window.location.reload() }} className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">
                重設管理金鑰
              </button>
              <Link to="/admin/images/list" className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]">
                查看清單 →
              </Link>
            </div>
          </div>

          <p className="text-gray-600">
            原圖寫入 Private R2、縮圖寫入 Public R2，並同步更新公開圖片 catalog
          </p>
        </div>

        {/* 上傳表單 */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            選擇圖片檔案
          </h2>

          {/* 檔案選擇 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              支援格式：JPG、PNG、WEBP（可一次選擇多張）
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                cursor-pointer"
              disabled={uploading}
            />
            {selectedFiles.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                已選擇 {selectedFiles.length} 張圖片
              </p>
            )}
          </div>

          {/* 分類選擇 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              圖片分類 <span className="text-red-500">*</span>
            </label>
            {loadingCategories ? (
              <div className="text-sm text-gray-500">載入分類中...</div>
            ) : categories.length === 0 ? (
              <div className="text-sm text-amber-600">目前沒有可用的分類</div>
            ) : (
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value)
                  setUploadStatus('') // 清除之前的錯誤訊息
                }}
                className={`block w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  !selectedCategoryId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={uploading}
              >
                <option value="">請選擇分類</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            {!selectedCategoryId && uploadStatus === '請先選擇圖片分類' && (
              <p className="text-sm text-red-600 mt-1">請先選擇圖片分類</p>
            )}
          </div>

          {/* 圖片方案選擇 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              圖片下載權限 <span className="text-red-500">*</span>
            </label>
            <select
              value="bundle"
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-700"
              disabled
            >
              <option value="bundle">完整素材庫（NT$399 素材包）－本階段固定</option>
            </select>
            {!selectedPriceType && uploadStatus === '請先選擇圖片下載權限' && (
              <p className="text-sm text-red-600 mt-1">請先選擇圖片下載權限</p>
            )}
          </div>

          {/* 預覽區域 */}
          {previewUrls.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                預覽（{previewUrls.length} 張）：
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {previewUrls.map((preview, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-2 bg-gray-50"
                  >
                    <img
                      src={preview.url}
                      alt={`預覽 ${index + 1}`}
                      className="w-full h-32 object-cover rounded mb-2"
                    />
                    <p className="text-xs text-gray-500 truncate" title={preview.file.name}>
                      {preview.file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(preview.file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 上傳進度 */}
          {uploadProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  上傳進度
                </span>
                <span className="text-sm text-gray-600">
                  {uploadProgress.current} / {uploadProgress.total}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
                  style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* 上傳按鈕 */}
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || !selectedCategoryId || !selectedPriceType || uploading}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              selectedFiles.length === 0 || !selectedCategoryId || !selectedPriceType || uploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {uploading 
              ? `上傳中... ${uploadProgress ? `(${uploadProgress.current}/${uploadProgress.total})` : ''}`
              : `上傳圖片${selectedFiles.length > 0 ? ` (${selectedFiles.length} 張)` : ''}`
            }
          </button>

          {/* 上傳狀態 */}
          {uploadStatus && (
            <div
              className={`mt-4 p-3 rounded-lg whitespace-pre-line ${
                uploadStatus.includes('成功') && !uploadStatus.includes('失敗')
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : uploadStatus.includes('失敗') && !uploadStatus.includes('成功')
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}
            >
              {uploadStatus}
            </div>
          )}
        </div>

        {/* 說明區塊 */}
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 使用說明
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• 原始大圖只寫入 rxv-healing-images-staging</li>
            <li>• 縮圖只寫入 rxv-healing-images-public</li>
            <li>• 上傳成功後自動更新 catalog/images-public.json</li>
            <li>• 本階段新圖固定為「完整素材庫」，不公開原圖下載網址</li>
            <li>• 支援 JPG、PNG、WEBP</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
