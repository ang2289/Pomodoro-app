import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import type { LineStickerMode, LineStickerStage } from "@/lib/lineStickerFlow";

type Props = {
  activeStep: LineStickerStage;
  mode?: LineStickerMode;
  compact?: boolean;
};

const BASE_STEPS = [
  { step: 1 as const, title: "選貼圖" },
  { step: 2 as const, title: "AI 畫圖" },
  { step: 3 as const, title: "傳回圖片" },
  { step: 4 as const, title: "自動切圖" },
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
    { step: 5 as const, title: mode === "animated" ? "做動態" : "下載 ZIP" },
  ];

  return (
    <nav
      className={`${compact ? "mb-3" : "mb-5"} border-b border-slate-200 pb-4`}
      aria-label="貼圖製作五步驟"
    >
      <p className="mb-3 text-sm font-semibold text-slate-700">
        跟著 1 → 2 → 3 → 4 → 5 做貼圖
      </p>
      <ol className="flex flex-wrap items-center gap-2" aria-label="貼圖操作流程">
        {steps.map((item) => {
          const active = item.step === activeStep;
          return (
            <li key={item.step}>
              <Link
                to={paths[item.step - 1]}
                aria-current={active ? "step" : undefined}
                aria-label={`第 ${item.step} 步：${item.title}`}
                className={`inline-flex min-h-10 w-auto items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 ${
                  active
                    ? "border-violet-500 bg-violet-50 text-violet-900"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                }`}
              >
                <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                  active ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600"
                }`}>{item.step}</span>
                {item.title}
              </Link>
            </li>
          );
        })}
      </ol>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        先用 ChatGPT（推薦）畫一整張母圖，再回本站上傳。不需要一格一格畫。
        {" "}<Link to="/tools/line-sticker-guide" className="font-semibold text-violet-700 underline underline-offset-2">查看完整教學</Link>
      </p>
    </nav>
  );
}
