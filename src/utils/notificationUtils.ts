// 定義通知設定的介面
export interface NotificationSettings {
  enabled: boolean;
  sound: string;
  workNotification?: boolean;
  breakNotification?: boolean;
  autoNextRound?: boolean;
}

// 預設通知設定
export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  sound: 'ding.mp3',
  workNotification: true,
  breakNotification: true,
  autoNextRound: false
};

// 獲取通知設定，如果不存在則返回預設值
export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem('notification-settings');
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;
    
    const parsed = JSON.parse(raw);
    // 合併儲存的設定與預設設定，確保所有必要屬性都存在
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...parsed };
  } catch (error) {
    console.error('讀取通知設定失敗:', error);
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

// 儲存通知設定
export function saveNotificationSettings(settings: Partial<NotificationSettings>) {
  try {
    // 合併現有設定與新設定
    const currentSettings = getNotificationSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem('notification-settings', JSON.stringify(updatedSettings));
    
    // 如果設定了通知權限，檢查並請求權限
    if (settings.enabled === true && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().catch(err => 
          console.error('請求通知權限失敗:', err)
        );
      }
    }
    
    return true;
  } catch (error) {
    console.error('儲存通知設定失敗:', error);
    return false;
  }
}
