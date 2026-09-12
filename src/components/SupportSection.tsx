import { useState } from 'react'
import SupportButton from './SupportButton'

interface Props {
  supportCount: number
  supported: boolean
  onSupport: () => Promise<void>
  commentCount: number
}

export default function SupportSection({ supportCount, supported, onSupport, commentCount }: Props) {
  console.log('SupportSection rendered with count:', supportCount, 'comments:', commentCount)
  
  // 愛心點擊動畫狀態
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 處理愛心點擊
  const handleHeartClick = async () => {
    if (supported || isAnimating) return; // 如果已經支持過或動畫正在進行中，不做任何事
    
    // 設置動畫狀態
    setIsAnimating(true);
    
    // 調用支持函數
    await onSupport();
    
    // 動畫結束後重置
    setTimeout(() => {
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex flex-col gap-3 text-sm text-gray-600 mb-3">
        <div>
          <button
            onClick={handleHeartClick}
            disabled={supported || isAnimating}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg 
              ${supported ? 'bg-gray-100' : 'bg-pink-50 hover:bg-pink-100 active:bg-pink-200'}
              transition-all duration-300 focus:outline-none`}
            style={{ border: 'none' }}
          >
            <div className="flex items-center justify-center gap-2">
              <span 
                className={`text-pink-500 text-3xl drop-shadow-md transition-transform duration-300
                  ${isAnimating ? 'animate-heartbeat scale-125' : 'hover:scale-110'}
                  ${supported ? 'opacity-80' : ''}`}
              >
                💖
              </span>
              <span className={`font-medium ${supported ? 'text-gray-500' : 'text-pink-600'}`}>
                愛心支持（{supportCount}）
              </span>
            </div>
          </button>
          
          {isAnimating && (
            <p className="text-center text-pink-600 text-sm font-medium mt-2 animate-fadeIn">
              感謝您的支持！
            </p>
          )}
          
          {supported && !isAnimating && (
            <p className="text-center text-pink-600 text-sm font-medium mt-2">
              感謝您的支持！
            </p>
          )}
          
          {!supported && !isAnimating && (
            <p className="text-center text-gray-500 text-sm mt-2">
              點擊愛心來支持
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1 mt-2">
          <span className="text-purple-500 text-lg">💬</span>
          <span>留言 {commentCount} 則</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center">每人對每個活動僅能按一次支持</p>
    </div>
  )
}


