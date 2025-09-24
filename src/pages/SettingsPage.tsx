import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
// import { useTheme } from '../hooks/useTheme'
// import Button from '@/components/ui/Button'

const SettingsPage = () => {
  const [showComingSoon, setShowComingSoon] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  // const { theme, fontSize, toggleTheme, toggleFontSize, isDark, isLargeFont } = useTheme()

  // 從 localStorage 初始化訂閱狀態
  useEffect(() => {
    const adFreeStatus = localStorage.getItem('isAdFree')
    setIsSubscribed(adFreeStatus === 'true')
  }, [])

  const handleFeatureClick = () => {
    setShowComingSoon(true)
    setTimeout(() => setShowComingSoon(false), 2000)
  }

  const handleSubscribe = () => {
    console.log('按鈕被點擊了！', { isSubscribed })
    
    if (isSubscribed) {
      console.log('已經訂閱，不執行任何操作')
      return // 如果已經訂閱，不執行任何操作
    }

    console.log('顯示確認對話框')
    const confirmed = window.confirm('您確定要訂閱並移除廣告嗎？')
    
    if (confirmed) {
      console.log('用戶確認訂閱，更新狀態')
      localStorage.setItem('isAdFree', 'true')
      setIsSubscribed(true)
      console.log('訂閱狀態已更新')
    } else {
      console.log('用戶取消訂閱')
    }
  }

  return (
    <div className="page bg-white text-black">
      <h1>⚙️ 設定</h1>
      <Link 
        to="/" 
        style={{ 
          textDecoration: 'none',
          display: 'inline-block'
        }}
      >
        <button className="rounded px-4 py-2 font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200">
          ← 回首頁
        </button>
      </Link>
      
      <div className="stack">
        {/* 去廣告訂閱 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="m-0 mb-2 text-xl font-semibold">🚫 去廣告訂閱</h2>
              <p className="m-0 text-base font-medium">
                移除廣告，享受無干擾的使用體驗
              </p>
            </div>
            <button
              className="rounded px-4 py-2 font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
              onClick={handleSubscribe}
              disabled={isSubscribed}
            >
              {isSubscribed ? '✅ 已訂閱' : '訂閱'}
            </button>
          </div>
        </div>

        {/* 其他設定選項 */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 className="m-0 mb-2 text-xl font-semibold">🔔 通知設定</h2>
              <p className="m-0 text-base font-medium">
                管理番茄鐘和任務提醒通知
              </p>
            </div>
            <button
              className="rounded px-4 py-2 font-medium text-white bg-blue-500 hover:bg-blue-600 transition-colors duration-200"
              onClick={handleFeatureClick}
            >
              設定
            </button>
          </div>
        </div>

      </div>

      {/* 開發中提示 */}
      {showComingSoon && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#2a2a2a',
          color: 'white',
          padding: '20px 30px',
          borderRadius: '12px',
          border: '1px solid #4ecdc4',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          zIndex: 1000,
          textAlign: 'center',
          animation: 'fadeInOut 2s ease-in-out'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '12px' }}>🚧</div>
          <div style={{ fontSize: '20px', fontWeight: '600' }}>功能開發中</div>
          <div style={{ fontSize: '16px', color: '#ccc', marginTop: '6px', fontWeight: '500' }}>
            敬請期待！
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
          20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        }
      `}</style>
    </div>
  )
}

export default SettingsPage
