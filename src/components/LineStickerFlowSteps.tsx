import { useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { LineStickerMode, LineStickerStage } from "@/lib/lineStickerFlow";

type Props = {
  activeStep: LineStickerStage;
  mode?: LineStickerMode;
  compact?: boolean;
};

export default function LineStickerFlowSteps({
  activeStep,
  mode = "static",
  compact = false,
}: Props) {
  const location = useLocation();

  // 初次進入含 hash 的頁面直接定位，不使用平滑動畫，避免開發模式與回頂端操作造成畫面往返跳動。
  useLayoutEffect(() => {
    if (!location.hash) return;
    let anchorId = location.hash.slice(1);
    try { anchorId = decodeURIComponent(anchorId); } catch { /* 保留原始 hash */ }
    const target = document.getElementById(anchorId)
      ?? (anchorId === "mother-split" ? document.getElementById("mother-upload") : null);
    target?.scrollIntoView({ behavior: "auto", block: "start" });
  }, [location.pathname, location.hash]);

  // The entire product flow is five steps. Making APNG/WebP is part of step 5,
  // NOT a separate sixth step; there are local sub-actions inside the animation editor.
  const phases = [
    { step: 1 as const, title: "選角色", desc: "主題、文字、張數", path: "/tools/sticker-prompt#sticker-start" },
    { step: 2 as const, title: "AI 畫母圖", desc: "逐張複製指令", path: "/tools/sticker-prompt#sticker-copy" },
    { step: 3 as const, title: "上傳母圖", desc: "4×4＋4×2 等大圖", path: "/tools/line-sticker?existing=1#mother-upload" },
    { step: 4 as const, title: "自動切圖", desc: "安全檢查、去背", path: "/tools/line-sticker?flow=1#mother-split" },
    {
      step: 5 as const,
      title: mode === "animated" ? "製作動態 ZIP" : "下載靜態 ZIP",
      desc: mode === "animated" ? "動畫與上架檔同一步" : "取得上架素材",
      path: mode === "animated"
        ? "/tools/animated-line-sticker#animated-sticker-batch"
        : "/tools/line-sticker#sticker-download",
    },
  ];
  const activePhase = Math.max(1, Math.min(5, activeStep));

  return (
    <nav className={`${compact ? "mb-4" : "mb-6"}`} aria-label="貼圖製作五步驟導覽">
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="五步驟進度">
        {phases.map((phase) => {
          const active = phase.step === activePhase;
          return (
            <Link
              key={phase.step}
              to={phase.path}
              aria-current={active ? "step" : undefined}
              aria-label={`第 ${phase.step} 步：${phase.title}，${phase.desc}`}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center transition-colors sm:gap-2 sm:px-3 sm:py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${
                active
                  ? "border-violet-500 bg-violet-50 text-violet-900 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50"
              }`}
            >
              <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                active ? "bg-violet-600 text-white" : "bg-violet-100 text-violet-700"
              }`}>{phase.step}</span>
              <span className="text-[10px] font-bold leading-4 sm:text-sm">{phase.title}</span>
              <span className="hidden text-[11px] leading-5 text-slate-500 md:block">{phase.desc}</span>
            </Link>
          );
        })}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">
        {mode === "animated" ? "動態貼圖只需完成同樣的五步驟：第 5 步內製作動畫、下載 APNG／WebP ZIP，不額外增加第 6 步。" : "下載靜態 ZIP 就完成五步驟。"}
        {" "}<Link to="/tools/line-sticker-start" className="font-semibold text-violet-700 underline underline-offset-2">看寶寶、花店成果＋圖片教學 →</Link>
      </p>
    </nav>
  );
}
