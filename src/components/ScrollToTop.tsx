import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  const lastPathname = useRef<string | null>(null);

  useEffect(() => {
    // 同一頁只切換 #hash 時不應重置捲動位置。
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    // 貼圖工具的 #sticker-start／#sticker-copy／#mother-upload 等步驟錨點
    // 由 LineStickerFlowSteps 定位。若此處又回頂端，會與錨點捲動互相搶奪，
    // 造成畫面先往上、又往下的可見跳動，尤其在 React StrictMode 本機開發環境。
    const isStickerRoute = pathname === '/tools/sticker-prompt'
      || pathname === '/tools/line-sticker'
      || pathname === '/tools/animated-line-sticker'
      || pathname === '/tools/line-sticker-guide';
    if (isStickerRoute && hash) return;
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
