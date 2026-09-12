import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as _Link } from 'react-router-dom';
import _IconButton from '../components/ui/IconButton';
import HeaderBar from '../components/HeaderBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import NotificationSettings from '../components/NotificationSettings';
import { backupDataToFile, restoreDataFromFile } from '../utils/backupUtils';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import PayPalSubscribeButton from '../components/PayPalSubscribeButton';
console.log('✅ SettingsPage 載入中');
export default function SettingsPage() {
    const { t } = useTranslation();
    const fileInputRef = useRef(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [isApp, setIsApp] = useState(false);
    
    // 判斷是否為 App 環境
    useEffect(() => {
        // 檢查是否為真正的 Capacitor Native 環境
        if (typeof window !== 'undefined' && window.Capacitor && Capacitor?.isNativePlatform?.()) {
            setIsApp(true);
        } else {
            setIsApp(false);
        }
    }, []);
    
    // 載入訂閱狀態
    useEffect(() => {
        const loadSubscriptionStatus = async () => {
            const { value } = await Preferences.get({ key: 'isSubscribed' });
            console.log('設定頁面讀取訂閱狀態:', value);
            setIsSubscribed(value === 'true');
        };
        loadSubscriptionStatus();
    }, []);
    
    // 保留未來可能使用的匯入，避免 TS6133
    void _Link;
    void _IconButton;
    const handleRestore = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        try {
            await restoreDataFromFile(file);
            alert('✅ ' + t('data_restore_success'));
            window.location.reload();
        }
        catch (err) {
            alert('❌ ' + t('import_failed'));
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 p-4", children: [
        openDialog && _jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children:
            _jsxs("div", { className: "bg-white p-6 rounded shadow-lg max-w-md w-full", children: [
                _jsx("h2", { className: "text-lg font-bold mb-2", children: "訂閱方案說明" }),
                _jsx("p", { className: "text-sm text-gray-700", children: "訂閱每月 NT$49 即可移除底部廣告，享受更專注的唸經與任務管理體驗。您可以隨時取消訂閱。" }),
                _jsx("button", { 
                    onClick: () => setOpenDialog(false),
                    className: "mt-4 px-4 py-2 bg-blue-600 text-white rounded",
                    children: "關閉"
                })
            ]})
        }),
        _jsxs("div", { className: "responsive-container", children: [
            _jsx(HeaderBar, { icon: "\u2699\uFE0F", title: t('settings'), showHomeButton: true }), 
            _jsx(LanguageSwitcher, {}), 
            _jsxs("div", { className: "flex flex-col gap-4 sm:gap-6", children: [
                _jsx(NotificationSettings, {}), 
                ...(false ? (isApp ? [
                    _jsxs("div", { className: "card", style: { backgroundColor: '#ffffff', color: '#213547' }, children: [
                        _jsx("h2", { className: "text-lg font-bold mt-6", children: "📱 App 訂閱" }),
                        _jsx("div", { className: "mt-1 mb-2", children:
                            _jsx("button", { 
                                onClick: () => setOpenDialog(true),
                                className: "text-sm text-blue-600 underline",
                                children: "什麼是訂閱？"
                            })
                        }), 
                        _jsx("p", { className: "text-sm text-gray-500 mb-2", children: "勾選後將移除廣告" }), 
                        _jsxs("div", { className: "flex items-center mb-4", children: [
                            _jsx("input", { 
                                type: "checkbox", 
                                checked: isSubscribed, 
                                onChange: async (e) => {
                                    const checked = e.target.checked;
                                    setIsSubscribed(checked);
                                    console.log('設定訂閱狀態為:', checked ? 'true' : 'false');
                                    await Preferences.set({ key: 'isSubscribed', value: checked ? 'true' : 'false' });
                                    
                                    try {
                                        const { AdMob, BannerAdPosition } = await import('@capacitor-community/admob');
                                        
                                        if (!checked) {
                                            await AdMob.showBanner({
                                                adId: 'ca-app-pub-3940256099942544/6300978111',
                                                position: BannerAdPosition.BOTTOM_CENTER,
                                                isTesting: true
                                            });
                                            console.log('已顯示廣告');
                                        } else {
                                            await AdMob.hideBanner();
                                            console.log('已隱藏廣告');
                                        }
                                    } catch (error) {
                                        console.warn('更新廣告顯示狀態失敗:', error);
                                    }
                                }, 
                                className: "w-5 h-5" 
                            }), 
                            _jsx("label", { className: "ml-2 whitespace-nowrap", children: "是否訂閱去廣告（透過 Google Play）" })
                        ] }),
                        _jsx("div", { className: "mt-2 text-sm text-gray-600 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded", children: isSubscribed ? "✅ 您已成功訂閱！底部廣告已移除，享受更專注的唸經與任務管理體驗。" : "🎁 訂閱方案：月費 NT$49，可移除底部廣告，讓你更專注唸經與任務管理。" }),
                        _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "若您是透過 Google Play 訂閱，請至 App 內設定進行操作。" })
                    ] })
                ] : [
                    _jsxs("div", { className: "card", style: { backgroundColor: '#ffffff', color: '#213547' }, children: [
                        _jsx("h2", { className: "text-lg font-bold mt-6", children: "🌐 網頁訂閱" }),
                        _jsx("div", { className: "mt-1 mb-2", children:
                            _jsx("button", { 
                                onClick: () => setOpenDialog(true),
                                className: "text-sm text-blue-600 underline",
                                children: "什麼是訂閱？"
                            })
                        }), 
                        _jsx("p", { className: "text-sm text-gray-600 mt-1 mb-4", children: "本訂閱僅適用於瀏覽器使用者，與 APP 訂閱分開" }), 
                        _jsx(PayPalSubscribeButton, {}),
                        _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "若您是透過網頁訂閱，將以 PayPal 自動續訂，隨時可取消。" })
                    ] })
                ]) : []),
                _jsxs("div", { className: "card", style: { backgroundColor: '#ffffff', color: '#213547' }, children: [
                    _jsx("h2", { className: "text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6", children: "\uD83D\uDCE6 " + t('data_backup_restore') }), 
                    _jsxs("div", { className: "flex flex-col", children: [
                        _jsx("div", { className: "flex justify-center", children:
                            _jsx("div", { className: "w-1/3", children:
                                _jsx("button", { 
                                    onClick: backupDataToFile, 
                                    className: "w-full !bg-blue-600 hover:!bg-blue-700 !text-white font-semibold py-2 px-4 rounded transition-colors", 
                                    children: t('export_backup')
                                })
                            })
                        }), 
                        _jsx("div", { className: "flex justify-center mt-3", children:
                            _jsx("div", { className: "w-1/3", children:
                                _jsx("button", { 
                                    onClick: () => fileInputRef.current?.click(), 
                                    className: "w-full !bg-green-600 hover:!bg-green-700 !text-white font-semibold py-2 px-4 rounded transition-colors", 
                                    children: t('import_restore')
                                })
                            })
                        }), 
                        _jsx("input", { 
                            ref: fileInputRef, 
                            type: "file", 
                            accept: "application/json", 
                            onChange: handleRestore, 
                            className: "hidden" 
                        })
                    ] })
                ] })
            ] })
        ] })
    ] }));
}