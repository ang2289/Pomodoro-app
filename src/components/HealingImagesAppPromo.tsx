import { useLocation } from "react-router-dom";

const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.rxv.healingimages";

const PROMO_PATHS = new Set(["/", "/images", "/tools"]);

export default function HealingImagesAppPromo() {
  const { pathname } = useLocation();
  const normalized = pathname.replace(/\/+$/, "") || "/";

  if (!PROMO_PATHS.has(normalized)) return null;

  return (
    <aside className="mx-auto mt-4 w-full max-w-5xl px-4" aria-label="RxV 療癒圖片庫 App">
      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-sky-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-emerald-700">📱 RxV 療癒圖片庫已上架 Google Play</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            手機直接收藏、下載、分享圖片，也能快速設成桌布。
          </p>
        </div>
        <a
          href={PLAY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black !text-white shadow hover:bg-emerald-700"
        >
          前往 Google Play
        </a>
      </div>
    </aside>
  );
}
