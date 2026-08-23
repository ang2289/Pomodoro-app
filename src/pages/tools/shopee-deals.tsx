import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { getPublicDeals } from "@/lib/contentApi";

export type DealItemRow = {
  id?: string;
  platform?: string;
  title: string | null;
  price: number | null;
  original_price: number | null;
  image_url: string | null;
  product_url: string | null;
  affiliate_url: string | null;
  sale_end_time: string | null;
  discount_percent: number | null;
};

function pickOutboundUrl(row: DealItemRow): string {
  const aff = typeof row.affiliate_url === "string" ? row.affiliate_url.trim() : "";
  if (aff) return aff;
  return typeof row.product_url === "string" ? row.product_url : "#";
}

function formatTwd(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
  return `NT$${Number(n).toLocaleString("zh-TW")}`;
}

function formatPercent(n: number | null | undefined): string | null {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return null;
  return `${Number(n).toLocaleString("zh-TW", { maximumFractionDigits: 1 })}%`;
}

function useNowTick(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

function CountdownBlock({ saleEndIso }: { saleEndIso: string | null }) {
  const hasEnd = Boolean(saleEndIso && !Number.isNaN(Date.parse(saleEndIso || "")));
  const now = useNowTick(hasEnd);

  const { line1, line2 } = useMemo(() => {
    if (!saleEndIso) {
      return { line1: "—", line2: "" as string };
    }
    const end = Date.parse(saleEndIso);
    if (Number.isNaN(end)) {
      return { line1: "—", line2: "" };
    }
    const formatted = new Date(end).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    const diff = end - now;
    if (diff <= 0) {
      return { line1: formatted, line2: "已結束" };
    }
    const sec = Math.floor(diff / 1000);
    const s = sec % 60;
    const m = Math.floor(sec / 60) % 60;
    const h = Math.floor(sec / 3600) % 24;
    const d = Math.floor(sec / 86400);
    const remain = `${d > 0 ? `${d} 天 ` : ""}${h} 時 ${m} 分 ${s} 秒`;
    return { line1: formatted, line2: `剩餘 ${remain}` };
  }, [saleEndIso, now]);

  return (
    <div className="text-xs text-slate-600 leading-snug">
      <div className="font-medium text-slate-700">截止</div>
      <div>{line1}</div>
      {line2 ? <div className="mt-0.5 text-orange-700 tabular-nums">{line2}</div> : null}
    </div>
  );
}

export default function ShopeeDealsPage() {
  const [rows, setRows] = useState<DealItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPublicDeals();
      const qErr = null;

      if (qErr) {
        setError(qErr.message || "讀取失敗");
        setRows([]);
        return;
      }
      setRows((data as DealItemRow[]) || []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <SEO
        title="蝦皮限時優惠｜今日活動商品 - RxV AI工具中心"
        description="瀏覽蝦皮限時特賣與活動商品，掌握價格與截止時間。"
        keywords="蝦皮, 限時特賣, 優惠, 工具"
        path="/tools/shopee-deals"
      />

      <div className="min-h-screen bg-gradient-to-b from-orange-50/80 to-white px-4 py-8 pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6">
            <Link to="/tools" className="text-sm text-slate-600 hover:text-slate-900">
              ← 返回工具列表
            </Link>
          </div>

          <header className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">蝦皮活動商品</h1>
            <p className="mt-2 text-slate-600 text-sm sm:text-base max-w-2xl">
              顯示目前上架中的蝦皮活動商品（最多 50 筆），依截止時間排序。點擊按鈕將前往分潤連結或商品頁。
            </p>
          </header>

          {loading ? (
            <p className="text-slate-600">載入中…</p>
          ) : error ? (
            <div
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm"
              role="alert"
            >
              {error}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-slate-600">目前沒有符合條件的商品。</p>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((row, index) => {
                const key = row.id ?? row.product_url ?? `deal-${index}`;
                const href = pickOutboundUrl(row);
                const disc = formatPercent(row.discount_percent);
                return (
                  <li
                    key={key}
                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-slate-100">
                      {row.image_url ? (
                        <img
                          src={row.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                          無圖片
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <h2 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold text-slate-900 leading-snug">
                        {row.title?.trim() || "（未命名商品）"}
                      </h2>

                      <div className="flex flex-wrap items-baseline gap-2 gap-y-1">
                        <span className="text-lg font-bold text-orange-600 tabular-nums">
                          {formatTwd(row.price)}
                        </span>
                        {row.original_price != null && !Number.isNaN(Number(row.original_price)) ? (
                          <span className="text-sm text-slate-400 line-through tabular-nums">
                            {formatTwd(row.original_price)}
                          </span>
                        ) : null}
                        {disc ? (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                            省 {disc}
                          </span>
                        ) : null}
                      </div>

                      <CountdownBlock saleEndIso={row.sale_end_time} />

                      <div className="mt-auto pt-1">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300"
                        >
                          前往購買
                        </a>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
