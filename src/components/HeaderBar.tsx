import React from 'react'
import { Link } from 'react-router-dom'

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
          {title}
        </h1>
      </div>
    </div>
  )
}

export default HeaderBar














