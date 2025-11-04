import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import IconButton from './ui/IconButton';
import { getNotificationSettings, saveNotificationSettings } from '../utils/notificationUtils';
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
    const [settings, setSettings] = useState(getNotificationSettings());
    const [showSaved, setShowSaved] = useState(false);
    // 處理設定變更
    const handleSettingChange = (key, value) => {
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
                }
                else {
                    alert(t('native_notification_denied'));
                    handleSettingChange('enabled', false);
                }
            }
            catch (error) {
                console.error('請求原生通知權限失敗:', error);
                alert(t('native_notification_error'));
                handleSettingChange('enabled', false);
            }
        }
        else {
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
                }
                else {
                    alert(t('notification_permission_required'));
                    handleSettingChange('enabled', false);
                }
            }
            catch (error) {
                console.error('請求瀏覽器通知權限失敗:', error);
                alert(t('browser_notification_error'));
                handleSettingChange('enabled', false);
            }
        }
    };
    return (_jsxs("div", { className: "rounded-lg bg-white shadow-md p-6 w-full relative", children: [_jsx("h2", { className: "text-base font-medium text-gray-700 mb-4", children: `\uD83D\uDD14 ${t('notification_settings')}` }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("label", { htmlFor: "enableNotify", className: "text-base font-medium text-gray-700", children: t('enable_notifications') }), _jsx("input", { id: "enableNotify", type: "checkbox", className: "w-5 h-5", checked: settings.enabled, onChange: () => {
                            if (!settings.enabled) {
                                requestNotificationPermission();
                            }
                            else {
                                handleSettingChange('enabled', false);
                            }
                        } })] }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("label", { htmlFor: "soundSelect", className: "text-base font-medium text-gray-700", children: t('notification_sound') }), _jsx("select", { id: "soundSelect", className: "border rounded px-2 py-1 bg-white", value: settings.sound, onChange: (e) => handleSettingChange('sound', e.target.value), disabled: !settings.enabled, children: soundOptions.map((sound) => (_jsx("option", { value: sound.value, children: t(sound.labelKey) }, sound.value))) })] }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("label", { htmlFor: "workNotify", className: "text-base font-medium text-gray-700", children: t('work_end_notification') }), _jsx("input", { id: "workNotify", type: "checkbox", className: "w-5 h-5", checked: settings.workNotification, onChange: () => handleSettingChange('workNotification', !settings.workNotification), disabled: !settings.enabled })] }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("label", { htmlFor: "breakNotify", className: "text-base font-medium text-gray-700", children: t('break_end_notification') }), _jsx("input", { id: "breakNotify", type: "checkbox", className: "w-5 h-5", checked: settings.breakNotification, onChange: () => handleSettingChange('breakNotification', !settings.breakNotification), disabled: !settings.enabled })] }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("label", { htmlFor: "autoNextRound", className: "text-base font-medium text-gray-700", children: t('auto_next_round') }), _jsx("input", { id: "autoNextRound", type: "checkbox", className: "w-5 h-5", checked: settings.autoNextRound, onChange: () => handleSettingChange('autoNextRound', !settings.autoNextRound) })] }), _jsx("div", { className: "mt-6", children: _jsx(IconButton, { label: t('test_notification'), variant: "secondary", onClick: async () => {
                        if (settings.enabled) {
                            if (notificationService.isNativePlatform()) {
                                // 原生平台測試
                                if (notificationService.hasNotificationPermission()) {
                                    await notificationService.showNotification({ title: t('test_notification'), body: t('native_notification_ok') });
                                    // 播放選擇的音效
                                    const audio = new Audio(`/sounds/${settings.sound}`);
                                    audio.play().catch(err => console.error('播放音效失敗:', err));
                                }
                                else {
                                    alert(t('please_grant_native_permission'));
                                    requestNotificationPermission();
                                }
                            }
                            else {
                                // 瀏覽器環境測試
                                if (Notification.permission === 'granted') {
                                    new Notification(t('test_notification'), { body: t('browser_notification_ok') });
                                    // 播放選擇的音效
                                    const audio = new Audio(`/sounds/${settings.sound}`);
                                    audio.play().catch(err => console.error('播放音效失敗:', err));
                                }
                                else {
                                    alert(t('please_grant_browser_permission'));
                                    requestNotificationPermission();
                                }
                            }
                        }
                        else {
                            alert(t('please_enable_notifications'));
                        }
                    }, fullWidth: true }) }), showSaved && (_jsx("div", { className: "absolute top-2 right-2 bg-green-100 text-green-700 px-3 py-1 rounded shadow-sm", children: `\u2705 ${t('saved')}` }))] }));
}
