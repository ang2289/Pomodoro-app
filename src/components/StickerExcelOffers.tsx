import { useState } from "react";

export const FREE_STICKER_EXCEL_PATH = "/downloads/RXV_LINE_Sticker_Prompts_Free_100.xlsx";
export const STICKER_SALES_EMAIL = "rxv0227@gmail.com";
export const STICKER_SALES_FACEBOOK = "https://www.facebook.com/profile.php?id=61588964893446";
export const STICKER_SALES_SUBJECT = "詢問購買 RXV 多職業 LINE 貼圖 AI 提示詞模板｜NT$160";
export const STICKER_SALES_BODY = [
  "您好，我想購買 RXV 多職業 LINE 貼圖 AI 提示詞模板商用實戰版。",
  "",
  "商品價格：NT$160",
  "",
  "請提供購買及匯款方式，謝謝。",
].join("\n");
export const STICKER_SALES_MAILTO = `mailto:${STICKER_SALES_EMAIL}?subject=${encodeURIComponent(STICKER_SALES_SUBJECT)}&body=${encodeURIComponent(STICKER_SALES_BODY)}`;

/**
 * No sales ZIP, payment or signed download link is embedded in this component.
 * Paid orders are manually checked and delivered after confirmation.
 */
export default function StickerExcelOffers({ compact = false }: { compact?: boolean }) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function copyOrderEmail() {
    try {
      await navigator.clipboard.writeText(STICKER_SALES_EMAIL);
      setCopyStatus("copied");
    } catch {
      // On insecure origins / browsers with clipboard blocked, select a readonly
      // input as a legacy fallback. In all cases the visible address remains usable.
      try {
        const input = document.createElement("input");
        input.value = STICKER_SALES_EMAIL;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(input);
        setCopyStatus(successful ? "copied" : "failed");
      } catch {
        setCopyStatus("failed");
      }
    }
  }

  return (
    <section id="rxv-sticker-excel-download" aria-label="LINE 貼圖 Excel 免費下載與進階訂購"
      className={compact ? "mt-7 scroll-mt-24 rounded-3xl border border-violet-100 bg-white p-4 sm:p-5" : "scroll-mt-24 rounded-3xl border border-violet-100 bg-white p-5 sm:p-7"}>
      <div className="mb-4">
        <p className="text-xs font-bold text-violet-700">RXV LINE 貼圖 AI 提示詞模板</p>
        <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">免費 100 組 Excel・133 種職業進階版</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">不需登入即可下載免費 Excel，想製作店家及職業專屬貼圖，也可以洽詢商用實戰版。兩種選擇都不影響免費貼圖工具。</p>
      </div>
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
        <article className="flex flex-col rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5">
          <p className="text-xs font-bold text-emerald-800">免費入門版</p>
          <h3 className="mt-2 text-lg font-black text-slate-900">免費 100 組 LINE 貼圖 AI 提示詞</h3>
          <p className="mt-2 text-3xl font-black text-emerald-700">NT$0</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            RXV LINE 貼圖 AI 提示詞模板｜免費 100 組入門版。包含 100 組日常主題、
            4×4（16 格）完整生圖提示詞、對應短句、角色動作建議及新手操作說明。
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-600">免費資料與進階職業情境分開提供，不需 Email、登入或登記。</p>
          <a
            href={FREE_STICKER_EXCEL_PATH}
            download="RXV_LINE_Sticker_Prompts_Free_100.xlsx"
            className="mt-auto inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-black !text-white hover:bg-emerald-800"
            aria-label="免費下載 100 組 Excel"
          >免費下載 Excel（100 組）</a>
          <p className="mt-2 text-xs leading-5 text-emerald-900">下載後可使用 Microsoft Excel 或相容試算表開啟，手機也可以下載保存。</p>
        </article>
        <article className="flex flex-col rounded-2xl border border-violet-200 bg-violet-50/70 p-4 sm:p-5">
          <p className="text-xs font-bold text-violet-800">多職業商用進階版</p>
          <h3 className="mt-2 text-lg font-black text-slate-900">133 種職業 × 10 種情境</h3>
          <p className="mt-1 text-2xl font-black text-violet-800">1,330 組</p>
          <p className="mt-1 text-3xl font-black text-slate-900">NT$160</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">
            RXV 多職業 LINE 貼圖 AI 提示詞模板｜商用實戰版。包含 Excel 模板、
            進階生圖提示詞、多職業企劃、使用教學及授權說明。適合店家客服、個人品牌、
            貼圖創作者與接案者。
          </p>
          <div className="mt-auto space-y-2 pt-4">
            <a href={STICKER_SALES_FACEBOOK} target="_blank" rel="noopener noreferrer"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-center text-sm font-black !text-white hover:bg-blue-800">
              Messenger 私訊訂購｜NT$160
            </a>
            <a href={STICKER_SALES_MAILTO}
              className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-violet-400 bg-white px-4 py-3 text-center text-sm font-black text-violet-900 hover:bg-violet-100">
              Email 詢問訂購
            </a>
            <button type="button" onClick={copyOrderEmail}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
              {copyStatus === "copied" ? "已複製聯絡 Email" : "複製聯絡 Email"}
            </button>
            <p role="status" aria-live="polite" className="text-center text-xs leading-5 text-slate-600">
              {copyStatus === "failed" ? "瀏覽器無法自動複製，請手動複製下方信箱：" : ""}
              <span className="ml-1 select-all break-all font-semibold">{STICKER_SALES_EMAIL}</span>
            </p>
          </div>
        </article>
      </div>
      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-sm font-black text-slate-900">進階版人工訂購流程</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-6 text-slate-700">
          <li>選擇 Messenger 或 Email 詢問。</li>
          <li>RXV 人工回覆訂購及匯款資訊。</li>
          <li>客戶完成匯款。</li>
          <li>RXV 確認款項。</li>
          <li>人工寄送完整 ZIP 商品檔案。</li>
        </ol>
        <p className="mt-2 text-xs font-bold leading-6 text-amber-950">
          本商品採人工確認訂購與匯款，確認收款後提供完整檔案。非自動付款、非即時下載。
        </p>
      </div>
    </section>
  );
}
