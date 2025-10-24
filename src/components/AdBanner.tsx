import { AdMob, BannerAdOptions, BannerAdPosition } from '@capacitor-community/admob'
import { useEffect } from 'react'
import { Preferences } from '@capacitor/preferences'

export default function AdBanner() {
  useEffect(() => {
    const showAd = async () => {
      try {
        const { value } = await Preferences.get({ key: 'isSubscribed' })
        console.log('訂閱狀態:', value)
        
        if (value === 'true') {
          // 已訂閱，隱藏廣告
          try {
            await AdMob.hideBanner()
            console.log('廣告已隱藏（訂閱用戶）')
          } catch (hideError) {
            console.warn('隱藏廣告失敗:', hideError)
          }
          return
        }
        
        // 未訂閱，顯示廣告
        try {
          // 先嘗試隱藏可能存在的廣告，避免重複顯示
          await AdMob.hideBanner().catch(() => {})
          
          await AdMob.initialize()
          await AdMob.showBanner({
            adId: 'ca-app-pub-3940256099942544/6300978111', // 測試 ID，記得換正式 ID
            position: BannerAdPosition.BOTTOM_CENTER,
            isTesting: true
          })
          console.log('廣告已顯示（免費用戶）')
        } catch (adError) {
          console.warn('顯示廣告失敗:', adError)
        }
      } catch (error) {
        console.warn('AdMob error:', error)
      }
    }
    
    showAd()
    
    // 監聽訂閱狀態變化
    const subscriptionListener = async (event: CustomEvent) => {
      if (event.detail?.key === 'isSubscribed') {
        console.log('訂閱狀態變化:', event.detail.value)
        showAd()
      }
    }
    
    // 添加自定義事件監聽器
    window.addEventListener('preferenceChange', subscriptionListener as EventListener)
    
    // 組件卸載時清理
    return () => {
      window.removeEventListener('preferenceChange', subscriptionListener as EventListener)
      AdMob.hideBanner().catch(err => console.warn('卸載時隱藏廣告失敗:', err))
    }
  }, [])

  return null
}
