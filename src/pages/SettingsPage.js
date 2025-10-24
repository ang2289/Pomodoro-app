import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState, useEffect } from 'react';
import { Link as _Link } from 'react-router-dom';
import _IconButton from '../components/ui/IconButton';
import HeaderBar from '../components/HeaderBar';
import NotificationSettings from '../components/NotificationSettings';
import { backupDataToFile, restoreDataFromFile } from '../utils/backupUtils';
import { Preferences } from '@capacitor/preferences';
console.log('✅ SettingsPage 載入中');
export default function SettingsPage() {
    const fileInputRef = useRef(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    
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
            alert('✅ 資料還原成功！');
            window.location.reload();
        }
        catch (err) {
            alert('❌ 匯入失敗，請確認檔案格式正確');
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
            _jsx(HeaderBar, { icon: "\u2699\uFE0F", title: "\u8A2D\u5B9A\u4E2D\u5FC3", showHomeButton: true }), 
            _jsxs("div", { className: "flex flex-col gap-4 sm:gap-6", children: [
                _jsx(NotificationSettings, {}), 
                _jsxs("div", { className: "card", style: { backgroundColor: '#ffffff', color: '#213547' }, children: [
                    _jsx("h2", { className: "text-lg font-bold whitespace-nowrap mt-6", children: "\uD83C\uDF1F \u8A02\u95B1\u8A2D\u5B9A" }),
                    _jsx("div", { className: "mt-1 mb-2", children:
                        _jsx("button", { 
                            onClick: () => setOpenDialog(true),
                            className: "text-sm text-blue-600 underline",
                            children: "什麼是訂閱？"
                        })
                    }), 
                    _jsx("p", { className: "text-sm text-gray-500 mb-2", children: "\u52FE\u9078\u5F8C\u5C07\u79FB\u9664\u5EE3\u544A" }), 
                    _jsxs("div", { className: "flex items-center mb-4", children: [
                        _jsx("input", { 
                            type: "checkbox", 
                            checked: isSubscribed, 
                            onChange: async (e) => {
                                const checked = e.target.checked;
                                setIsSubscribed(checked);
                                console.log('設定訂閱狀態為:', checked ? 'true' : 'false');
                                await Preferences.set({ key: 'isSubscribed', value: checked ? 'true' : 'false' });
                                
                                // 立即生效的簡易修法（for MVP 測試）
                                try {
                                    const { AdMob, BannerAdPosition } = await import('@capacitor-community/admob');
                                    
                                    // 取消訂閱後立即重啟廣告
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
                        _jsx("label", { className: "ml-2 whitespace-nowrap", children: "\u662F\u5426\u8A02\u95B1\u53BB\u5EE3\u544A" })
                    ] }),
                    
                    /* 訂閱說明文字區塊 */
                    _jsx("div", { className: "mt-2 text-sm text-gray-600 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded", children: isSubscribed ? "✅ 您已成功訂閱！底部廣告已移除，享受更專注的唸經與任務管理體驗。" : "🎁 訂閱方案：月費 NT$49，可移除底部廣告，讓你更專注唸經與任務管理。" })
                ] }), 
                _jsxs("div", { className: "card", style: { backgroundColor: '#ffffff', color: '#213547' }, children: [
                    _jsx("h2", { className: "text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6", children: "\uD83D\uDCE6 \u8CC7\u6599\u5099\u4EFD\u8207\u9084\u539F" }), 
                    _jsxs("div", { className: "flex flex-col gap-3 sm:gap-4", children: [
                        _jsx("button", { 
                            onClick: backupDataToFile, 
                            className: "w-full text-white font-semibold text-base sm:text-lg px-4 py-3 sm:py-4 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]", 
                            style: {
                                backgroundColor: '#2563eb',
                                color: 'white'
                            }, 
                            onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#1d4ed8';
                            }, 
                            onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = '#2563eb';
                            }, 
                            children: "\u532F\u51FA\u5099\u4EFD\uFF08.json\uFF09" 
                        }), 
                        _jsx("button", { 
                            onClick: () => fileInputRef.current?.click(), 
                            className: "w-full text-white font-semibold text-base sm:text-lg px-4 py-3 sm:py-4 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]", 
                            style: {
                                backgroundColor: '#16a34a',
                                color: 'white'
                            }, 
                            onMouseEnter: (e) => {
                                e.currentTarget.style.backgroundColor = '#15803d';
                            }, 
                            onMouseLeave: (e) => {
                                e.currentTarget.style.backgroundColor = '#16a34a';
                            }, 
                            children: "\u532F\u5165\u9084\u539F\uFF08.json\uFF09" 
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