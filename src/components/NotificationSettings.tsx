
import { useState } from 'react';
import IconButton from './ui/IconButton';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  NotificationSettings as NotificationSettingsType 
} from '../utils/notificationUtils';
import { notificationService } from '../services/notificationService';
import { useTranslation } from 'react-i18next';

// 可用的音效選項
const soundOptions = [
  { value: 'bell.mp3', labelKey: 'sound_1' },
  { value: 'ding.mp3', labelKey: 'sound_2' },
  { value: 'tick.mp3', labelKey: 'sound_3' },
  { value: 'wood.mp3', labelKey: 'sound_4' }
];

export default function NotificationSettings() {
  const { t } = useTranslation();
  // 使用統一的通知設定狀態
  const [settings, setSettings] = useState<NotificationSettingsType>(getNotificationSettings());
  const [showSaved, setShowSaved] = useState(false);

  // 處理設定變更
  const handleSettingChange = (key: keyof NotificationSettingsType, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // 儲存設定並顯示成功訊息
    const success = saveNotificationSettings(newSettings);
    if (success) {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  // 請求通知權限
  const requestNotificationPermission = async () => {
    if (notificationService.isNativePlatform()) {
      // 原生平台
      try {
        const hasPermission = await notificationService.initialize();
        if (hasPermission) {
          alert(t('native_notification_granted'));
          handleSettingChange('enabled', true);
        } else {
          alert(t('native_notification_denied'));
          handleSettingChange('enabled', false);
        }
      } catch (error) {
        console.error('請求原生通知權限失敗:', error);
        alert(t('native_notification_error'));
        handleSettingChange('enabled', false);
      }
    } else {
      // 瀏覽器環境
      if (!notificationService.isNotificationSupported()) {
        alert(t('browser_notification_unsupported'));
        handleSettingChange('enabled', false);
        return;
      }

      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          alert(t('browser_notification_granted'));
          handleSettingChange('enabled', true);
        } else {
          alert(t('notification_permission_required'));
          handleSettingChange('enabled', false);
        }
      } catch (error) {
        console.error('請求瀏覽器通知權限失敗:', error);
        alert(t('browser_notification_error'));
        handleSettingChange('enabled', false);
      }
    }
  };

  return (
    <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
      <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6">🔔 {t('notification_settings')}</h2>

      {/* 啟用通知 */}
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <label htmlFor="enableNotify" className="text-base sm:text-lg font-medium text-gray-700 flex-1 mr-3">{t('enable_notifications')}</label>
        <input
          id="enableNotify"
          type="checkbox"
          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
          checked={settings.enabled}
          onChange={() => {
            if (!settings.enabled) {
              requestNotificationPermission();
            } else {
              handleSettingChange('enabled', false);
            }
          }}
        />
      </div>

      {/* 音效選擇 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-5 gap-2 sm:gap-0">
        <label htmlFor="soundSelect" className="text-base sm:text-lg font-medium text-gray-700">{t('notification_sound')}</label>
        <select
          id="soundSelect"
          className="border rounded-lg px-3 py-2 bg-white text-base sm:text-lg min-w-[120px] sm:min-w-[140px]"
          value={settings.sound}
          onChange={(e) => handleSettingChange('sound', e.target.value)}
          disabled={!settings.enabled}
        >
          {soundOptions.map((sound) => (
            <option key={sound.value} value={sound.value}>
              {t(sound.labelKey)}
            </option>
          ))}
        </select>
      </div>

      {/* 工作時段結束通知 */}
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <label htmlFor="workNotify" className="text-base sm:text-lg font-medium text-gray-700 flex-1 mr-3">{t('work_end_notification')}</label>
        <input
          id="workNotify"
          type="checkbox"
          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
          checked={settings.workNotification}
          onChange={() => handleSettingChange('workNotification', !settings.workNotification)}
          disabled={!settings.enabled}
        />
      </div>

      {/* 休息時段結束通知 */}
      <div className="flex justify-between items-center mb-4 sm:mb-5">
        <label htmlFor="breakNotify" className="text-base sm:text-lg font-medium text-gray-700 flex-1 mr-3">{t('break_end_notification')}</label>
        <input
          id="breakNotify"
          type="checkbox"
          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
          checked={settings.breakNotification}
          onChange={() => handleSettingChange('breakNotification', !settings.breakNotification)}
          disabled={!settings.enabled}
        />
      </div>

      {/* 自動進入下一回合 */}
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <label htmlFor="autoNextRound" className="text-base sm:text-lg font-medium text-gray-700 flex-1 mr-3">{t('auto_next_round')}</label>
        <input
          id="autoNextRound"
          type="checkbox"
          className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
          checked={settings.autoNextRound}
          onChange={() => handleSettingChange('autoNextRound', !settings.autoNextRound)}
        />
      </div>

      {/* 測試通知按鈕 */}
      <div className="mt-6 sm:mt-8">
        <IconButton
          label={t('test_notification')}
          variant="secondary"
          onClick={async () => {
            if (settings.enabled) {
              if (notificationService.isNativePlatform()) {
                // 原生平台測試
                if (notificationService.hasNotificationPermission()) {
                  await notificationService.showNotification({ title: t('test_notification'), body: t('native_notification_ok') });
                  
                  // 播放選擇的音效
                  const audio = new Audio(`/sounds/${settings.sound}`);
                  audio.play().catch(err => console.error('播放音效失敗:', err));
                } else {
                  alert(t('please_grant_native_permission'));
                  requestNotificationPermission();
                }
              } else {
                // 瀏覽器環境測試
                if (Notification.permission === 'granted') {
                  new Notification(t('test_notification'), { body: t('browser_notification_ok') });
                  
                  // 播放選擇的音效
                  const audio = new Audio(`/sounds/${settings.sound}`);
                  audio.play().catch(err => console.error('播放音效失敗:', err));
                } else {
                  alert(t('please_grant_browser_permission'));
                  requestNotificationPermission();
                }
              }
            } else {
              alert(t('please_enable_notifications'));
            }
          }}
          fullWidth
        />
      </div>

      {/* 儲存成功提示 */}
      {showSaved && (
        <div className="absolute top-2 right-2 bg-green-100 text-green-700 px-3 py-1 rounded shadow-sm">
          ✅ {t('saved')}
        </div>
      )}
    </div>
  );
}
