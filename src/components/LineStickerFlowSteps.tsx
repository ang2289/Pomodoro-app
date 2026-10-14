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
  { step: 2 as const, title: "Google Gemini 畫圖", desc: "複製指令，到 Gemini 貼上生圖" },
  { step: 3 as const, title: "上傳圖片", desc: "把完整大圖傳回 RXV" },
  { step: 4 as const, title: "自動整理", desc: "一張大圖自動分成多張貼圖" },
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
          紫色是目前查看的步驟。點任何步驟都可回去查看，不會清除已選的內容。
        </p>
      </div>

      <div className="mb-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3">
        <p className="text-sm font-black text-sky-900">先知道一件事：不是一張張畫貼圖</p>
        <p className="mt-1 text-sm leading-6 text-slate-700">
          用 Google Gemini 畫一張有 8 或 16 格的完整大圖（叫「母圖」），下載大圖後傳回 RXV，系統就會自動分割、去背及整理。
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          目前 RXV 貼圖工具免費使用；Google Gemini 的使用限制依 Google 帳號與服務規則為準。
          <Link to="/tools/line-sticker-guide" className="ml-2 font-bold text-sky-800 underline underline-offset-2">看圖片操作教學 →</Link>
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {steps.map((item) => {
          const active = item.step === activeStep;
          const previous = item.step < activeStep;
          return (
            <Link
              key={item.step}
              to={paths[item.step - 1]}
              aria-current={active ? "step" : undefined}
              aria-label={`第 ${item.step} 步：${item.title}，前往操作`}
              className={`block rounded-2xl border p-3 transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${
                active
                  ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                  : previous
                    ? "border-slate-200 bg-white"
                    : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                    active
                      ? "bg-violet-600 text-white"
                      : previous
                        ? "bg-slate-200 text-slate-700"
                        : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {item.step}
                </span>
                <span className="min-w-[5.5rem] flex-1 whitespace-normal break-keep text-xs font-black leading-5 text-slate-900">第 {item.step} 步｜{item.title}</span>
              </div>
              <p className="mt-2 min-w-0 break-words text-[11px] leading-5 text-slate-500">{item.desc}</p>
              <span className="mt-2 block text-[11px] leading-5 text-slate-600">想前往這一步？請按下方紫色文字。</span>
              <span className="mt-1 inline-block text-[11px] font-bold text-violet-700">前往第 {item.step} 步 →</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
