import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { getCurrentUserId, logout as logoutUser } from '@/lib/auth'
import PrimaryButton from '@/components/ui/PrimaryButton'

interface HeaderBarProps {
  icon: string
  title: string
  className?: string
  showHomeButton?: boolean
}

const HeaderBar: React.FC<HeaderBarProps> = ({ 
  icon, 
  title, 
  className = '',
  showHomeButton = false
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [userId, setUserId] = useState<string | null>(null)

  // 檢查登入狀態
  useEffect(() => {
    const checkLogin = () => {
      const currentUserId = getCurrentUserId()
      setUserId(currentUserId)
    }

    // 初始檢查
    checkLogin()

    // 監聽 localStorage 變化（用於跨標籤頁同步）
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userId') {
        checkLogin()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    // 定期檢查（用於同標籤頁更新）
    const interval = setInterval(checkLogin, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  // 登出處理
  const handleLogout = () => {
    logoutUser()
    setUserId(null)
    navigate('/login')
  }

  return (
    <div className={`flex items-center justify-between gap-2 mb-4 sm:mb-6 pt-2 sm:pt-6 pb-2 sm:pb-4 ${className}`}>
      {/* 左側：回首頁按鈕和標題 */}
      <div className="flex items-center gap-2">
        {showHomeButton && (
          <Link 
            to="/" 
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200"
            title="回首頁"
          >
            <span className="text-sm sm:text-lg">🏠</span>
          </Link>
        )}
        
        {/* 標題區域 */}
        <span className="text-xl sm:text-2xl">{icon}</span>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
          {t(title)}
        </h1>
      </div>

      {/* 右側區域：根據登入狀態顯示不同內容 */}
      {userId ? (
        <div className="flex items-center gap-3">
          {/* 登出按鈕 */}
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            登出
          </button>
        </div>
      ) : (
        <Link to="/login" className="block">
          <PrimaryButton fullWidth={false} size="sm">
            登入
          </PrimaryButton>
        </Link>
      )}
    </div>
  )
}

export default HeaderBar














