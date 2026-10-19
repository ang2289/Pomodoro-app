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
    title: "用 ChatGPT／Gemini 畫圖",
    description: "第 2 步先按「複製」，再開啟 ChatGPT 或 Google Gemini 貼上指令，畫出一張完整大圖。",
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
        RXV 不是直接替你畫圖：先用本站準備「給 AI 的畫圖指令」，再用 ChatGPT 或 Google Gemini 畫好一張貼圖大圖，
        再把圖片傳回 RXV 自動切割、整理與下載。
      </p>
      {/* Each diagram card receives a real width. Avoid shrinking the label to a one-character
          column when this guide is placed inside the /tools layout or on a narrow device. */}
      <div
        aria-label="一張完整 4×4 母圖，透過工具切割成 16 張貼圖"
        className="mt-4 grid w-full min-w-0 grid-cols-1 items-center justify-items-stretch gap-3 overflow-hidden rounded-2xl bg-sky-50 p-3 sm:p-4 lg:grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)]"
      >
        <div className="grid w-full min-w-0 grid-cols-[68px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-sky-100 bg-white p-3 sm:grid-cols-[80px_minmax(0,1fr)]">
          <div className="grid h-[68px] w-[68px] shrink-0 grid-cols-4 gap-1 rounded-lg border border-sky-200 bg-sky-50 p-2 sm:h-20 sm:w-20" aria-hidden="true">
            {Array.from({ length: 16 }, (_, index) => (
              <span key={index} className="rounded bg-sky-200" />
            ))}
          </div>
          <div className="min-w-0 w-full text-left">
            <p className="whitespace-normal break-normal text-sm font-black leading-6 text-slate-900">一張大圖（母圖）</p>
            <p className="mt-1 whitespace-normal break-normal text-xs leading-5 text-slate-600">像 4×4 表格，有 16 個小畫面</p>
          </div>
        </div>
        <span className="justify-self-center rotate-90 text-2xl font-black leading-none text-sky-700 lg:rotate-0" aria-hidden="true">→</span>
        <div className="grid w-full min-w-0 grid-cols-[68px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-emerald-100 bg-white p-3 sm:grid-cols-[80px_minmax(0,1fr)]">
          <div className="grid h-[68px] w-[68px] shrink-0 grid-cols-2 content-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 p-2 sm:h-20 sm:w-20" aria-hidden="true">
            {Array.from({ length: 4 }, (_, index) => (
              <span key={index} className="aspect-square rounded border border-emerald-300 bg-emerald-100" />
            ))}
          </div>
          <div className="min-w-0 w-full text-left">
            <p className="whitespace-normal break-normal text-sm font-black leading-6 text-slate-900">自動分成 16 張</p>
            <p className="mt-1 whitespace-normal break-normal text-xs leading-5 text-slate-600">每格成為一張獨立貼圖</p>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {steps.map((step) => (
          <div key={step.number} className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-700 text-sm font-black text-white">{step.number}</span>
              <p className="text-sm font-black leading-5 text-slate-900">{step.title}</p>
            </div>
            <p className="mt-2 flex-1 text-xs leading-6 text-slate-600">{step.description}</p>
            <p className="mt-2 text-[11px] font-bold leading-5 text-sky-900">下一步請按：「{step.action}」</p>
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
        ChatGPT 是目前已有實際操作的生圖方式，Google Gemini 也是可選工具。第 2 步有複製指令及兩個生圖平台入口；Google「搜尋」不是 Gemini。
      </p>
      <p className="mt-3 text-xs leading-5 text-slate-500">
        WhatsApp ZIP 需要搭配支援的貼圖 APP 匯入；LINE 上架仍須由 LINE Creators Market 審核。
      </p>
    </section>
  );
}
