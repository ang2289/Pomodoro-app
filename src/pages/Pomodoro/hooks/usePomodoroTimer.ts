import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { getNotificationSettings } from '../../../utils/notificationUtils';

interface UsePomodoroTimerProps {
  workMinutes: number;
  breakMinutes: number;
  onWorkSessionComplete?: () => void;
  onBreakSessionComplete?: () => void;
}

export const usePomodoroTimer = ({
  workMinutes,
  breakMinutes,
  onWorkSessionComplete,
  onBreakSessionComplete
}: UsePomodoroTimerProps) => {
  const { t } = useTranslation();
  
  // Wake Lock 變數
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = useCallback(async () => {
    try {
      wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      console.log('🟢 螢幕已鎖定避免休眠');
    } catch (err) {
      console.warn('⚠️ 瀏覽器不支援 Wake Lock', err);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('🔓 已釋放螢幕鎖定');
      }
    } catch (err) {
      console.warn('⚠️ 無法釋放 Wake Lock', err);
    }
  }, []);

  // 計時器狀態
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  // 當工作時間設定改變時，更新計時器（僅在非運行狀態且非休息狀態）
  useEffect(() => {
    if (!isRunning && !isBreak) {
      const newTimeLeft = workMinutes * 60;
      setTimeLeft(newTimeLeft);
      // 儲存到 localStorage
      localStorage.setItem('pomodoroWorkMinutes', workMinutes.toString());
    }
  }, [workMinutes, isRunning, isBreak]);

  // 播放音效和發送通知
  const playNotificationSound = useCallback((type: 'work' | 'break') => {
    const settings = getNotificationSettings();
    
    // 檢查是否啟用通知
    if (!settings.enabled) return;
    
    // 檢查特定類型的通知設定
    if (type === 'work' && !settings.workNotification) return;
    if (type === 'break' && !settings.breakNotification) return;
    
    // 播放音效
    try {
      const audio = new Audio(`/sounds/${settings.sound}`);
      audio.volume = 0.8; // 設定音量
      audio.play().catch(err => {
        console.error('播放音效失敗:', err);
      });
    } catch (error) {
      console.error('音效播放錯誤:', error);
    }
    
    // 發送瀏覽器通知
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = type === 'work' ? t('work_session_end') : t('break_time_end');
      const body = type === 'work' ? t('work_completed_message') : t('break_end_message');
      
      try {
        new Notification(title, {
          body: body,
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      } catch (error) {
        console.error('發送通知失敗:', error);
      }
    }
  }, [t]);

  // 計時器邏輯
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // 時間到，切換到休息或工作時間
      if (isBreak) {
        // 休息結束，回到工作時間
        setIsBreak(false);
        setTimeLeft(workMinutes * 60);
        setIsRunning(false);
        // 播放休息結束通知
        playNotificationSound('break');
        // 關閉防止螢幕休眠
        releaseWakeLock();
        // 觸發回調
        onBreakSessionComplete?.();
      } else {
        // 工作結束，開始休息
        // 播放工作結束通知
        playNotificationSound('work');
        
        if (breakMinutes <= 0) {
          // 無休息：直接重置到下一輪工作並停下等待使用者開始
          setIsBreak(false);
          setTimeLeft(workMinutes * 60);
          setIsRunning(false);
          // 關閉防止螢幕休眠
          releaseWakeLock();
        } else {
          setIsBreak(true);
          setTimeLeft(breakMinutes * 60);
          // 自動開始休息計時
          setIsRunning(true);
          // 繼續保持防止螢幕休眠狀態
        }
        
        // 觸發回調
        onWorkSessionComplete?.();
      }
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, workMinutes, breakMinutes, onWorkSessionComplete, onBreakSessionComplete, playNotificationSound, releaseWakeLock]);

  // 計時器控制函數
  const startTimer = async () => {
    setIsRunning(true);
    // 啟用防止螢幕休眠
    await requestWakeLock();
  };

  const pauseTimer = async () => {
    setIsRunning(false);
    // 關閉防止螢幕休眠
    await releaseWakeLock();
  };

  const resetTimer = async () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
    // 關閉防止螢幕休眠
    await releaseWakeLock();
  };

  // 切換播放/暫停
  const togglePause = async () => {
    if (isRunning) {
      await pauseTimer();
    } else {
      await startTimer();
    }
  };

  // 提早結束當前階段
  const skipCurrentPhase = async () => {
    // 顯示確認彈窗
    if (!confirm(t('stop_early') + "?")) {
      return; // 使用者取消，不執行任何操作
    }
    
    // 1. 停止當前計時器（setInterval 會透過 useEffect 的清理函數自動清除）
    setIsRunning(false);
    
    // 2. 切換工作/休息階段
    setIsBreak(!isBreak);
    
    // 3. 根據當前狀態設定下個階段的預設時間
    if (isBreak) {
      // 如果現在是休息，切換到工作時間
      setTimeLeft(workMinutes * 60);
    } else {
      // 如果現在是工作，切換到休息時間
      setTimeLeft(breakMinutes * 60);
    }
    
    // 4. 確保不會自動繼續倒數
    setIsRunning(false);
    
    // 5. 關閉防止螢幕休眠
    await releaseWakeLock();
  };

  // 提早結束當前階段
  const endSession = async () => {
    await skipCurrentPhase();
  };

  // 處理時間輸入（由 TimerPanel 傳入的 onTimeChange 處理）
  const handleTimeInput = (seconds: number) => {
    setTimeLeft(seconds);
    // 自動啟動計時器
    if (!isRunning) {
      startTimer();
    }
  };

  // 組件卸載時釋放防止螢幕休眠
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, []);

  return {
    timeLeft,
    isRunning,
    isBreak,
    startTimer,
    pauseTimer,
    resetTimer,
    togglePause,
    endSession,
    handleTimeInput,
    setTimeLeft
  };
};

