import { Link } from "react-router-dom";
import {
  BadgeCheck,
  Camera,
  Check,
  CircleDollarSign,
  ExternalLink,
  Gift,
  Globe2,
  Image,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Share2,
  Sparkles,
  Store,
} from "lucide-react";
import SEO from "@/components/SEO";

const painPoints = [
  "商品照片都散在 LINE、FB、IG，客人不好找",
  "客人一直問價格、品項、怎麼訂",
  "不想花大錢架網站",
  "只需要一個簡單可分享的商品目錄頁",
];

const features = [
  { label: "商品照片", icon: Image },
  { label: "商品名稱", icon: BadgeCheck },
  { label: "價格", icon: CircleDollarSign },
  { label: "商品介紹", icon: Store },
  { label: "LINE 詢問按鈕", icon: MessageCircle },
  { label: "電話／地址／社群", icon: Phone },
  { label: "公開網址", icon: Globe2 },
  { label: "QR Code 分享", icon: QrCode },
  { label: "可搭配名片 QR Code 使用", icon: Share2 },
];

const audiences = [
  "甜點店",
  "飲料店",
  "美業",
  "手作飾品",
  "服飾選物",
  "團購主",
  "攤商",
  "個人工作室",
  "接案者",
];

const plans = [
  {
    name: "免費試用 7 天",
    price: "7 天免費試用",
    tone: "emerald",
    description: "適合先整理商品資訊，確認展示頁是否符合日常接單需求。",
    items: [
      "可建立 1 個商品展示頁",
      "可先放 5 個商品或服務",
      "可放聯絡方式與社群",
      "到期後可升級正式版",
    ],
  },
  {
    name: "正式版",
    price: "首波 NT$199／3 個月",
    tone: "cyan",
    description: "適合開始把商品目錄放到名片、社群貼文與私訊中使用。",
    items: [
      "可放更多商品或服務",
      "可使用公開網址",
      "可搭配 QR Code 分享",
      "適合放在名片、社群、貼文與私訊中",
    ],
  },
  {
    name: "名片加值方案",
    price: "名片 2 盒 NT$399 含運",
    tone: "violet",
    description: "印名片時一起建立品牌入口，讓紙本名片可以連到線上介紹頁。",
    items: [
      "加送品牌介紹頁基本版 3 個月",
      "之後可升級為商品展示頁",
      "適合把 QR Code 放在名片、貼紙或立牌上",
    ],
  },
] as const;

function toneClass(tone: "emerald" | "cyan" | "violet") {
  const classes = {
    emerald: {
      badge: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      border: "border-emerald-200",
      button: "bg-emerald-600 hover:bg-emerald-700",
      icon: "bg-emerald-100 text-emerald-700",
    },
    cyan: {
      badge: "bg-cyan-50 text-cyan-700 ring-cyan-100",
      border: "border-cyan-200",
      button: "bg-cyan-600 hover:bg-cyan-700",
      icon: "bg-cyan-100 text-cyan-700",
    },
    violet: {
      badge: "bg-violet-50 text-violet-700 ring-violet-100",
      border: "border-violet-200",
      button: "bg-violet-600 hover:bg-violet-700",
      icon: "bg-violet-100 text-violet-700",
    },
  };

  return classes[tone];
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-black tracking-[0.18em] text-cyan-700">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

export default function ProductShowcaseLandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SEO
        title="小店商品展示頁｜商品目錄、LINE 詢問、QR Code 分享"
        description="不用自己架網站，也能建立商品展示頁。可放商品照片、價格、介紹、LINE、電話、地址與社群連結，適合小店、攤商、工作室與個人品牌。"
        path="/tools/product-showcase-page"
      />

      <section className="border-b border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_430px] lg:items-center lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-3 py-1.5 text-sm font-black text-cyan-800 shadow-sm">
              <Store className="h-4 w-4" aria-hidden="true" />
              小店商品展示頁
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
              小店商品展示頁｜不用自己架站，也能展示商品與服務
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-700">
              可放商品照片、價格、介紹、LINE 詢問按鈕、電話、地址、社群連結與 QR Code，適合小店家、攤商、工作室與個人品牌。
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/login"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-lg"
              >
                登入後申請 7 天試用
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                to="/shop/rxv"
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-white px-6 py-3 text-base font-black text-cyan-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-50 hover:shadow-md"
              >
                查看範例頁
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-500">
              目前試用採人工開通；登入或註冊後可申請協助開通。
            </p>
          </div>

          <div className="rounded-[28px] border border-cyan-100 bg-white p-5 shadow-xl">
            <div className="rounded-3xl bg-gradient-to-br from-cyan-700 via-sky-700 to-emerald-600 p-4 text-white">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-cyan-200">甜點工作室</p>
                  <h2 className="mt-1 text-2xl font-black">本週商品目錄</h2>
                </div>
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-slate-950">
                  <QrCode className="h-9 w-9" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {[
                  ["草莓生乳捲", "NT$420", "今日可預訂"],
                  ["檸檬塔禮盒", "NT$360", "適合送禮"],
                  ["手工餅乾罐", "NT$280", "常溫配送"],
                ].map(([name, price, tag]) => (
                  <div key={name} className="grid grid-cols-[72px_1fr] gap-3 rounded-2xl bg-white/10 p-3">
                    <div className="grid h-[72px] place-items-center rounded-xl bg-gradient-to-br from-amber-200 to-rose-200 text-amber-900">
                      <Camera className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-black">{name}</h3>
                        <p className="shrink-0 font-black text-cyan-200">{price}</p>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{tag}</p>
                      <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-white">
                        <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                        LINE 詢問
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-2 rounded-2xl bg-white p-4 text-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <MapPin className="h-4 w-4 text-cyan-700" aria-hidden="true" />
                  基隆／新北／台北｜可自取、可宅配
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Share2 className="h-4 w-4 text-cyan-700" aria-hidden="true" />
                  /shop/sweet-studio
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="WHY"
          title="客人不是不想買，是資訊太分散"
          description="商品資訊整理成一個公開頁面，私訊、貼文、名片與 QR Code 都能導到同一個地方。"
        />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((point) => (
            <div key={point} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-700">
                <Check className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-base font-black leading-relaxed text-slate-900">{point}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="FEATURES"
            title="商品目錄該有的資訊，一頁放好"
            description="不用做完整購物網站，先把客人最常問的內容整理清楚。"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ label, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-100 text-cyan-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="font-black text-slate-900">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="FOR"
          title="適合正在用 LINE、社群接單的小店與個人品牌"
        />
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {audiences.map((item) => (
            <span
              key={item}
              className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-base font-black text-emerald-800"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="border-y border-cyan-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="RESULT"
            title="試用後你會得到什麼？"
            description="不是再多開一個複雜網站，而是把客人最需要看的商品、價格與聯絡方式整理成一個可分享入口。"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              "公開商品展示網址",
              "可分享給客人的商品目錄頁",
              "可放在名片上的 QR Code",
              "可放在 FB、IG、LINE 的連結",
            ].map((item) => (
              <div key={item} className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5 text-center shadow-sm">
                <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-white text-cyan-700 shadow-sm">
                  <Check className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-4 text-base font-black leading-relaxed text-cyan-950">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-gradient-to-br from-white via-cyan-50 to-violet-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="PLANS"
            title="選擇適合你的小店展示方案"
            description="可先申請 7 天免費試用，確認商品展示頁是否適合你的接單方式；正式版首波 NT$199／3 個月。"
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {plans.map((plan) => {
              const tone = toneClass(plan.tone);
              return (
                <article
                  key={plan.name}
                  className={`flex h-full flex-col rounded-[24px] border ${tone.border} bg-white p-6 shadow-sm`}
                >
                  <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ring-1 ${tone.badge}`}>
                    {plan.name}
                  </span>
                  <h3 className="mt-4 text-2xl font-black text-slate-950">{plan.price}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{plan.description}</p>
                  <ul className="mt-5 space-y-3">
                    {plan.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm font-bold leading-relaxed text-slate-700">
                        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${tone.icon}`}>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={
                      plan.name === "免費試用 7 天"
                        ? "/login"
                        : plan.name === "正式版"
                          ? "/payment/bank-transfer?plan=199&mode=storefront"
                          : "/tools/business-card-order"
                    }
                    className={`mt-6 inline-flex min-h-[46px] items-center justify-center rounded-xl px-5 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 ${tone.button}`}
                  >
                    {plan.name === "免費試用 7 天"
                      ? "申請 7 天免費試用"
                      : plan.name === "正式版"
                        ? "購買 NT$199／3 個月"
                        : "查看名片方案"}
                  </Link>
                </article>
              );
            })}
          </div>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              to="/login"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-cyan-600 px-6 py-3 text-base font-black !text-white shadow-md transition hover:bg-cyan-700"
            >
              登入後申請 7 天試用
            </Link>
            <Link
              to="/tools/business-card-order"
              className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-violet-200 bg-white px-6 py-3 text-base font-black text-violet-800 shadow-sm transition hover:bg-violet-50"
            >
              查看名片加值方案
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[28px] border border-cyan-200 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="grid aspect-[4/3] place-items-center rounded-3xl bg-gradient-to-br from-cyan-600 via-sky-600 to-emerald-500 p-6 text-white">
            <div className="max-w-sm">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
                <Sparkles className="h-8 w-8" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-3xl font-black leading-tight">照片先整理好，展示頁更好看</h2>
              <p className="mt-3 text-base leading-relaxed text-cyan-50">
                商品照片、社群貼文、展示頁素材可以一起規劃。
              </p>
            </div>
          </div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-800 ring-1 ring-amber-100">
              <Gift className="h-4 w-4" aria-hidden="true" />
              商品圖工具導流
            </div>
            <h2 className="mt-4 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              商品照片不夠漂亮也沒關係
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-700">
              可搭配 AI 商品圖工具，先把照片整理成適合展示頁與社群使用的圖片。圖片清楚、風格一致，客人點進商品展示頁時會更容易理解品項與價格。
            </p>
            <Link
              to="/tools/product-image-generator"
              className="mt-6 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-base font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-lg"
            >
              前往 AI 商品圖工具
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
