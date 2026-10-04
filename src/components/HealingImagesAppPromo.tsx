import { Link, useLocation } from "react-router-dom";

const PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.rxv.healingimages";

const PROMO_PATHS = new Set(["/", "/images", "/tools"]);

const previewImages = [
  {
    src: "/images/showcase/nail-sticker.png",
    alt: "RxV 圖片素材示意：美甲主題",
  },
  {
    src: "/images/showcase/drink-promo.png",
    alt: "RxV 圖片素材示意：飲料促銷主題",
  },
  {
    src: "/images/showcase/florist-sticker.png",
    alt: "RxV 圖片素材示意：花店主題",
  },
];

export default function HealingImagesAppPromo() {
  const { pathname } = useLocation();
  const normalized = pathname.replace(/\/+$/, "") || "/";

  if (!PROMO_PATHS.has(normalized)) return null;

  return (
    <aside
      className="mx-auto mt-5 w-full max-w-5xl px-4"
      aria-label="RxV 療癒圖片庫 App"
    >
      <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-md">
        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[260px_1fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-[260px]">
            <div className="rounded-[2rem] border-[6px] border-slate-900 bg-slate-900 p-2 shadow-xl">
              <div className="overflow-hidden rounded-[1.4rem] bg-white">
                <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2">
                  <img
                    src="/icons/icon-192.png"
                    alt="RxV 療癒圖片庫 App 圖示"
                    className="h-8 w-8 rounded-lg object-cover shadow-sm"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-slate-900">
                      RxV 療癒圖片庫
                    </p>
                    <p className="text-[10px] text-emerald-600">Google Play 正式上架</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-2">
                  {previewImages.map((item) => (
                    <div
                      key={item.src}
                      className="aspect-[4/5] overflow-hidden rounded-lg bg-slate-100 shadow-sm"
                    >
                      <img
                        src={item.src}
                        alt={item.alt}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-1.5 px-2 pb-2 text-center text-[10px] font-bold text-slate-700">
                  <div className="rounded-lg bg-rose-50 px-2 py-1.5">♡ 收藏喜歡的圖</div>
                  <div className="rounded-lg bg-sky-50 px-2 py-1.5">↓ 直接下載</div>
                  <div className="rounded-lg bg-amber-50 px-2 py-1.5">↗ 一鍵分享</div>
                  <div className="rounded-lg bg-violet-50 px-2 py-1.5">▣ 快速設桌布</div>
                </div>
              </div>
            </div>

            <span className="absolute -right-2 -top-2 rounded-full bg-rose-500 px-3 py-1 text-xs font-black !text-white shadow">
              手機更方便
            </span>
          </div>

          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-black !text-white">
                📱 Google Play 正式上架
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
                收藏・下載・分享・桌布
              </span>
            </div>

            <h2 className="mt-4 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
              喜歡網站上的圖片？
              <span className="block text-emerald-700">
                裝進手機，看到喜歡的就直接收藏。
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
              RxV 療癒圖片庫把圖片瀏覽、收藏、下載、分享與設桌布集中在手機裡，
              不用每次回到電腦找圖。看到喜歡的圖片，就能立即存下來使用。
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm">
                💚 喜歡的圖片先收藏，之後再慢慢挑
              </div>
              <div className="rounded-xl border border-sky-100 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm">
                📥 圖片直接下載到手機，不必先傳到電腦
              </div>
              <div className="rounded-xl border border-amber-100 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm">
                📤 適合 LINE、FB、社群貼文快速分享
              </div>
              <div className="rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 shadow-sm">
                🖼️ 喜歡的療癒圖可快速設成手機桌布
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={PLAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-emerald-600 px-6 py-3 text-sm font-black !text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl"
              >
                前往 Google Play 安裝 →
              </a>

              {normalized !== "/images" ? (
                <Link
                  to="/images"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  先看看圖片庫
                </Link>
              ) : null}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              上方圖片為網站素材內容示意，實際 App 內容會依目前上架版本與素材更新為準。
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
