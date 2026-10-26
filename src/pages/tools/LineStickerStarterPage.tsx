import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import LineStickerFlowSteps from "@/components/LineStickerFlowSteps";
import StickerExcelOffers from "@/components/StickerExcelOffers";

/**
 * 新手導流頁：先看真實製作範例，再進入現有五步驟工具。
 * 此頁面不放分潤廣告、付款／註冊牆，素材取自使用者提供的示範母圖與成果影片。
 * 實體圖片／影片在 public/images/rxv-sticker-guide/，可由獨立本機測試包安全放入。
 */
const ASSET = "/images/rxv-sticker-guide";
type DemoCase = { id: string; name: string; badge: string; text: string; main: string; extra: string; mainAlt: string; extraAlt: string; video?: string; videoPoster?: string; originalPhoto?: string; note?: string; };
const cases: DemoCase[] = [
  {
    "id": "baby",
    "name": "寶寶真人感",
    "badge": "真人照片延伸多表情",
    "text": "真人寶寶的多表情日常回覆示範；AI 延伸後仍要確認和照片的相似度。",
    "main": "/images/rxv-sticker-guide/baby-4x4.webp",
    "extra": "/images/rxv-sticker-guide/baby-4x2.webp",
    "video": "/images/rxv-sticker-guide/baby-demo.mp4",
    "videoPoster": "/images/rxv-sticker-guide/baby-demo.webp",
    "mainAlt": "寶寶真人感 第一張 4×4 16 格母圖",
    "extraAlt": "寶寶真人感 第二張 4×2 8 格母圖"
  },
  {
    "id": "florist",
    "name": "花店職業",
    "badge": "原創 Q 版職業角色",
    "text": "花店接單、花束完成、配送通知與感謝客戶的回覆貼圖。",
    "main": "/images/rxv-sticker-guide/florist-4x4.webp",
    "extra": "/images/rxv-sticker-guide/florist-4x2.webp",
    "video": "/images/rxv-sticker-guide/florist-demo.mp4",
    "videoPoster": "/images/rxv-sticker-guide/florist-demo.webp",
    "mainAlt": "花店職業 第一張 4×4 16 格母圖",
    "extraAlt": "花店職業 第二張 4×2 8 格母圖"
  },
  {
    "id": "dog",
    "name": "萌寵狗狗",
    "badge": "寵物日常回覆",
    "text": "同一隻棕白萌犬：早安、晚安、收到、謝謝等 24 張。",
    "main": "/images/rxv-sticker-guide/dog-4x4.webp",
    "extra": "/images/rxv-sticker-guide/dog-4x2.webp",
    "video": "/images/rxv-sticker-guide/dog-demo.mp4",
    "videoPoster": "/images/rxv-sticker-guide/dog-demo.webp",
    "mainAlt": "萌寵狗狗 第一張 4×4 16 格母圖",
    "extraAlt": "萌寵狗狗 第二張 4×2 8 格母圖"
  },
  {
    "id": "cat",
    "name": "萌寵貓咪",
    "badge": "原照片轉 Q 版",
    "text": "對照布偶貓原始照片及 Q 版貼圖，目前沒有動態影片。",
    "main": "/images/rxv-sticker-guide/cat-4x4.webp",
    "extra": "/images/rxv-sticker-guide/cat-4x2.webp",
    "originalPhoto": "/images/rxv-sticker-guide/cat-original.webp",
    "mainAlt": "萌寵貓咪 第一張 4×4 16 格母圖",
    "extraAlt": "萌寵貓咪 第二張 4×2 8 格母圖"
  },
  {
    "id": "couple",
    "name": "甜蜜情侶",
    "badge": "雙人 Q 版",
    "text": "情侶日常互動、想你、抱抱、謝謝、陪伴等。",
    "main": "/images/rxv-sticker-guide/couple-4x4.webp",
    "extra": "/images/rxv-sticker-guide/couple-4x2.webp",
    "video": "/images/rxv-sticker-guide/couple-demo.mp4",
    "videoPoster": "/images/rxv-sticker-guide/couple-demo.webp",
    "mainAlt": "甜蜜情侶 第一張 4×4 16 格母圖",
    "extraAlt": "甜蜜情侶 第二張 4×2 8 格母圖"
  },
  {
    "id": "realtor",
    "name": "房仲服務",
    "badge": "職業個人品牌",
    "text": "房仲接洽、看屋安排、進度追蹤與成交祝賀。",
    "main": "/images/rxv-sticker-guide/realtor-4x4.webp",
    "extra": "/images/rxv-sticker-guide/realtor-4x2.webp",
    "video": "/images/rxv-sticker-guide/realtor-demo.mp4",
    "videoPoster": "/images/rxv-sticker-guide/realtor-demo.webp",
    "note": "原壓縮檔標示已上架；本頁僅展示製作成果，未核驗目前商店狀態。",
    "mainAlt": "房仲服務 第一張 4×4 16 格母圖",
    "extraAlt": "房仲服務 第二張 4×2 8 格母圖"
  },
  {
    "id": "sales",
    "name": "專業業務",
    "badge": "業務回覆",
    "text": "收到、確認、追進度、整理資料與感謝客戶。",
    "main": "/images/rxv-sticker-guide/sales-4x4.webp",
    "extra": "/images/rxv-sticker-guide/sales-4x2.webp",
    "video": "/images/rxv-sticker-guide/sales-demo.mp4",
    "videoPoster": "/images/rxv-sticker-guide/sales-demo.webp",
    "mainAlt": "專業業務 第一張 4×4 16 格母圖",
    "extraAlt": "專業業務 第二張 4×2 8 格母圖"
  },
  {
    "id": "manager",
    "name": "社區總幹事",
    "badge": "物業管理",
    "text": "社區服務、公告提醒、設備報修與行政回覆。",
    "main": "/images/rxv-sticker-guide/manager-4x4.webp",
    "extra": "/images/rxv-sticker-guide/manager-4x2.webp",
    "video": "/images/rxv-sticker-guide/manager-demo.mp4",
    "videoPoster": "/images/rxv-sticker-guide/manager-demo.webp",
    "note": "原壓縮檔標示已上架；本頁僅展示製作成果，未核驗目前商店狀態。",
    "mainAlt": "社區總幹事 第一張 4×4 16 格母圖",
    "extraAlt": "社區總幹事 第二張 4×2 8 格母圖"
  },
  {
    "id": "breakfast",
    "name": "早餐店",
    "badge": "店家客服",
    "text": "接單、餐點完成、取餐、外送與店家問候。",
    "main": "/images/rxv-sticker-guide/breakfast-4x4.webp",
    "extra": "/images/rxv-sticker-guide/breakfast-4x2.webp",
    "video": "/images/rxv-sticker-guide/breakfast-demo.mp4",
    "videoPoster": "/images/rxv-sticker-guide/breakfast-demo.webp",
    "note": "原壓縮檔標示已上架；本頁僅展示製作成果，未核驗目前商店狀態。",
    "mainAlt": "早餐店 第一張 4×4 16 格母圖",
    "extraAlt": "早餐店 第二張 4×2 8 格母圖"
  }
];

const steps = [
  {n:1, title:"選角色與文字", desc:"選靜態／動態、8／16／24 張和真人／Q 版畫風。", detail:"只需要選一選，不用會設計。", key:"theme"},
  {n:2, title:"複製指令、AI 畫圖", desc:"先複製第 1 張，回 ChatGPT 畫好後再做第 2 張。", detail:"24 張＝4×4（16）＋4×2（8）。", key:"image"},
  {n:3, title:"上傳完整母圖", desc:"把 AI 產生的整張圖存下來、回到 RXV 上傳。", detail:"不用自己拆成 24 張。", key:"upload"},
  {n:4, title:"自動切圖與檢查", desc:"網站辨識格數、檢查安全留白、去背及整理尺寸。", detail:"紅色警告請先修圖，不硬切。", key:"slice"},
  {n:5, title:"靜態下載／動態製作", desc:"靜態下載 ZIP；動態在這一步製作動畫並下載 ZIP。", detail:"不是再多一個第 6 步。", key:"zip"},
] as const;

function StickerImage({src, alt, shape = "square"}: {src: string; alt: string; shape?: "square" | "wide"}) {
  return (
    <div className="overflow-hidden rounded-xl border border-rose-100 bg-white p-2 shadow-sm">
      <img src={src} alt={alt} loading="lazy" decoding="async"
        className={`w-full object-contain ${shape === "square" ? "aspect-square" : "aspect-[2/1]"}`}
      />
    </div>
  );
}

/**
 * Native browser media playback, with an explicit action for visitors whose
 * browser has not yet loaded media metadata. MP4 files are static public assets.
 * Switching examples remounts this component, so a prior error does not leak.
 */
function StickerDemoVideo({ item }: { item: DemoCase }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  if (!item.video) return null;

  const playVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.error) video.load();
    setError(false);
    void video.play().then(() => {
      setIsPlaying(true);
    }).catch(() => {
      setError(true);
    });
  };

  const retryVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    setError(false);
    setDuration(null);
    video.load();
    void video.play().then(() => {
      setIsPlaying(true);
    }).catch(() => setError(true));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-[#fff9fc] p-3">
      <p className="mb-2 text-xs font-bold text-slate-900">動態貼圖製作成果（影片示範）</p>
      <video
        ref={videoRef}
        controls
        playsInline
        preload="none"
        poster={item.videoPoster}
        className="mx-auto max-h-[330px] w-full rounded-xl bg-white object-contain"
        aria-label={item.name + "動態影片展示"}
        onLoadedMetadata={(event) => {
          const seconds = event.currentTarget.duration;
          if (Number.isFinite(seconds) && seconds > 0) {
            setDuration(Math.round(seconds));
            setError(false);
          }
        }}
        onPlaying={() => { setIsPlaying(true); setError(false); }}
        onPause={() => setIsPlaying(false)}
        onError={() => { setError(true); setIsPlaying(false); }}
      >
        <source src={item.video} type="video/mp4" />
        您的瀏覽器無法播放此影片。
      </video>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" onClick={playVideo}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-700 px-4 py-2 text-sm font-bold text-white hover:bg-violet-800">
          {isPlaying ? "重新播放影片" : "▶ 播放示範影片"}
        </button>
        <a href={item.video} target="_blank" rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-50">
          另開影片檔案 ↗
        </a>
        {duration !== null && (
          <span className="text-xs font-semibold text-slate-600">影片長度：約 {duration} 秒</span>
        )}
      </div>
      {error && (
        <div role="alert" className="mt-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs leading-6 text-orange-900">
          影片載入或播放失敗。請按「重新載入影片」重試；
          若仍無法播放，可點「另開影片檔案」檢查瀏覽器是否能直接讀取 MP4。
          <button type="button" onClick={retryVideo}
            className="ml-2 inline-flex min-h-10 items-center rounded-lg border border-orange-300 bg-white px-3 font-bold text-orange-900">
            重新載入影片
          </button>
        </div>
      )}
      <p className="mt-2 text-[11px] leading-5 text-slate-500">影片只示範動畫效果，不代表已通過 LINE 審核。</p>
    </div>
  );
}

export default function LineStickerStarterPage() {
  const [selectedId, setSelectedId] = useState("baby");
  const selected = cases.find((item) => item.id === selectedId) ?? cases[0];
  return (
    <>
      <SEO
        title="LINE 貼圖免費製作教學｜寶寶、萌寵、情侶、房仲與店家 24 張範例｜RxV"
        description="先看九組 LINE 貼圖範例、動態影片，再用 RxV 免費五步驟工具做 LINE 或 WhatsApp 靜態／動態貼圖。"
        path="/tools/line-sticker-start"
        keywords="LINE貼圖教學,LINE動態貼圖,真人寶寶貼圖,花店LINE貼圖,免費貼圖製作,母圖切割"
      />
      <main className="min-h-screen bg-[#fffaf7] px-3 py-6 sm:px-6 sm:py-10">
        <div className="mx-auto max-w-6xl space-y-7">
          <section className="overflow-hidden rounded-3xl border border-rose-100 bg-gradient-to-br from-[#fff0f5] via-white to-[#f2eeff] p-5 sm:p-9">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-violet-800">
              <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">RxV 免費 LINE 貼圖工廠</span>
              <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">靜態＋動態</span>
              <span className="rounded-full bg-white px-3 py-1.5 shadow-sm">適合第一次使用</span>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-black leading-snug text-slate-900 sm:text-5xl">
              不會畫圖、不會切圖，也能製作自己的 LINE 貼圖
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 sm:text-base">
              先看下方九套作品：寶寶、花店、萌寵、情侶、業務與店家。看懂什麼是「母圖」，再依照五個步驟自己製作。
              RxV 幫您整理提示詞、自動切割、去背與打包；動態貼圖也在第 5 步完成。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/tools/sticker-prompt?new=1#sticker-start" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-700 px-6 py-3 text-sm font-black !text-white shadow-sm hover:bg-violet-800">
                免費開始製作我的貼圖 →
              </Link>
              <a href="#examples" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-bold text-violet-800 hover:bg-violet-50">
                先看九套成果 ↓
              </a>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">本站工具可免費使用；AI 生圖服務可能有平台使用額度。LINE 上架需自行送審，並非完成 ZIP 就自動通過。</p>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-4 sm:p-6" aria-label="LINE 貼圖五步驟">
            <h2 className="text-xl font-black text-slate-900">完整流程就 5 步｜動態貼圖不加第 6 步</h2>
            <LineStickerFlowSteps activeStep={1} />
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
              {steps.map((step) => (
                <article key={step.n} className="rounded-2xl border border-violet-100 bg-[#faf9ff] p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-sm font-black text-white">{step.n}</span>
                    <h3 className="text-sm font-black text-slate-900">{step.title}</h3>
                  </div>
                  {step.key === "image" || step.key === "slice" ? (
                    <img src={step.key === "image" ? cases[0].main : cases[1].extra} alt={step.key === "image" ? "AI 一張母圖 4×4 範例" : "自動切割使用的母圖 4×2 範例"} loading="lazy" className="mb-2 aspect-[5/3] w-full rounded-lg bg-white object-contain" />
                  ) : (
                    <div className="mb-2 flex aspect-[5/3] items-center justify-center rounded-lg bg-white text-3xl font-black text-violet-300">
                      {step.key === "theme" ? "Aa" : step.key === "upload" ? "↑" : "ZIP"}
                    </div>
                  )}
                  <p className="text-xs leading-5 text-slate-700">{step.desc}</p>
                  <p className="mt-2 text-[11px] font-semibold leading-5 text-violet-800">{step.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <StickerExcelOffers />

          <section id="examples" className="scroll-mt-24 space-y-4" aria-label="九組貼圖示範作品">
            <div className="px-1">
              <p className="text-xs font-black text-violet-700">9 組實際製作案例</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">先選一組喜歡的貼圖，再看完整成果</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">點分類卡片，才展開該組 4×4、4×2 母圖及動態影片。24 張需要兩張母圖，由工具切成獨立貼圖。</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" role="group" aria-label="選擇貼圖示範類型">
              {cases.map((item) => (
                <button type="button" key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  aria-pressed={selected.id === item.id}
                  aria-controls="sticker-selected-example"
                  className={"rounded-2xl border-2 bg-white p-2 text-left transition-colors hover:border-violet-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 " + (selected.id === item.id ? "border-violet-600 shadow-md" : "border-rose-100")}>
                  <img src={item.main} alt={item.mainAlt} loading="lazy" decoding="async" className="aspect-square w-full rounded-lg bg-white object-contain" />
                  <span className="mt-2 block text-sm font-black text-slate-900">{item.name}</span>
                  <span className="mt-1 block text-[11px] leading-5 text-slate-500">{item.badge}</span>
                </button>
              ))}
            </div>
            <article id="sticker-selected-example" key={selected.id} className="rounded-3xl border border-violet-200 bg-white p-4 shadow-sm sm:p-6" aria-live="polite">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black text-slate-900">{selected.name}</h3>
                <span className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-800">{selected.badge}</span>
              </div>
              <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">{selected.text}</p>
              {selected.originalPhoto ? (
                <figure className="mt-4 max-w-[330px] rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <img src={selected.originalPhoto} alt="寵物原始參考照片" loading="lazy" className="max-h-48 w-full object-contain" />
                  <figcaption className="mt-1 text-xs font-bold text-slate-600">原始照片 → 下面的 Q 版貼圖</figcaption>
                </figure>
              ) : null}
              <div className="mt-4 grid gap-3 md:grid-cols-[1.05fr_1fr]">
                <figure>
                  <StickerImage src={selected.main} alt={selected.mainAlt} />
                  <figcaption className="mt-2 text-center text-xs font-semibold text-slate-700">母圖 1｜4×4，共 16 格</figcaption>
                </figure>
                <div className="space-y-4">
                  <figure>
                    <StickerImage src={selected.extra} alt={selected.extraAlt} shape="wide" />
                    <figcaption className="mt-2 text-center text-xs font-semibold text-slate-700">母圖 2｜4×2，共 8 格</figcaption>
                  </figure>
                  {selected.video ? (
                    <StickerDemoVideo key={selected.id} item={selected} />
                  ) : (
                    <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">本組只有靜態母圖，尚未提供動態影片；仍可於第 5 步製作動畫。</p>
                  )}
                </div>
              </div>
              {selected.note && <p className="mt-3 text-xs text-slate-500">{selected.note}</p>}
              <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
                <Link to="/tools/sticker-prompt?new=1#sticker-start" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold !text-white hover:bg-violet-800">
                  我也想做這種貼圖｜免費開始 →
                </Link>
                <span className="text-xs text-slate-500">進入第 1 步後可選擇主題與畫風。</span>
              </div>
            </article>
          </section>
          <section className="rounded-3xl border border-violet-100 bg-white p-5 sm:p-7">
            <h2 className="text-2xl font-black text-slate-900">第一次製作，這些先知道就好</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ["什麼是母圖？","就是排好 8 格、16 格等貼圖的整張大圖片；不用先手動拆開。"],
                ["照片和母圖有什麼不同？","單張寶寶照片是人物參考照，還不是完成的貼圖母圖。先選真人照片模式，再製作母圖。"],
                ["動態貼圖有第 6 步嗎？","沒有。第 5 步內先做動畫效果，再下載 APNG／WebP ZIP。"],
                ["直接產生就能上架嗎？","產生 ZIP 是完成素材，不是官方審核結果。請檢查文字、角色版權、商標及販售地區後送審。"],
              ].map(([q,a])=>(
                <div key={q} className="rounded-xl bg-[#faf9ff] p-4">
                  <p className="text-sm font-black text-violet-900">{q}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{a}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-gradient-to-r from-violet-700 to-fuchsia-700 p-6 text-center sm:p-9">
            <h2 className="text-2xl font-black text-white">看懂了，開始製作自己的貼圖</h2>
            <p className="mt-2 text-sm leading-6 text-violet-50">新手請從第 1 步開始；已經有完整母圖的人可直接跳到第 3 步。</p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link to="/tools/sticker-prompt?new=1#sticker-start" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-black text-violet-900 hover:bg-violet-50">
                免費開始製作我的貼圖 →
              </Link>
              <Link to="/tools/line-sticker?existing=1#mother-upload" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/50 px-5 py-3 text-sm font-bold !text-white hover:bg-white/10">
                我已有完整母圖，直接上傳
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
