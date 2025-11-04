import React from 'react';
import { useTranslation } from 'react-i18next';
import CircularTimer from '../../../components/Pomodoro/CircularTimer';

interface TimerPanelProps {
  timeLeft: number;
  isRunning: boolean;
  isBreak: boolean;
  timerColor: string;
  workMinutes: number;
  breakMinutes: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onTimeInput: (seconds: number) => void;
}

const TimerPanel: React.FC<TimerPanelProps> = ({
  timeLeft,
  isRunning,
  isBreak,
  timerColor,
  workMinutes,
  breakMinutes,
  onStart,
  onPause,
  onReset,
  onSkip,
  onTimeInput
}) => {
  const { t } = useTranslation();

  const togglePause = () => {
    if (isRunning) {
      onPause();
    } else {
      onStart();
    }
  };

  return (
    <div className="card rounded-xl shadow-md p-4 sm:p-6" style={{ color: '#213547', position: 'relative', pointerEvents: 'auto' }}>
      <div style={{ position: 'relative' }}>
        <CircularTimer
          timeLeft={timeLeft}
          totalSeconds={isBreak ? breakMinutes * 60 : workMinutes * 60}
          timerColor={timerColor}
          isRunning={isRunning}
          isBreak={isBreak}
          className=""
          onTimeChange={onTimeInput}
        />
      </div>
      
      {/* 快捷按鈕列 */}
      <div className="quick-buttons">
        <button onClick={onReset} title={t('reset')}>🔁</button>
        <button onClick={togglePause} title={isRunning ? t('pause') : t('play')}>
          {isRunning ? "⏸️" : "▶️"}
        </button>
        <button onClick={onSkip} title={t('stop_early')}>⏩</button>
      </div>
    </div>
  );
};

export default TimerPanel;


