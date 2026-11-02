import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  readStickerGuidanceMode,
  setStickerGuidanceMode,
  useStickerGuidanceMode,
  type StickerGuidanceMode,
} from "@/lib/stickerGuidanceMode";

type Props = {
  /** Homepage / direct prompt entry: ask once until the visitor selects a mode. */
  entry?: boolean;
  /** From landing pages, begin step 1 after a choice; on the prompt page, keep all form values. */
  startAfterChoice?: boolean;
};

export default function StickerGuidanceChooser({ entry = false, startAfterChoice = false }: Props) {
  const navigate = useNavigate();
  const mode = useStickerGuidanceMode();
  const [open, setOpen] = useState(() => entry && readStickerGuidanceMode() === null);
  const [remember, setRemember] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (entry && mode === null) setOpen(true);
  }, [entry, mode]);

  useEffect(() => {
    if (!open) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      } else if (event.key === "Tab") {
        const buttons = Array.from(document.querySelectorAll<HTMLElement>(
          '[data-sticker-mode-dialog] button, [data-sticker-mode-dialog] input'
        )).filter((element) => !element.hasAttribute("disabled"));
        if (!buttons.length) return;
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKey);
      openerRef.current?.focus();
    };
  }, [open]);

  const choose = (next: StickerGuidanceMode) => {
    setStickerGuidanceMode(next, remember);
    setOpen(false);
    if (startAfterChoice) navigate("/tools/sticker-prompt?new=1#sticker-start");
  };

  return (
    <>
      <button ref={openerRef} type="button" onClick={() => setOpen(true)}
        className="inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-300 bg-white px-4 py-2.5 text-sm font-black text-violet-800 hover:bg-violet-50">
        切換操作方式：{mode === "guided" ? "一步一步教學" : mode === "quick" ? "快速開始" : "尚未選擇"}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-slate-950/75 p-3 sm:p-6" role="presentation">
          <section data-sticker-mode-dialog role="dialog" aria-modal="true"
            aria-labelledby="sticker-mode-title" aria-describedby="sticker-mode-desc"
            className="w-full max-w-lg max-h-[92dvh] overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-black text-violet-700">LINE／WhatsApp 貼圖工坊</p>
                <h2 id="sticker-mode-title" className="mt-2 text-2xl font-black leading-snug text-slate-900">
                  你想怎麼開始製作貼圖？
                </h2>
              </div>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)}
                aria-label="暫時關閉操作方式選擇"
                className="min-h-11 min-w-11 shrink-0 rounded-xl bg-slate-100 px-3 text-xl font-black text-slate-700 hover:bg-slate-200">×</button>
            </div>
            <p id="sticker-mode-desc" className="mt-3 text-base leading-7 text-slate-700">
              兩種方式都使用相同的免費製作工具，隨時可以切換，不會清除已設定的貼圖。
            </p>

            <div className="mt-5 grid gap-3">
              <button type="button" onClick={() => choose("guided")}
                className="min-h-[112px] rounded-2xl border-2 border-blue-700 bg-blue-700 p-4 text-left shadow-sm transition hover:bg-blue-800 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                <span className="block text-xl font-black !text-white">我是新手，帶我一步一步做</span>
                <span className="mt-2 block text-base leading-7 !text-white">
                  每一步都會彈出清楚的操作教學；忘記怎麼做，可以再按一次教學。
                </span>
              </button>
              <button type="button" onClick={() => choose("quick")}
                className="min-h-[104px] rounded-2xl border-2 border-violet-200 bg-violet-50 p-4 text-left transition hover:border-violet-500 hover:bg-violet-100 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-violet-500">
                <span className="block text-xl font-black text-violet-950">我會用，直接開始</span>
                <span className="mt-2 block text-base leading-7 text-violet-900">
                  不自動彈出每一步教學；需要時仍可按「？ 不會操作」。
                </span>
              </button>
            </div>

            <label className="mt-5 flex min-h-11 cursor-pointer items-center gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)}
                className="h-5 w-5 accent-violet-700" />
              記住我的選擇，下次直接使用
            </label>
            <p className="mt-2 text-xs leading-6 text-slate-600">
              不勾選只在目前瀏覽器分頁使用此選擇；隨時可從頁面上方切換。
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}
