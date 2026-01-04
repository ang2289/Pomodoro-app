import { useState, useEffect } from 'react'
import clsx from 'clsx'
import { supabase } from '../lib/supabase'

interface WishLightRecord {
  id: string
  user_name: string
  created_at: string
}

interface WishLightButtonProps {
  wishId: string
}

export default function WishLightButton({ wishId }: WishLightButtonProps) {
  const [isClicked, setIsClicked] = useState(false)
  const [userName, setUserName] = useState('')
  const [lightCount, setLightCount] = useState(0)
  const [isLighted, setIsLighted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [lightRecords, setLightRecords] = useState<WishLightRecord[]>([])
  const [showRecords, setShowRecords] = useState(false)

  // 載入點燈狀態和數量
  useEffect(() => {
    const loadData = async () => {
      // 檢查本地是否已點燈
      const key = `wish_lighted_${wishId}`
      const hasLighted = localStorage.getItem(key) === '1'
      setIsLighted(hasLighted)

      try {
        // 載入點燈總數
        const { count, error } = await supabase
          .from('wish_lights')
          .select('*', { count: 'exact', head: true })
          .eq('wish_id', wishId)

        if (!error && count !== null) {
          setLightCount(count)
        } else {
          console.log('載入點燈數量結果:', { count, error })
        }

        // 載入點燈明細
        const { data: records, error: recordsError } = await supabase
          .from('wish_lights')
          .select('id, user_name, created_at')
          .eq('wish_id', wishId)
          .order('created_at', { ascending: false })
          .limit(10) // 只顯示最新的10筆

        if (!recordsError && records) {
          setLightRecords(records)
        }
      } catch (err) {
        console.error('載入點燈資料失敗:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [wishId])

  const handleLight = async () => {
    if (isLighted || loading) return

    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 800)

    const nameToSave = userName.trim() || '匿名'

    try {
      const { error } = await supabase
        .from('wish_lights')
        .insert({
          wish_id: wishId,
          user_name: nameToSave
        })

      if (error) {
        console.error('點燈失敗:', error)
        alert('點燈失敗：' + error.message)
        return
      }

      // 更新狀態
      setIsLighted(true)
      setLightCount(prev => prev + 1)
      localStorage.setItem(`wish_lighted_${wishId}`, '1')
      setUserName('') // 清空輸入欄
      
      // 重新載入點燈明細
      const { data: records, error: recordsError } = await supabase
        .from('wish_lights')
        .select('id, user_name, created_at')
        .eq('wish_id', wishId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (!recordsError && records) {
        setLightRecords(records)
      }
      
      alert('🪔 點燈成功！')
    } catch (err) {
      console.error('點燈失敗:', err)
      alert('點燈失敗，請稍後再試')
    }
  }

  // 格式化時間顯示（如「3分鐘前」）
  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const past = new Date(dateString)
    const diffInMs = now.getTime() - past.getTime()
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

    if (diffInMinutes < 1) return '剛剛'
    if (diffInMinutes < 60) return `${diffInMinutes}分鐘前`
    if (diffInHours < 24) return `${diffInHours}小時前`
    if (diffInDays < 7) return `${diffInDays}天前`
    
    // 超過一週顯示完整日期
    return past.toLocaleDateString('zh-TW', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <button
        onClick={handleLight}
        disabled={isLighted || loading}
        className={clsx(
          'transition-all duration-500 ease-out relative p-4',
          isClicked ? 'scale-125' : 'scale-100',
          isLighted || loading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2 rounded-full'
        )}
        aria-label="點燈"
      >
        {/* 蓮花圖案 🪷 */}
        <div className="relative">
          {/* 背景光暈 - 持續脈動 */}
          <div 
            className={clsx(
              'absolute inset-0 rounded-full blur-xl transition-all duration-700',
              isClicked 
                ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 opacity-70 scale-150' 
                : isLighted 
                  ? 'bg-pink-300 opacity-30 scale-100'
                  : 'bg-pink-400 opacity-40 scale-100 animate-pulse'
            )}
          />
          
          {/* 蓮花主體 */}
          <div
            className={clsx(
              'relative w-16 h-16 flex items-center justify-center transition-all duration-500',
              isClicked && 'animate-bounce drop-shadow-[0_0_20px_rgba(236,72,153,0.9)]',
              !isLighted && !isClicked && 'drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]'
            )}
            style={{
              filter: isClicked ? 'brightness(1.5) saturate(1.5)' : 'brightness(1)',
              transform: isClicked ? 'rotate(360deg)' : 'rotate(0deg)',
              transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }}
          >
            <img 
              src="/assets/lotus-new.png" 
              alt="蓮花點燈圖"
              className="w-24 h-24 mx-auto my-2 drop-shadow-lg rounded-full"
            />
          </div>
          
          {/* 點擊時的火焰效果 */}
          {isClicked && (
            <>
              {/* 中心光芒 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-yellow-300 rounded-full opacity-40 animate-ping" />
              
              {/* 粒子效果 */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                    style={{
                      transform: `rotate(${i * 45}deg) translateY(-25px)`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.6s'
                    }}
                  />
                ))}
              </div>
              
              {/* 漣漪效果 */}
              <div className="absolute inset-0 rounded-full border-4 border-pink-400 opacity-60 animate-ping" 
                   style={{ animationDuration: '1s' }} />
              <div className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-40 animate-ping" 
                   style={{ animationDuration: '1.2s', animationDelay: '0.2s' }} />
            </>
          )}
        </div>
      </button>
      
      {/* 名字輸入欄位 */}
      {!isLighted && (
        <input
          type="text"
          placeholder="請輸入您的名字（可留空）"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="mt-2 w-full max-w-xs px-3 py-2 rounded-lg border border-gray-300 text-sm text-center focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
        />
      )}
      
      {/* 點燈數量顯示 */}
      <div className="flex items-center gap-1 text-yellow-600 font-medium">
        <span>🪔</span>
        <span className="text-sm">{lightCount} 盞</span>
      </div>
      
      {/* 點燈明細按鈕 */}
      {lightCount > 0 && (
        <button
          onClick={() => setShowRecords(!showRecords)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {showRecords ? '隱藏明細' : '查看明細'}
        </button>
      )}
      
      {/* 點燈明細列表 */}
      {showRecords && lightRecords.length > 0 && (
        <div className="w-full max-w-xs bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
          <h5 className="text-xs font-medium text-gray-700 mb-2 text-center">🪔 點燈明細</h5>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {lightRecords.map((record) => (
              <div key={record.id} className="flex justify-between items-center text-xs">
                <span className="text-gray-600">
                  🪔 {record.user_name}
                </span>
                <span className="text-gray-400">
                  {formatTimeAgo(record.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 已點燈提示 */}
      {isLighted && (
        <p className="text-xs text-gray-500">已點燈</p>
      )}
    </div>
  )
}

