import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const KOFI_SHOP_URL = "https://ko-fi.com/s/62381d787d";

type CategoryKey =
  | "all"
  | "lineSticker"
  | "businessImage"
  | "beauty"
  | "social";

type ShowcaseItem = {
  title: string;
  desc: string;
  img: string;
  tag: string;
  category: CategoryKey;
  promptHint: string;
  useCase: string;
};

const categories: Array<{ key: CategoryKey; label: string }> = [
  { key: "all", label: "全部成果" },
  { key: "lineSticker", label: "LINE 貼圖" },
  { key: "businessImage", label: "店家商業圖" },
  { key: "beauty", label: "美業服務" },
  { key: "social", label: "社群促銷" },
];

const showcaseItems: ShowcaseItem[] = [
  {
    title: "早餐店職業貼圖",
    desc: "適合早餐店、餐車、早午餐店日常回覆與預約使用。",
    img: "/images/showcase/breakfast-sticker.png",
    tag: "LINE貼圖",
    category: "lineSticker",
    useCase: "早安問候、外帶預訂、餐點完成、感謝支持、明天見。",
    promptHint:
      "早餐店老闆／店員、Q版可愛、白色背景、4×4 貼圖大圖、繁體中文粗體字、每格獨立留白。",
  },
  {
    title: "甜點店商業圖",
    desc: "適合 FB、IG、開幕活動、新品上市與品牌形象宣傳。",
    img: "/images/showcase/dessert-commercial.png",
    tag: "商業生圖",
    category: "businessImage",
    useCase: "新品上市、預購公告、節日活動、限時優惠、品牌形象圖。",
    promptHint:
      "甜點店老闆、蛋塔與甜點禮盒、溫暖療癒光線、商品清楚、社群貼文 1:1、乾淨商業圖。",
  },
  {
    title: "美甲師預約貼圖",
    desc: "適合預約、改期、色卡展示、補甲提醒與作品分享。",
    img: "/images/showcase/nail-sticker.png",
    tag: "美業",
    category: "beauty",
    useCase: "歡迎預約、色卡給你看、今日滿約、可以改期、謝謝喜歡。",
    promptHint:
      "美甲師角色、粉色系工作室、色卡與美甲工具、Q版精緻甜美、預約服務貼圖。",
  },
  {
    title: "飲料店促銷圖",
    desc: "適合新品上市、買一送一、限時活動與社群宣傳。",
    img: "/images/showcase/drink-promo.png",
    tag: "社群宣傳",
    category: "social",
    useCase: "新品上市、甜度冰塊提醒、外送活動、買一送一、限時優惠。",
    promptHint:
      "飲料店促銷圖、手搖杯、清爽夏日配色、大字標題、商品主體明確、適合 FB／IG。",
  },
  {
    title: "小店家客服貼圖",
    desc: "適合網拍、小吃店、甜點店與個人品牌日常客服回覆。",
    img: "/images/showcase/shop-support-sticker.png",
    tag: "店家客服",
    category: "lineSticker",
    useCase: "已收到、幫您確認、可以取貨囉、外送出發、感謝支持。",
    promptHint:
      "小店長／客服角色、圍裙、手機訂單、商品袋、Q版親切、LINE 回覆貼圖。",
  },
  {
    title: "花店花藝師貼圖",
    desc: "適合訂花、花束完成、配送提醒與節日祝福訊息。",
    img: "/images/showcase/florist-sticker.png",
    tag: "花藝",
    category: "lineSticker",
    useCase: "歡迎訂花、花束完成、卡片寫好了、配送出發、送上祝福。",
    promptHint: "花藝師、花束、緞帶、卡片、清新花藝風、Q版可愛、白色背景。",
  },
];

export default function StickerShowcaseGallery() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(
    showcaseItems[0],
  );

  const filteredItems = useMemo(() => {
    if (activeCategory === "all") return showcaseItems;
    return showcaseItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <>
      <SEO
        title="AI 貼圖與商業圖成果牆｜RxV AI工具中心"
        description="查看 RxV LINE 貼圖提示詞、店家商業圖、社群促銷圖與美業服務圖成果，可放大預覽並回到工具自行產生提示詞。"
        path="/tools/sticker-showcase"
        keywords="AI貼圖成果, LINE貼圖成果牆, 店家商業圖, AI生圖提示詞, RxV"
      />

      <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-violet-50 px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <Link
            to="/tools/sticker-prompt"
            className="mb-4 inline-block text-xs font-bold text-violet-600 hover:text-violet-700"
          >
            ← 回到 LINE 貼圖提示詞產生器
          </Link>

          <section className="rounded-3xl border border-pink-100 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-pink-600 px-3 py-1 text-xs font-black !text-white">
                成果牆
              </span>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">
                可放大預覽
              </span>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                店家／職業／社群素材
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-black leading-tight text-slate-900 sm:text-4xl">
              AI 貼圖與商業圖成果牆
            </h1>

            <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600 sm:text-base">
              這裡整理 LINE
              職業貼圖、店家宣傳圖、商品促銷圖與社群素材示範。點擊圖片可放大查看細節，也可回到提示詞工具套用類似主題。
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => setActiveCategory(category.key)}
                  className={`rounded-2xl px-4 py-2 text-sm font-black transition ${
                    activeCategory === category.key
                      ? "bg-pink-600 !text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-pink-100 hover:text-pink-700"
                  }`}
                  style={
                    activeCategory === category.key
                      ? { color: "#ffffff" }
                      : undefined
                  }
                >
                  {category.label}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredItems.map((item) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className={`overflow-hidden rounded-3xl border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                    selectedItem?.title === item.title
                      ? "border-pink-300 ring-4 ring-pink-100"
                      : "border-slate-100"
                  }`}
                >
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </div>

                  <div className="p-4">
                    <span className="rounded-full bg-violet-100 px-2 py-1 text-[11px] font-black text-violet-700">
                      {item.tag}
                    </span>
                    <h2 className="mt-3 text-base font-black text-slate-900">
                      {item.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.desc}
                    </p>
                    <span className="mt-3 inline-flex text-xs font-black text-pink-700">
                      點圖看放大細節 →
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-lg">
                {selectedItem ? (
                  <>
                    <div className="bg-slate-100 p-3">
                      <img
                        src={selectedItem.img}
                        alt={`${selectedItem.title}放大成果`}
                        className="mx-auto max-h-[72vh] w-full rounded-2xl object-contain"
                      />
                    </div>

                    <div className="p-5">
                      <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-black text-pink-700">
                        {selectedItem.tag}
                      </span>

                      <h2 className="mt-3 text-2xl font-black text-slate-900">
                        {selectedItem.title}
                      </h2>

                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {selectedItem.desc}
                      </p>

                      <div className="mt-4 rounded-2xl bg-violet-50 p-4">
                        <h3 className="text-sm font-black text-slate-900">
                          適合用途
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-700">
                          {selectedItem.useCase}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl bg-amber-50 p-4">
                        <h3 className="text-sm font-black text-slate-900">
                          提示詞方向
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-700">
                          {selectedItem.promptHint}
                        </p>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <Link
                          to="/tools/sticker-prompt"
                          className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-violet-700"
                          style={{ color: "#ffffff" }}
                        >
                          回工具產生提示詞
                        </Link>

                        <a
                          href={KOFI_SHOP_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-pink-600 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-pink-700"
                          style={{ color: "#ffffff" }}
                        >
                          購買進階模板
                        </a>
                      </div>
                    </div>
                  </>
                ) : null}
              </div>
            </aside>
          </section>

          <section className="mt-6 rounded-3xl border border-pink-100 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-slate-900">
              也想打造專屬店家貼圖或商業圖？
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              不論是早餐店、甜點店、美甲師、花店、飲料店或個人品牌，都可以依照你的店家風格，規劃成
              LINE 貼圖、社群宣傳圖、商品促銷圖與品牌形象素材。
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/tools/sticker-prompt"
                className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-violet-700"
                style={{ color: "#ffffff" }}
              >
                先用工具產生貼圖提示詞
              </Link>
              <a
                href={KOFI_SHOP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-pink-600 px-5 py-3 text-sm font-black !text-white shadow-md hover:bg-pink-700"
                style={{ color: "#ffffff" }}
              >
                查看進階模板
              </a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
