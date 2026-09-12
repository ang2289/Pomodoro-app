import type { RefObject } from "react";
import type { TFunction } from "i18next";

type Props = {
  t: TFunction;
  compositePreviewRef: RefObject<HTMLCanvasElement>;
  compositePhoneRef: RefObject<HTMLCanvasElement>;
  previewCardClass: string;
  isLowContrast: boolean;
  hasUserContent: boolean;
  onFixContrast: () => void;
  downloadPng: () => void;
  downloadSvg: () => void;
  openLineShare: () => void;
  openFbShare: () => void;
  openXShare: () => void;
  handleCopy: () => void;
};

const rankingPlaceholders = [
  { rank: 1, title: "熱門 WiFi QR", scans: "2,124" },
  { rank: 2, title: "IG 導流小卡", scans: "1,836" },
  { rank: 3, title: "菜單 QR 模板", scans: "1,420" },
];

export default function QRPreviewPanel({
  t,
  compositePreviewRef,
  compositePhoneRef,
  previewCardClass,
  isLowContrast,
  hasUserContent,
  onFixContrast,
  downloadPng,
  downloadSvg,
  openLineShare,
  openFbShare,
  openXShare,
  handleCopy,
}: Props) {
  return (
    <div className="qr-preview-panel rounded-[28px] border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/90 p-5 shadow-lg shadow-slate-200/60 ring-1 ring-slate-100/80 md:p-7">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2rem]">即時預覽</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          與下載 PNG 相同，調整左側設定會立即更新。
        </p>
      </div>

      <div
        className={`qr-preview-panel__hero mx-auto flex w-full min-w-0 flex-col items-center justify-center rounded-[24px] border border-slate-200/70 p-4 md:p-6 ${previewCardClass}`}
      >
        <canvas
          ref={compositePreviewRef}
          className="qr-composite-preview block h-auto w-full rounded-[24px] shadow-inner"
          aria-label="QR 合成預覽"
        />
      </div>

      <div className="qr-preview-panel__actions mt-6 space-y-4">
        <div className="qr-preview-panel__download-grid">
          <button
            type="button"
            onClick={downloadPng}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {t("qr.download.png")}
          </button>
          <button
            type="button"
            onClick={downloadSvg}
            className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-violet-400/80 bg-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
          >
            {t("qr.download.svg")}
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            分享連結
          </p>
          <div className="qr-preview-panel__share-grid">
            <button
              type="button"
              onClick={openLineShare}
              className="qr-preview-panel__share-button inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-emerald-500 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              LINE
            </button>
            <button
              type="button"
              onClick={openFbShare}
              className="qr-preview-panel__share-button inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-[#1877f2] text-sm font-semibold text-white shadow-sm transition hover:bg-[#166fe5]"
            >
              FB
            </button>
            <button
              type="button"
              onClick={openXShare}
              className="qr-preview-panel__share-button inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              X
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="qr-preview-panel__share-button inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              {t("qr.download.copy")}
            </button>
          </div>
          {!hasUserContent ? (
            <p className="qr-preview-panel__hint mt-3 text-center text-xs text-slate-500">
              {t("qr.hint.default_content")}
            </p>
          ) : null}
        </div>

        {isLowContrast ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
            <p>{t("qr.contrast.warn")}</p>
            <button
              type="button"
              onClick={onFixContrast}
              className="mt-2 text-xs font-medium text-blue-600 underline"
            >
              {t("qr.contrast.fix")}
            </button>
          </div>
        ) : null}

        <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-4">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            掃描輔助參考
          </p>
          <div className="qr-preview-panel__phone-wrap flex justify-center">
            <div className="qr-preview-panel__phone-shell flex shrink-0 items-center justify-center rounded-[1.25rem] border-[4px] border-slate-800 bg-slate-900 shadow-md">
              <div className="flex h-[94px] w-full items-center justify-center overflow-hidden rounded-[0.95rem] bg-white px-1">
                <canvas
                  ref={compositePhoneRef}
                  className="max-h-full w-full object-contain"
                  aria-hidden
                />
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] leading-snug text-slate-400">{t("qr.preview.phone_mock")}</p>
        </div>

        <div className="qr-preview-panel__ranking rounded-2xl border border-slate-200/80 bg-white/90 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">排行榜入口預留</h3>
              <p className="text-xs text-slate-500">後續可接今日熱門、本週熱門與最新 QR。</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
              Coming soon
            </span>
          </div>
          <div className="qr-preview-panel__ranking-list">
            {rankingPlaceholders.map((item) => (
              <div key={item.rank} className="qr-preview-panel__ranking-item">
                <span className="qr-preview-panel__ranking-badge">{item.rank}</span>
                <div className="qr-preview-panel__ranking-text">
                  <span className="qr-preview-panel__ranking-title">{item.title}</span>
                  <span className="qr-preview-panel__ranking-meta">{item.scans} 掃描</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
