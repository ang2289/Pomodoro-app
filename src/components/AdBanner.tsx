import { useState, useEffect } from 'react'

const AdBanner = () => {
  const [isAdFree, setIsAdFree] = useState(false)

  // 載入時檢查 localStorage 中的訂閱狀態
  useEffect(() => {
    const adFreeStatus = localStorage.getItem('isAdFree')
    setIsAdFree(adFreeStatus === 'true')
  }, [])

  // 如果已訂閱，不顯示廣告
  if (isAdFree) {
    return null
  }

  return (
    <div className="ad-banner">
      📱 廣告區域 - 這裡將顯示廣告內容
    </div>
  )
}

export default AdBanner

