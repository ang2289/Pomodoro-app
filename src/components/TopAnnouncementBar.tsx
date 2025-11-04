import React from 'react';
import { useTranslation } from 'react-i18next';
import { Volume2 } from 'lucide-react';

/**
 * 🔴 頂部跑馬燈公告元件
 * - 桌機：靜態顯示
 * - 手機：自動橫向捲動（marquee 效果）
 */
export default function TopAnnouncementBar() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  const isEnglish = !lang.startsWith("zh");

  const messageZh = `【行政院公告】普發一萬元補助將於 11 月 5 日開放申請，請認明官方網站：10000.gov.tw`;
  const messageEn = `[Executive Yuan Notice] The NT$10,000 subsidy program opens on Nov 5, 2025. Verify the official site: 10000.gov.tw`;

  return (
    <>
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 12s linear infinite;
        }
      `}</style>
      <div className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white text-center py-2 shadow-md relative overflow-hidden">
        {/* 桌機版：靜態顯示 */}
        <div className="hidden sm:flex items-center justify-center gap-2 text-sm font-medium animate-pulse">
          <Volume2 className="w-4 h-4 animate-bounce" />
          {isEnglish ? (
            <>
              [Executive Yuan Notice] The NT$10,000 subsidy program opens on
              <strong className="mx-1">Nov 5, 2025</strong>. Verify the official
              site:
              <a
                href="https://10000.gov.tw"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold ml-1"
              >
                10000.gov.tw
              </a>
            </>
          ) : (
            <>
              【行政院公告】普發一萬元補助將於
              <strong className="mx-1">11 月 5 日</strong>
              開放申請，請認明官方網站：
              <a
                href="https://10000.gov.tw"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold ml-1"
              >
                10000.gov.tw
              </a>
            </>
          )}
        </div>

        {/* 手機版：橫向跑馬燈 */}
        <div className="block sm:hidden whitespace-nowrap animate-marquee text-sm font-medium flex items-center gap-2">
          <Volume2 className="w-4 h-4 ml-2" />
          <span>
            {isEnglish ? messageEn : messageZh}
          </span>
        </div>
      </div>
    </>
  );
}

