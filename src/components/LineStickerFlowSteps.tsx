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
  const steps = [
    ...BASE_STEPS,
    {
      step: 5 as const,
      title: mode === "animated" ? "製作動態貼圖" : "下載完成",
      desc: mode === "animated" ? "自動套動畫並打包" : "下載 LINE 上架檔案",
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
          目前做到哪一步會自動標示，不需要記工具名稱。
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {steps.map((item) => {
          const active = item.step === activeStep;
          const done = item.step < activeStep;
          return (
            <div
              key={item.step}
              className={`rounded-2xl border p-3 transition ${
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
                <span className="min-w-[5.5rem] flex-1 whitespace-normal break-keep text-xs font-black leading-5 text-slate-900">{item.title}</span>
              </div>
              <p className="mt-2 min-w-0 break-words text-[11px] leading-5 text-slate-500">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
