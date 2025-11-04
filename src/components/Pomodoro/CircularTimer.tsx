import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface CircularTimerProps {
  timeLeft: number;
  totalSeconds: number;
  timerColor: string;
  isRunning: boolean;
  isBreak: boolean;
  className?: string;
  onTimeChange?: (seconds: number) => void;
}

const CircularTimer: React.FC<CircularTimerProps> = ({
  timeLeft,
  totalSeconds,
  timerColor,
  isRunning,
  isBreak: _isBreak,
  className,
  onTimeChange
}) => {
  const { t } = useTranslation();
  
  const getProgressPercentage = () => {
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(formatTime(timeLeft));

  // 當 timeLeft 改變時更新 inputValue（但只在非編輯狀態）
  useEffect(() => {
    if (!isEditing) {
      setInputValue(formatTime(timeLeft));
    }
  }, [timeLeft, isEditing]);

  const progress = getProgressPercentage();
  const radius = 95;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  function handleConfirm(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const [m, s] = inputValue.split(':').map(Number);
    const newSeconds = m * 60 + (s || 0);
    onTimeChange?.(newSeconds);
    setIsEditing(false);
  }

  return (
    <div className="timer-wrapper">
      <div className={`timer-circle ${className || ''}`} style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        margin: '0 auto'
      }}>
        <svg
          width="240"
          height="240"
          style={{
            transform: 'rotate(-90deg)',
            width: '240px',
            height: '240px',
            pointerEvents: 'none'
          }}
        >
          {/* 背景圓環 */}
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth="10"
            r={radius}
            cx="120"
            cy="120"
            style={{
              opacity: 0.3
            }}
          />
          {/* 進度圓環 */}
          <circle
            stroke={isRunning ? timerColor : '#e5e7eb'}
            fill="transparent"
            strokeWidth="10"
            r={radius}
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

        {/* 中央時間顯示或輸入框 */}
        <div className="relative flex flex-col items-center justify-center">
          {isEditing ? (
            <form onSubmit={handleConfirm} className="flex flex-col items-center">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="text-4xl font-bold text-blue-600 text-center bg-transparent border-none outline-none"
                autoFocus
              />
              <button type="submit" className="mt-2 px-3 py-1 bg-blue-500 text-white rounded-md">
                {t('save')}
              </button>
            </form>
          ) : (
            <button
              type="button"
              className="text-4xl font-bold text-blue-600"
              onClick={() => !isRunning && setIsEditing(true)}
            >
              {formatTime(timeLeft)}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CircularTimer;