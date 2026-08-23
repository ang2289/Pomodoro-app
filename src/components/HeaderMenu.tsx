import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// TODO: 為了上線摘要與作業功能，暫時隱藏集氣願望模組
// 日後可透過環境變數 VITE_ENABLE_CHANT=true 或 NEXT_PUBLIC_ENABLE_CHANT=true 再次開啟
const isChantWishEnabled = import.meta.env.VITE_ENABLE_CHANT === 'true' || import.meta.env.NEXT_PUBLIC_ENABLE_CHANT === 'true';

const baseMenuItems = [
  { path: '/summary', labelKey: 'ai_summary' },
  { path: '/chant', labelKey: 'chant' },
  { path: '/todo', labelKey: 'todo' },
  { path: 'pomodoro', labelKey: 'pomodoro' }
];

const chantWishMenuItems = isChantWishEnabled ? [
  { path: '/wish', labelKey: 'wish' }
] : [];

const menuItems = [...baseMenuItems, ...chantWishMenuItems];

export default function HeaderMenu() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  const getCurrentPageLabel = () => {
    const currentItem = menuItems.find(item => 
      item.path === currentPath || 
      (item.path === '/chant' && currentPath === '/')
    )
    if (currentItem) {
      return t(currentItem.labelKey)
    }
    return t('menu')
  }

  const getCurrentPageIcon = () => {
    return '☰'
  }

  return (
    <div className="relative">
      {/* 選單按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white shadow-lg rounded-lg px-3 sm:px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <span className="text-base sm:text-lg">{getCurrentPageIcon()}</span>
        <span className="text-sm sm:text-base font-medium text-gray-700">{getCurrentPageLabel()}</span>
        <svg 
          className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉選單 */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-2">
            {menuItems.map((item) => {
              const isActive = currentPath === item.path || 
                              (item.path === '/chant' && currentPath === '/') ||
                              (item.path === '/summary' && currentPath === '/summary')
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 text-base transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{t(item.labelKey)}</span>
                  {isActive && (
                    <svg className="w-4 h-4 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </Link>
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
