import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import LineStickerAuthorCard from "@/components/LineStickerAuthorCard";

const demoVideoSrc = "/videos/line-sticker-guide.mp4";
const demoVideoFallbackSrc = "/line-sticker-guide.mp4";
const demoVideoPosterSrc = "/images/line-sticker-guide-cover.jpg";
const SUPPORT_TW_URL = "https://p.ecpay.com.tw/FD7CD6D";
const SUPPORT_KOFI_URL = "https://ko-fi.com/ang2289";
const PHOTOROOM_AI_URL =
  "https://www.photoroom.com/zh-tw/tools/ai-image-generator";
const PHOTOROOM_BG_URL =
  "https://www.photoroom.com/zh-tw/tools/background-remover";

const checklistItems = [
  "貼圖圖片建議先做去背，輸出透明 PNG 或 WebP。",
  "角色與文字之間要保留安全距離，避免切圖時被裁掉。",
  "文字建議使用繁體中文、粗體、有白邊，手機聊天畫面才清楚。",
  "上架前檢查 main.png、tab.png 與每張貼圖 PNG 是否都存在。",
  "若用 AI 圖片，請避免商標、名人肖像、侵權角色或容易誤導的內容。",
];

const promptCards = [
  {
    title: "4×4 一次產生 16 張貼圖公版咒語",
    text: "請生成一張 4×4 LINE 貼圖表，共 16 張，角色保持完全一致，可愛 Q 版，白色背景，粗黑線條，每格平均排列並保留大間距，文字使用繁體中文、粗體、黑字白邊，角色與文字都不可貼邊，適合後續切割使用。",
  },
  {
    title: "5×4 一次產生 20 張貼圖公版咒語",
    text: "請生成一張 5×4 LINE 貼圖表，共 20 張，角色保持完全一致，可愛 Q 版，白色背景，粗黑線條，表情誇張，每格保留安全邊距，文字使用繁體中文、黑字白邊，適合 LINE 貼圖切割使用。",
  },
  {
    title: "角色一致性補強咒語",
    text: "同一個角色、同一個臉型、同一套服裝、同一種線條粗細與上色風格，不要換角色，不要改變頭身比例，每張只改動表情與動作。",
  },
  {
    title: "避免切到字的補強咒語",
    text: "每一格之間保留明顯間距，角色與文字不要碰到格線，文字置於角色下方或上方，四周留白，不要讓角色或文字超出格子。",
  },
];

const steps = [
  {
    title: "產生提示詞",
    desc: "先用 RxV 的提示詞產生器選分類、角色、風格與貼圖文字。",
  },
  {
    title: "用 AI 生圖",
    desc: "把提示詞貼到生圖工具，產生 4×4 或 5×4 的貼圖大圖。",
  },
  {
    title: "分割貼圖",
    desc: "使用 RxV 圖片分割工具切成多張小圖，支援 4×4／5×4 與拖曳分割線微調。",
  },
  {
    title: "去背檢查",
    desc: "若要上架，建議整理成透明 PNG，並確認沒有白底殘留。",
  },
  {
    title: "回到 RxV 打包",
    desc: "上傳切好的圖片，自動整理尺寸、命名、main.png、tab.png 與 ZIP。",
  },
];

const faqItems = [
  {
    q: "新手一定要一次做 40 張嗎？",
    a: "不一定。建議先從 8 張或 16 張開始測試風格與角色一致性，確認效果好再延伸成 40 張。",
  },
  {
    q: "目前 RxV 有內建分割嗎？",
    a: "目前 RxV 已有圖片分割工具，可把 4×4 或 5×4 大圖切開，並支援拖曳分割線微調；切好後再回到 LINE 貼圖工具整理上架包。",
  },
  {
    q: "AI 產生的圖片可以拿來做 LINE 貼圖嗎？",
    a: "可以作為創作素材，但要避免使用名人肖像、受保護角色、品牌商標、仿冒角色與侵權元素。也要確認你使用的 AI 工具授權是否允許商業用途。",
  },
  {
    q: "為什麼文字要加白邊？",
    a: "LINE 聊天背景可能是淺色或深色，黑字加白邊比較容易閱讀，也比較像常見貼圖風格。",
  },
];

function VideoDemoSection() {
  return (
    <section className="mt-10 rounded-3xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
          影片教學
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
          新手快速看懂
        </span>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-black text-slate-900">
          先看影片：LINE 貼圖從生圖到打包怎麼做
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          先產生貼圖提示詞，再用 AI 生圖，接著把大圖切成多張貼圖，最後回到 RxV
          工具整理尺寸並下載 ZIP 上架包。
        </p>

        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-sm">
          <video
            className="aspect-video w-full bg-slate-950"
            controls
            playsInline
            preload="metadata"
            poster={demoVideoPosterSrc}
          >
            <source src={demoVideoSrc} type="video/mp4" />
            <source src={demoVideoFallbackSrc} type="video/mp4" />
            你的瀏覽器不支援影片播放，請改用下方影片連結觀看。
          </video>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
          <a
            href={demoVideoSrc}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700 hover:bg-blue-100"
          >
            直接開啟影片檔
          </a>
          <a
            href={demoVideoFallbackSrc}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-slate-700 hover:bg-slate-50"
          >
            備用影片路徑
          </a>
        </div>
      </div>
    </section>
  );
}

function GuideSupportSection() {
  return (
    <section className="mt-10 rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
      <h2 className="text-2xl font-black text-slate-900">
        💗 支持 RxV 持續開發免費工具
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-700">
        如果這份教學與工具對你有幫助，歡迎小額支持，讓 RxV
        持續製作更多免費圖片、LINE 貼圖工具與創作者教學。
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          href={SUPPORT_TW_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl bg-amber-600 px-5 py-3 text-center text-sm font-black !text-white shadow-md hover:bg-amber-700 hover:!text-white"
          style={{ color: "#ffffff" }}
        >
          ☕ 台灣小額支持
        </a>
        <a
          href={SUPPORT_KOFI_URL}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl bg-blue-600 px-5 py-3 text-center text-sm font-black !text-white shadow-md hover:bg-blue-700 hover:!text-white"
          style={{ color: "#ffffff" }}
        >
          🌍 Ko-fi 海外支持
        </a>
      </div>
      <p className="mt-3 text-xs font-bold text-slate-600">
        功能建議／合作洽詢：rxv0227@gmail.com
      </p>
    </section>
  );
}

function GuideRecommendedToolsSection() {
  return (
    <section className="mt-10 rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
          推薦流程
        </span>
        <h2 className="text-2xl font-black text-slate-900">
          做貼圖時可以搭配的工具
        </h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        先產生清楚的貼圖大圖，再分割成單張圖片，最後回到 RxV 整理尺寸與 ZIP。若圖片有白底，可先使用去背工具處理。
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-sm font-black !text-white">
            1
          </div>
          <h3 className="text-lg font-black text-slate-900">
            產生貼圖大圖
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            適合製作有繁體中文文字的 4×4／5×4 貼圖大圖。請注意角色一致、文字清楚、每格保留安全距離。
          </p>
          <span className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black !text-white">
            建議先完成這一步
          </span>
        </div>
        <a
          href={PHOTOROOM_AI_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-3xl border border-slate-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black !text-white">
            2
          </div>
          <h3 className="text-lg font-black text-slate-900 group-hover:text-blue-700">
            補做貼紙素材
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            可用來嘗試貼紙風角色、商品素材或品牌小圖示。若產出的文字不清楚，建議回到圖片編輯工具重新加字。
          </p>
          <span className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-xs font-black !text-white">
            前往試做素材
          </span>
        </a>
        <a
          href={PHOTOROOM_BG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-3xl border border-slate-100 bg-gradient-to-br from-violet-50 to-white p-5 shadow-sm hover:shadow-md"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600 text-sm font-black !text-white">
            3
          </div>
          <h3 className="text-lg font-black text-slate-900 group-hover:text-violet-700">
            處理透明背景
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            可用來移除白底或雜亂背景。處理完成後，建議回本站檢查是否為透明 PNG，再進行分割與打包。
          </p>
          <span className="mt-4 inline-flex rounded-xl bg-violet-600 px-4 py-2 text-xs font-black !text-white">
            前往去背工具
          </span>
        </a>
      </div>
    </section>
  );
}

export default function LineStickerGuide() {
  return (
    <>
      <SEO
        title="LINE 貼圖製作教學｜提示詞、生圖、分割、ZIP 打包 - RxV AI工具中心"
        description="給新手與客戶看的 LINE 貼圖製作教學，包含提示詞產生、AI 生圖、圖片分割工具、去背檢查、尺寸整理與 ZIP 打包。"
        path="/tools/line-sticker-guide"
        keywords="LINE貼圖教學, LINE貼圖製作, AI貼圖, 貼圖上架, 貼圖ZIP打包, RxV"
      />

      <main className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-emerald-50 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Link
            to="/tools/line-sticker"
            className="mb-4 inline-block text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            ← 回到 LINE 貼圖整理工具
          </Link>

          <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white">
                LINE 貼圖教學
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                客戶版流程
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                ZIP 打包上架
              </span>
            </div>
            <h1 className="mt-5 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
              第一次做 LINE 貼圖？照流程做，最後整理成上架素材包
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              這份教學是給新手、店家、品牌與客製貼圖客戶看的版本。你可以先產生貼圖提示詞，再用
              AI 生成貼圖大圖，切成多張後回到 RxV 工具整理尺寸、命名與 ZIP
              打包。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/tools/sticker-prompt"
                className="inline-flex justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-violet-700"
              >
                先產生貼圖提示詞
              </Link>
              <Link
                to="/tools/line-sticker"
                className="inline-flex justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-blue-700"
              >
                回到工具整理 ZIP
              </Link>
              <a
                href="#prompt"
                className="inline-flex justify-center rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-black text-blue-700 hover:bg-blue-100"
              >
                查看公版咒語
              </a>
            </div>
          </section>

          <LineStickerAuthorCard />

          <VideoDemoSection />

          <section className="mt-8 grid gap-4 md:grid-cols-5">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
                  {index + 1}
                </div>
                <h2 className="text-sm font-black text-slate-900">
                  {step.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {step.desc}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-10 rounded-3xl border border-violet-100 bg-violet-50/70 p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">目前建議流程</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Link
                to="/tools/sticker-prompt"
                className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md"
              >
                <p className="text-sm font-black text-violet-700">
                  ① 產生提示詞
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  選情侶、品牌、遊戲、寵物等分類，一鍵複製提示詞。
                </p>
              </Link>
              <div className="rounded-2xl bg-white p-5 shadow-sm">
                <p className="text-sm font-black text-violet-700">② 分割圖片</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  使用本站圖片分割工具，支援 4×4／5×4 大圖分割，也可拖曳分割線微調位置。
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <a
                    href={PHOTOROOM_BG_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl bg-purple-600 px-3 py-2 text-center text-xs font-black !text-white hover:bg-purple-700 hover:!text-white"
                    style={{ color: "#ffffff" }}
                  >
                    PhotoRoom 去背
                  </a>
                  <Link
                    to="/tools/sticker-splitter"
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-center text-xs font-black !text-white hover:bg-emerald-700 hover:!text-white"
                    style={{ color: "#ffffff" }}
                  >
                    本站圖片分割
                  </Link>
                </div>
              </div>
              <Link
                to="/tools/line-sticker"
                className="rounded-2xl bg-white p-5 shadow-sm hover:shadow-md"
              >
                <p className="text-sm font-black text-violet-700">③ 整理 ZIP</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  上傳切好的圖片，整理 LINE 上架尺寸、主圖、標籤圖與 ZIP。
                </p>
              </Link>
            </div>
          </section>

          <section
            id="prompt"
            className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-24"
          >
            <h2 className="text-2xl font-black text-slate-900">
              AI 生圖公版咒語
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              你可以把下面文字貼到 AI
              生圖工具，再依角色、風格、貼圖文字自行調整。重點是「角色一致、格子間距、文字白邊、不要切到字」。
            </p>
            <div className="mt-5 space-y-4">
              {promptCards.map((card) => (
                <article
                  key={card.title}
                  className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4"
                >
                  <h3 className="text-sm font-black text-blue-900">
                    {card.title}
                  </h3>
                  <p className="mt-2 whitespace-pre-wrap rounded-xl bg-white p-4 text-xs leading-relaxed text-slate-700 shadow-sm">
                    {card.text}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                上架前檢查表
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                {checklistItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-0.5 text-emerald-600">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">
                適合哪些人使用？
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                <li>✓ 想做情侶、夫妻、寵物或寶寶貼圖的人</li>
                <li>✓ 想替店家做品牌小店長貼圖的小老闆</li>
                <li>✓ 已經有貼圖圖片，但不會整理尺寸與 ZIP 的新手</li>
                <li>✓ 想先用免費工具測試 LINE 貼圖接案方向的創作者</li>
              </ul>
            </div>
          </section>

          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">常見問題</h2>
            <div className="mt-5 space-y-4">
              {faqItems.map((item) => (
                <article key={item.q} className="rounded-2xl bg-slate-50 p-4">
                  <h3 className="text-sm font-black text-slate-900">
                    {item.q}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {item.a}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <GuideSupportSection />

          <GuideRecommendedToolsSection />

          <section className="mt-10 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-emerald-50 p-6 text-center shadow-sm sm:p-8">
            <h2 className="text-2xl font-black text-slate-900">
              切好圖片後，回到工具開始打包
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              上傳已切好、已去背的貼圖圖片，選擇張數，確認預覽後即可產生 LINE
              貼圖上架用 ZIP。
            </p>
            <Link
              to="/tools/line-sticker"
              className="mt-6 inline-flex rounded-2xl bg-blue-600 px-6 py-3 text-sm font-black !text-white shadow-md hover:bg-blue-700 hover:!text-white"
              style={{ color: "#ffffff" }}
            >
              回到 LINE 貼圖工具
            </Link>
          </section>
        </div>
      </main>
    </>
  );
}
