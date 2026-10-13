import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { LineStickerMode, LineStickerStage } from "@/lib/lineStickerFlow";

type Props = {
  activeStep: LineStickerStage;
  mode?: LineStickerMode;
  compact?: boolean;
};

const BASE_STEPS = [
  { step: 1 as const, title: "選擇貼圖", desc: "選類型、主題與張數" },
  { step: 2 as const, title: "ChatGPT 生圖", desc: "複製指令並產生母圖" },
  { step: 3 as const, title: "上傳圖片", desc: "把母圖傳回本站" },
  { step: 4 as const, title: "自動整理", desc: "切圖、去背、尺寸檢查" },
];

export default function LineStickerFlowSteps({
  activeStep,
  mode = "static",
  compact = false,
}: Props) {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) return;
    let anchorId = location.hash.slice(1);
    try { anchorId = decodeURIComponent(anchorId); } catch { /* 保留原始 hash */ }
    const frame = window.requestAnimationFrame(() => {
      // 尚未上傳圖片時，第 4 步切割區還未顯示；先引導回第 3 步上傳區。
      const target = document.getElementById(anchorId)
        ?? (anchorId === "mother-split" ? document.getElementById("mother-upload") : null);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  const paths = [
    "/tools/sticker-prompt#sticker-start",
    "/tools/sticker-prompt#sticker-copy",
    "/tools/line-sticker#mother-upload",
    "/tools/line-sticker#mother-split",
    mode === "animated" ? "/tools/animated-line-sticker#animated-sticker-batch" : "/tools/line-sticker#sticker-download",
  ];
  const steps = [
    ...BASE_STEPS,
    {
      step: 5 as const,
      title: mode === "animated" ? "製作動態貼圖" : "下載完成",
      desc: mode === "animated" ? "自動套動畫並打包" : "下載 LINE／WhatsApp 貼圖 ZIP",
    },
  ];

  return (
    <section
      className={`${compact ? "mb-4" : "mb-6"} rounded-3xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5`}
      aria-label="LINE 貼圖製作步驟"
    >
      <div className="mb-4">
        <p className="text-xs font-black tracking-wide text-violet-600">LINE 貼圖一鍵製作</p>
        <h2 className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
          跟著 1 → 2 → 3 → 4 → 5 完成
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          紫色是目前階段，點下方「第幾步」即可前往對應操作；已完成的階段會標示勾選。
        </p>
      </div>

      <div className="mb-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-violet-50 px-4 py-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <p className="text-sm font-black text-amber-900">
              🎁 RXV 免費貼圖製作工具
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              目前靜態貼圖整理、母圖切割、動畫效果與整套輸出都可免費使用。
            </p>
            <p className="mt-1 text-[11px] leading-5 text-slate-500">
              第一次使用建議先選 8 或 16 張靜態貼圖，熟悉流程後再製作動態；LINE 上架仍需平台審核。
            </p>
          </div>
          <span className="w-fit shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700">
            目前免費開放
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {steps.map((item) => {
          const active = item.step === activeStep;
          const done = item.step < activeStep;
          return (
            <Link
              key={item.step}
              to={paths[item.step - 1]}
              aria-current={active ? "step" : undefined}
              aria-label={`第 ${item.step} 步：${item.title}，前往操作`}
              className={`block rounded-2xl border p-3 transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${
                active
                  ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                  : done
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    active
                      ? "bg-violet-600 text-white"
                      : done
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {done ? "✓" : item.step}
                </span>
                <span className="min-w-[5.5rem] flex-1 whitespace-normal break-keep text-xs font-black leading-5 text-slate-900">第 {item.step} 步｜{item.title}</span>
              </div>
              <p className="mt-2 min-w-0 break-words text-[11px] leading-5 text-slate-500">{item.desc}</p>
              <span className="mt-2 inline-block text-[11px] font-bold text-violet-700">前往第 {item.step} 步 →</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
