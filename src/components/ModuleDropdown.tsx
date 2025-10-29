import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const moduleOptions = [
  { value: '/chant', label: '唸經' },
  { value: '/todo', label: '待辦' },
  { value: '/pomodoro', label: '番茄鐘' },
  // 點「發起集氣」導向發起集氣助念活動頁
  { value: '/chant-wish-create', label: '發起集氣' },
  // 新增：集氣活動牆頁
  { value: '/chant-wish-wall', label: '集氣牆' },
  // 新增：統計頁面
  { value: '/chant-stats', label: '統計' },
  // 新增：排行榜頁面
  { value: '/chant-ranking', label: '排行榜' },
  // 新增：功能總覽頁面
  { value: '/features', label: '功能總覽' },
  // 新增：設定頁面
  { value: '/settings', label: '設定' }
]

export default function ModuleDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  const getCurrentOption = () => {
    const currentOption = moduleOptions.find(option => 
      option.value === currentPath || 
      (option.value === '/pomodoro' && currentPath === '/')
    )
    return currentOption || { label: '選擇模組' }
  }

  const handleChange = (value: string) => {
    navigate(value)
    setIsOpen(false)
  }

  return (
    <div className="relative w-full max-w-xs mx-auto mb-3 sm:mb-4">
      {/* 下拉選單按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center">
          <span className="text-sm sm:text-base font-medium text-gray-700">{getCurrentOption().label}</span>
        </div>
        <svg 
          className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉選單內容 */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50">
          <div className="py-1">
            {moduleOptions.map((option) => {
              const isActive = currentPath === option.value || 
                              (option.value === '/pomodoro' && currentPath === '/')
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleChange(option.value)}
                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span>{option.label}</span>
                    </div>
                    {isActive && (
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 點擊外部關閉選單 */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
