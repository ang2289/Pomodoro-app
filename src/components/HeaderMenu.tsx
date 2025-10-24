import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const menuItems = [
  { path: '/chant', label: '唸經' },
  { path: '/todo', label: '待辦' },
  { path: 'pomodoro', label: '專注' },
  { path: '/wish', label: '發起集氣' }
]

export default function HeaderMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname

  const getCurrentPageLabel = () => {
    const currentItem = menuItems.find(item => 
      item.path === currentPath || 
      (item.path === '/chant' && currentPath === '/')
    )
    return currentItem ? currentItem.label : '選單'
  }

  const getCurrentPageIcon = () => {
    return '☰'
  }

  return (
    <div className="relative">
      {/* 選單按鈕 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white shadow-lg rounded-lg px-4 py-2 border border-gray-200 hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{getCurrentPageIcon()}</span>
        <span className="text-base font-medium text-gray-700">{getCurrentPageLabel()}</span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
                              (item.path === '/chant' && currentPath === '/')
              
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
                  <span>{item.label}</span>
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
