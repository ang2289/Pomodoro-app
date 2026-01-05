import { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import LanguageSwitcher from '../components/LanguageSwitcher';
import NotificationSettings from '../components/NotificationSettings';
import CreditUsageDisplay from '../components/CreditUsageDisplay';
import PurchaseHistory from '../components/PurchaseHistory';
import { backupDataToFile, restoreDataFromFile } from '../utils/backupUtils';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import PayPalSubscribeButton from '../components/PayPalSubscribeButton';
import { supabase } from '../lib/supabase';
import PrimaryButton from '../components/ui/PrimaryButton';
import EmailAuth from '../components/auth/EmailAuth';

// console.log('✅ SettingsPage 載入中');

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isApp, setIsApp] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // 判斷是否為 App 環境
  useEffect(() => {
    // 檢查是否為真正的 Capacitor Native 環境
    if (typeof window !== 'undefined' && (window as any).Capacitor && Capacitor?.isNativePlatform?.()) {
      setIsApp(true);
    } else {
      setIsApp(false);
    }
  }, []);
  
  // 載入訂閱狀態
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      const { value } = await Preferences.get({ key: 'isSubscribed' });
      // console.log('設定頁面讀取訂閱狀態:', value);
      setIsSubscribed(value === 'true');
    };
    loadSubscriptionStatus();
  }, []);

  // 檢查管理員權限
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data, error } = await supabase.rpc('is_admin');
          if (!error && data === true) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('檢查管理員權限失敗:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();

    // ⚠️ 已停用：不再使用 onAuthStateChange 監聽認證狀態
    // 目前只允許用 getSession() 主動判斷登入狀態
    // const {
    //   data: { subscription },
    // } = supabase.auth.onAuthStateChange(async (_event, session) => {
    //   if (session?.user) {
    //     try {
    //       const { data, error } = await supabase.rpc('is_admin');
    //       if (!error && data === true) {
    //         setIsAdmin(true);
    //       } else {
    //         setIsAdmin(false);
    //       }
    //     } catch (error) {
    //       console.error('檢查管理員權限失敗:', error);
    //       setIsAdmin(false);
    //     }
    //   } else {
    //     setIsAdmin(false);
    //   }
    // });
    
    // 定期檢查 session 狀態並更新管理員權限（用於更新 UI）
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const { data, error } = await supabase.rpc('is_admin');
          if (!error && data === true) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('檢查管理員權限失敗:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      await restoreDataFromFile(file);
      alert('✅ ' + t('data_restore_success'));
      window.location.reload();
    } catch (err) {
      alert('❌ ' + t('import_failed'));
    }
  };

  // 判斷語言
  const lang = i18n.language === 'en' ? 'en' : 'zh-tw';

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {openDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-2">訂閱方案說明</h2>
            <p className="text-sm text-gray-700">
              訂閱每月 NT$49 即可移除底部廣告，享受更專注的唸經與任務管理體驗。您可以隨時取消訂閱。
            </p>
            <button 
              onClick={() => setOpenDialog(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              關閉
            </button>
          </div>
        </div>
      )}

      <div className="responsive-container">
        <HeaderBar icon="⚙️" title={t('settings')} showHomeButton={true} />
        
        {/* EmailAuth 元件：登入/註冊/登出 */}
        <div className="mb-4">
          <EmailAuth />
        </div>
        
        <LanguageSwitcher />
        
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* 點數使用狀況（新增） */}
          <CreditUsageDisplay lang={lang} />

          {/* 購點紀錄 */}
          <PurchaseHistory />

          <NotificationSettings />
          
          {/* 訂閱區塊（目前隱藏） */}
          {false && (isApp ? (
            <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
              <h2 className="text-lg font-bold mt-6">📱 App 訂閱</h2>
              <div className="mt-1 mb-2">
                <button 
                  onClick={() => setOpenDialog(true)}
                  className="text-sm text-blue-600 underline"
                >
                  什麼是訂閱？
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-2">勾選後將移除廣告</p>
              <div className="flex items-center mb-4">
                <input 
                  type="checkbox" 
                  checked={isSubscribed} 
                  onChange={async (e) => {
                    const checked = e.target.checked;
                    setIsSubscribed(checked);
                    // console.log('設定訂閱狀態為:', checked ? 'true' : 'false');
                    await Preferences.set({ key: 'isSubscribed', value: checked ? 'true' : 'false' });
                    
                    try {
                      const { AdMob, BannerAdPosition } = await import('@capacitor-community/admob');
                      
                      if (!checked) {
                        await AdMob.showBanner({
                          adId: 'ca-app-pub-3940256099942544/6300978111',
                          position: BannerAdPosition.BOTTOM_CENTER,
                          isTesting: true
                        });
                        // console.log('已顯示廣告');
                      } else {
                        await AdMob.hideBanner();
                        // console.log('已隱藏廣告');
                      }
                    } catch (error) {
                      // console.warn('更新廣告顯示狀態失敗:', error);
                    }
                  }} 
                  className="w-5 h-5" 
                />
                <label className="ml-2 whitespace-nowrap">
                  是否訂閱去廣告（透過 Google Play）
                </label>
              </div>
              <div className={`mt-2 text-sm text-gray-600 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded ${isSubscribed ? '' : ''}`}>
                {isSubscribed 
                  ? '✅ 您已成功訂閱！底部廣告已移除，享受更專注的唸經與任務管理體驗。'
                  : '🎁 訂閱方案：月費 NT$49，可移除底部廣告，讓你更專注唸經與任務管理。'
                }
              </div>
              <p className="text-xs text-gray-500 mt-2">
                若您是透過 Google Play 訂閱，請至 App 內設定進行操作。
              </p>
            </div>
          ) : (
            <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
              <h2 className="text-lg font-bold mt-6">🌐 網頁訂閱</h2>
              <div className="mt-1 mb-2">
                <button 
                  onClick={() => setOpenDialog(true)}
                  className="text-sm text-blue-600 underline"
                >
                  什麼是訂閱？
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1 mb-4">
                本訂閱僅適用於瀏覽器使用者，與 APP 訂閱分開
              </p>
              <PayPalSubscribeButton />
              <p className="text-xs text-gray-500 mt-2">
                若您是透過網頁訂閱，將以 PayPal 自動續訂，隨時可取消。
              </p>
            </div>
          ))}

          {/* 資料備份與還原 */}
          <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
            <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6">
              📦 {t('data_backup_restore')}
            </h2>
            <div className="flex flex-col">
              <div className="flex justify-center">
                <div className="w-1/3">
                  <button 
                    onClick={backupDataToFile} 
                    className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    {t('export_backup')}
                  </button>
                </div>
              </div>
              <div className="flex justify-center mt-3">
                <div className="w-1/3">
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="w-full !bg-green-600 hover:!bg-green-700 !text-white font-semibold py-2 px-4 rounded transition-colors"
                  >
                    {t('import_restore')}
                  </button>
                </div>
              </div>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="application/json" 
                onChange={handleRestore} 
                className="hidden" 
              />
            </div>
          </div>

          {/* 管理員工具區塊（僅管理員可見） */}
          {isAdmin && (
            <div className="card" style={{ backgroundColor: '#ffffff', color: '#213547' }}>
              <h2 className="text-lg sm:text-xl font-medium text-gray-700 mb-4 sm:mb-6">
                管理員工具
              </h2>
              <div>
                <Link to="/admin/payments" className="block w-full">
                  <PrimaryButton fullWidth className="bg-blue-600 hover:bg-blue-700">
                    匯款補點管理
                  </PrimaryButton>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

