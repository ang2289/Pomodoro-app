import { useEffect, useRef, useState } from 'react'

const defaultMusicOptions = [
  { label: '南無阿彌陀佛（一）', file: '/music/namo1.mp3' },
  { label: '南無阿彌陀佛（二）', file: '/music/namo2.mp3' },
  { label: '南無阿彌陀佛（三）', file: '/music/namo3.mp3' }
]

export default function AnimatedMusicPlayer({ onPlayStateChange }: { onPlayStateChange?: (isPlaying: boolean) => void } = {}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(() => {
    // 從 localStorage 讀取播放狀態，預設為暫停
    const savedPlayState = localStorage.getItem('animatedMusicPlayState')
    return savedPlayState === 'true'
  })
  const [selected, setSelected] = useState(() => {
    // 從 localStorage 讀取音樂選擇，預設為南無阿彌陀佛（一）
    return localStorage.getItem('selectedAnimatedMusic') || defaultMusicOptions[0].file
  })
  const [customMusic, setCustomMusic] = useState<string | null>(null)
  const [musicOptions, setMusicOptions] = useState(defaultMusicOptions)

  // 載入儲存的音樂設定
  useEffect(() => {
    const savedCustomMusic = localStorage.getItem('customAnimatedMusic')
    if (savedCustomMusic) {
      setCustomMusic(savedCustomMusic)
      const customOption = {
        label: '自訂音樂',
        file: savedCustomMusic
      }
      setMusicOptions([customOption, ...defaultMusicOptions])
    }
  }, [])

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

  // 音樂播放控制
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = selected
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
    }
  }, [selected, isPlaying])

  // 儲存播放狀態到 localStorage
  useEffect(() => {
    localStorage.setItem('animatedMusicPlayState', isPlaying.toString())
  }, [isPlaying])

  // 處理自訂音樂上傳
  const handleCustomMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setCustomMusic(result)
        localStorage.setItem('customAnimatedMusic', result)
        
        // 更新音樂選項
        const customOption = {
          label: '自訂音樂',
          file: result
        }
        setMusicOptions([customOption, ...defaultMusicOptions])
        setSelected(result)
      }
      reader.readAsDataURL(file)
    }
  }

  // 清除自訂音樂
  const clearCustomMusic = () => {
    setCustomMusic(null)
    localStorage.removeItem('customAnimatedMusic')
    setMusicOptions(defaultMusicOptions)
    setSelected(defaultMusicOptions[0].file)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500">
      <h3 className="text-xl font-bold mb-2 text-center text-gray-800">
        🎵 背景音樂（動畫版）
      </h3>
      

      {/* 音樂選擇 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          選擇音樂：
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
          上傳自訂音樂：
        </label>
        <div className="flex gap-2">
          <label className="flex-1 cursor-pointer">
            <input
              type="file"
              accept="audio/mp3,audio/*"
              onChange={handleCustomMusicUpload}
              className="hidden"
            />
            <div className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-center font-medium transition-colors duration-200">
              選擇 MP3 檔案
            </div>
          </label>
          {customMusic && (
            <button
              onClick={clearCustomMusic}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              清除
            </button>
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
          {isPlaying ? '⏸️ 暫停音樂' : '▶️ 播放音樂'}
        </button>
      </div>

      {/* 隱藏的音頻元素 */}
      <audio ref={audioRef} loop hidden />
    </div>
  )
}
