import { useEffect, useRef, useState } from "react";
import { getMotherSheetPlan, type LineStickerCount } from "@/lib/lineStickerFlow";

/**
 * TUTU 母圖圖解：同一張花店 4×4 教學圖用於第 1 與第 3 步。
 * 圖檔由本機 QA 工具安裝至 public/images/tutu-mother-sheet-guide-16.webp。
 * 圖檔未載入時，顯示版型示意而不是空白圖片。
 */
const GUIDE_IMAGE = "/images/tutu-mother-sheet-guide-16.webp";

type StickerMotherSheetExampleProps = {
  count?: LineStickerCount;
  variant?: "intro" | "upload";
};

export default function StickerMotherSheetExample({
  count = 16,
  variant = "intro",
}: StickerMotherSheetExampleProps) {
  const imageTriggerRef = useRef<HTMLButtonElement>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const closeImage = () => {
    setIsImageOpen(false);
    // Return keyboard focus to the thumbnail after closing.
    requestAnimationFrame(() => imageTriggerRef.current?.focus());
  };

  useEffect(() => {
    if (!isImageOpen) return;
    modalCloseRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsImageOpen(false);
        requestAnimationFrame(() => imageTriggerRef.current?.focus());
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isImageOpen]);
  const plan = getMotherSheetPlan(count);
  const isUpload = variant === "upload";
  const planText = plan
    .map((part, i) => `第 ${i + 1} 張 ${part.grid.replace("x", "×")}（${part.count} 格）`)
    .join("＋");

  return (
    <section
      aria-label="LINE 貼圖整張母圖示範"
      className="mb-5 rounded-2xl border-2 border-sky-200 bg-sky-50 p-4 shadow-sm sm:p-5"
    >
      <h2 className="text-xl font-black leading-8 text-sky-950">
        {isUpload ? "上傳前先看｜什麼是整張母圖？" : "先看範例｜AI 會畫出什麼樣的母圖？"}
      </h2>
      <p className="mt-2 text-base font-bold leading-7 text-slate-800">
        母圖就是「一張大圖片，裡面排列好多格貼圖」，<strong>不是單獨一張人物照片。</strong>
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,220px)_1fr] md:items-start">
        <div className="rounded-xl border border-sky-200 bg-white p-2">
          {imageFailed ? (
            <div className="grid aspect-[4/5] grid-cols-4 gap-1 rounded-lg bg-slate-100 p-3" aria-label="16 格母圖版型示意">
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="flex items-center justify-center rounded border border-sky-100 bg-white text-sm font-bold text-slate-600">
                  {i + 1}
                </div>
              ))}
            </div>
          ) : (
            <button
              type="button"
              ref={imageTriggerRef}
              onClick={() => setIsImageOpen(true)}
              className="block w-full rounded-lg focus-visible:outline focus-visible:outline-4 focus-visible:outline-sky-500"
              aria-label="放大花店 16 格母圖教學示範"
            >
              <img src={GUIDE_IMAGE} alt="花店 4×4 LINE 貼圖母圖示範：16 格人物與文字排列在同一張大圖，請整張上傳，系統自動切圖"
                loading={isUpload ? "eager" : "lazy"}
                onError={() => setImageFailed(true)}
                className="mx-auto h-auto w-full rounded-md object-contain" />
              <span className="mt-2 block text-center text-sm font-black text-sky-700">點圖片可放大查看</span>
            </button>
          )}
          <p className="mt-2 text-center text-sm font-bold text-slate-700">花店母圖範例｜4×4，共 16 格</p>
        </div>
        <div className="space-y-3">
          <p className="rounded-xl bg-white px-4 py-3 text-base font-bold leading-7 text-slate-900">
            {isUpload ? "下一步：找到 AI 畫好的完整大圖，按下方紫色「選擇整張母圖」。" : "第 1 步選好主題與文字 → 第 2 步複製指令到 ChatGPT／Gemini 產生整張母圖。"}
          </p>
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-base font-black leading-7 text-rose-800">
            請保留整張母圖，不要先自己切成單張！
          </p>
          <p className="text-base font-bold leading-7 text-sky-950">
            你目前選 {count} 張貼圖，需要 {plan.length} 張母圖：
          </p>
          <p className="rounded-xl border border-sky-200 bg-white px-4 py-3 text-base font-black leading-7 text-sky-900">
            {planText}
          </p>
          {plan.length > 1 ? (
            <p className="text-base font-bold leading-7 text-amber-900">
              注意：要下載 {plan.length} 張完整母圖，再一起上傳；不要把不同母圖自行拼在同一張圖片。
            </p>
          ) : (
            <p className="text-base leading-7 text-slate-700">
              這張示範圖是 16 張版本；其他張數仍依上方顯示的格數產圖。完成後網站會自動切圖。
            </p>
          )}
        </div>
      </div>

      {isImageOpen && !imageFailed ? (
        <div
          role="presentation"
          onClick={(event) => { if (event.target === event.currentTarget) closeImage(); }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 p-3 sm:p-5"
        >
          <div role="dialog" aria-modal="true" aria-label="花店母圖教學圖片放大檢視"
            className="flex max-h-[94dvh] w-full max-w-[980px] flex-col overflow-hidden rounded-2xl bg-white p-3 shadow-2xl sm:p-4">
            <div className="mb-3 flex shrink-0 items-center justify-between gap-3">
              <p className="text-base font-black text-slate-900">花店 4×4 母圖示範</p>
              <button ref={modalCloseRef} type="button" onClick={closeImage}
                className="min-h-12 shrink-0 rounded-xl bg-blue-700 px-5 py-2 text-base font-black text-white hover:bg-blue-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-blue-300">
                關閉圖片 ×
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto">
              <img src={GUIDE_IMAGE}
                alt="完整母圖教學：AI 先畫整張母圖，回本站上傳，系統自動切成 16 張並匯出 ZIP"
                className="mx-auto block max-h-[calc(94dvh-6rem)] max-w-full object-contain"
                onError={() => { setImageFailed(true); setIsImageOpen(false); }} />
            </div>
            <p className="mt-2 shrink-0 text-center text-sm font-bold text-slate-700">按右上角「關閉圖片」、Esc，或點圖片外側即可返回操作</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
