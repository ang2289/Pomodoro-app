import { useEffect, useMemo, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const DISMISSED_KEY = 'rxv_pwa_install_dismissed_until';
const NEVER_SHOW_KEY = 'rxv_pwa_install_never_show';
const INSTALLED_KEY = 'rxv_pwa_installed';
const REMINDER_KEY = 'rxv_pwa_marketing_reminder_enabled';
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const APP_ICON = '/icons/rxv-icon-192-v78.png';

function isStandaloneMode() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
}

function ua() {
  if (typeof navigator === 'undefined') return '';
  return navigator.userAgent || '';
}

function viewportWidth() {
  if (typeof window === 'undefined') return 9999;
  return Math.max(
    window.innerWidth || 0,
    document.documentElement?.clientWidth || 0,
    window.screen?.width || 0,
  );
}

function isDesktopHardBlocked() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  const width = viewportWidth();
  const value = ua();
  const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(value);
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches === true;
  const hoverFine = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches === true;

  // V81：桌機瀏覽器硬排除。
  // 只要是一般桌機寬度或滑鼠精準指標，就不顯示 PWA 安裝卡。
  // 避免 Chrome 桌機也觸發 beforeinstallprompt 導致首頁被遮住。
  if (width >= 768 && !mobileUA) return true;
  if (width >= 768 && hoverFine) return true;
  if (isDesktopOS() && !coarsePointer) return true;

  return false;
}

function isDesktopOS() {
  const value = ua();
  return /Windows NT|Macintosh|X11|Linux x86_64|CrOS/i.test(value) && !/Android|iPhone|iPad|iPod/i.test(value);
}

function isMobileOrTabletDevice() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  if (isDesktopHardBlocked()) return false;
  const value = ua();
  const width = viewportWidth();
  const hasMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(value);
  const hasTouch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;

  // Windows / Mac / Linux 桌機版一律排除，避免桌機 Chrome 觸發 beforeinstallprompt 後出現卡片。
  if (isDesktopOS() && width >= 768) return false;

  // 真手機 / 平板：UA 有 Android、iPhone、iPad 或 Mobile。
  if (hasMobileUA) return true;

  // 特殊平板 UA 不含 Mobile 時，用觸控 + 較窄寬度補判斷。
  if (hasTouch && width <= 900) return true;

  return false;
}

function isIOSDevice() {
  return /iphone|ipad|ipod/i.test(ua());
}

function isAndroidDevice() {
  return /android/i.test(ua());
}

function isLikelyChrome() {
  const value = ua();
  return /Chrome\//i.test(value) && !/EdgA|OPR|SamsungBrowser|FBAN|FBAV|Line|Instagram/i.test(value);
}

function isInAppBrowser() {
  const value = ua();
  return /Line|FBAN|FBAV|Instagram|MicroMessenger|Twitter|TikTok|Pinterest/i.test(value);
}

function getBrowserName() {
  const value = ua();
  if (/Line/i.test(value)) return 'LINE 內建瀏覽器';
  if (/FBAN|FBAV/i.test(value)) return 'Facebook 內建瀏覽器';
  if (/Instagram/i.test(value)) return 'Instagram 內建瀏覽器';
  if (/MicroMessenger/i.test(value)) return '微信內建瀏覽器';
  return '內建瀏覽器';
}

async function registerRxVServiceWorker() {
  if (typeof window === 'undefined') return null;
  if (!('serviceWorker' in navigator)) return null;
  if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(window.location.hostname)) return null;

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    return registration;
  } catch (error) {
    console.warn('[PWA] service worker register failed:', error);
    return null;
  }
}

function shouldSuppressPrompt() {
  if (typeof window === 'undefined') return true;
  if (!isMobileOrTabletDevice()) return true;
  if (isStandaloneMode()) return true;
  if (localStorage.getItem(INSTALLED_KEY) === '1') return true;
  if (localStorage.getItem(NEVER_SHOW_KEY) === '1') return true;

  const dismissedUntil = Number(localStorage.getItem(DISMISSED_KEY) || 0);
  return Boolean(dismissedUntil && Date.now() < dismissedUntil);
}

function buildChromeIntentUrl() {
  if (typeof window === 'undefined') return '';
  const current = window.location.href;
  const withoutProtocol = current.replace(/^https?:\/\//, '');
  return `intent://${withoutProtocol}#Intent;scheme=https;package=com.android.chrome;end`;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission | 'unsupported'>('unsupported');

  const isStandalone = useMemo(() => isStandaloneMode(), []);
  const isIOS = useMemo(() => isIOSDevice(), []);
  const isAndroid = useMemo(() => isAndroidDevice(), []);
  const inApp = useMemo(() => isInAppBrowser(), []);
  const chrome = useMemo(() => isLikelyChrome(), []);
  const browserName = useMemo(() => getBrowserName(), []);
  const mobileOrTablet = useMemo(() => isMobileOrTabletDevice(), []);

  useEffect(() => {
    const closeOnDesktop = () => {
      if (isDesktopHardBlocked()) {
        setVisible(false);
        setDeferredPrompt(null);
      }
    };
    closeOnDesktop();
    window.addEventListener('resize', closeOnDesktop);
    return () => window.removeEventListener('resize', closeOnDesktop);
  }, []);

  useEffect(() => {
    registerRxVServiceWorker();

    if (!mobileOrTablet) {
      console.log('[PWA] Desktop detected, skip install prompt');
      return;
    }

    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }

    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, '1');
      setVisible(false);
      setDeferredPrompt(null);
    };

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      if (shouldSuppressPrompt()) return;
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    if (!shouldSuppressPrompt()) {
      // LINE / FB / IG 內建瀏覽器不會觸發 beforeinstallprompt，直接顯示「用 Chrome 開啟」轉換卡。
      // iPhone / iPad 同樣不支援一鍵安裝，顯示加入主畫面教學。
      // Android Chrome 若事件稍慢，先延遲顯示，避免一進站就擋畫面。
      const delay = inApp || isIOS ? 900 : 1800;
      const timer = window.setTimeout(() => {
        if (!shouldSuppressPrompt()) setVisible(true);
      }, delay);

      return () => {
        window.clearTimeout(timer);
        window.removeEventListener('appinstalled', onInstalled);
        window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    };
  }, [inApp, isIOS, mobileOrTablet]);

  useEffect(() => {
    if (localStorage.getItem(REMINDER_KEY) !== '1') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const timer = window.setTimeout(async () => {
      const registration = await navigator.serviceWorker?.ready.catch(() => null);
      registration?.active?.postMessage({
        type: 'RXV_TEST_NOTIFICATION',
        title: 'RxV 工具提醒',
        body: '今天可以回來產短影音、整理文案或使用 AI 工具。',
        url: '/tools/shopee-video',
      });
    }, 2500);

    return () => window.clearTimeout(timer);
  }, []);

  const dismissFor7Days = () => {
    localStorage.setItem(DISMISSED_KEY, String(Date.now() + SEVEN_DAYS));
    setVisible(false);
  };

  const neverShowAgain = () => {
    localStorage.setItem(NEVER_SHOW_KEY, '1');
    setVisible(false);
  };

  const installApp = async () => {
    if (deferredPrompt && chrome) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice.catch(() => null);
      setDeferredPrompt(null);
      if (choice?.outcome === 'accepted') {
        localStorage.setItem(INSTALLED_KEY, '1');
        setVisible(false);
      }
      return;
    }

    setGuideOpen(true);
  };

  const openInChrome = () => {
    if (isAndroid) {
      window.location.href = buildChromeIntentUrl();
      window.setTimeout(() => setGuideOpen(true), 800);
      return;
    }
    setGuideOpen(true);
  };

  const enableReminder = async () => {
    if (!('Notification' in window)) {
      setNotificationStatus('unsupported');
      return;
    }

    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    if (permission === 'granted') {
      localStorage.setItem(REMINDER_KEY, '1');
      const registration = await navigator.serviceWorker?.ready.catch(() => null);
      registration?.active?.postMessage({
        type: 'RXV_TEST_NOTIFICATION',
        title: '提醒已開啟',
        body: '之後可更快回來使用 RxV 工具。',
        url: '/',
      });
    }
  };

  // V81 最後一道保險：桌機版任何情況都不渲染。
  if (isDesktopHardBlocked() || !mobileOrTablet || !visible || isStandalone || shouldSuppressPrompt()) return null;

  const primaryLabel = inApp
    ? '🚀 用 Chrome 開啟'
    : isIOS
      ? '📖 查看加入教學'
      : deferredPrompt && chrome
        ? '📲 一鍵加入桌面'
        : '📖 查看加入教學';

  const primaryAction = inApp ? openInChrome : installApp;

  return (
    <div className="fixed bottom-24 left-3 right-3 z-[9999] mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:left-auto sm:right-5 sm:bottom-5">
      <div className="flex items-start gap-3">
        <img src={APP_ICON} alt="RxV" className="h-12 w-12 rounded-2xl shadow-sm" onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.png'; }} />
        <div className="min-w-0 flex-1">
          <div className="text-base font-bold text-slate-900">把 RxV 加到手機桌面</div>
          <p className="mt-1 text-sm leading-5 text-slate-600">
            下次不用找網址，直接從桌面打開短影音工具、文案複製與 AI 工具。
          </p>
        </div>
        <button
          type="button"
          onClick={dismissFor7Days}
          className="rounded-full px-2 py-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          aria-label="關閉"
        >
          ✕
        </button>
      </div>

      {inApp ? (
        <div className="mt-3 rounded-xl bg-orange-50 p-3 text-sm leading-6 text-orange-900">
          <div className="font-semibold">目前在 {browserName}</div>
          <ol className="mt-1 list-decimal pl-5">
            <li>請點右上角或下方選單</li>
            <li>選「用外部瀏覽器開啟」或「在 Chrome 開啟」</li>
            <li>到 Chrome 後再按「加到桌面」</li>
          </ol>
        </div>
      ) : null}

      {guideOpen || (isIOS && !deferredPrompt) ? (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          <div className="font-semibold text-slate-900">
            {isIOS ? 'iPhone / iPad 加入方式：' : 'Android Chrome 加入方式：'}
          </div>
          {isIOS ? (
            <ol className="mt-1 list-decimal pl-5">
              <li>請用 Safari 開啟本網站</li>
              <li>點 Safari 下方「分享」按鈕</li>
              <li>選「加入主畫面」</li>
              <li>按「新增」</li>
            </ol>
          ) : (
            <ol className="mt-1 list-decimal pl-5">
              <li>請用 Chrome 開啟本網站</li>
              <li>點右上角 ⋮ 選單</li>
              <li>選「安裝應用程式」或「加入主畫面」</li>
            </ol>
          )}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={primaryAction}
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          {primaryLabel}
        </button>
        <button
          type="button"
          onClick={enableReminder}
          disabled={notificationStatus === 'denied' || notificationStatus === 'unsupported'}
          className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          🔔 開啟提醒
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-sm">
        <button type="button" onClick={dismissFor7Days} className="text-slate-500 underline underline-offset-2">
          稍後再提醒
        </button>
        <button type="button" onClick={neverShowAgain} className="font-medium text-red-600 underline underline-offset-2">
          不再提示安裝捷徑
        </button>
      </div>

      {notificationStatus === 'denied' ? (
        <p className="mt-2 text-xs text-red-600">瀏覽器已封鎖通知，需到網站權限重新允許。</p>
      ) : notificationStatus === 'granted' ? (
        <p className="mt-2 text-xs text-emerald-700">提醒已允許。</p>
      ) : null}

      <p className="mt-2 text-xs text-slate-400">
        已安裝或選擇不再提示後，此視窗不會重複出現。
      </p>
    </div>
  );
}
