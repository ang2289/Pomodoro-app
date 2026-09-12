import React, { useEffect, useState } from 'react'

// 擴展 Window 介面
declare global {
  interface Window {
    adsbygoogle?: any[]
  }
}

export default function WebAdBanner() {
  const [isSubscribed, setIsSubscribed] = useState(false)

  // 請在 AdSense 後台建立廣告單元後，將此替換為真實的廣告單元 ID
  const adSlot = "1234567890"

  useEffect(() => {
    // 檢查訂閱狀態
    const stored = localStorage.getItem('rxv_isSubscribed')
    if (stored === 'true') {
      setIsSubscribed(true)
      return // 已訂閱，不顯示廣告
    }
    
    // 初始化 AdSense
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch (e) {
      console.error('AdSense error:', e)
    }
  }, [])

  // 如果已訂閱，不顯示廣告
  if (isSubscribed) {
    return null
  }

  return (
    <div className="rxv-ad-banner w-full flex justify-center py-4" style={{ minHeight: '100px' }}>
      <div className="w-full max-w-screen-md mx-auto px-4">
        <ins
          className="adsbygoogle block w-full"
          style={{ display: 'block', width: '100%', minHeight: '100px' }}
          data-ad-client="ca-pub-4098050974072911"
          data-ad-slot={adSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  )
}
