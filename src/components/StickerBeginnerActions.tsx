import { Link } from "react-router-dom";
import type { ReactNode } from "react";

/** 新手主流程：已有母圖可直接上傳；需要協助可私訊，不呈現價目表。 */
export function StickerExistingMotherSheetShortcut({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white ${compact ? "p-3" : "p-4"}`}>
      <p className="text-sm font-semibold text-slate-900">已經有貼圖大圖？不用再產生提示詞！</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">例如一張有 8 格、16 格或 20 格角色的完整大圖，直接傳到第 3 步。RXV 會協助辨識格數、切割與去背。</p>
      <p className="mt-2 text-xs font-medium text-slate-600">下一步請按下方「第 3 步｜我已有母圖，直接上傳」按鈕。</p>
      <Link
        to="/tools/line-sticker?existing=1#mother-upload"
        className="mt-2 inline-flex min-h-11 w-fit max-w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-center text-sm font-semibold text-violet-800 hover:border-violet-500"
      >
        第 3 步｜我已有母圖，直接上傳 →
      </Link>
    </div>
  );
}

export function StickerCustomInquiry({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`rounded-xl border border-slate-200 bg-white ${compact ? "p-3" : "p-4"}`} aria-label="客製貼圖私訊詢問">
      <h3 className="text-base font-semibold text-slate-900">想製作自己的專屬角色或店家貼圖？</h3>
      <p className="mt-1 text-sm leading-6 text-slate-700">可以私訊詢問客製貼圖。請告訴我們用途、預計張數（8／16／24 等）、靜態或動態，以及喜歡的風格；有參考圖片也可以一起傳。</p>
      <p className="mt-2 text-xs font-medium text-slate-600">下一步請按下方「到 Facebook 私訊」或「用 LINE 私訊」按鈕。</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <a
          href="https://www.facebook.com/profile.php?id=61588964893446"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-4 py-2 text-sm font-black !text-white hover:bg-blue-800"
        >到 Facebook 私訊 ↗</a>
        <a
          href="https://line.me/ti/p/~angelchen2289"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-black !text-white hover:bg-emerald-800"
        >用 LINE 私訊 ↗</a>
      </div>
      <p className="mt-2 text-xs leading-5 text-slate-600">Facebook 連結會開啟 RXV 專頁，請再點「傳送訊息」；以上是詢問入口，不需先付款或註冊本站。</p>
    </section>
  );
}

export function StickerNextActionHint({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs font-medium leading-6 text-slate-600">下一步：{children}</p>;
}

/** 兩個 AI 生圖入口同時提供：ChatGPT 是已實際使用的流程，Gemini 為可選方案。 */
export function StickerAIProviderLinks({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      <p className="mb-2 text-xs font-medium leading-6 text-slate-600">推薦新手使用已實測的 ChatGPT。Google Gemini 為實驗性選項：測試曾出現欄數錯誤、重複文字，不建議直接拿來批次上架。</p>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href="https://chatgpt.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 w-fit max-w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-2.5 text-center text-sm font-black !text-white hover:bg-emerald-800"
        >開啟 ChatGPT 畫圖 ↗</a>
        <a
          href="https://gemini.google.com/app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 w-fit max-w-full items-center justify-center rounded-xl border border-blue-300 bg-white px-4 py-2.5 text-center text-sm font-black text-blue-800 hover:bg-blue-50"
        >開啟 Google Gemini 畫圖（實驗性）↗</a>
      </div>
      {!compact && <p className="mt-2 text-xs leading-6 text-slate-600">先複製 RXV 的畫圖指令，再到所選 AI 貼上。Gemini 可試「複製 Gemini 排版強化版」，但加長指令也不能保證正確。若欄數、列數、文字、人物或留白不符，請改用 ChatGPT 重畫，不要直接切圖。各服務額度依平台規定。</p>}
    </div>
  );
}
