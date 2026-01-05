import { useEffect, useState } from 'react'

export default function PromoCountdown() {
  const [remaining, setRemaining] = useState('')

  useEffect(() => {
    const updateCountdown = () => {
      const end = new Date('2026-01-10T23:59:59+08:00').getTime() // 台灣時間
      const now = Date.now()
      const diff = end - now

      if (diff <= 0) {
        setRemaining('活動已結束')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)
      
      if (days > 0) {
        setRemaining(`剩下 ${days} 天 ${hours} 小時 ${minutes} 分鐘`)
      } else if (hours > 0) {
        setRemaining(`剩下 ${hours} 小時 ${minutes} 分鐘 ${seconds} 秒`)
      } else if (minutes > 0) {
        setRemaining(`剩下 ${minutes} 分鐘 ${seconds} 秒`)
      } else {
        setRemaining(`剩下 ${seconds} 秒`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  // 檢查活動是否已結束
  const end = new Date('2026-01-10T23:59:59+08:00').getTime()
  const now = Date.now()
  if (now > end) {
    return null // 活動結束後不顯示
  }

  // 檢查活動是否已開始
  const start = new Date('2026-01-06T00:00:00+08:00').getTime()
  if (now < start) {
    return null // 活動開始前不顯示
  }

  return (
    <div className="bg-red-100 border border-red-300 text-red-800 p-3 text-sm rounded text-center mb-4">
      🎉 限時活動進行中：購買任一方案加贈 10% 點數！
      <br />
      ⏳ {remaining}
    </div>
  )
}
