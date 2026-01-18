import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface ChantButtonProps {
  onSoundPlay?: () => void
  onCount?: () => void
  customWoodfishImage?: string | null
  onWoodfishUpload?: (image: string | null) => void
  onReset?: () => void
}

export default function ChantButton({ onSoundPlay, onCount, customWoodfishImage, onWoodfishUpload, onReset }: ChantButtonProps) {
  const { t } = useTranslation()
  const [animate, setAnimate] = useState(false)
  const [showPlusOne, setShowPlusOne] = useState(false)

  const handleWoodfishUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        onWoodfishUpload?.(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleClick = () => {
    // 如果正在動畫中，不重複觸發
    if (animate) return

    setAnimate(true)
    setShowPlusOne(true)

    // 播放音效
    onSoundPlay?.()

    // 呼叫計數邏輯
    onCount?.()

    // 動畫完成後重置狀態
    setTimeout(() => {
      setShowPlusOne(false)
      setAnimate(false)
    }, 1000)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {/* 木魚按鈕（按下響應效果） */}
      <div className="relative">
        <button
          type="button"
          onClick={handleClick}
          className={`group flex items-center justify-center transition-all duration-150
            active:scale-95
            !border-0 !outline-none !ring-0 !shadow-none bg-transparent`}
          style={{ 
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
            borderWidth: '0',
            borderStyle: 'none',
            borderColor: 'transparent',
            background: 'transparent'
          }}
          aria-label="敲木魚"
        >
          <img
            src={customWoodfishImage || "/assets/woodfish.png"}
            className={`w-32 h-32 sm:w-40 sm:h-40 select-none pointer-events-none border-0 outline-none`}
            alt="敲木魚"
            style={{ WebkitTapHighlightColor: 'transparent', border: 'none', outline: 'none' }}
          />
        </button>
        {showPlusOne && (
          <div className="floating-plus-one animate-pop-bounce">+1</div>
        )}
      </div>
      
      {/* 上傳圖片按鈕 */}
      <input
        type="file"
        accept="image/*"
        onChange={handleWoodfishUpload}
        className="hidden"
        id="woodfish-upload"
      />
      <label htmlFor="woodfish-upload">
        <div className="w-full max-w-xs lg:w-40 mx-auto block bg-yellow-500 text-white px-3 sm:px-4 py-2 rounded cursor-pointer hover:bg-yellow-600 transition-colors duration-200 text-sm sm:text-base">
          {t('upload_custom_woodfish_image')}
        </div>
      </label>
      
      {/* 還原預設按鈕 */}
      <div 
        onClick={onReset}
        className="w-full max-w-xs lg:w-40 mx-auto block bg-gray-400 text-white px-3 sm:px-4 py-2 rounded hover:bg-gray-500 cursor-pointer transition-colors duration-200 text-sm sm:text-base"
      >
        {t('restore_default')}
      </div>
    </div>
  )
}
