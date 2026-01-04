import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import imageCompression from 'browser-image-compression'
import { supabase } from '../lib/supabase'

async function isImageSafe(base64DataUrl: string): Promise<boolean> {
  const labels = ['safe', 'porn', 'naked', 'violence', 'blood', 'hate', 'weapon']
  try {
    console.log('開始圖片安全檢查...')
    
    // 檢查網路連線
    if (!navigator.onLine) {
      console.warn('網路連線不可用，跳過安全檢查')
      return true
    }
    
    // 使用 timeout 避免長時間等待
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超時
    
    const res = await fetch('https://moderate-content-clip-vit-base-patch32.hf.space/run/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [base64DataUrl, labels] }),
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      console.warn('安全檢查 API 回應錯誤:', res.status, res.statusText)
      return true // 若 API 失敗則預設為安全
    }
    
    const result = await res.json()
    const topLabel = result?.data?.[0]?.[0]?.label || ''
    console.log('安全檢查結果:', topLabel)
    return topLabel === 'safe'
  } catch (error) {
    console.error('圖片安全檢查錯誤:', error)
    
    // 如果是超時或網路錯誤，跳過檢查
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('安全檢查超時，跳過檢查')
      } else if (error.message.includes('fetch')) {
        console.warn('網路連線問題，跳過安全檢查')
      }
    }
    
    return true // 若 API 失敗則預設為安全（避免誤封）
  }
}

export default function ImageUpload({ onUpload }: { onUpload: (url: string) => void }) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      console.log('沒有選擇檔案')
      return
    }

    console.log('選擇的檔案:', file.name, '大小:', (file.size / 1024 / 1024).toFixed(2), 'MB')
    setFileName(file.name)
    
    // 立即顯示本地預覽
    const localPreviewUrl = URL.createObjectURL(file)
    setPreviewUrl(localPreviewUrl)

    // 檢查檔案類型（更寬鬆的檢查，支援手機常見的格式）
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/jpeg;base64']
    const validExtensions = ['.jpg', '.jpeg', '.png']
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      alert(t('only_jpg_png'))
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFileName('')
      setPreviewUrl('')
      return
    }

    // 檢查檔案大小（初步檢查）
    if (file.size > 50 * 1024 * 1024) { // 50MB
      alert(t('image_too_large_50mb'))
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFileName('')
      setPreviewUrl('')
      return
    }

    try {
      // 在手機環境下跳過安全檢查，直接上傳
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      if (isMobile) {
        console.log('手機環境，跳過安全檢查，直接上傳')
        await uploadImage(file)
      } else {
        // 網頁環境進行安全檢查
        console.log('開始讀取檔案進行安全檢查...')
        
        try {
          // 使用 Promise 包裝 FileReader
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            
            reader.onload = () => {
              const result = reader.result as string
              if (!result) {
                reject(new Error('無法讀取檔案內容'))
                return
              }
              resolve(result)
            }
            
            reader.onerror = () => {
              reject(new Error('檔案讀取失敗'))
            }
            
            reader.readAsDataURL(file)
          })
          
          console.log('檔案讀取成功，開始安全檢查...')
          const safe = await isImageSafe(base64)
          
          if (!safe) {
            alert('🚫 此圖片可能包含敏感內容，請更換圖片。')
            if (fileInputRef.current) fileInputRef.current.value = ''
            setFileName('')
            setPreviewUrl('')
            return
          }
          
          console.log('安全檢查通過，開始上傳...')
          await uploadImage(file)
        } catch (safetyError) {
          console.warn('安全檢查失敗，但繼續上傳:', safetyError)
          await uploadImage(file)
        }
      }
    } catch (error) {
      console.error('處理檔案時發生錯誤:', error)
      alert('處理圖片時發生錯誤，請重試')
      if (fileInputRef.current) fileInputRef.current.value = ''
      setFileName('')
      setPreviewUrl('')
    }
  }

  async function uploadImage(file: File) {
    console.log('開始圖片上傳流程...')
    setUploading(true)
    
    try {
      console.log('原始檔案大小:', (file.size / 1024 / 1024).toFixed(2), 'MB')
      console.log('檔案類型:', file.type)
      
      // 檢查檔案大小（如果太大直接提示）
      if (file.size > 10 * 1024 * 1024) { // 10MB
        alert(t('image_too_large_10mb'))
        return
      }
      
      // 圖片壓縮 - 確保符合上傳要求（手機優化版）
      console.log('開始壓縮圖片...')
      let compressedFile: File
      
      // 檢查是否為手機環境
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      
      try {
        // 根據原始檔案大小動態調整壓縮參數
        const fileSizeMB = file.size / (1024 * 1024)
        console.log('原始檔案大小:', fileSizeMB.toFixed(2), 'MB')
        
        // 如果原始檔案已經夠小，直接使用
        if (fileSizeMB <= 1) {
          console.log('檔案已經夠小，跳過壓縮')
          compressedFile = file
        } 
        // 手機環境使用簡化的壓縮策略
        else if (isMobile) {
          console.log('手機環境，使用簡化壓縮策略')
          
          // 手機上只進行一次溫和壓縮
          const options = {
            maxSizeMB: 0.9,
            maxWidthOrHeight: 800,
            useWebWorker: false,
            fileType: 'image/jpeg',
            initialQuality: 0.7,
            alwaysKeepResolution: true,
            preserveExif: false
          }
          
          try {
            compressedFile = await imageCompression(file, options)
            console.log('手機壓縮後檔案大小:', (compressedFile.size / (1024 * 1024)).toFixed(2), 'MB')
            
            // 如果壓縮失敗或檔案仍然太大，但原始檔案可接受，則使用原始檔案
            if (compressedFile.size > 2 * 1024 * 1024 && file.size <= 3 * 1024 * 1024) {
              console.log('壓縮效果不佳，使用原始檔案')
              compressedFile = file
            }
          } catch (mobileError) {
            console.warn('手機壓縮失敗，嘗試使用原始檔案:', mobileError)
            
            // 如果原始檔案不是太大，直接使用
            if (file.size <= 3 * 1024 * 1024) {
              compressedFile = file
            } else {
              throw new Error('圖片太大且無法壓縮，請選擇較小的圖片')
            }
          }
        } 
        // 網頁環境使用原有的多級壓縮策略
        else {
          // 手機優化的壓縮策略：更保守的設定
          let maxSizeMB = 0.8
          let initialQuality = 0.7
          let maxWidthOrHeight = 800
          
          // 根據檔案大小調整參數
          if (fileSizeMB > 10) {
            maxSizeMB = 0.6
            initialQuality = 0.4
            maxWidthOrHeight = 500
          } else if (fileSizeMB > 5) {
            maxSizeMB = 0.7
            initialQuality = 0.5
            maxWidthOrHeight = 600
          } else if (fileSizeMB > 2) {
            maxSizeMB = 0.75
            initialQuality = 0.6
            maxWidthOrHeight = 700
          }
          
          console.log(`壓縮參數: maxSizeMB=${maxSizeMB}, quality=${initialQuality}, size=${maxWidthOrHeight}`)
          
          // 第一次壓縮
          compressedFile = await imageCompression(file, {
            maxSizeMB,
            maxWidthOrHeight,
            useWebWorker: true,
            fileType: 'image/jpeg',
            initialQuality,
            alwaysKeepResolution: false,
            preserveExif: false
          })
          
          console.log('第一次壓縮後檔案大小:', (compressedFile.size / (1024 * 1024)).toFixed(2), 'MB')
          
          // 如果仍然太大，進行第二次壓縮
          if (compressedFile.size > 1024 * 1024) {
            console.log('檔案仍然太大，進行第二次壓縮...')
            compressedFile = await imageCompression(compressedFile, {
              maxSizeMB: 0.7,
              maxWidthOrHeight: 600,
              useWebWorker: true,
              fileType: 'image/jpeg',
              initialQuality: 0.4
            })
          }
        }
        
      } catch (compressionError) {
        console.error('圖片壓縮失敗:', compressionError)
        
        // 如果壓縮完全失敗，檢查原始檔案大小
        if (file.size <= 2 * 1024 * 1024) { // 放寬限制到 2MB
          console.log('使用原始檔案作為備用方案')
          compressedFile = file
        } else {
          alert('圖片處理失敗，請選擇較小的圖片')
          return
        }
      }

      // 上傳到 Supabase
      console.log('開始上傳到 Supabase...')
      const fileExt = 'jpg'
      const uploadFileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`
      
      console.log('上傳檔案名稱:', uploadFileName)
      
      const uploadResult = await supabase.storage
        .from('chant-wish-images')
        .upload(uploadFileName, compressedFile, { 
          cacheControl: '3600', 
          upsert: false, 
          contentType: 'image/jpeg' 
        })

      if (uploadResult.error) {
        console.error('Supabase 上傳錯誤:', uploadResult.error)
        throw new Error(`${t('upload_failed_colon')}${uploadResult.error.message}`)
      }

      console.log('上傳成功，獲取公開 URL...')
      const { data: urlData } = supabase.storage
        .from('chant-wish-images')
        .getPublicUrl(uploadFileName)
        
      if (urlData?.publicUrl) {
        console.log('獲得公開 URL:', urlData.publicUrl)
        setPreviewUrl(urlData.publicUrl)
        onUpload(urlData.publicUrl)
        console.log('圖片上傳完成')
      } else {
        throw new Error('無法獲取圖片公開 URL')
      }
      
    } catch (err: any) {
      console.error('圖片上傳失敗:', err)
      
      let errorMessage = t('image_upload_failed')
      
      // 處理 ProgressEvent 錯誤（網路中斷等情況）
      if (err instanceof ProgressEvent) {
        if (err.type === 'error') {
          errorMessage = t('network_issue_check')
        } else if (err.type === 'abort') {
          errorMessage = t('upload_failed_retry')
        } else {
          errorMessage = t('network_issue_check')
        }
      } else if (err?.message) {
        if (err.message.includes('JWT') || err.message.includes('auth')) {
          errorMessage = t('upload_failed_retry')
        } else if (err.message.includes('storage') || err.message.includes('bucket')) {
          errorMessage = t('upload_failed_retry')
        } else if (err.message.includes('network') || err.message.includes('fetch') || err.message.includes('timeout')) {
          errorMessage = t('network_issue_check')
        } else if (err.message.includes('size') || err.message.includes('too large') || err.message.includes('過大')) {
          errorMessage = t('image_too_large_1mb')
        } else if (err.message.includes('compression') || err.message.includes('壓縮')) {
          errorMessage = t('image_too_large_1mb')
        } else if (err.message.includes('format') || err.message.includes('格式')) {
          errorMessage = t('only_jpg_png')
        } else {
          errorMessage = `${t('upload_failed_colon')}${err.message}`
        }
      } else if (typeof err === 'string') {
        errorMessage = `${t('upload_failed_colon')}${err}`
      } else if (err && typeof err.toString === 'function') {
        // 處理其他類型的錯誤物件
        const errStr = err.toString()
        if (errStr.includes('ProgressEvent')) {
          errorMessage = t('network_issue_check')
        } else {
          errorMessage = `${t('upload_failed_colon')}${errStr}`
        }
      } else {
        errorMessage = t('upload_failed_retry')
      }
      
      alert(errorMessage)
      setFileName('')
    } finally {
      setUploading(false)
    }
  }

  function handleRemove() {
    setPreviewUrl('')
    setFileName('')
    onUpload('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="text-sm text-gray-600">
      <label className="block font-semibold mb-1">📷 {t('upload_image_label')}</label>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={uploading}
          className="!bg-blue-500 hover:!bg-blue-600 !text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:!bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
        >
          {uploading ? t('uploading') : t('select_image')}
        </button>
        <span className="text-gray-500 text-xs">
          {fileName ? `(${fileName})` : t('no_file_chosen')}
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        title={t('select_image_file')}
        placeholder={t('please_select_image')}
        onChange={handleUpload}
        capture="environment"
      />

      {uploading && <p className="text-xs text-gray-400 mt-1">{t('image_compressing_uploading')}</p>}

      {previewUrl && (
        <div className="mt-3">
          <div className="inline-block rounded-md border border-gray-200 shadow-md overflow-hidden">
            <img src={previewUrl} alt={t('preview')} className="max-h-40 object-contain bg-white" />
          </div>
          <div className="mt-2">
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm"
            >
              {t('remove')}
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-1">
        {t('image_content_warning')}
      </p>
    </div>
  )
}


