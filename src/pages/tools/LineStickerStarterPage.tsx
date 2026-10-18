import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import LineStickerFlowSteps from "@/components/LineStickerFlowSteps";

/**
 * 新手導流頁：先看真實製作範例，再進入現有五步驟工具。
 * 此頁面不放分潤廣告、付款／註冊牆，素材取自使用者提供的示範母圖與成果影片。
 * 實體圖片／影片在 public/images/rxv-sticker-guide/，可由獨立本機測試包安全放入。
 */
const ASSET = "/images/rxv-sticker-guide";
const cases = [
  {
    id: "baby",
    name: "寶寶真人感貼圖",
    badge: "真人照片延伸多表情",
    text: "同一位寶寶，用不同表情與動作回覆聊天。只有一張原始照片，也能製作多表情 AI 生圖指令；生成後仍須人工確認長相與比例。",
    main: `${ASSET}/baby-4x4.webp`,
    extra: `${ASSET}/baby-4x2.webp`,
    video: `${ASSET}/baby-demo.mp4`,
    videoPoster: `${ASSET}/baby-demo.webp`,
    mainAlt: "寶寶真人感 LINE 貼圖範例，第一張 4 欄 4 列共 16 格，搭配繁體中文文字",
    extraAlt: "同位寶寶延續的第二張 4 欄 2 列共 8 格",
  },
  {
    id: "florist",
    name: "花店店家回覆貼圖",
    badge: "原創 Q 版職業角色",
    text: "花店可以用自己的 LINE 貼圖回覆訂單、花束完成與配送通知，不用每次重打長篇文字。",
    main: `${ASSET}/florist-4x4.webp`,
    extra: `${ASSET}/florist-4x2.webp`,
    video: `${ASSET}/florist-demo.mp4`,
    videoPoster: `${ASSET}/florist-demo.webp`,
    mainAlt: "花店 Q 版職業角色貼圖範例，4 欄 4 列的 16 格繁體中文貼圖",
    extraAlt: "花店 Q 版貼圖第二張母圖，4 欄 2 列 8 格",
  },
] as const;

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

export default function LineStickerStarterPage() {
  return (
    <>
      <SEO
        title="LINE 貼圖免費製作教學｜寶寶真人、花店 Q 版 24 張實例｜RxV"
        description="先看真人寶寶和花店 Q 版貼圖範例、動態影片，再用 RxV 免費五步驟工具做 LINE 或 WhatsApp 靜態／動態貼圖。"
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
              先看下方兩套實際作品：寶寶真人感、花店 Q 版。看懂什麼是「母圖」，再依照五個步驟自己製作。
              RxV 幫您整理提示詞、自動切割、去背與打包；動態貼圖也在第 5 步完成。
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/tools/sticker-prompt?new=1#sticker-start" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-700 px-6 py-3 text-sm font-black !text-white shadow-sm hover:bg-violet-800">
                免費開始製作我的貼圖 →
              </Link>
              <a href="#examples" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-violet-200 bg-white px-5 py-3 text-sm font-bold text-violet-800 hover:bg-violet-50">
                先看兩套成果 ↓
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

          <section id="examples" className="scroll-mt-24 space-y-4">
            <div className="px-1">
              <p className="text-xs font-black text-violet-700">兩套實際製作案例</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">先看成果，再選自己喜歡的風格</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">一張母圖不是一張貼圖，而是排成 4×4 或 4×2 的大圖；24 張需要兩張母圖，後續由工具切成獨立貼圖。</p>
            </div>
            {cases.map((item) => (
              <article key={item.id} className="rounded-3xl border border-rose-100 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">{item.name}</h3>
                  <span className="rounded-full bg-pink-50 px-3 py-1.5 text-xs font-bold text-pink-800">{item.badge}</span>
                </div>
                <p className="mt-2 max-w-4xl text-sm leading-7 text-slate-700">{item.text}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-[1.05fr_1fr]">
                  <figure>
                    <StickerImage src={item.main} alt={item.mainAlt} />
                    <figcaption className="mt-2 text-center text-xs font-semibold text-slate-700">母圖 1｜4×4，共 16 格</figcaption>
                  </figure>
                  <div className="space-y-4">
                    <figure>
                      <StickerImage src={item.extra} alt={item.extraAlt} shape="wide" />
                      <figcaption className="mt-2 text-center text-xs font-semibold text-slate-700">母圖 2｜4×2，共 8 格</figcaption>
                    </figure>
                    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-[#fff9fc] p-3">
                      <p className="mb-2 text-xs font-bold text-slate-900">動態貼圖製作成果（影片示範）</p>
                      <video controls playsInline preload="none" poster={item.videoPoster} src={item.video} className="mx-auto max-h-[330px] w-full rounded-xl bg-white object-contain" aria-label={item.name + "動態影片展示"} />
                      <p className="mt-2 text-[11px] leading-5 text-slate-500">影片僅示範動畫效果；LINE 實際上架檔案為 APNG，需遵守官方規格與審核。</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
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
