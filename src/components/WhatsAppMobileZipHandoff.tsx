import { useState } from "react";

/** Web Share -> Android ACTION_SEND -> RxV APP, never claims ZIP can install directly in WhatsApp. */
export type WhatsAppZipArchive = { blob: Blob; filename: string };

export function isAndroidPhone(): boolean {
  return typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent) &&
    /Mobile/i.test(navigator.userAgent);
}

export function WhatsAppMobileZipHandoff({ archive }: { archive: WhatsAppZipArchive | null }) {
  const [status, setStatus] = useState("");
  if (!isAndroidPhone()) return null;

  const file = archive ? new File([archive.blob], archive.filename, { type: "application/zip" }) : null;
  const canShareFile = !!file && typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" && navigator.canShare({ files: [file] });

  async function handOffZip() {
    if (!file || !canShareFile) return;
    try {
      // This must run directly from the button's user gesture.
      await navigator.share({ files: [file], title: "RxV WhatsApp 貼圖 ZIP" });
      setStatus("已開啟系統分享。請選「RxV 貼圖工廠」；在 APP 中確認貼圖包後再加入 WhatsApp。");
    } catch (error) {
      if ((error as DOMException)?.name === "AbortError") {
        setStatus("已取消分享。ZIP 仍可下載，稍後由 RXV APP 選取。");
      } else {
        setStatus("手機無法分享 ZIP，請先下載 ZIP，再於 RXV 貼圖工廠 APP 的「WA 匯入」選擇 ZIP。");
      }
    }
  }

  return (
    <section className="mt-4 rounded-2xl border-2 border-violet-300 bg-violet-50 p-4" aria-label="手機匯入 WhatsApp 貼圖">
      <h3 className="text-base font-black text-violet-950">Android 手機｜整組匯入 WhatsApp</h3>
      <p className="mt-2 text-sm leading-6 text-slate-800">
        先產生 WhatsApp WebP ZIP。手機可分享到已安裝的「RxV 貼圖工廠」APP，由 APP 檢查後逐組加入 WhatsApp。
      </p>
      {canShareFile ? (
        <button type="button" onClick={handOffZip}
          className="mt-3 min-h-12 w-full rounded-xl bg-violet-700 px-4 py-3 text-sm font-black text-white hover:bg-violet-800">
          將這份 ZIP 分享到 RXV 貼圖工廠
        </button>
      ) : (
        <p role="status" className="mt-3 rounded-xl bg-white p-3 text-sm font-bold leading-6 text-violet-900">
          {archive ? "此瀏覽器無法直接分享 ZIP；請下載 ZIP，再從 RXV APP 的「WA 匯入」選檔。" : "完成 WhatsApp ZIP 下載後，這裡會顯示手機匯入按鈕。"}
        </p>
      )}
      <p className="mt-2 text-xs leading-5 text-slate-700">
        需更新支援分享接收的 RXV Android APP；網站無法直接把 ZIP 安裝至 WhatsApp，最終需由 WhatsApp 確認加入。
      </p>
      {status && <p role="status" className="mt-2 rounded-xl bg-white p-3 text-xs font-bold leading-5 text-violet-900">{status}</p>}
    </section>
  );
}
