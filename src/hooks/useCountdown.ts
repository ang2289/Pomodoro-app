import { useEffect, useState } from 'react'

export default function useCountdown(endTime: number) {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const diff = Math.max(0, endTime - now)
  const expired = diff <= 0

  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff / 3600000) % 24)
  const minutes = Math.floor((diff / 60000) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  const isLastDay = !expired && diff <= 24 * 60 * 60 * 1000

  return { days, hours, minutes, seconds, expired, isLastDay }
}
