import { useState } from "react";
import { Link } from "react-router-dom";

const GROUP_BUY_PATH = "/group-buy/yannick-first-group-buy";
const PRODUCT_IMAGE_PATH = "/group-buy/yannick/original.jpg";

export function YannickGroupBuyPromoCard() {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <section
      aria-labelledby="yannick-group-buy-promo-title"
      className="mb-8 overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="grid min-w-0 md:grid-cols-[minmax(0,34%)_minmax(0,66%)]">
        <Link
          to={GROUP_BUY_PATH}
          aria-label="查看亞尼克生乳捲第一團品項與價格"
          className="block min-h-44 overflow-hidden bg-amber-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-orange-500 md:min-h-[250px]"
        >
          {imageFailed ? (
            <span className="flex h-full min-h-44 items-center justify-center px-4 text-center text-sm font-bold text-orange-900 md:min-h-[250px]">
              亞尼克生乳捲第一團
            </span>
          ) : (
            <img
              src={PRODUCT_IMAGE_PATH}
              alt="亞尼克生乳捲第一團商品示意"
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="h-48 w-full object-cover sm:h-56 md:h-full md:min-h-[250px]"
            />
          )}
        </Link>

        <div className="min-w-0 p-5 sm:p-6 md:flex md:flex-col md:justify-center md:p-8">
          <span className="w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-800">
            第一團開放登記
          </span>
          <h2
            id="yannick-group-buy-promo-title"
            className="mt-3 break-words text-xl font-black text-orange-950 sm:text-2xl"
          >
            🍰 亞尼克生乳捲第一團
          </h2>
          <p className="mt-3 break-words text-sm leading-7 text-slate-700 sm:text-base">
            9款團購品項可選，官網定價76折。
            <br />
            先登記數量，成團後再通知付款。
            <br />
            夏季統一採冷凍宅配。
          </p>
          <Link
            to={GROUP_BUY_PATH}
            className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-orange-700 px-5 py-2.5 text-center text-sm font-black !text-white shadow-sm transition-colors hover:bg-orange-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-300 active:bg-orange-900 sm:w-fit"
            style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
          >
            查看團購品項與價格
          </Link>
          <p className="mt-3 break-words text-xs leading-relaxed text-slate-500">
            本站自辦團購，非亞尼克官方網站。
          </p>
        </div>
      </div>
    </section>
  );
}
