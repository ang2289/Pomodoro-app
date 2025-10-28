import { useEffect } from 'react'
import { useUserStore } from '../store/userStore'

// 擴展 Window 介面以包含 adsbygoogle
declare global {
  interface Window {
    adsbygoogle?: any[]
  }
}

interface GoogleAdBannerProps {
  adClient?: string
  adSlot?: string
  showOnlyOnDesktop?: boolean
}

export default function GoogleAdBanner({ 
  adClient = "ca-pub-3940256099942544",
  adSlot = "1234567890",
  showOnlyOnDesktop = false
}: GoogleAdBannerProps) {
  const { isWebSubscribed } = useUserStore()

  useEffect(() => {
    // 如果已訂閱，不顯示廣告
    if (isWebSubscribed) {
      return
    }

    // 初始化 AdSense
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({})
      }
    } catch (e) {
      console.error('AdSense error:', e)
    }
  }, [isWebSubscribed])

  // 如果已訂閱，不渲染廣告
  if (isWebSubscribed) {
    return null
  }

  return (
    <div className={`w-full flex justify-center my-4 bg-gray-100 py-4 ${showOnlyOnDesktop ? 'hidden md:flex' : ''}`} style={{ minHeight: '90px' }}>
      <ins className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '90px' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    </div>
  )
}
