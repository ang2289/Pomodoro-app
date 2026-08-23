import { useState } from "react";
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

const purchaseUrl = "/payment/bank-transfer?plan=199&mode=storefront";
const sampleUrl = "/shop/rxv";

function getAuthToken() {
  if (typeof window === "undefined") return "";
  return String(window.localStorage.getItem("auth_token") || window.localStorage.getItem("token") || "").trim();
}

function goToLoginForTrial() {
  if (typeof window === "undefined") return;
  const returnTo = `${window.location.pathname}${window.location.search}`;
  try {
    window.sessionStorage.setItem("rxv_auth_return_to", returnTo);
  } catch {
    // sessionStorage 失敗不影響登入流程。
  }
  window.location.assign(`/login?returnTo=${encodeURIComponent(returnTo)}`);
}

const painPoints = [
  "商品照片散在 LINE、FB、IG，客人常常找不到",
  "客人一直重複問價格、品項、怎麼訂",
  "想有網站，但不想花大錢架完整電商",
  "只需要一個能放商品、價格與聯絡方式的頁面",
];

const features = [
  { label: "商品照片", icon: Image },
  { label: "商品名稱", icon: BadgeCheck },
  { label: "價格與規格", icon: CircleDollarSign },
  { label: "商品介紹", icon: Store },
  { label: "LINE 詢問按鈕", icon: MessageCircle },
  { label: "電話／地址／社群", icon: Phone },
  { label: "公開網址", icon: Globe2 },
  { label: "QR Code 分享", icon: QrCode },
  { label: "可放在名片或貼文中", icon: Share2 },
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

const results = [
  "一個可分享的商品展示網址",
  "客人可直接看商品、價格與介紹",
  "可放 LINE 詢問、電話、地址與社群",
  "可搭配 QR Code 放在名片、貼文與立牌",
];

const primaryButtonClass =
  "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-6 py-3 text-base font-black !text-white shadow-lg shadow-cyan-200/70 transition hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-xl";
const secondaryButtonClass =
  "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-cyan-200 bg-white px-6 py-3 text-base font-black text-cyan-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-cyan-50 hover:shadow-md";
const violetButtonClass =
  "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-violet-600 px-6 py-3 text-base font-black !text-white shadow-lg shadow-violet-200/70 transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-xl";
const greenButtonClass =
  "inline-flex min-h-[50px] items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-base font-black !text-white shadow-lg shadow-emerald-200/70 transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl";

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

function DemoProductCard({ name, price, tag }: { name: string; price: string; tag: string }) {
  return (
    <div className="grid grid-cols-[74px_1fr] gap-3 rounded-2xl border border-cyan-100 bg-white p-3 shadow-sm">
      <div className="grid h-[74px] place-items-center rounded-xl bg-gradient-to-br from-amber-100 via-rose-100 to-cyan-100 text-cyan-700">
        <Camera className="h-7 w-7" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-black text-slate-950">{name}</h3>
          <p className="shrink-0 rounded-full bg-cyan-50 px-2 py-1 text-xs font-black text-cyan-700">{price}</p>
        </div>
        <p className="mt-1 text-sm font-bold text-slate-500">{tag}</p>
        <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black !text-white">
          <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
          LINE 詢問
        </span>
      </div>
    </div>
  );
}

export default function ProductShowcaseLandingPage() {
  const [trialSubmitting, setTrialSubmitting] = useState(false);
  const [trialMessage, setTrialMessage] = useState("");
  const [trialError, setTrialError] = useState("");

  const requestTrial = async () => {
    const token = getAuthToken();
    if (!token) {
      goToLoginForTrial();
      return;
    }

    setTrialSubmitting(true);
    setTrialMessage("");
    setTrialError("");

    try {
      const response = await fetch("/api/main?action=create-storefront-trial-request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestNote: "商品展示頁 7 天試用申請" }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(data?.error || "送出試用申請失敗，請稍後再試。"));

      setTrialMessage(String(data?.message || "已收到 7 天試用申請，站方審核後會人工開通。"));
    } catch (error) {
      setTrialError(error instanceof Error ? error.message : "送出試用申請失敗，請稍後再試。");
    } finally {
      setTrialSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <SEO
        title="小店商品展示頁｜商品目錄、LINE 詢問、QR Code 分享"
        description="不用自己架網站，也能建立商品展示頁。可放商品照片、價格、介紹、LINE、電話、地址與社群連結，適合小店、攤商、工作室與個人品牌。"
        path="/tools/product-showcase-page"
      />

      <section className="border-b border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_440px] lg:items-center lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white px-4 py-2 text-sm font-black text-cyan-800 shadow-sm">
              <Store className="h-4 w-4" aria-hidden="true" />
              小店商品展示頁正式版
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
              不用自己架站，也能有一個可分享的商品展示頁
            </h1>

            <p className="mt-5 max-w-3xl text-lg leading-relaxed text-slate-700">
              可放商品照片、價格、介紹、LINE 詢問按鈕、電話、地址、社群連結與 QR Code。
              適合小店家、攤商、工作室、團購主與個人品牌。
            </p>

            <div className="mt-7 max-w-2xl rounded-[28px] border border-cyan-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-cyan-700">首波體驗價</p>
                  <p className="mt-1 text-4xl font-black text-slate-950">
                    NT$199
                    <span className="ml-2 text-lg font-black text-slate-600">／3 個月</span>
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-500">平均一天不到 NT$3，先讓客人找得到商品與聯絡方式。</p>
                </div>
                <Link to={purchaseUrl} className={primaryButtonClass}>
                  立即購買 3 個月方案
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-black text-emerald-900">想先試用？可先申請免費試用 7 天</p>
                <p className="mt-1 text-sm font-bold leading-relaxed text-emerald-800">
                  先建立 1 個商品展示頁，確認是否適合你的接單方式，再決定是否升級正式版。
                </p>
                <button
                  type="button"
                  onClick={() => void requestTrial()}
                  disabled={trialSubmitting}
                  className="mt-3 inline-flex min-h-[42px] items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-black text-emerald-800 shadow-sm transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {trialSubmitting ? "申請送出中…" : "登入後申請 7 天試用"}
                </button>
                {trialMessage ? <p className="mt-3 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-black text-emerald-800">{trialMessage}</p> : null}
                {trialError ? <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-black text-rose-800">{trialError}</p> : null}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link to={sampleUrl} className={secondaryButtonClass}>
                查看範例頁
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link to="/tools/product-image-generator" className={secondaryButtonClass}>
                搭配 AI 商品圖工具
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="rounded-[32px] border border-cyan-100 bg-white p-5 shadow-xl">
            <div className="overflow-hidden rounded-[26px] bg-gradient-to-br from-white via-cyan-50 to-emerald-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-cyan-700">範例店家展示頁</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">商品／服務目錄</h2>
                  <p className="mt-1 text-sm font-bold text-slate-500">示意畫面｜可換成你的店家資料</p>
                </div>
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-cyan-700 shadow-sm">
                  <QrCode className="h-9 w-9" aria-hidden="true" />
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <DemoProductCard name="商品項目 A" price="價格範例" tag="可放規格、預訂或服務說明" />
                <DemoProductCard name="商品項目 B" price="價格範例" tag="可放商品特色與注意事項" />
                <DemoProductCard name="服務項目 C" price="價格範例" tag="可放服務內容與預約方式" />
              </div>

              <div className="mt-4 grid gap-2 rounded-2xl bg-white p-4 text-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <MapPin className="h-4 w-4 text-cyan-700" aria-hidden="true" />
                  可自取、可宅配、可放營業資訊
                </div>
                <div className="flex items-center gap-2 text-sm font-bold">
                  <Share2 className="h-4 w-4 text-cyan-700" aria-hidden="true" />
                  /shop/your-store
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-cyan-600 px-4 py-3 text-center text-sm font-black !text-white shadow-md">
                這裡會換成你的商品、價格、照片與聯絡方式
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="WHY"
          title="客人不是不想買，是資訊太分散"
          description="把商品資訊整理成一個公開頁，私訊、貼文、名片與 QR Code 都能導到同一個地方。"
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

      <section className="border-y border-cyan-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="RESULT"
            title="購買後可以得到什麼？"
            description="不是完整電商平台，而是小店可立即分享給客人的商品目錄與品牌入口。"
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {results.map((item) => (
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

      <section className="border-b border-slate-200 bg-white">
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

      <section className="border-y border-slate-200 bg-gradient-to-br from-white via-cyan-50 to-violet-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="PRICE"
            title="選擇適合你的小店展示方案"
            description="正式版可直接購買 3 個月；也可先申請 7 天免費試用。"
          />

          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            <article className="flex h-full flex-col rounded-[28px] border-2 border-cyan-300 bg-white p-6 shadow-lg">
              <span className="inline-flex w-fit rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700 ring-1 ring-cyan-100">
                推薦方案
              </span>
              <h3 className="mt-4 text-3xl font-black text-slate-950">NT$199／3 個月</h3>
              <p className="mt-3 text-sm font-bold leading-relaxed text-slate-600">
                適合開始把商品目錄放到名片、社群貼文、LINE 私訊與 QR Code 中使用。
              </p>
              <ul className="mt-5 space-y-3">
                {[
                  "可建立小店商品展示頁",
                  "可放商品、價格、介紹與詢問按鈕",
                  "可使用公開網址與 QR Code 分享",
                  "付款確認後開通／展延 3 個月",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm font-bold leading-relaxed text-slate-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan-100 text-cyan-700">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to={purchaseUrl} className={`${primaryButtonClass} mt-6`}>
                購買 3 個月方案
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="flex h-full flex-col rounded-[28px] border border-emerald-200 bg-white p-6 shadow-sm">
              <span className="inline-flex w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-100">
                先試用
              </span>
              <h3 className="mt-4 text-3xl font-black text-slate-950">免費試用 7 天</h3>
              <p className="mt-3 text-sm font-bold leading-relaxed text-slate-600">
                適合先整理商品資訊，確認展示頁是否符合你的日常接單需求。
              </p>
              <ul className="mt-5 space-y-3">
                {[
                  "可先建立 1 個商品展示頁",
                  "可放少量商品或服務",
                  "可放聯絡方式與社群",
                  "到期後可升級正式版",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm font-bold leading-relaxed text-slate-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => void requestTrial()}
                disabled={trialSubmitting}
                className={`${greenButtonClass} mt-6 disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {trialSubmitting ? "申請送出中…" : "登入後申請試用"}
              </button>
              {trialMessage ? <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-black text-emerald-800">{trialMessage}</p> : null}
              {trialError ? <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-black text-rose-800">{trialError}</p> : null}
            </article>

            <article className="flex h-full flex-col rounded-[28px] border border-violet-200 bg-white p-6 shadow-sm">
              <span className="inline-flex w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700 ring-1 ring-violet-100">
                名片加值
              </span>
              <h3 className="mt-4 text-3xl font-black text-slate-950">名片 2 盒 NT$399 含運</h3>
              <p className="mt-3 text-sm font-bold leading-relaxed text-slate-600">
                印名片時一起建立品牌入口，讓紙本名片可以連到線上介紹頁。
              </p>
              <ul className="mt-5 space-y-3">
                {[
                  "加送品牌介紹頁基本版 3 個月",
                  "之後可升級為商品展示頁",
                  "適合把 QR Code 放在名片、貼紙或立牌上",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm font-bold leading-relaxed text-slate-700">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-700">
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/tools/business-card-order" className={`${violetButtonClass} mt-6`}>
                查看名片方案
              </Link>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-8 rounded-[28px] border border-cyan-200 bg-white p-6 shadow-sm sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="grid aspect-[4/3] place-items-center rounded-3xl bg-gradient-to-br from-cyan-100 via-emerald-50 to-violet-100 p-6 text-slate-950">
            <div className="max-w-sm">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-cyan-700 shadow-sm">
                <Sparkles className="h-8 w-8" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-3xl font-black leading-tight">照片先整理好，展示頁更好看</h2>
              <p className="mt-3 text-base font-bold leading-relaxed text-slate-700">
                商品照片、社群貼文、展示頁素材可以一起規劃，讓客人更快看懂你的商品。
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
            <Link to="/tools/product-image-generator" className={`${primaryButtonClass} mt-6`}>
              前往 AI 商品圖工具
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
