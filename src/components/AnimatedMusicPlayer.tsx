import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n'

export default function AnimatedMusicPlayer({ onPlayStateChange }: { onPlayStateChange?: (isPlaying: boolean) => void } = {}) {
  const { t } = useTranslation()
  const audioRef = useRef<HTMLAudioElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 根據語言動態生成音樂選項
  const getDefaultMusicOptions = () => [
    { label: t('chant_config.music.namo_1'), file: '/music/namo1.mp3' },
    { label: t('chant_config.music.namo_2'), file: '/music/namo2.mp3' },
    { label: t('chant_config.music.namo_3'), file: '/music/namo3.mp3' }
  ]
  
  const [isPlaying, setIsPlaying] = useState(() => {
    // 從 localStorage 讀取播放狀態，預設為暫停
    const savedPlayState = localStorage.getItem('animatedMusicPlayState')
    return savedPlayState === 'true'
  })
  
  const [selected, setSelected] = useState(() => {
    // 從 localStorage 讀取音樂選擇，預設為第一個選項
    const defaultOptions = getDefaultMusicOptions()
    return localStorage.getItem('selectedAnimatedMusic') || defaultOptions[0].file
  })
  
  // 使用URL.createObjectURL創建的URL
  const [customMusicURL, setCustomMusicURL] = useState<string | null>(null)
  // 使用檔案物件直接參考檔案
  const [customMusicFile, setCustomMusicFile] = useState<File | null>(null)
  // 使用customMusicName來顯示自訂音樂的名稱
  const [customMusicName, setCustomMusicName] = useState<string | null>(null)
  const [musicOptions, setMusicOptions] = useState(getDefaultMusicOptions())

  // 載入儲存的自訂音樂名稱（只在初始化時）
  useEffect(() => {
    const savedCustomMusicName = localStorage.getItem('customMusicName')
    if (savedCustomMusicName) {
      setCustomMusicName(savedCustomMusicName)
    }
  }, [])

  // 更新音樂選項（當語言變更時）
  useEffect(() => {
    if (customMusicName) {
      const customOption = {
        label: t('chant_config.music.custom_music') + ': ' + customMusicName,
        file: 'custom'
      }
      setMusicOptions([customOption, ...getDefaultMusicOptions()])
    } else {
      setMusicOptions(getDefaultMusicOptions())
    }
  }, [t, i18n.language, customMusicName])

  // 初始載入時通知播放狀態
  useEffect(() => {
    onPlayStateChange?.(isPlaying)
  }, [isPlaying, onPlayStateChange])

  // 切換播放/暫停函數
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(console.error)
      }
    }
    const newPlayState = !isPlaying
    setIsPlaying(newPlayState)
    onPlayStateChange?.(newPlayState)
  }

  // 快捷鍵監聽（空白鍵切換播放/暫停）
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // 只在按下空白鍵且不在輸入欄位中時觸發
      if (event.code === 'Space' && 
          !['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement)?.tagName)) {
        event.preventDefault() // 防止頁面滾動
        togglePlay()
      }
    }

    // 添加事件監聽器
    document.addEventListener('keydown', handleKeyPress)

    // 清理事件監聽器
    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [isPlaying]) // 依賴 isPlaying 以確保使用最新狀態

  // 清理URL.createObjectURL創建的URL
  useEffect(() => {
    return () => {
      if (customMusicURL && customMusicURL.startsWith('blob:')) {
        URL.revokeObjectURL(customMusicURL)
      }
    }
  }, [customMusicURL])

  // 音樂播放控制
  useEffect(() => {
    if (!audioRef.current) return
    
    if (selected === 'custom' && customMusicURL) {
      audioRef.current.src = customMusicURL
    } else {
      audioRef.current.src = selected
    }
    
    audioRef.current.loop = true
    audioRef.current.volume = 0.5
    
    // 根據播放狀態控制音樂
    if (isPlaying) {
      audioRef.current.play().catch(console.error)
    } else {
      audioRef.current.pause()
    }
    
    // 儲存音樂選擇到 localStorage
    localStorage.setItem('selectedAnimatedMusic', selected)
  }, [selected, customMusicURL, isPlaying])

  // 儲存播放狀態到 localStorage
  useEffect(() => {
    localStorage.setItem('animatedMusicPlayState', isPlaying.toString())
  }, [isPlaying])

  // 處理自訂音樂上傳
  const handleCustomMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      try {
        // 清理之前的URL
        if (customMusicURL && customMusicURL.startsWith('blob:')) {
          URL.revokeObjectURL(customMusicURL)
        }
        
        // 使用URL.createObjectURL而不是FileReader和DataURL
        const objectURL = URL.createObjectURL(file)
        setCustomMusicURL(objectURL)
        setCustomMusicFile(file)
        setCustomMusicName(file.name)
        
        // 只儲存檔案名稱，不儲存檔案內容
        localStorage.setItem('customMusicName', file.name)
        
        // 更新音樂選項
        const customOption = {
          label: t('chant_config.music.custom_music') + ': ' + file.name,
          file: 'custom'
        }
        setMusicOptions([customOption, ...getDefaultMusicOptions()])
        setSelected('custom')
      } catch (error) {
        console.error(t('chant_config.error.process_custom_music_failed'), error)
        alert(t('chant_config.alert.file_process_failed'))
      }
    }
    // 重置input值，以便能夠重新選擇相同檔案
    event.target.value = ''
  }

  // 清除自訂音樂
  const clearCustomMusic = () => {
    // 清理URL
    if (customMusicURL && customMusicURL.startsWith('blob:')) {
      URL.revokeObjectURL(customMusicURL)
    }
    
    setCustomMusicURL(null)
    setCustomMusicFile(null)
    setCustomMusicName(null)
    localStorage.removeItem('customMusicName')
    localStorage.removeItem('selectedAnimatedMusic')
    const defaultOptions = getDefaultMusicOptions()
    setMusicOptions(defaultOptions)
    setSelected(defaultOptions[0].file)
    
    // 重置檔案輸入
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
      <h3 className="text-xl font-bold mb-2 text-center text-gray-800">
        🎵 {t('background_music_animated')}
      </h3>
      <p className="text-sm text-gray-500 text-center mb-4">
        {t('chant_config.music.spacebar_hint')}
      </p>

      {/* 音樂選擇 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('select_music')}
        </label>
        <select
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {musicOptions.map((music) => (
            <option key={music.file} value={music.file}>
              {music.label}
            </option>
          ))}
        </select>
      </div>

      {/* 自訂音樂上傳 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('upload_custom_music')}
        </label>
        <div className="space-y-2">
          <label className="block cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/mp3,audio/*"
              onChange={handleCustomMusicUpload}
              className="hidden"
            />
            <div className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors duration-200 shadow-md hover:shadow-lg">
              {t('select_mp3_file')}
            </div>
          </label>
          {customMusicName && (
            <button
              onClick={clearCustomMusic}
              className="w-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] mt-3 mb-2"
            >
              {t('clear_custom_music')}
            </button>
          )}
          {customMusicName && (
            <div className="text-sm text-green-600 mt-1">
              {t('selected_file')}{customMusicName}
            </div>
          )}
        </div>
      </div>

      {/* 播放控制 */}
      <div className="text-center">
        <button
          id="music-play-button"
          onClick={togglePlay}
          className="music-play-button"
          style={{
            backgroundColor: '#3b82f6',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: 'auto',
            maxWidth: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.setProperty('background-color', '#2563eb', 'important');
            e.currentTarget.style.setProperty('background', '#2563eb', 'important');
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.setProperty('background-color', '#3b82f6', 'important');
            e.currentTarget.style.setProperty('background', '#3b82f6', 'important');
          }}
        >
          {isPlaying ? `⏸️ ${t('pause_music')}` : `▶️ ${t('play_music')}`}
        </button>
      </div>

      {/* 隱藏的音頻元素 */}
      <audio ref={audioRef} loop hidden />
    </div>
  )
}
