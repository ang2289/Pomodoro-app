import type { VercelRequest, VercelResponse } from "@vercel/node";
import axios from "axios";
import * as cheerio from "cheerio";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_FLASH_SALE_URL = "https://shopee.tw/flash_sale";

const PLATFORM = "shopee" as const;
const SOURCE = "flash_sale" as const;

type ParsedDeal = {
  title: string;
  price: number | null;
  original_price: number | null;
  image_url: string | null;
  product_url: string;
  sale_end_time: string | null;
  discount_percent: number | null;
};

function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function normalizeProductUrl(href: string, base: string): string | null {
  try {
    const u = new URL(href, base);
    if (!u.hostname.includes("shopee.")) return null;
    const m = u.pathname.match(/\/product\/(\d+)\/(\d+)/);
    if (!m) return null;
    return `${u.origin}/product/${m[1]}/${m[2]}`;
  } catch {
    return null;
  }
}

/** 蝦皮 API／內嵌 JSON 常見價格單位：除以 100000 為新台幣元 */
function normalizeShopeePrice(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 1000) return Math.round((n / 100000) * 100) / 100;
  return Math.round(n * 100) / 100;
}

function parseTwdFromText(text: string): number | null {
  const cleaned = text.replace(/[,，]/g, "").replace(/[^\d.]/g, " ");
  const nums = cleaned.match(/\d+(?:\.\d+)?/g);
  if (!nums?.length) return null;
  const v = parseFloat(nums[0]);
  return Number.isFinite(v) ? Math.round(v * 100) / 100 : null;
}

function computeDiscountPercent(price: number | null, original: number | null): number | null {
  if (price === null || original === null || original <= 0) return null;
  return Math.round(((original - price) / original) * 10000) / 100;
}

/** 從字串 start 位置的 `{` 做括號平衡，取出完整 JSON 物件字串 */
function extractBalancedJsonObject(s: string, braceStart: number): string | null {
  if (s[braceStart] !== "{") return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = braceStart; i < s.length; i++) {
    const c = s[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === "\\") {
        escape = true;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return s.slice(braceStart, i + 1);
    }
  }
  return null;
}

function tryParseItemBasicBlocks(html: string): Record<string, unknown>[] {
  const key = '"item_basic"';
  const out: Record<string, unknown>[] = [];
  let from = 0;
  while (from < html.length) {
    const idx = html.indexOf(key, from);
    if (idx === -1) break;
    const colon = html.indexOf(":", idx + key.length);
    if (colon === -1) break;
    const brace = html.indexOf("{", colon);
    if (brace === -1) break;
    const jsonStr = extractBalancedJsonObject(html, brace);
    if (jsonStr) {
      try {
        const obj = JSON.parse(jsonStr) as Record<string, unknown>;
        if (obj && typeof obj === "object" && "itemid" in obj && "shopid" in obj) {
          out.push(obj);
        }
      } catch {
        /* 略過非 JSON 片段 */
      }
    }
    from = idx + key.length;
  }
  return out;
}

function imageIdToUrl(imageId: unknown, imageHost: string): string | null {
  if (typeof imageId !== "string" || !imageId.trim()) return null;
  const id = imageId.trim();
  if (id.startsWith("http")) return id;
  const host = imageHost.replace(/\/$/, "");
  return `${host}/file/${id}`;
}

function pickImageHost($: cheerio.CheerioAPI): string {
  const scripts = $("script")
    .toArray()
    .map((el) => $(el).html() || "");
  for (const t of scripts) {
    const m = t.match(/"TW"\s*:\s*"([^"]+)"/);
    if (m?.[1]) {
      const host = m[1].trim();
      if (host.startsWith("http")) return host;
      return `https://${host}`;
    }
  }
  return "https://down-tw.img.susercontent.com";
}

function pickSaleEndTimeFromObj(o: Record<string, unknown>): string | null {
  const candidates = [
    o.end_time,
    o.end_ts,
    o.promotion_end,
    o.flash_sale_end_time,
    o.session_end_time,
  ];
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c) && c > 1e9) {
      return new Date(c * 1000).toISOString();
    }
    if (typeof c === "number" && Number.isFinite(c) && c > 1e12) {
      return new Date(c).toISOString();
    }
  }
  return null;
}

function mapItemBasicToDeal(
  raw: Record<string, unknown>,
  imageHost: string,
  baseOrigin: string
): ParsedDeal | null {
  const shopid = raw.shopid;
  const itemid = raw.itemid;
  if (typeof shopid !== "number" && typeof shopid !== "string") return null;
  if (typeof itemid !== "number" && typeof itemid !== "string") return null;
  const product_url = `${baseOrigin}/product/${shopid}/${itemid}`;
  const name = typeof raw.name === "string" ? raw.name : "";
  const title = name || "（無標題）";

  const price =
    normalizeShopeePrice(raw.price_min ?? raw.price) ??
    normalizeShopeePrice(raw.price_max);

  const original_price =
    normalizeShopeePrice(raw.price_min_before_discount) ??
    normalizeShopeePrice(raw.price_before_discount) ??
    normalizeShopeePrice(raw.price_max_before_discount);

  const imgRaw = raw.image ?? raw.imageid;
  const image_url = imageIdToUrl(imgRaw, imageHost);

  const sale_end_time = pickSaleEndTimeFromObj(raw);

  const discount_percent = computeDiscountPercent(price, original_price);

  return {
    title,
    price,
    original_price,
    image_url,
    product_url,
    sale_end_time,
    discount_percent,
  };
}

function parseDealsWithCheerio(html: string, pageUrl: string): ParsedDeal[] {
  const $ = cheerio.load(html);
  const origin = new URL(pageUrl).origin;
  const imageHost = pickImageHost($);
  const byUrl = new Map<string, ParsedDeal>();

  $('a[href*="/product/"]').each((_i, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const product_url = normalizeProductUrl(href, pageUrl);
    if (!product_url) return;

    const $a = $(el);
    let title =
      $a.attr("title")?.trim() ||
      $a.find("img[alt]").first().attr("alt")?.trim() ||
      $a.text().replace(/\s+/g, " ").trim() ||
      "";

    const $scope = $a.closest("div").parent().length ? $a.closest("div") : $a.parent();
    const scopeText = $scope.text().replace(/\s+/g, " ");
    const imgSrc =
      $a.find("img").first().attr("src") ||
      $a.find("img").first().attr("data-src") ||
      $scope.find("img").first().attr("src") ||
      null;

    let image_url: string | null = imgSrc && imgSrc.startsWith("http") ? imgSrc : null;
    if (!image_url && imgSrc?.startsWith("//")) image_url = `https:${imgSrc}`;

    const price = parseTwdFromText(scopeText);
    let original_price: number | null = null;
    const strikethrough = $scope.find("del, s, ._line-through, [class*='strike']").first().text();
    if (strikethrough) original_price = parseTwdFromText(strikethrough);

    let sale_end_time: string | null = null;
    const countdown = $scope.find("[data-end-time], [data-end], [data-countdown-end]").first();
    const ds =
      countdown.attr("data-end-time") ||
      countdown.attr("data-end") ||
      countdown.attr("data-countdown-end");
    if (ds) {
      const n = Number(ds);
      if (Number.isFinite(n)) {
        sale_end_time =
          n > 1e12 ? new Date(n).toISOString() : new Date(n * 1000).toISOString();
      }
    }

    const discount_percent = computeDiscountPercent(price, original_price);

    if (!title) title = "（無標題）";

    const prev = byUrl.get(product_url);
    if (!prev || (title !== "（無標題）" && prev.title === "（無標題）")) {
      byUrl.set(product_url, {
        title,
        price,
        original_price,
        image_url,
        product_url,
        sale_end_time,
        discount_percent,
      });
    }
  });

  const fromJson = tryParseItemBasicBlocks(html);
  for (const block of fromJson) {
    const deal = mapItemBasicToDeal(block, imageHost, origin);
    if (!deal) continue;
    const prev = byUrl.get(deal.product_url);
    if (!prev || (prev.title === "（無標題）" && deal.title !== "（無標題）")) {
      byUrl.set(deal.product_url, deal);
    } else if (!prev.image_url && deal.image_url) {
      byUrl.set(deal.product_url, { ...prev, image_url: deal.image_url });
    }
  }

  return [...byUrl.values()];
}

async function fetchFlashSaleHtml(url: string): Promise<string> {
  const { data } = await axios.get<string>(url, {
    responseType: "text",
    timeout: 30000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
      Referer: "https://shopee.tw/",
    },
    validateStatus: (s) => s >= 200 && s < 400,
  });
  return typeof data === "string" ? data : String(data);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    const pageUrl =
      (typeof req.query?.url === "string" && req.query.url) ||
      process.env.SHOPEE_FLASH_SALE_URL ||
      DEFAULT_FLASH_SALE_URL;

    const html = await fetchFlashSaleHtml(pageUrl);
    const deals = parseDealsWithCheerio(html, pageUrl);

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Supabase 環境變數未設定（SUPABASE_URL／VITE_SUPABASE_URL 與 SUPABASE_SERVICE_ROLE_KEY）",
      });
    }

    if (deals.length === 0) {
      return res.status(200).json({ success: true, count: 0 });
    }

    const rows = deals.map((d) => ({
      platform: PLATFORM,
      source: SOURCE,
      title: d.title,
      price: d.price,
      original_price: d.original_price,
      image_url: d.image_url,
      product_url: d.product_url,
      sale_end_time: d.sale_end_time,
      discount_percent: d.discount_percent,
    }));

    const chunkSize = 200;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase.from("deal_items").upsert(chunk, {
        onConflict: "platform,source,product_url",
      });
      if (error) {
        console.error("[shopee-flash-sale] upsert error:", error.message);
        return res.status(500).json({
          success: false,
          error: error.message || "deal_items upsert 失敗",
        });
      }
    }

    return res.status(200).json({ success: true, count: deals.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[shopee-flash-sale]", err);
    return res.status(500).json({ success: false, error: message });
  }
}
