import { useEffect, useState } from 'react'

export default function PayPalSubscribeButton() {
  const [isSubscribed, setIsSubscribed] = useState(false)

  useEffect(() => {
    // 初始化檢查訂閱狀態
    const stored = localStorage.getItem('rxv_isSubscribed')
    if (stored === 'true') {
      setIsSubscribed(true)
      hideAds()
    } else {
      showAds()
    }

    // 載入 PayPal SDK
    const script = document.createElement('script')
    script.src =
      'https://www.paypal.com/sdk/js?client-id=AQrZKPX7xVGiFtlQrh0uaVHN4OAe5fuRlUdlwXarVkhiN27VViC_69Mv3M1s4PFqO2SzRQcvhx7Zz5hH&vault=true&intent=subscription'
    script.setAttribute('data-sdk-integration-source', 'button-factory')
    script.onload = () => {
      // @ts-ignore
      if (window.paypal) {
        // @ts-ignore
        window.paypal
          .Buttons({
            style: {
              shape: 'rect',
              color: 'gold',
              layout: 'horizontal',
              label: 'subscribe'
            },
            createSubscription: function (data: any, actions: any) {
              return actions.subscription.create({
                plan_id: 'P-1AE690984Y433821JND7PI6Q'
              })
            },
            onApprove: function (data: any) {
              alert('✅ 訂閱成功！訂閱編號：' + data.subscriptionID)
              localStorage.setItem('rxv_isSubscribed', 'true')
              setIsSubscribed(true)
              hideAds()
            }
          })
          .render('#paypal-button-container-P-1AE690984Y433821JND7PI6Q')
      }
    }
    document.body.appendChild(script)
  }, [])

  // 隱藏廣告
  const hideAds = () => {
    const adBanners = document.querySelectorAll('.rxv-ad-banner')
    adBanners.forEach((el) => ((el as HTMLElement).style.display = 'none'))
  }

  // 顯示廣告
  const showAds = () => {
    const adBanners = document.querySelectorAll('.rxv-ad-banner')
    adBanners.forEach((el) => ((el as HTMLElement).style.display = 'block'))
  }

  // 取消訂閱
  const cancelSubscription = () => {
    const confirmCancel = window.confirm('確定要取消訂閱並恢復顯示廣告嗎？')
    if (confirmCancel) {
      localStorage.setItem('rxv_isSubscribed', 'false')
      setIsSubscribed(false)
      showAds()
      alert('❌ 訂閱已取消，廣告已恢復顯示。')
    }
  }

  return (
    <div className="text-center p-4">
      {isSubscribed ? (
        <>
          <p className="text-green-600 font-bold text-lg mb-2">
            ✅ 目前已訂閱（廣告已關閉）
          </p>
          <button
            onClick={cancelSubscription}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            取消訂閱
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-700 font-semibold mb-3">
            去廣告月訂閱方案（NT$49 / 月）
          </p>
          <div
            id="paypal-button-container-P-1AE690984Y433821JND7PI6Q"
            className="flex flex-wrap justify-center gap-4 p-2"
            style={{
              rowGap: '12px',
              columnGap: '16px',
              flexDirection: 'row'
            }}
          ></div>
        </>
      )}
    </div>
  )
}
