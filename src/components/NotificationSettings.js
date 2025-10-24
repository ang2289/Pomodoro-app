import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import IconButton from './ui/IconButton';
import { getNotificationSettings, saveNotificationSettings } from '../utils/notificationUtils';
import { notificationService } from '../services/notificationService';
// 可用的音效選項
const soundOptions = [
    { value: 'bell.mp3', label: '音效1' },
    { value: 'ding.mp3', label: '音效2' },
    { value: 'tick.mp3', label: '音效3' },
    { value: 'wood.mp3', label: '音效4' }
];
export default function NotificationSettings() {
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
                    alert('原生通知權限已授予！');
                    handleSettingChange('enabled', true);
                }
                else {
                    alert('原生通知權限被拒絕');
                    handleSettingChange('enabled', false);
                }
            }
            catch (error) {
                console.error('請求原生通知權限失敗:', error);
                alert('請求原生通知權限時發生錯誤');
                handleSettingChange('enabled', false);
            }
        }
        else {
            // 瀏覽器環境
            if (!notificationService.isNotificationSupported()) {
                alert('瀏覽器不支援通知功能');
                handleSettingChange('enabled', false);
                return;
            }
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    alert('瀏覽器通知權限已授予！');
                    handleSettingChange('enabled', true);
                }
                else {
                    alert('需要通知權限才能啟用此功能');
                    handleSettingChange('enabled', false);
                }
            }
            catch (error) {
                console.error('請求瀏覽器通知權限失敗:', error);
                alert('請求瀏覽器通知權限時發生錯誤');
                handleSettingChange('enabled', false);
            }
        }
    };
    return (_jsxs("div", { className: "rounded-lg bg-white shadow-md p-6 w-full relative", children: [_jsx("h2", { className: "text-base font-medium text-gray-700 mb-4", children: "\uD83D\uDD14 \u901A\u77E5\u8A2D\u5B9A" }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("label", { htmlFor: "enableNotify", className: "text-base font-medium text-gray-700", children: "\u555F\u7528\u901A\u77E5" }), _jsx("input", { id: "enableNotify", type: "checkbox", className: "w-5 h-5", checked: settings.enabled, onChange: () => {
                            if (!settings.enabled) {
                                requestNotificationPermission();
                            }
                            else {
                                handleSettingChange('enabled', false);
                            }
                        } })] }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("label", { htmlFor: "soundSelect", className: "text-base font-medium text-gray-700", children: "\u901A\u77E5\u97F3\u6548" }), _jsx("select", { id: "soundSelect", className: "border rounded px-2 py-1 bg-white", value: settings.sound, onChange: (e) => handleSettingChange('sound', e.target.value), disabled: !settings.enabled, children: soundOptions.map((sound) => (_jsx("option", { value: sound.value, children: sound.label }, sound.value))) })] }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("label", { htmlFor: "workNotify", className: "text-base font-medium text-gray-700", children: "\u756A\u8304\u9418\u7D50\u675F\u901A\u77E5" }), _jsx("input", { id: "workNotify", type: "checkbox", className: "w-5 h-5", checked: settings.workNotification, onChange: () => handleSettingChange('workNotification', !settings.workNotification), disabled: !settings.enabled })] }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("label", { htmlFor: "breakNotify", className: "text-base font-medium text-gray-700", children: "\u4F11\u606F\u7D50\u675F\u901A\u77E5" }), _jsx("input", { id: "breakNotify", type: "checkbox", className: "w-5 h-5", checked: settings.breakNotification, onChange: () => handleSettingChange('breakNotification', !settings.breakNotification), disabled: !settings.enabled })] }), _jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsx("label", { htmlFor: "autoNextRound", className: "text-base font-medium text-gray-700", children: "\u81EA\u52D5\u9032\u5165\u4E0B\u4E00\u56DE\u5408" }), _jsx("input", { id: "autoNextRound", type: "checkbox", className: "w-5 h-5", checked: settings.autoNextRound, onChange: () => handleSettingChange('autoNextRound', !settings.autoNextRound) })] }), _jsx("div", { className: "mt-6", children: _jsx(IconButton, { label: "\u6E2C\u8A66\u901A\u77E5", variant: "secondary", onClick: async () => {
                        if (settings.enabled) {
                            if (notificationService.isNativePlatform()) {
                                // 原生平台測試
                                if (notificationService.hasNotificationPermission()) {
                                    await notificationService.showNotification({ title: '測試通知', body: '原生通知功能正常運作中！' });
                                    // 播放選擇的音效
                                    const audio = new Audio(`/sounds/${settings.sound}`);
                                    audio.play().catch(err => console.error('播放音效失敗:', err));
                                }
                                else {
                                    alert('請先授予原生通知權限');
                                    requestNotificationPermission();
                                }
                            }
                            else {
                                // 瀏覽器環境測試
                                if (Notification.permission === 'granted') {
                                    new Notification('測試通知', { body: '瀏覽器通知功能正常運作中！' });
                                    // 播放選擇的音效
                                    const audio = new Audio(`/sounds/${settings.sound}`);
                                    audio.play().catch(err => console.error('播放音效失敗:', err));
                                }
                                else {
                                    alert('請先授予瀏覽器通知權限');
                                    requestNotificationPermission();
                                }
                            }
                        }
                        else {
                            alert('請先啟用通知功能');
                        }
                    }, fullWidth: true }) }), showSaved && (_jsx("div", { className: "absolute top-2 right-2 bg-green-100 text-green-700 px-3 py-1 rounded shadow-sm", children: "\u2705 \u5DF2\u5132\u5B58" }))] }));
}
