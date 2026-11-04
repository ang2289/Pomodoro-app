import { useRef, useState } from "react";
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
  const modalRef = useRef<HTMLDialogElement>(null);
  const [imageFailed, setImageFailed] = useState(false);
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
              onClick={() => modalRef.current?.showModal()}
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

      {!imageFailed ? (
        <dialog ref={modalRef}
          onClick={(event) => { if (event.target === modalRef.current) modalRef.current?.close(); }}
          className="w-[min(96vw,950px)] max-h-[94vh] rounded-2xl border border-slate-300 bg-white p-3 shadow-2xl backdrop:bg-slate-900/70"
          aria-label="母圖教學圖片放大檢視">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-base font-black text-slate-900">花店 4×4 母圖示範</p>
            <form method="dialog"><button type="submit" className="rounded-xl bg-blue-700 px-4 py-2 text-base font-black text-white">關閉圖片</button></form>
          </div>
          <div className="max-h-[82vh] overflow-y-auto">
            <img src={GUIDE_IMAGE} alt="完整母圖教學：AI 畫出一張大圖，回本網站上傳，系統自動切成 16 張並匯出 ZIP"
              className="mx-auto h-auto w-full object-contain" />
          </div>
        </dialog>
      ) : null}
    </section>
  );
}
