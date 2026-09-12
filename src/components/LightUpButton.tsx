import { useState } from 'react'
import clsx from 'clsx'

interface LightUpButtonProps {
  onLight?: (userName: string) => void
  disabled?: boolean
  lightCount?: number
}

export default function LightUpButton({ onLight, disabled = false, lightCount = 0 }: LightUpButtonProps) {
  const [isClicked, setIsClicked] = useState(false)

  const handleClick = () => {
    if (disabled) return
    
    setIsClicked(true)
    setTimeout(() => setIsClicked(false), 800)
    
    // 執行點燈邏輯
    if (onLight) {
      const nameToSave = '匿名善信' // 使用預設名字
      onLight(nameToSave)
    }
  }


  return (
    <div className="flex flex-col items-center gap-6 mt-8">
      <button
        onClick={handleClick}
        disabled={disabled}
        className={clsx(
          'transition-all duration-500 ease-out relative pt-4 pb-12 px-8 no-focus-outline',
          isClicked ? 'scale-125' : 'scale-100',
          disabled ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110 cursor-pointer',
          'rounded-full'
        )}
        aria-label="點燈"
        style={{ 
          outline: 'none', 
          border: 'none',
          background: 'transparent',
          boxShadow: 'none'
        }}
        onFocus={(e) => {
          e.target.style.outline = 'none'
          e.target.style.boxShadow = 'none'
          e.target.style.border = 'none'
        }}
        onBlur={(e) => {
          e.target.style.outline = 'none'
          e.target.style.boxShadow = 'none'
          e.target.style.border = 'none'
        }}
      >
        {/* 蓮花圖案 🪷 */}
        <div className="relative">
          {/* 背景光暈 - 持續脈動 */}
          <div 
            className={clsx(
              'absolute inset-0 rounded-full blur-xl transition-all duration-700',
              isClicked 
                ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-yellow-400 opacity-90 scale-200 animate-spin' 
                : disabled 
                  ? 'bg-pink-300 opacity-30 scale-100'
                  : 'bg-pink-400 opacity-40 scale-100 animate-pulse'
            )}
            style={{ width: '214px', height: '214px' }}
          />
          
          {/* 蓮花主體 */}
          <div
            className={clsx(
              'relative flex items-center justify-center transition-all duration-500',
              isClicked && 'animate-bounce drop-shadow-[0_0_20px_rgba(236,72,153,0.9)]',
              !disabled && !isClicked && 'drop-shadow-[0_0_10px_rgba(236,72,153,0.5)]'
            )}
            style={{ 
              width: '171px', 
              height: '171px', 
              minWidth: '171px', 
              minHeight: '171px',
              filter: isClicked ? 'brightness(2) saturate(2) contrast(1.2) hue-rotate(20deg) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))' : 'brightness(1)',
              transform: isClicked ? 'rotate(360deg) scale(1.1)' : 'rotate(0deg) scale(1)',
              transition: 'all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            }}
          >
            <img 
              src="/assets/lotus-new.png" 
              alt="蓮花點燈圖"
              className="mx-auto drop-shadow-lg rounded-full"
              style={{ 
                width: '171px', 
                height: '171px', 
                maxWidth: '171px',
                minWidth: '171px',
                minHeight: '171px'
              }}
            />
          </div>

          {/* 點擊時的火焰效果 */}
          {isClicked && (
            <>
              {/* 中心光芒 */}
              <div className="center-glow" />
              
              {/* 粒子效果 */}
              <div className="particle-effect">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="particle"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
              
              {/* 漣漪效果 */}
              <div className="ripple-effect ripple-1" />
              <div className="ripple-effect ripple-2" />
            </>
          )}
        </div>
      </button>
      
      
      {/* 點燈數量顯示 */}
      <div className="flex items-center gap-1 text-yellow-600 font-medium mt-6">
        <span>🪔</span>
        <span className="text-sm">{lightCount} 盞</span>
      </div>
      
      
      {/* 已點燈提示 */}
      {disabled && (
        <p className="text-xs text-gray-500 mt-2">已點燈</p>
      )}
    </div>
  )
}

