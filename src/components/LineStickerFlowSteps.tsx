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

  const phases = [
    { step: 1 as const, title: "選設定、畫母圖", desc: "原第 1～2 步", path: "/tools/sticker-prompt#sticker-start" },
    { step: 2 as const, title: "上傳、自動整理", desc: "原第 3～4 步", path: "/tools/line-sticker?existing=1#mother-upload" },
    {
      step: 3 as const,
      title: mode === "animated" ? "製作動態、下載" : "下載上架 ZIP",
      desc: "原第 5 步",
      path: mode === "animated"
        ? "/tools/animated-line-sticker#animated-sticker-batch"
        : "/tools/line-sticker#sticker-download",
    },
  ];
  const activePhase = activeStep <= 2 ? 1 : activeStep <= 4 ? 2 : 3;

  return (
    <nav className={`${compact ? "mb-4" : "mb-6"}`} aria-label="貼圖製作三階段與五步驟導覽">
      <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {phases.map((phase) => {
          const active = phase.step === activePhase;
          return (
            <Link
              key={phase.step}
              to={phase.path}
              aria-current={active ? "step" : undefined}
              aria-label={`第 ${phase.step} 階段：${phase.title}，${phase.desc}`}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 border-r border-slate-200 px-1.5 py-3 text-center transition-colors last:border-r-0 sm:flex-row sm:gap-2 sm:px-3 sm:py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-600 ${
                active
                  ? "bg-violet-50 text-violet-900"
                  : "bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                active ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600"
              }`}>
                {String(phase.step).padStart(2, "0")}
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold leading-5 sm:text-sm">{phase.title}</span>
                <span className="hidden text-[11px] leading-5 text-slate-500 sm:block">{phase.desc}</span>
              </span>
            </Link>
          );
        })}
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        從第 1 步開始即可；已完成母圖的人可直接進入上傳。
        {" "}<Link to="/tools/line-sticker-guide" className="font-semibold text-violet-700 underline underline-offset-2">查看完整教學</Link>
      </p>
    </nav>
  );
}
