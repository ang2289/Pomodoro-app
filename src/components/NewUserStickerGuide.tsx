import { Link } from "react-router-dom";
import { StickerExistingMotherSheetShortcut, StickerCustomInquiry, StickerNextActionHint } from "@/components/StickerBeginnerActions";

/**
 * 新手看得懂的一條路：先選題 → AI 生圖 → 上傳母圖 → 自動切割 → 下載。
 * 這裡只做導覽，既有貼圖專案暫存、切圖、去背與匯出邏輯不變。
 */
const steps = [
  {
    number: 1,
    title: "選主題、靜態或動態",
    description: "先選花店、飲料店、日常聊天等主題，以及要做幾張。",
    action: "第 1 步｜選擇主題",
    href: "/tools/sticker-prompt#sticker-start",
  },
  {
    number: 2,
    title: "貼到 Google Gemini 畫圖",
    description: "在第 2 步按「複製」，開啟 Google Gemini 貼上指令，請 AI 畫出一張完整的大圖。",
    action: "第 2 步｜複製畫圖指令",
    href: "/tools/sticker-prompt#sticker-copy",
  },
  {
    number: 3,
    title: "下載大圖，再傳回 RXV",
    description: "把 AI 畫好的圖片存到手機或電腦，上傳到本站即可，不用手動切成小圖。",
    action: "第 3 步｜上傳母圖",
    href: "/tools/line-sticker#mother-upload",
  },
  {
    number: 4,
    title: "確認格數，自動切割",
    description: "工具幫你分割、去白底、調整尺寸。記得檢查文字和角色沒有被切到。",
    action: "第 4 步｜確認切割",
    href: "/tools/line-sticker#mother-split",
  },
  {
    number: 5,
    title: "下載 ZIP，或接著做動態",
    description: "靜態貼圖下載 ZIP；動態貼圖再選動畫效果與輸出。上架前仍要檢查平台規格。",
    action: "第 5 步｜下載貼圖",
    href: "/tools/line-sticker#sticker-download",
  },
] as const;

type Props = { compact?: boolean };

export default function NewUserStickerGuide({ compact = false }: Props) {
  return (
    <section
      aria-labelledby="rxv-sticker-new-user-title"
      className="mb-6 rounded-3xl border border-sky-200 bg-white p-4 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800">第一次使用先看這裡</span>
        <span className="text-xs font-semibold text-slate-500">LINE／WhatsApp・靜態／動態</span>
      </div>
      <h2 id="rxv-sticker-new-user-title" className="mt-3 text-xl font-black leading-snug text-slate-900 sm:text-2xl">
        不會畫圖也可以：先畫一張大圖，再自動切成貼圖
      </h2>
      <p className="mt-2 text-sm leading-7 text-slate-700">
        RXV 不是直接替你畫圖：先用本站準備「給 AI 的畫圖指令」，以 Google Gemini 畫好一張貼圖大圖，
        再把圖片傳回 RXV 自動切割、整理與下載。
      </p>
      <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-sky-50 p-3 sm:flex-row sm:justify-center sm:p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-20 w-20 shrink-0 grid-cols-4 gap-1 rounded-lg border border-sky-200 bg-white p-2" aria-hidden="true">
            {Array.from({ length: 16 }, (_, index) => (
              <span key={index} className="rounded bg-sky-200" />
            ))}
          </div>
          <div className="max-w-32 text-sm font-bold text-slate-800">
            一張大圖（母圖）
            <p className="mt-1 text-xs font-normal text-slate-600">像 4×4 表格，有 16 個小畫面</p>
          </div>
        </div>
        <span className="text-xl font-black text-sky-700" aria-hidden="true">→</span>
        <div className="flex items-center gap-3">
          <div className="flex h-20 w-20 shrink-0 flex-wrap content-center justify-center gap-1 rounded-lg border border-emerald-200 bg-white p-2" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} className="h-6 w-6 rounded border border-emerald-300 bg-emerald-100" />
            ))}
          </div>
          <div className="max-w-36 text-sm font-bold text-slate-800">
            自動分成 16 張
            <p className="mt-1 text-xs font-normal text-slate-600">每格成為一張獨立貼圖</p>
          </div>
        </div>
      </div>
      <div className={`mt-4 grid gap-2 ${compact ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-5"}`}>
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-700 text-sm font-black text-white">{step.number}</span>
              <p className="text-sm font-black leading-5 text-slate-900">{step.title}</p>
            </div>
            <p className="mt-2 flex-1 text-xs leading-6 text-slate-600">{step.description}</p>
            <Link
              to={step.href}
              className="mt-3 inline-flex min-h-11 w-fit items-center justify-center rounded-xl border border-sky-200 bg-white px-3 py-2 text-xs font-black text-sky-800 transition hover:border-sky-400 hover:bg-sky-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-700"
              aria-label={step.action}
            >
              {step.action} →
            </Link>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <StickerNextActionHint>還沒有圖片，就按「第 1 步｜我還沒有圖片」，從選主題開始。</StickerNextActionHint>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Link to="/tools/sticker-prompt#sticker-start" className="inline-flex min-h-11 items-center rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-black !text-white hover:bg-sky-800">
          第 1 步｜我還沒有圖片
        </Link>
        <Link to="/tools/line-sticker?existing=1#mother-upload" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-100">
          第 3 步｜我已有圖片
        </Link>
        <Link to="/tools/line-sticker-guide" className="inline-flex min-h-11 items-center px-2 py-2 text-sm font-bold text-sky-800 underline underline-offset-4">
          查看完整圖文說明
        </Link>
      </div>
      <div className="mt-4"><StickerExistingMotherSheetShortcut compact /></div>
      <div className="mt-3"><StickerCustomInquiry compact /></div>
      <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs leading-6 text-emerald-900">
        生圖請到 Google Gemini（建議先用）或 ChatGPT；Google「搜尋」不會自動產圖。第 2 步會提供複製按鈕與前往 Gemini 的連結。
      </p>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        WhatsApp ZIP 需要搭配支援的貼圖 APP 匯入；LINE 上架仍須由 LINE Creators Market 審核。
      </p>
    </section>
  );
}
