import { useEffect, useRef, useState } from "react";
import { buildMotherSheetWhitespaceRetryPrompt } from "@/lib/stickerMotherSheetWhitespace";
import type { LineStickerMode, MotherSheetGrid } from "@/lib/lineStickerFlow";

export type MotherSheetRepairIssue = {
  kind: "unsafe" | "plan" | "read";
  fileName: string;
  grid: MotherSheetGrid;
  reasons: string[];
};

type MotherSheetRepairDialogProps = {
  issue: MotherSheetRepairIssue | null;
  mode: LineStickerMode;
  onClose: () => void;
  onReupload: () => void;
};

/**
 * Only open on an actual blocking validation error.
 * This modal does not change grid detection, bypass image checks or re-upload automatically.
 */
export default function MotherSheetRepairDialog({
  issue, mode, onClose, onReupload,
}: MotherSheetRepairDialogProps) {
  const [copyStatus, setCopyStatus] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const promptRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!issue) return;
    setCopyStatus("");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [issue, onClose]);

  if (!issue) return null;
  const needsRedraw = issue.kind === "unsafe";
  const title = needsRedraw
    ? "母圖需要重新排版，才能安全切圖"
    : issue.kind === "plan"
      ? "母圖格數與目前方案不相符"
      : "這張母圖暫時無法讀取";
  const retryPrompt = needsRedraw
    ? buildMotherSheetWhitespaceRetryPrompt(issue.grid, mode)
    : "";

  const copyRetryPrompt = async () => {
    try {
      await navigator.clipboard.writeText(retryPrompt);
      setCopyStatus("已複製！請回原本的 ChatGPT 或 Gemini 對話貼上，並附上有問題的母圖。");
    } catch {
      promptRef.current?.focus();
      promptRef.current?.select();
      setCopyStatus("瀏覽器沒有允許自動複製；已選取下方文字，請按 Ctrl+C（手機請長按複製）。");
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="mother-repair-title"
        aria-describedby="mother-repair-instructions"
        className="w-full max-w-xl max-h-[92dvh] overflow-y-auto rounded-3xl border-2 border-rose-200 bg-white p-4 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-black text-rose-700">第 3 步｜圖片檢查提醒</p>
            <h2 id="mother-repair-title" className="mt-1 text-xl font-black leading-snug text-slate-900">{title}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="關閉圖片修正提醒"
            className="min-h-11 min-w-11 shrink-0 rounded-xl bg-slate-100 px-3 text-xl font-black text-slate-800 hover:bg-slate-200">×</button>
        </div>

        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3">
          <p className="break-all text-sm font-black text-rose-900">有問題的圖片：{issue.fileName}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm font-semibold leading-6 text-rose-800">
            {issue.reasons.slice(0, 4).map((reason, index) => <li key={index}>{reason}</li>)}
          </ul>
        </div>

        <div id="mother-repair-instructions" className="mt-4 space-y-2 text-sm leading-7 text-slate-800">
          {needsRedraw ? (
            <>
              <p><strong>① 回到原本的 AI 對話。</strong> 把這張有問題的完整母圖附上，貼上下面的修正指令。如果用了真人照片，也一起附上原始照片。</p>
              <p><strong>② 請 AI 重新生成整張母圖。</strong> 每格「人物＋文字＋頭髮＋道具＋裝飾」一起縮小、置中，四周各留 15% 純白；格數、原句和人物都保持不變。</p>
              <p className="font-black text-rose-700">注意：只在整張圖片外面加白框，不會修復格子內部貼邊或相鄰兩格碰撞。</p>
            </>
          ) : issue.kind === "plan" ? (
            <>
              <p><strong>① 先檢查圖片實際是幾欄、幾列。</strong> 不要把橫向 4×2 強行當成 4×4。</p>
              <p><strong>② 若只是選錯張數：</strong> 關閉視窗，在下方母圖辨識區使用「改用偵測張數」或調整方案；不用重畫。</p>
              <p><strong>③ 若真的缺格或少一張母圖：</strong> 回 AI 補畫，存檔後再重新上傳完整母圖。</p>
            </>
          ) : (
            <>
              <p><strong>① 檢查圖片格式。</strong> 請使用可正常開啟的 PNG、JPG 或 WebP，避免損壞或未下載完整的檔案。</p>
              <p><strong>② 重新儲存圖片。</strong> 如果原圖無法讀取，回 AI 下載原圖或重新匯出 PNG，再上傳。</p>
            </>
          )}
          <p><strong>{needsRedraw ? "③" : "最後"} 儲存修正後的母圖並重新上傳。</strong> 在這裡選「改好圖片了｜重新上傳」，重新選擇新檔案；系統會重新判斷，不會直接套用舊圖片的結果。</p>
        </div>

        {needsRedraw ? (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-3">
            <button type="button" onClick={() => void copyRetryPrompt()}
              className="min-h-12 w-full rounded-xl bg-blue-700 px-4 py-3 text-base font-black !text-white hover:bg-blue-800">
              一鍵複製 AI 修正母圖指令
            </button>
            {copyStatus ? <p role="status" className="mt-2 text-sm font-bold leading-6 text-blue-900">{copyStatus}</p> : null}
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-bold text-blue-900">複製失敗？展開指令手動複製</summary>
              <textarea ref={promptRef} readOnly value={retryPrompt} rows={6}
                aria-label="AI 重新排版修圖指令"
                className="mt-2 w-full rounded-lg border border-blue-200 bg-white p-2 text-xs leading-5 text-slate-900" />
            </details>
          </div>
        ) : null}

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button type="button" onClick={() => { onClose(); onReupload(); }}
            className="min-h-12 rounded-xl bg-emerald-700 px-3 py-3 text-sm font-black !text-white hover:bg-emerald-800">
            改好圖片了｜重新上傳
          </button>
          <button type="button" onClick={onClose}
            className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm font-black text-slate-800 hover:bg-slate-50">
            先關閉，查看辨識結果
          </button>
        </div>
      </section>
    </div>
  );
}
