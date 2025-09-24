import React from 'react';

interface CircularTimerProps {
  timeLeft: number;
  totalSeconds: number;
  timerColor: string;
  isRunning: boolean;
  isBreak: boolean;
}

const CircularTimer: React.FC<CircularTimerProps> = ({
  timeLeft,
  totalSeconds,
  timerColor,
  isRunning,
  isBreak
}) => {
  const getProgressPercentage = () => {
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = getProgressPercentage();
  // 與實際 circle 的 r 一致，避免進度起點/長度錯位
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      width: '240px',
      height: '240px',
      margin: '0 auto'
    }}>
      <svg
        width="240"
        height="240"
        style={{
          // 使進度條從 12 點鐘方向開始
          transform: 'rotate(-90deg)',
          width: '240px',
          height: '240px'
        }}
      >
        {/* 背景圓環 */}
        <circle
          stroke="#e5e7eb"
          fill="transparent"
          strokeWidth="10"
          r={95}
          cx="120"
          cy="120"
          style={{
            opacity: 0.3
          }}
        />
        {/* 進度圓環 - 只有在計時器運行時才顯示顏色 */}
        <circle
          stroke={isRunning ? timerColor : '#e5e7eb'}
          fill="transparent"
          strokeWidth="10"
          r={95}
          cx="120"
          cy="120"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease-in-out',
            opacity: isRunning ? 0.8 : 0.3
          }}
        />
      </svg>
      
      {/* 中央時間顯示 */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: '#213547',
        fontSize: '3rem',
        fontWeight: 'bold',
        fontFamily: 'monospace',
        whiteSpace: 'nowrap',
        lineHeight: 1
      }} className="dark:text-gray-100">
        {formatTime(timeLeft)}
      </div>
      
      {/* 狀態指示器 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '1rem',
        fontWeight: '600',
        color: isBreak ? '#ff6b6b' : '#4ecdc4',
        textAlign: 'center'
      }} className="dark:text-gray-200">
        {isBreak ? '休息時間' : '工作時間'}
        {isRunning && (
          <div style={{
            fontSize: '0.8rem',
            color: '#213547',
            marginTop: '4px'
          }} className="dark:text-gray-400">
            ● 進行中
          </div>
        )}
      </div>
    </div>
  );
};

export default CircularTimer;
