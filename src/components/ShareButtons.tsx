import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function ShareButtons({ title }: { title: string }) {
  const { t } = useTranslation();
  const lineButtonRef = useRef<HTMLButtonElement>(null);
  const facebookButtonRef = useRef<HTMLButtonElement>(null);
  const copyButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // 強制設置按鈕寬度為 50%，覆蓋全局 CSS 的 !important
    if (lineButtonRef.current) {
      lineButtonRef.current.style.setProperty('width', '50%', 'important');
    }
    if (facebookButtonRef.current) {
      facebookButtonRef.current.style.setProperty('width', '50%', 'important');
    }
    if (copyButtonRef.current) {
      copyButtonRef.current.style.setProperty('width', '50%', 'important');
    }
  }, []);

  // 統一的分享文字格式：標題 + 連結
  const currentUrl = window.location.href;
  const shareText = `【${title}】\n${currentUrl}`;

  const handleShareLine = () => {
    // LINE 分享：使用 line.me 網頁版分享，可以包含文字和連結
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
    window.open(lineUrl, '_blank');
  };

  const handleShareFacebook = () => {
    // Facebook 分享：先複製標題+連結到剪貼簿，然後打開 Facebook 分享頁面
    // 因為 Facebook sharer.php 不能直接預填文字，所以需要用戶手動貼上
    navigator.clipboard.writeText(shareText).then(() => {
      // 先顯示提示，等用戶確認後再打開 Facebook 分享頁面
      alert(t('facebook_share_copied_alert'));
      // 用戶確認後，打開 Facebook 分享頁面
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        '_blank'
      );
    }).catch(() => {
      // 如果複製失敗，先顯示錯誤提示
      alert(t('facebook_share_copy_failed_alert') + shareText);
      // 用戶確認後，仍然打開 Facebook 分享頁面
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        '_blank'
      );
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    alert(t('copy_title_link_alert'));
  };

  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <button
        ref={lineButtonRef}
        onClick={handleShareLine}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-lg font-semibold shadow transition"
        style={{
          backgroundColor: '#16a34a',
          color: '#ffffff',
          border: 'none'
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#15803d' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#16a34a' }}
      >
        💬 {t('share_to_line')}
      </button>

      <button
        ref={facebookButtonRef}
        onClick={handleShareFacebook}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-lg font-semibold shadow transition"
        style={{
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none'
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1d4ed8' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2563eb' }}
      >
        📣 {t('share_to_facebook')}
      </button>

      <button
        ref={copyButtonRef}
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-lg font-semibold shadow transition"
        style={{
          backgroundColor: '#9333ea',
          color: '#ffffff',
          border: 'none'
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#7e22ce' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#9333ea' }}
      >
        🔗 {t('copy_title_link')}
      </button>
    </div>
  );
}
