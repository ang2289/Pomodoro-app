import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ChantCounter = () => {
  const navigate = useNavigate()
  const [selectedChant, setSelectedChant] = useState<string>(() => {
    const saved = localStorage.getItem('selectedChant')
    return saved || '南無阿彌陀佛'
  })
  const [chantList, setChantList] = useState<string[]>([])
  const [chantStats, setChantStats] = useState<{
    [chantName: string]: {
      count: number
      lastChanted: string
    }
  }>({})
  const [count, setCount] = useState(0)
  const [isSoundPlaying, setIsSoundPlaying] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('chantList')
    if (saved) {
      try {
        setChantList(JSON.parse(saved))
      } catch (error) {
        console.error('載入念誦清單失敗:', error)
      }
    }

    const savedStats = localStorage.getItem('chantStats')
    if (savedStats) {
      try {
        setChantStats(JSON.parse(savedStats))
      } catch (error) {
        console.error('載入統計資料失敗:', error)
      }
    }

    const savedImage = localStorage.getItem('chantImage')
    if (savedImage) {
      setUploadedImage(savedImage)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('selectedChant', selectedChant)
  }, [selectedChant])

  useEffect(() => {
    localStorage.setItem('chantList', JSON.stringify(chantList))
  }, [chantList])

  useEffect(() => {
    localStorage.setItem('chantStats', JSON.stringify(chantStats))
  }, [chantStats])

  useEffect(() => {
    if (uploadedImage) {
      localStorage.setItem('chantImage', uploadedImage)
    } else {
      localStorage.removeItem('chantImage')
    }
  }, [uploadedImage])

  const addChant = () => {
    const newChant = prompt('請輸入新的念誦內容:')
    if (newChant && newChant.trim() && !chantList.includes(newChant.trim())) {
      setChantList([...chantList, newChant.trim()])
    }
  }

  const removeChant = (chant: string) => {
    if (window.confirm(`確定要刪除「${chant}」嗎？`)) {
      setChantList(chantList.filter(c => c !== chant))
      const newStats = { ...chantStats }
      delete newStats[chant]
      setChantStats(newStats)
    }
  }

  const incrementCount = () => {
    setCount(prev => prev + 1)
    
    const now = new Date().toISOString()
    setChantStats(prev => ({
      ...prev,
      [selectedChant]: {
        count: (prev[selectedChant]?.count || 0) + 1,
        lastChanted: now
      }
    }))
  }

  const resetCount = () => {
    if (window.confirm('確定要重置計數嗎？')) {
      setCount(0)
    }
  }

  const playSound = () => {
    if (isSoundPlaying) return
    
    setIsSoundPlaying(true)
    const audio = new Audio('/sounds/wooden-fish.mp3')
    audio.play()
    
    setTimeout(() => {
      setIsSoundPlaying(false)
    }, 1000)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setUploadedImage(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setUploadedImage(null)
  }

  const getTotalCount = () => {
    return Object.values(chantStats).reduce((total, stat) => total + stat.count, 0)
  }

  const getMostChanted = () => {
    let maxCount = 0
    let mostChanted = ''
    
    Object.entries(chantStats).forEach(([chant, stat]) => {
      if (stat.count > maxCount) {
        maxCount = stat.count
        mostChanted = chant
      }
    })
    
    return mostChanted
  }

  return (
    <div className="gradient-bg min-h-screen p-3 sm:p-4">
      <div className="w-full max-w-screen-md mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-4 sm:mb-6">🙏 念誦計數器</h1>
          
          {uploadedImage && (
            <div className="mb-4 sm:mb-6 text-center">
              <img 
                src={uploadedImage} 
                alt="念誦圖片" 
                className="max-w-full h-32 sm:h-48 object-cover rounded-lg mx-auto"
              />
              <button
                onClick={removeImage}
                className="mt-2 px-2 sm:px-3 py-1 bg-red-500 text-white text-xs sm:text-sm rounded hover:bg-red-600"
              >
                移除圖片
              </button>
            </div>
          )}

          <div className="text-center mb-4 sm:mb-6">
            <div className="text-4xl sm:text-6xl font-bold text-pink-600 mb-2">{count}</div>
            <div className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">念誦次數</div>
            
            <div className="flex justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
              <button
                onClick={incrementCount}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm sm:text-lg font-semibold"
              >
                +1
              </button>
              <button
                onClick={resetCount}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-lg font-semibold"
              >
                重置
              </button>
            </div>

            <button
              onClick={playSound}
              disabled={isSoundPlaying}
              className={`px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base ${
                isSoundPlaying 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {isSoundPlaying ? '播放中...' : '🔔 木魚聲'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">📿 念誦內容</h2>
          
          <div className="mb-3 sm:mb-4">
            <select
              value={selectedChant}
              onChange={(e) => setSelectedChant(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm sm:text-base"
            >
              {chantList.map((chant) => (
                <option key={chant} value={chant}>{chant}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={addChant}
              className="flex-1 sm:flex-initial sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              新增念誦
            </button>
            {selectedChant && chantList.includes(selectedChant) && (
              <button
                onClick={() => removeChant(selectedChant)}
                className="flex-1 sm:flex-initial sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
              >
                刪除
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">📊 統計資料</h2>
          
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
              <span className="font-medium text-sm sm:text-base">總念誦次數</span>
              <span className="text-base sm:text-lg font-bold text-pink-600">{getTotalCount()}</span>
            </div>
            
            {getMostChanted() && (
              <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm sm:text-base">最常念誦</span>
                <span className="text-base sm:text-lg font-bold text-blue-600">{getMostChanted()}</span>
              </div>
            )}
            
            {selectedChant && chantStats[selectedChant] && (
              <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg">
                <span className="font-medium text-sm sm:text-base">當前念誦次數</span>
                <span className="text-base sm:text-lg font-bold text-green-600">{chantStats[selectedChant].count}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">🖼️ 背景圖片</h2>
          
          <div className="mb-3 sm:mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="w-full p-2 border border-gray-300 rounded-lg text-sm sm:text-base"
            />
          </div>
          
          <p className="text-xs sm:text-sm text-gray-600">
            上傳圖片作為念誦時的背景，支援 JPG、PNG 格式
          </p>
        </div>

        {/* TODO: 為了上線摘要與作業功能，暫時隱藏 chant 模組 */}
        {/* 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟 */}
        {(import.meta.env.VITE_ENABLE_CHANT === 'true' || import.meta.env.NEXT_PUBLIC_ENABLE_CHANT === 'true') && (
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">🔗 相關功能</h2>
            
            <div className="space-y-2 sm:space-y-3">
              <button
                onClick={() => navigate('/chant-wish-wall')}
                className="w-full p-2 sm:p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base"
              >
                🙏 發起集氣活動
              </button>
              
              <button
                onClick={() => navigate('/chant-wish-wall')}
                className="w-full p-2 sm:p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm sm:text-base"
              >
                📣 查看集氣牆
              </button>
              
              <button
                onClick={() => navigate('/chant-ranking')}
                className="w-full p-2 sm:p-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all text-sm sm:text-base"
              >
                🏆 排行榜
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChantCounter