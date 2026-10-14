import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import LineStickerAuthorCard from "@/components/LineStickerAuthorCard";
import { StickerExistingMotherSheetShortcut, StickerCustomInquiry, StickerNextActionHint } from "@/components/StickerBeginnerActions";

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
    title: "4×5 一次產生 20 張貼圖公版咒語",
    text: "請生成一張 4×5 LINE 貼圖表，共 20 張，角色保持完全一致，可愛 Q 版，白色背景，粗黑線條，表情誇張，每格保留安全邊距，文字使用繁體中文、黑字白邊，適合 LINE 貼圖切割使用。",
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
  { title: "選主題與張數", desc: "先選 LINE 或 WhatsApp、靜態或動態，再選主題與上架張數。" },
  { title: "到 Google Gemini 畫圖", desc: "複製本站產生的指令，貼到 Google Gemini 並送出；把完整大圖下載到手機或電腦。" },
  { title: "上傳母圖", desc: "把一張 4×4（16 格）等母圖傳回本站；不用自己一張張手動切。" },
  { title: "確認自動整理", desc: "確認格數與預覽，讓工具切圖、去背、調整尺寸；文字不能被切掉。" },
  { title: "下載／做動態", desc: "靜態貼圖下載 ZIP；動態貼圖接著產生動畫。LINE 上架仍須審核。" },
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

const demoScreenshots = [
  { src: "/images/sticker-prompt-demo/demo-prompt.png", title: "第 1 步：選擇主題、張數", desc: "先選靜態或動態，網站自動產生 AI 繪圖指令。" },
  { src: "/images/sticker-prompt-demo/demo-result.png", title: "第 2 步：用 AI 畫出母圖", desc: "一張 4×4 圖片內有 16 格，先存成圖片，不用手工拆開。" },
  { src: "/images/sticker-prompt-demo/demo-pack.png", title: "第 3～5 步：上傳、切圖、下載", desc: "將一整張母圖交給 RXV 切割、整理、檢查後下載 ZIP。" },
] as const;

function IllustratedDemoSection() {
  return (
    <section className="mt-10 rounded-3xl border border-sky-200 bg-white p-4 shadow-sm sm:p-6">
      <span className="inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-black text-sky-800">看圖片就懂</span>
      <h2 className="mt-3 text-xl font-black text-slate-900 sm:text-2xl">不是一張張畫：先畫一張大圖，再讓工具切開</h2>
      <p className="mt-2 text-sm leading-7 text-slate-600">以下三張是網站現有操作示範圖片。依序點下方步驟按鈕，就能實際操作。</p>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {demoScreenshots.map((item) => (
          <figure key={item.src} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
            <img src={item.src} alt={item.title} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-contain" />
            <figcaption className="p-4">
              <p className="text-sm font-black text-slate-900">{item.title}</p>
              <p className="mt-2 text-xs leading-6 text-slate-600">{item.desc}</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/tools/sticker-prompt#sticker-start" className="inline-flex min-h-11 items-center rounded-xl bg-sky-700 px-4 py-2 text-sm font-black !text-white hover:bg-sky-800">第 1 步｜開始製作 →</Link>
        <Link to="/tools/line-sticker#mother-upload" className="inline-flex min-h-11 items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-800 hover:bg-slate-100">第 3 步｜已有圖片 →</Link>
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
            可嘗試製作有繁體中文文字的 4×4／4×5 貼圖大圖。請注意角色一致、文字清楚、每格保留安全距離。
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
              這份教學是給第一次使用的新手、店家與創作者看的版本。先用本站準備 AI 生圖指令，貼到 Google Gemini，
              讓 AI 畫好貼圖大圖，下載後傳回 RXV，自動切割、去背、整理尺寸與打包 ZIP。
            </p>
            <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
              最簡單的方法：先在 RXV 選主題並複製指令 → 開啟 Google Gemini 貼上、產出整張圖片 → 下載圖片 → 回 RXV 上傳。Google 搜尋不是 Gemini。
              <a href="https://gemini.google.com/app" target="_blank" rel="noopener noreferrer" className="ml-2 font-bold underline">開啟 Google Gemini ↗</a>
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/tools/sticker-prompt"
                className="inline-flex justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-violet-700"
              >
                第 1 步｜開始選主題
              </Link>
              <Link
                to="/tools/line-sticker"
                className="inline-flex justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-blue-700"
              >
                第 3 步｜已有圖片
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

          <StickerNextActionHint>還沒有圖片，請按上方「第 1 步｜開始選主題」；已有完整母圖，請直接使用下面的上傳捷徑。</StickerNextActionHint>
          <div className="mt-4"><StickerExistingMotherSheetShortcut /></div>
          <IllustratedDemoSection />

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
            <h2 className="text-xl font-black text-slate-900">做到哪一步，就從哪個按鈕繼續</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Link to="/tools/sticker-prompt#sticker-start" className="rounded-2xl bg-white p-4 shadow-sm hover:shadow-md"><p className="text-sm font-black text-violet-700">第 1～2 步：還沒有圖片</p><p className="mt-2 text-xs leading-6 text-slate-600">挑選主題、複製 AI 生圖指令。</p></Link>
              <Link to="/tools/line-sticker#mother-upload" className="rounded-2xl bg-white p-4 shadow-sm hover:shadow-md"><p className="text-sm font-black text-violet-700">第 3～4 步：已有圖片</p><p className="mt-2 text-xs leading-6 text-slate-600">上傳母圖，由 RXV 自動切圖、去背與整理。</p></Link>
              <Link to="/tools/animated-line-sticker#animated-sticker-batch" className="rounded-2xl bg-white p-4 shadow-sm hover:shadow-md"><p className="text-sm font-black text-violet-700">第 5 步：製作動態</p><p className="mt-2 text-xs leading-6 text-slate-600">已完成靜態圖，再選動畫效果並打包。</p></Link>
            </div>
            <details className="mt-4 rounded-xl border border-violet-100 bg-white p-3">
              <summary className="cursor-pointer text-xs font-black text-slate-800">進階：若自動去背不理想</summary>
              <p className="mt-2 text-xs leading-6 text-slate-600">一般情況先用本站自動去背。若文字或白色衣物被誤刪，再使用其他去背工具修正。</p>
              <a href={PHOTOROOM_BG_URL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex text-xs font-black text-violet-700 underline">PhotoRoom 去背工具（選用）</a>
            </details>
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

          <StickerCustomInquiry />
          {false && <GuideSupportSection />}

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
