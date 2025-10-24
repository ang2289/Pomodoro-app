import { useState, useEffect, useCallback } from 'react';
import { getNotificationSettings } from '../utils/notificationUtils';
import { ErrorType, processError } from '../utils/errorHandler';

/**
 * 通知 Hook，用於顯示瀏覽器通知並播放聲音
 * @param defaultEnabled - 預設是否啟用通知
 * @param defaultSound - 預設音效檔案
 * @returns 通知相關方法和狀態
 */
export function useNotification(defaultEnabled = true, defaultSound = '/sounds/ding.mp3') {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isEnabled, setIsEnabled] = useState<boolean>(defaultEnabled);
  const [soundFile, setSoundFile] = useState<string>(defaultSound);
  const [error, setError] = useState<string | null>(null);

  // 初始化 - 讀取設定和權限
  useEffect(() => {
    // 檢查通知 API 是否可用
    if (!('Notification' in window)) {
      setError('您的瀏覽器不支援通知功能');
      setIsEnabled(false);
      return;
    }

    // 設定當前權限狀態
    setPermission(Notification.permission);

    // 從設定中讀取通知偏好
    const settings = getNotificationSettings();
    setIsEnabled(settings.enabled);
    // 確保音效文件路徑正確（添加 /sounds/ 前綴）
    const soundFileName = settings.sound || defaultSound;
    const fullSoundPath = soundFileName.startsWith('/sounds/') ? soundFileName : `/sounds/${soundFileName}`;
    setSoundFile(fullSoundPath);
  }, [defaultEnabled, defaultSound]);

  // 請求通知權限
  const requestPermission = useCallback(async () => {
    try {
      if (!('Notification' in window)) {
        throw new Error('您的瀏覽器不支援通知功能');
      }

      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setIsEnabled(true);
        setError(null);
        return true;
      } else {
        setIsEnabled(false);
        setError('需要通知權限才能啟用此功能');
        return false;
      }
    } catch (err) {
      const errorMessage = processError(err, ErrorType.PERMISSION);
      setError(errorMessage);
      return false;
    }
  }, []);

  // 播放聲音
  const playSound = useCallback(() => {
    try {
      if (!soundFile) {
        console.warn('沒有設定音效文件');
        return;
      }
      
      console.log('嘗試播放音效:', soundFile);
      const audio = new Audio(soundFile);
      
      // 設定音量和播放參數
      audio.volume = 0.8;
      audio.preload = 'auto';
      
      // 處理瀏覽器自動播放政策
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          console.log('音效播放成功:', soundFile);
        }).catch(err => {
          console.error('播放音效失敗 (可能是瀏覽器自動播放政策限制):', err, '音效文件:', soundFile);
          // 嘗試降低音量再播放一次
          audio.volume = 0.1;
          audio.play().catch(secondErr => {
            console.error('第二次播放音效也失敗:', secondErr);
          });
        });
      }
    } catch (err) {
      console.error('播放音效時發生錯誤:', err, '音效文件:', soundFile);
    }
  }, [soundFile]);

  // 顯示通知
  const notify = useCallback(
    async (title: string, body?: string, icon?: string) => {
      // 如果未啟用通知或沒有權限，則不顯示
      if (!isEnabled) return false;
      
      try {
        // 如果權限不是 granted，嘗試請求
        if (permission !== 'granted') {
          const granted = await requestPermission();
          if (!granted) return false;
        }

        // 顯示通知
        const notification = new Notification(title, {
          body,
          icon,
          silent: true // 使用自定義聲音，而非系統聲音
        });

        // 播放聲音
        playSound();

        // 點擊通知時的行為
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        return true;
      } catch (err) {
        const errorMessage = processError(err, ErrorType.PERMISSION);
        setError(errorMessage);
        return false;
      }
    },
    [isEnabled, permission, requestPermission, playSound]
  );

  return {
    isEnabled,
    permission,
    error,
    notify,
    requestPermission,
    playSound,
    soundFile
  };
}