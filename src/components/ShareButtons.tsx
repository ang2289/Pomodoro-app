import { useRef, useEffect } from 'react';

export default function ShareButtons({ title }: { title: string }) {
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
      alert('📋 標題和連結已複製到剪貼簿！\n\n點擊「確定」後將開啟 Facebook 分享頁面\n\n請在分享框中貼上（Ctrl+V / Cmd+V）');
      // 用戶確認後，打開 Facebook 分享頁面
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        '_blank'
      );
    }).catch(() => {
      // 如果複製失敗，先顯示錯誤提示
      alert('⚠️ 無法複製到剪貼簿，請手動複製以下內容：\n\n' + shareText);
      // 用戶確認後，仍然打開 Facebook 分享頁面
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
        '_blank'
      );
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    alert("✅ 已複製標題＋連結，可直接貼到群組分享！");
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
        💬 分享到 LINE
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
        📣 分享到 Facebook
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
        🔗 複製標題＋連結
      </button>
    </div>
  );
}
