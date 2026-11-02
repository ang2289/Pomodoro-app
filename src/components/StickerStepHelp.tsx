import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { LineStickerMode, LineStickerStage } from "@/lib/lineStickerFlow";

const DISABLED_KEY = "tutu_sticker_help_disable_auto_v1";
const seenKey = (step: number) => `tutu_sticker_help_seen_v1_${step}`;

type Props = {
  activeStep: LineStickerStage;
  mode: LineStickerMode;
};

type Guide = {
  title: string;
  summary: string;
  actions: string[];
  caution: string;
  button: string;
  path: string;
};

function guideFor(step: LineStickerStage, mode: LineStickerMode): Guide {
  switch (step) {
    case 1:
      return {
        title: "選主題、張數與貼圖類型",
        summary: "第一次做貼圖，先選好要做什麼；其他設定可以保留預設值。",
        actions: [
          "點「我還沒有母圖」開始，選 LINE 或 WhatsApp。",
          "選靜態／動態和 8、16 或更多張數，再選一個貼圖主題。",
          "新手可直接使用「簡易大主題（推薦）」，不用先填髮型、服裝和人物細節。",
        ],
        caution: "動態貼圖也要先畫一張靜態母圖，動畫會在後面製作。",
        button: "前往第 1 步｜選主題",
        path: "/tools/sticker-prompt#sticker-start",
      };
    case 2:
      return {
        title: "複製指令到 AI，畫完整母圖",
        summary: "這一步不需要懂程式；到 ChatGPT 畫圖，再把整張圖存下來。",
        actions: [
          "在第 2 步按「複製 ChatGPT 指令」。",
          "另開 ChatGPT 對話，把指令貼上並送出；真人或寵物貼圖請同時附上授權參考照片。",
          "等 AI 畫好「整張 4×4／4×2 母圖」，先檢查文字和格子，再下載完整圖片。",
        ],
        caution: "不要先把每格剪開；也不要只複製指令文字當成已完成圖片。24 張以上可能要畫多張母圖。",
        button: "前往第 2 步｜複製 AI 指令",
        path: "/tools/sticker-prompt#sticker-copy",
      };
    case 3:
      return {
        title: "把 AI 畫好的完整母圖上傳",
        summary: "回到本站，直接選擇剛才下載的「整張」貼圖大圖。",
        actions: [
          "按「選擇整張母圖並辨識格數」。",
          "從手機相簿或電腦下載資料夾選取剛存的 PNG／JPG／WebP；需要兩張母圖時一起選。",
          "查看「母圖辨識結果」，確認 4×4 是 16 格、4×2 是 8 格，和原本選的張數一致。",
        ],
        caution: "如果網站提示有圖案跨格或碰到分隔線，請按彈出的修圖教學回 AI 修改，再重新上傳；不要硬切。",
        button: "前往第 3 步｜上傳母圖",
        path: "/tools/line-sticker?existing=1#mother-upload",
      };
    case 4:
      return {
        title: "安全切圖並檢查每張貼圖",
        summary: "網站會自動分割母圖、去白底和整理尺寸。",
        actions: [
          "先確認母圖格數正確，並檢查有沒有紅色的安全留白警示。",
          "通過檢查後按「確認格數，開始自動切圖」。",
          "往下逐張預覽，看看人物、繁體中文和手腳有沒有被切掉；必要時調整放大比例。",
        ],
        caution: "如果出現紅色修正視窗，先處理母圖再上傳；不能靠強行切割修復已跨格的內容。",
        button: "回第 4 步｜檢查切圖",
        path: "/tools/line-sticker?flow=1#mother-split",
      };
    case 5:
      return {
        title: mode === "animated" ? "產生動態貼圖 ZIP" : "下載靜態貼圖 ZIP",
        summary: mode === "animated"
          ? "先檢查動畫預覽，再產生 LINE APNG 或 WhatsApp WebP 素材 ZIP。"
          : "確認每張預覽正確後，下載對應平台的貼圖 ZIP。",
        actions: mode === "animated"
          ? [
              "確認已載入全部貼圖，選擇 LINE 或 WhatsApp。",
              "先看動畫預覽與輸出尺寸，再按最後一步的「產生並下載動態 ZIP」。",
              "下載後確認 ZIP 內的每張動畫、主圖和標籤圖；再依平台要求上架。",
            ]
          : [
              "在第 5 步檢查平台、貼圖數量，以及每張文字、人物是否完整。",
              "選好主圖後，按「下載靜態 ZIP」。",
              "解壓或檢查 ZIP 內容，再到 LINE Creators Market 等對應平台自行上架。",
            ],
        caution: "網站下載 ZIP 不等於已經上架；送審前仍需自行確認平台規格和內容。",
        button: mode === "animated" ? "前往第 5 步｜動態 ZIP" : "前往第 5 步｜下載 ZIP",
        path: mode === "animated" ? "/tools/animated-line-sticker#animated-sticker-batch" : "/tools/line-sticker#sticker-download",
      };
  }
}

export default function StickerStepHelp({ activeStep, mode }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleStep, setVisibleStep] = useState<LineStickerStage>(activeStep);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const seenThisMount = useRef<Set<number>>(new Set());

  useEffect(() => {
    setVisibleStep(activeStep);
    let disabled = false;
    let seen = false;
    try {
      disabled = window.localStorage.getItem(DISABLED_KEY) === "1";
      seen = window.localStorage.getItem(seenKey(activeStep)) === "1";
    } catch {
      // Storage may be disabled. Keep one-popup-per-step behavior within this page.
    }
    if (!disabled && !seen && !seenThisMount.current.has(activeStep)) {
      setIsOpen(true);
    }
  }, [activeStep]);

  const markSeen = () => {
    seenThisMount.current.add(activeStep);
    try {
      window.localStorage.setItem(seenKey(activeStep), "1");
    } catch { /* Browsers may block local storage. */ }
  };

  const close = () => {
    markSeen();
    setIsOpen(false);
  };

  const disableAuto = () => {
    markSeen();
    try {
      window.localStorage.setItem(DISABLED_KEY, "1");
    } catch { /* Keep the current dialog dismissible. */ }
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        // Keep keyboard users inside the instructional dialog.
        const nodes = document.querySelectorAll<HTMLElement>(
          '[data-sticker-help-dialog] button, [data-sticker-help-dialog] a[href]'
        );
        const focusable = Array.from(nodes).filter((node) => !node.hasAttribute("disabled"));
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, activeStep]);

  const guide = guideFor(visibleStep, mode);

  return (
    <>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => {
          setVisibleStep(activeStep);
          setIsOpen(true);
        }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-300 bg-white px-4 py-2.5 text-sm font-black text-violet-800 hover:bg-violet-50">
          ？ 不會操作｜看這一步教學
        </button>
        <span className="text-xs font-semibold text-slate-600">第一次到各步驟會教一次；不需要時可關閉。</span>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[190] flex items-center justify-center bg-slate-950/70 p-3 sm:p-5" role="presentation">
          <section data-sticker-help-dialog role="dialog" aria-modal="true"
            aria-labelledby="sticker-step-help-title" aria-describedby="sticker-step-help-summary"
            className="w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl border-2 border-violet-200 bg-white p-4 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-violet-700">新手操作教學｜第 {visibleStep}／5 步</p>
                <h2 id="sticker-step-help-title" className="mt-1 text-xl font-black leading-snug text-slate-900">
                  {guide.title}
                </h2>
              </div>
              <button ref={closeButtonRef} type="button" onClick={close} aria-label="關閉操作教學"
                className="min-h-11 min-w-11 shrink-0 rounded-xl bg-slate-100 px-3 text-xl font-black text-slate-700 hover:bg-slate-200">
                ×
              </button>
            </div>

            <p id="sticker-step-help-summary" className="mt-3 text-sm font-bold leading-7 text-slate-700">{guide.summary}</p>

            <div className="mt-4 grid grid-cols-5 gap-1.5" aria-label="切換五步驟教學">
              {([1, 2, 3, 4, 5] as LineStickerStage[]).map((step) => (
                <button key={step} type="button" onClick={() => setVisibleStep(step)}
                  aria-label={`查看第 ${step} 步教學`} aria-pressed={visibleStep === step}
                  className={`min-h-11 rounded-xl border-2 text-sm font-black ${visibleStep === step
                    ? "border-violet-700 bg-violet-700 !text-white"
                    : "border-violet-200 bg-violet-50 text-violet-800"}`}>
                  {step}
                </button>
              ))}
            </div>

            <ol className="mt-4 space-y-3">
              {guide.actions.map((action, index) => (
                <li key={index} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-7 text-slate-800">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-800">{index + 1}</span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold leading-6 text-amber-900">
              注意：{guide.caution}
            </p>

            <div className="mt-4 grid gap-2">
              <Link to={guide.path} onClick={close}
                className="flex min-h-12 items-center justify-center rounded-xl bg-violet-700 px-4 py-3 text-center text-base font-black !text-white hover:bg-violet-800">
                {guide.button}
              </Link>
              <button type="button" onClick={close}
                className="min-h-11 rounded-xl border border-violet-300 bg-white px-4 py-2 text-sm font-black text-violet-800 hover:bg-violet-50">
                我知道了｜繼續操作
              </button>
              <button type="button" onClick={disableAuto}
                className="min-h-11 rounded-xl px-4 py-2 text-xs font-bold text-slate-600 underline hover:bg-slate-50">
                不要再自動顯示教學（仍可按「？ 不會操作」）
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
