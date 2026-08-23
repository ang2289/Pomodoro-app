import { Link } from "react-router-dom";
import SEO from "@/components/SEO";

const showcaseItems = [
  {
    type: "甜點／蛋塔",
    before: "手機隨手拍、桌面雜物較多、光線偏暗",
    after: "整理成暖色系商品主圖，主體更清楚，適合 FB／IG 發文",
    tags: ["甜點店", "新品上市", "社群貼文"],
  },
  {
    type: "花店／花束",
    before: "背景較亂、花束特色不夠突出",
    after: "升級成節慶感花禮宣傳圖，可放預約與送禮文字",
    tags: ["花店", "節慶花禮", "預約導流"],
  },
  {
    type: "美甲／作品圖",
    before: "作品照可用，但缺少品牌感與版面整理",
    after: "整理成美甲作品展示圖，適合 IG、限動與預約宣傳",
    tags: ["美甲師", "作品集", "預約制"],
  },
];

const serviceItems = [
  {
    title: "商品主圖升級",
    text: "把手機隨手拍的商品照，整理成乾淨、主體清楚、適合商品頁與社群曝光的高質感圖片。",
  },
  {
    title: "社群宣傳圖",
    text: "可加入店名、活動文字、優惠資訊與行動呼籲，適合 FB、IG、Threads、LINE 分享。",
  },
  {
    title: "多平台尺寸輸出",
    text: "同一張圖可延伸為 1:1、4:5、9:16、16:9 等版本，方便用在蝦皮、IG、限動與網站。",
  },
];

const plans = [
  {
    name: "體驗款",
    price: "399 元起",
    desc: "適合先試做 1 張商品圖，看商品是否適合升級。",
    items: ["商品圖升級 1 張", "可放簡短文字", "提供 JPG／PNG", "基礎修改 1 次"],
  },
  {
    name: "小店主力款",
    price: "999 元起",
    desc: "適合想一次取得商品主圖、社群圖與活動圖的小店。",
    items: ["商品升級圖 3 張", "主圖／宣傳圖／活動圖", "可依平台調整比例", "基礎修改 1 次"],
    highlight: true,
  },
  {
    name: "商品發文包",
    price: "1,980 元起",
    desc: "適合需要圖文一起整理，準備直接拿去發文宣傳的店家。",
    items: ["商品圖 3 張", "社群宣傳圖 2 張", "簡短發文文案 2 則", "多平台尺寸輸出"],
  },
];

const examples = [
  "蛋塔／甜點禮盒",
  "早餐／飲料商品",
  "花束／節慶花禮",
  "美甲／美容作品",
  "手作小物／市集商品",
  "蝦皮／網拍商品主圖",
];

export default function ProductImageUpgradeService() {
  return (
    <>
      <SEO
        title="商品圖升級服務｜隨手拍商品照升級成高質感商品圖"
        description="把手機隨手拍商品照升級成適合 FB、IG、Threads、蝦皮與小店宣傳的高質感商品圖，可製作商品主圖、社群宣傳圖與多平台尺寸輸出。"
        canonical="/services/product-image-upgrade"
      />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-orange-50 via-white to-rose-50 p-6 shadow-sm ring-1 ring-orange-100 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                RxV 小店商品圖服務
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                隨手拍商品照，升級成高質感商品圖
              </h1>
              <p className="mt-4 text-base leading-8 text-slate-700 sm:text-lg">
                商品本身不差，但手機拍起來不夠吸引人？可協助把普通商品照整理成更乾淨、更有品牌感、更適合社群宣傳與商品頁使用的圖片。
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="mailto:rxv0227@gmail.com?subject=商品圖升級服務詢問&body=您好，我想詢問商品圖升級服務。%0D%0A商品類型：%0D%0A用途：FB／IG／蝦皮／限動／網站%0D%0A想放的文字：%0D%0A希望風格：%0D%0A預算範圍："
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-orange-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-orange-700 hover:!text-white hover:shadow-lg"
                >
                  上傳照片詢問
                </a>
                <Link
                  to="/tools/image-prompt"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-violet-700 hover:!text-white hover:shadow-lg"
                >
                  先用提示詞工具
                </Link>
                <Link
                  to="/tools/image-resize"
                  className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold !text-white shadow transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:!text-white hover:shadow-lg"
                >
                  圖片尺寸工具
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-white bg-white/90 p-5 shadow-sm">
              <p className="text-sm font-extrabold text-slate-900">適合這些客戶</p>
              <div className="mt-4 grid gap-3 text-sm font-semibold text-slate-700">
                {examples.map((item) => (
                  <div key={item} className="rounded-2xl bg-orange-50 px-4 py-3">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-orange-200 bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold text-orange-700">展示方式</p>
              <h2 className="text-2xl font-extrabold text-slate-900">隨手拍升級後，可以變成這些用途</h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-slate-600">
              這裡先用文字展示服務方向；之後可把實際案例圖放進來，改成「原始隨手拍／升級後商品圖／社群宣傳版」三欄展示。
            </p>
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {showcaseItems.map((item) => (
              <article key={item.type} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm">
                <div className="grid grid-cols-2 gap-px bg-slate-200">
                  <div className="bg-white p-4">
                    <p className="text-xs font-bold text-slate-500">隨手拍狀態</p>
                    <div className="mt-3 flex h-28 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 text-center text-xs leading-5 text-slate-500">
                      {item.before}
                    </div>
                  </div>
                  <div className="bg-orange-50 p-4">
                    <p className="text-xs font-bold text-orange-700">升級後用途</p>
                    <div className="mt-3 flex h-28 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 px-3 text-center text-xs font-semibold leading-5 text-slate-700">
                      {item.after}
                    </div>
                  </div>
                </div>
                <div className="bg-white p-5">
                  <h3 className="text-lg font-extrabold text-slate-900">{item.type}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          {serviceItems.map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <h2 className="text-2xl font-extrabold text-slate-900">服務方案</h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            以下為起始方案，實際價格會依商品照片品質、張數、是否加文字、是否需要多尺寸輸出調整。正式製作前會先確認需求與報價。
          </p>
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border p-5 shadow-sm ${
                  plan.highlight
                    ? "border-orange-300 bg-orange-50 ring-2 ring-orange-100"
                    : "border-slate-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-xl font-extrabold text-slate-900">{plan.name}</h3>
                  {plan.highlight && (
                    <span className="rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">
                      推薦
                    </span>
                  )}
                </div>
                <p className="mt-3 text-3xl font-extrabold text-orange-700">{plan.price}</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{plan.desc}</p>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                  {plan.items.map((item) => (
                    <li key={item}>✓ {item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900">委託流程</h2>
            <ol className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
              <li><b>1. 上傳商品照：</b>提供原始照片、商品類型與用途。</li>
              <li><b>2. 確認方向：</b>確認要做商品主圖、社群圖、活動圖或多尺寸輸出。</li>
              <li><b>3. 報價製作：</b>確認價格後開始製作。</li>
              <li><b>4. 交付圖片：</b>提供可直接發文或上架使用的 JPG／PNG。</li>
            </ol>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <h2 className="text-xl font-extrabold text-slate-900">注意事項</h2>
            <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-700">
              <li>• 商品圖升級以視覺整理與宣傳呈現為主，不做誇大功效宣稱。</li>
              <li>• 客戶提供的照片、Logo、品牌素材需確認有使用權。</li>
              <li>• 若圖片品質過低，會先評估是否適合製作。</li>
              <li>• 醫療、減肥、保健、功效型商品需避免不實前後效果宣稱。</li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
