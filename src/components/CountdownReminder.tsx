import { useState, useEffect } from 'react'
import { parseDeliveryTime, getTimeRemaining, formatTimeRemaining, shouldShowReminder } from '../utils/timeUtils'

interface CountdownReminderProps {
  deliveryTime: string
}

const CountdownReminder = ({ deliveryTime }: CountdownReminderProps) => {
  const [timeRemaining, setTimeRemaining] = useState<ReturnType<typeof getTimeRemaining> | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const updateCountdown = () => {
      const targetTime = parseDeliveryTime(deliveryTime)
      if (targetTime) {
        const remaining = getTimeRemaining(targetTime)
        setTimeRemaining(remaining)
      }
    }

    // 立即更新一次
    updateCountdown()

    // 每分鐘更新一次
    const interval = setInterval(updateCountdown, 60000)

    return () => clearInterval(interval)
  }, [deliveryTime])

  if (!timeRemaining) {
    return null
  }

  const showReminder = shouldShowReminder(timeRemaining)
  const timeText = formatTimeRemaining(timeRemaining)

  if (!isVisible) {
    return null
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* 倒數計時顯示 */}
      <div style={{
        backgroundColor: timeRemaining.isExpired ? '#ff6b6b' : showReminder ? '#ffa726' : '#4ecdc4',
        color: 'white',
        padding: '16px',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: showReminder ? '15px' : '0',
        fontSize: '18px',
        fontWeight: '600',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>
          {timeRemaining.isExpired ? '⏰' : showReminder ? '⚠️' : '⏳'}
        </div>
        <div>
          {timeRemaining.isExpired ? '領貨時間已過' : `距離領貨時間還有 ${timeText}`}
        </div>
      </div>

      {/* 一小時前提醒 */}
      {showReminder && (
        <div style={{
          backgroundColor: '#fff3cd',
          color: '#856404',
          padding: '16px',
          borderRadius: '12px',
          border: '2px solid #ffeaa7',
          textAlign: 'center',
          fontSize: '16px',
          fontWeight: '600',
          position: 'relative',
          animation: 'pulse 2s infinite'
        }}>
          <div style={{ fontSize: '20px', marginBottom: '8px' }}>🔔</div>
          <div>請提醒團友領貨！</div>
          <div style={{ 
            fontSize: '14px', 
            marginTop: '8px',
            opacity: 0.8
          }}>
            領貨時間即將開始
          </div>
          
          {/* 關閉按鈕 */}
          <button
            onClick={() => setIsVisible(false)}
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'none',
              border: 'none',
              color: '#856404',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              lineHeight: 1
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(133, 100, 4, 0.1)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

export default CountdownReminder










