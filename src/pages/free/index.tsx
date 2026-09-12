import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SEO, { getBaseUrl } from "@/components/SEO";
import LineStickerAuthorCard from "@/components/LineStickerAuthorCard";

const kofiShopUrl = "https://ko-fi.com/s/62381d787d";

type ResourceItem = {
  title: string;
  desc: string;
  href: string;
  cta: string;
  type?: "download" | "link" | "external";
};

type ResourceSection = {
  title: string;
  description: string;
  items: ResourceItem[];
};

const premiumFeatures = [
  "完整多主題與多職業貼圖提示詞模板",
  "加贈多職業／店家／客服／業務／接案者主題模板",
  "可搭配免費提示詞工具與 LINE 貼圖分割打包工具使用",
  "可重複替換店名、商品、優惠、活動、客群與 CTA",
  "適合店家社群經營、接案展示、LINE 貼圖服務與商業貼文",
  "後續可延伸：寵物、甜點、早午晚安圖、古風形象圖等商業模板",
];

const resourceSections: ResourceSection[] = [
  {
    title: "LINE 貼圖資源",
    description:
      "適合想做 LINE 貼圖、Q 版人物貼圖、店家客服貼圖的新手與商業經營者使用。",
    items: [
      {
        title: "進階版｜100 組咒語＋多職業商業模板",
        desc: "適合店家、小編、接案者、客服與業務使用，可替換店名、商品、優惠、活動與 CTA，用來做貼圖素材與社群行銷。",
        href: kofiShopUrl,
        cta: "購買進階版 Excel 模板",
        type: "external",
      },
      {
        title: "LINE 貼圖提示詞工具",
        desc: "選主題後快速產生貼圖提示詞，適合搭配 AI 生圖工具使用。",
        href: "/tools/sticker-prompt",
        cta: "開啟工具",
      },
      {
        title: "LINE 貼圖分割打包工具",
        desc: "上傳 4x4 / 5x4 貼圖大圖後，可切割整理並打包 ZIP。",
        href: "/tools/line-sticker",
        cta: "前往打包",
      },
    ],
  },
  {
    title: "AI 生圖資源",
    description:
      "之後會陸續新增 Q 版人物、商品圖、早安圖、節日圖、古風女神與品牌吉祥物提示詞。",
    items: [
      {
        title: "AI 生圖提示詞產生器",
        desc: "選擇用途、主題、風格與氛圍，一鍵產生一般圖片 Prompt。",
        href: "/tools/image-prompt",
        cta: "開啟生圖提示詞",
      },
      {
        title: "免費圖片素材",
        desc: "整理可下載的免費圖片、示範圖與素材靈感，適合社群貼文與創作參考。",
        href: "/images",
        cta: "查看免費圖片",
      },
    ],
  },
  {
    title: "文案／社群資源",
    description: "適合 FB、Threads、社團推廣、商品文案與私訊回覆使用。",
    items: [
      {
        title: "文案咒語包（規劃中）",
        desc: "未來會整理社群貼文、商品痛點文案、活動宣傳與私訊回覆範本。",
        href: "/tools",
        cta: "查看工具總覽",
      },
    ],
  },
  {
    title: "實用工具入口",
    description: "圖片處理、QR Code、貼圖製作等工具會持續更新。",
    items: [
      {
        title: "工具總覽",
        desc: "查看目前網站已整理的免費工具與創作輔助功能。",
        href: "/tools",
        cta: "前往工具總覽",
      },
      {
        title: "QR Code 產生器",
        desc: "可用於活動頁、下載頁、商品頁與社群導流。",
        href: "/tools/qr-code",
        cta: "產生 QR Code",
      },
      {
        title: "圖片尺寸調整",
        desc: "調整圖片尺寸，方便貼圖、商品圖與社群圖片使用。",
        href: "/tools/image-resize",
        cta: "調整圖片",
      },
    ],
  },
];

function ButtonLink({ item }: { item: ResourceItem }) {
  const className =
    "inline-flex w-full items-center justify-center rounded-xl bg-pink-500 px-4 py-3 text-center text-sm font-bold !text-white transition hover:bg-pink-600";

  if (item.type === "download") {
    return (
      <a
        href={item.href}
        download
        className={className}
        style={{ color: "#ffffff" }}
      >
        {item.cta}
      </a>
    );
  }

  if (item.type === "external") {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        className={className}
        style={{ color: "#ffffff" }}
      >
        {item.cta}
      </a>
    );
  }

  return (
    <Link to={item.href} className={className} style={{ color: "#ffffff" }}>
      {item.cta}
    </Link>
  );
}

function ResourceCard({ item }: { item: ResourceItem }) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 text-lg font-bold text-slate-900">{item.title}</div>
      <p className="mb-4 min-h-[48px] text-sm leading-6 text-slate-600">
        {item.desc}
      </p>
      <ButtonLink item={item} />
    </div>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 text-xs font-black text-pink-700">
            ✓
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function FreeResourcesPage() {
  const baseUrl = getBaseUrl().replace(/\/$/, "");

  return (
    <>
      <SEO
        title="創作資源中心｜LINE 貼圖提示詞、AI 生圖工具、進階模板"
        description="網站提供 LINE 貼圖提示詞與 AI 生圖工具線上試用；需要完整主題、多職業、店家行銷與接案用途，可購買進階版 Excel 模板。"
        keywords="LINE貼圖提示詞,AI生圖提示詞,貼圖咒語,Ko-fi模板,商業貼圖模板,文案模板,免費圖片"
        path="/free"
      />
      <Helmet>
        <link rel="canonical" href={`${baseUrl}/free`} />
      </Helmet>

      <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-orange-50 px-4 py-8 text-slate-900">
        <section className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-white p-6 shadow-sm md:p-10">
            <div className="mb-4 inline-flex rounded-full bg-pink-100 px-4 py-2 text-sm font-bold text-pink-700">
              RxV 創作資源中心
            </div>
            <h1 className="mb-4 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
              創作資源中心｜LINE 貼圖提示詞、AI 生圖工具、進階模板
            </h1>
            <p className="max-w-3xl text-base leading-8 text-slate-600 md:text-lg">
              這裡分成兩種使用方式：網站工具提供免費線上試做，方便快速複製提示詞、測試圖片效果；進階版
              Excel
              模板則整理完整主題、職業、風格與下拉選項，適合收藏、接案、店家行銷與重複使用。需要店家、接案、客服、業務或商業行銷用途，可購買進階版
              Excel 模板。
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href={kofiShopUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-orange-500 px-6 py-3 text-center font-bold !text-white shadow-sm transition hover:bg-orange-600"
                style={{ color: "#ffffff" }}
              >
                購買進階版 Excel 模板
              </a>
              <Link
                to="/tools/sticker-prompt"
                className="rounded-2xl bg-violet-600 px-6 py-3 text-center font-bold !text-white shadow-sm transition hover:bg-violet-700"
                style={{ color: "#ffffff" }}
              >
                開啟貼圖提示詞工具
              </Link>
            </div>
          </div>

          <LineStickerAuthorCard />

          <section className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
              <div className="mb-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700">
                網站免費使用
              </div>
              <h2 className="text-xl font-black text-slate-950">
                先線上試效果
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                網站工具放熱門主題與示範效果，適合先複製提示詞、快速測試圖片風格，也方便發社團時導流給網友體驗。
              </p>
              <Link
                to="/tools/image-prompt"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black !text-white hover:bg-emerald-700"
                style={{ color: "#ffffff" }}
              >
                開啟生圖提示詞工具
              </Link>
            </div>

            <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm">
              <div className="mb-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-black text-orange-700">
                Excel 模板販售
              </div>
              <h2 className="text-xl font-black text-slate-950">
                完整下拉模板包
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                Excel 版放完整 100
                組、更多職業、用途、風格、色調與可重複使用的下拉選項，適合店家、接案、社群經營與商業行銷。
              </p>
              <a
                href={kofiShopUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black !text-white hover:bg-orange-600"
                style={{ color: "#ffffff" }}
              >
                購買進階版 Excel 模板
              </a>
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-violet-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-2 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                網站線上試用
              </div>
              <h2 className="text-2xl font-black text-slate-950">
                先用網站工具產生提示詞
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                一般使用者可直接在網站選主題、複製提示詞、測試 4x4 / 5x4
                貼圖排版，不需要下載 Excel。若 AI
                工具排版不穩，可先用無文字版產生角色草稿，再回本站整理。
              </p>
              <Link
                to="/tools/sticker-prompt"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-violet-600 px-6 py-3 text-center font-bold !text-white transition hover:bg-violet-700"
                style={{ color: "#ffffff" }}
              >
                開啟貼圖提示詞工具
              </Link>
            </div>

            <div className="rounded-3xl border border-orange-200 bg-orange-50 p-6 shadow-sm md:p-8">
              <div className="mb-2 inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                進階商業版
              </div>
              <h2 className="text-2xl font-black text-slate-950">
                多主題＋多職業商業模板
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                適合想拿來經營社群、服務客戶、做店家貼圖、接案展示或販售模板的人，內容偏商業應用，並建議搭配提示詞工具、分割工具與打包工具形成完整流程。
              </p>
              <FeatureList items={premiumFeatures} />
              <a
                href={kofiShopUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-orange-500 px-6 py-3 text-center font-bold !text-white transition hover:bg-orange-600"
                style={{ color: "#ffffff" }}
              >
                購買進階版 Excel 模板
              </a>
            </div>
          </section>

          <div className="mt-8 rounded-3xl border border-yellow-200 bg-yellow-50 p-5 text-sm leading-7 text-slate-700 md:p-6">
            <b>建議流程：</b> 先開啟貼圖提示詞工具試做 → 選擇 4x4 或 5x4 →
            選主題與文字樣式 → 複製提示詞 → 到 AI 生圖工具產生貼圖大圖 → 使用
            LINE 貼圖分割打包工具整理 ZIP。若 Gemini／豆包產生的圖無法穩定
            4x4，請改用「穩定無文字版」先產生角色草稿，再後製加字與切割。需要店家／接案／商業用途，可購買進階版
            Excel 模板。
          </div>

          <section className="mt-8 rounded-3xl border border-amber-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-2 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
              AI 生圖穩定度提醒
            </div>
            <h2 className="text-2xl font-black text-slate-950">
              Gemini／豆包跑版時，改用無文字草稿流程
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              有些 AI 工具會把 4x4
              畫成海報、上下兩組、格線不平均，或把繁體中文字畫錯。這不是模板壞掉，而是不同
              AI 生圖模型對排版與文字控制的穩定度不同。
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "完整 4x4 版",
                  desc: "適合先用 ChatGPT 圖像生成測試，有機會直接產生含文字貼圖大圖。",
                },
                {
                  title: "穩定無文字版",
                  desc: "適合 Gemini、豆包跑版時使用，先生成角色表情草稿，成功率較高。",
                },
                {
                  title: "分割打包工具",
                  desc: "將可用大圖回到本站切割、整理、加字或打包成 ZIP。",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-amber-100 bg-amber-50 p-5"
                >
                  <h3 className="font-black text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Link
                to="/tools/sticker-prompt"
                className="inline-flex items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-violet-700 hover:!text-white"
                style={{ color: "#ffffff" }}
              >
                開啟提示詞工具
              </Link>
              <Link
                to="/tools/line-sticker"
                className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-blue-700 hover:!text-white"
                style={{ color: "#ffffff" }}
              >
                開啟分割打包工具
              </Link>
            </div>
          </section>

          <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <div className="mb-4">
              <h2 className="text-2xl font-black text-slate-950">
                可委託製作項目
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                需要客製圖片或貼圖素材，也可以參考以下服務方向。適合個人創作者、小店家、甜點店、花店、社群小編與接案者使用。
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Q 版 LINE 貼圖",
                  desc: "可製作個人頭像貼圖、店家客服回覆貼圖、節日祝福貼圖與角色貼圖。",
                },
                {
                  title: "古風／夢幻形象圖",
                  desc: "可製作個人形象圖、品牌主視覺、社群封面圖與短影音素材圖。",
                },
                {
                  title: "店家社群素材",
                  desc: "可製作早午晚安圖、商品宣傳圖、活動海報、甜點／花藝／餐飲貼文圖。",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                >
                  <h3 className="font-black text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl bg-pink-50 p-5 text-sm leading-7 text-slate-700">
              想做類似作品，可先準備照片、想要的主題、用途與文字內容，再透過下方資源或
              Ko-fi 入口了解更多。
            </div>
          </section>

          <div className="mt-10 space-y-10">
            {resourceSections.map((section) => (
              <section key={section.title}>
                <div className="mb-4">
                  <h2 className="text-2xl font-black text-slate-950">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {section.description}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((item) => (
                    <ResourceCard key={item.title} item={item} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-10 rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-3 text-2xl font-black">更新紀錄</h2>
            <ul className="space-y-2 text-sm leading-6 text-slate-700">
              <li>
                v1.2｜移除免費 Excel
                下載入口，改為導向網站工具試用與進階版模板購買。
              </li>
              <li>
                v1.0｜新增 LINE 貼圖 4x4 / 5x4 提示詞產生器與貼圖製作流程。
              </li>
              <li>
                預計新增：AI
                生圖咒語包、文字文案咒語包、免費圖片素材、更多店家主題貼圖範本。
              </li>
            </ul>
          </section>

          <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-xs leading-6 text-slate-500 md:p-8">
            <b>使用提醒：</b> 本頁資源主要用於創作參考、提示詞整理與貼圖企劃。AI
            生圖工具不保證每次都能一次產生完整
            4x4／5x4，也可能出現文字錯誤、角色不一致或格線不平均；建議多生成幾次，或改用無文字草稿流程。若使用真人照片製作貼圖，請先取得當事人同意。若要上架
            LINE 貼圖，仍需依 LINE Creators Market 審核規範為準。購買進階版
            Excel 模板前，請先確認商品頁說明與檔案內容。
          </section>
        </section>
      </main>
    </>
  );
}
