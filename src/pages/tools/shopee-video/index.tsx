// src/pages/tools/shopee-video/index.tsx

import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import SEO from "@/components/SEO";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { RelatedGuides } from "@/components/seo/RelatedGuides";
import {
  getRelatedGuideItems,
  getRelatedToolsItems,
} from "@/data/internalLinks";
import { featureFlags } from "@/config/featureFlags";
import { useBatchVideo, BatchTask } from "./hooks/useBatchVideo";
import SectionCard from "./components/SectionCard";

type RawRow = Record<string, any>;

type V404ManualPlatform =
  | "shopee"
  | "tiktok"
  | "facebook"
  | "instagram"
  | "threads"
  | "x"
  | "youtube";

type V404ManualPublishCopy = {
  painHook: string;
  coreSellingPoints: string;
  seoKeywords: string;
  shopee: string;
  common: string;
  tiktok: string;
  facebook: string;
  instagram: string;
  threads: string;
  x: string;
  youtubeTitle: string;
  youtubeDescription: string;
};

const V404_MANUAL_PLATFORM_OPTIONS: Array<{ key: V404ManualPlatform; label: string }> = [
  { key: "shopee", label: "蝦皮短影音" },
  { key: "tiktok", label: "TikTok" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "threads", label: "Threads" },
  { key: "x", label: "X" },
  { key: "youtube", label: "YouTube Shorts" },
];

type ApiResponse<T = any> = T & {
  ok?: boolean;
  error?: string;
  message?: string;
};

type ImportSummary = {
  total: number;
  with3Images: number;
  withAnyImages: number;
};

const PUBLISH_PLATFORM_OPTIONS = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram Reels" },
  { key: "tiktok", label: "TikTok" },
  { key: "youtube_shorts", label: "YouTube Shorts" },
  { key: "youtube_video", label: "YouTube" },
  { key: "threads", label: "Threads" },
  { key: "x", label: "X" },
] as const;

const ROTATION_PLATFORM_KEYS = [
  "facebook",
  "tiktok",
  "youtube_shorts",
  "threads",
  "x",
] as const;

const ROTATION_PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram Reels",
  tiktok: "TikTok",
  youtube_shorts: "YouTube Shorts",
  threads: "Threads",
  x: "X",
};

type RotationProgress = {
  productKey: string; total: number; completed: number; published: number; remaining: number; done: boolean;
  items: Array<{ platform: string; jobId: number; status: string; lastError: string; publishedUrl: string }>;
};

type RotationState = {
  productKey: string; productTitle: string; currentPlatform: string; progress: RotationProgress | null;
  skipped: Array<{ platform: string; reason: string }>; done: boolean;
};

type AffiliateDbSummary = {
  total: number;
  completed: number;
  failed: number;
  pendingPublish: number;
  published: number;
  platformCounts?: Record<
    string,
    {
      notPublished?: number;
      queued?: number;
      publishing?: number;
      published?: number;
      failed?: number;
    }
  >;
  dbPath?: string;
};

type ShopeeImageResult = {
  index: number;
  productUrl: string;
  images: string[];
  ok?: boolean;
  error?: string;
};


type PublisherCounts = {
  total: number;
  queued: number;
  scheduled: number;
  publishing: number;
  published: number;
  failed: number;
  needsManualAction?: number;
  cancelled: number;
};

type PublisherSetting = {
  platform: string;
  enabled: boolean;
  dailyLimit: number;
  minIntervalMinutes: number;
  autoPublish: boolean;
  adapterMode?: "extension" | "browser" | "api" | "off";
  browserFinalConfirm?: boolean;
  browserVisibility?: "private" | "unlisted" | "public";
  lastPublishedAt?: string;
};

type PublisherConnection = {
  configured: boolean;
  connected: boolean;
  adapterReady: boolean;
  message?: string;
};

type PublisherStatus = {
  readyProducts: number;
  actualPublishingEnabled: boolean;
  counts: PublisherCounts;
  settings: PublisherSetting[];
  connections: Record<string, PublisherConnection>;
  note?: string;
};

type PublisherJob = {
  id: number;
  productKey: string;
  productTitle: string;
  productUrl: string;
  affiliateUrl: string;
  platform: string;
  status: string;
  scheduledAt: string;
  attemptCount: number;
  maxAttempts: number;
  publishedUrl: string;
  lastError: string;
  videoPath: string;
  videoFilename: string;
  videoExists: boolean;
  publishReady: boolean;
  payloadVersion: string;
  safety?: {
    ok?: boolean;
    guardVersion?: string;
    issues?: string[];
  } | null;
  platformPayload?: Record<string, any>;
};

type BrowserStatus = {
  dependencyAvailable: boolean;
  edgeExecutable: string;
  profileDir: string;
  debugDir: string;
  contextOpen: boolean;
  startedAt: string;
  lastError: string;
  cloudStagingUsed: boolean;
  aiClicksUsed: boolean;
  supportedPlatforms: string[];
  note?: string;
};

type PublisherExtensionStatus = {
  online: boolean;
  lastHeartbeat?: number;
  installDir?: string;
  supportedPlatforms?: string[];
  pending?: number;
  processing?: number;
  prepared?: number;
  failed?: number;
  loginRequired?: number;
  extension?: {
    version?: string;
    browser?: string;
    currentUrl?: string;
    activeJobId?: string;
  };
};

type MetaConnectionItem = {
  configured: boolean;
  connected: boolean;
  pageId?: string;
  pageName?: string;
  igUserId?: string;
  username?: string;
  r2Configured?: boolean;
  token?: string;
  error?: string;
};

type MetaStatus = {
  graphVersion: string;
  secretsExposed: boolean;
  verifiedAt: string;
  facebook: MetaConnectionItem;
  instagram: MetaConnectionItem;
  r2: {
    configured: boolean;
    bucket?: string;
    publicBaseUrl?: string;
    accessKey?: string;
    secretKey?: string;
  };
};

type YouTubeStatus = {
  configured: boolean;
  authorized: boolean;
  storedAuthorization: boolean;
  redirectUri: string;
  privacyStatus: string;
  cloudStagingUsed: boolean;
  channelId?: string;
  channelTitle?: string;
  error?: string;
};




const PRODUCT_KEYS = [
  "商品原網址",
  "商品原始網址",
  "原始商品網址",
  "原始網址",
  "商品網址",
  "商品連結",
  "original_url",
  "originalUrl",
  "product_url",
  "productUrl",
  "url",
  "網址",
];

const PROMO_KEYS = [
  "推廣連結",
  "推廣鏈接",
  "promo_url",
  "promotion_url",
  "promotionUrl",
  "promoUrl",
  "推薦分潤連結",
  "分潤連結",
  "link",
];

const TITLE_KEYS = ["商品名稱", "商品标题", "title", "name"];
const PRICE_KEYS = ["商品價格", "價格", "price"];
const IMAGE_URL_KEYS = [
  "圖片網址",
  "圖片連結",
  "imageUrls",
  "imageurls",
  "image_url",
];
const IMAGE1_KEYS = ["圖片1", "圖1", "image1"];
const IMAGE2_KEYS = ["圖片2", "圖2", "image2"];
const IMAGE3_KEYS = ["圖片3", "圖3", "image3"];
const REVIEW_RATING_KEYS = ["評分", "星等", "商品評分", "rating", "reviewRating"];
const REVIEW_COUNT_KEYS = ["評價數", "評論數", "評價筆數", "reviewCount", "reviewsCount"];
const REVIEW_SUMMARY_KEYS = ["評價摘要", "評論摘要", "買家評價", "reviewSummary", "reviewText"];

function normalizeCell(value: unknown): string {
  return String(value ?? "").trim();
}

function normalizeNumber(val: unknown): string {
  if (val == null) return "";
  return String(val).replace(/[,$]/g, "").trim();
}

function pickRowValue(row: RawRow, keys: string[]): string {
  for (const k of keys) {
    const v = row[k];
    if (v != null && String(v).trim() !== "") {
      return String(v).trim();
    }
  }
  return "";
}

function extractUrls(text: string): string[] {
  const raw = String(text || "").trim();
  if (!raw) return [];

  const htmlImgUrls = [...raw.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)]
    .map((m) => normalizeCell(m[1]))
    .filter(isValidShopeeImageUrl);

  const inlineUrls = [...raw.matchAll(/https?:\/\/[^\s"'<>]+/gi)]
    .map((m) => normalizeCell(m[0]))
    .filter(Boolean);

  const splitUrls = raw
    .split(/[\n\r|,，;；]+/)
    .map((v) => normalizeCell(v))
    .filter(isValidShopeeImageUrl);

  return [...htmlImgUrls, ...inlineUrls, ...splitUrls];
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((v) => normalizeCell(v)).filter(Boolean))];
}

function isValidShopeeImageUrl(url: string): boolean {
  const u = normalizeCell(url).replace(/\\+$/g, "");
  if (!/^https?:\/\//i.test(u)) return false;
  if (/vod\.susercontent\.com|mms\.vod\.susercontent\.com|\.mp4(?:$|[?#])/i.test(u)) return false;
  const noQuery = u.split("?")[0].replace(/[#].*$/, "").replace(/\/+$/g, "");
  if (/^https?:\/\/down-[^/]+\.img\.susercontent\.com$/i.test(noQuery)) return false;
  if (/^https?:\/\/(?:down-[^/]+\.img\.susercontent\.com|cf\.shopee\.tw)\/file$/i.test(noQuery)) return false;
  const key = noQuery.replace(/^https?:\/\/(?:down-[^/]+\.img\.susercontent\.com\/(?:file\/)?|cf\.shopee\.tw\/file\/|[^/]*shopee\.tw\/file\/)/i, "");
  return key.length >= 16;
}

function formatV4041ManualText(input: any): string {
  let text = String(input ?? "").replace(/\r\n/g, "\n").trim();
  if (!text) return "";
  // If ChatGPT CSV already contains paragraph breaks, preserve them.
  if (text.includes("\n")) return text.replace(/\n{3,}/g, "\n\n");

  // Compatibility for the first V40.4 test CSV, which used one-line copy.
  const q = text.search(/[？?!！]/);
  if (q >= 8 && q <= 90) text = text.slice(0, q + 1) + "\n\n" + text.slice(q + 1).trim();
  text = text.replace(/\s*(?:🛒\s*)?商品連結[：:]\s*/g, "\n\n🛒 商品連結：\n");
  text = text.replace(/\s*(※(?:此連結為|含)分潤連結[^#]*)/g, "\n\n$1");
  text = text.replace(/\s+(#(?:[^\s#]+)(?:\s+#(?:[^\s#]+))*)\s*$/g, "\n\n$1");
  text = text.replace(/\s*(詳細(?:尺寸|功能|規格|連線|網路|材質)[^#]*)/g, "\n\n$1");
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

function buildV404ManualPublishCopy(row: RawRow): V404ManualPublishCopy {
  return {
    painHook: pickRowValue(row, ["痛點Hook", "痛點 Hook", "painHook"]),
    coreSellingPoints: pickRowValue(row, ["核心賣點", "核心卖点", "coreSellingPoints"]),
    seoKeywords: pickRowValue(row, ["SEO關鍵字", "SEO关键字", "SEO 關鍵字", "seoKeywords"]),
    shopee: formatV4041ManualText(pickRowValue(row, ["蝦皮文案", "蝦皮完整文案", "Shopee文案", "Shopee完整文案"])),
    common: formatV4041ManualText(pickRowValue(row, ["共用完整文案", "共用文案", "通用完整文案", "通用文案", "FB完整文案", "TikTok完整文案"])),
    tiktok: formatV4041ManualText(pickRowValue(row, ["TikTok完整文案", "TIKTOK完整文案", "TikTok 文案"])),
    facebook: formatV4041ManualText(pickRowValue(row, ["FB完整文案", "Facebook完整文案", "Facebook 文案"])),
    instagram: formatV4041ManualText(pickRowValue(row, ["IG完整文案", "Instagram完整文案", "Instagram 文案"])),
    threads: formatV4041ManualText(pickRowValue(row, ["Threads完整文案", "Threads 文案"])),
    x: formatV4041ManualText(pickRowValue(row, ["X完整文案", "X 文案"])),
    youtubeTitle: pickRowValue(row, ["YT標題", "YouTube標題", "YouTube Shorts標題"]),
    youtubeDescription: formatV4041ManualText(pickRowValue(row, ["YT完整說明", "YouTube完整說明", "YouTube Shorts完整說明"])),
  };
}

function hasV404ManualPublishCopy(task: any): boolean {
  const copy = task?.manualPublishCopy as V404ManualPublishCopy | undefined;
  if (!copy) return false;
  return Boolean(
    copy.shopee ||
      copy.tiktok ||
      copy.facebook ||
      copy.instagram ||
      copy.threads ||
      copy.x ||
      copy.youtubeTitle ||
      copy.youtubeDescription,
  );
}

function getV404ManualPlatformText(
  task: any,
  platform: V404ManualPlatform,
): string {
  const copy = (task?.manualPublishCopy || {}) as V404ManualPublishCopy;
  switch (platform) {
    case "shopee":
      return String(copy.shopee || "");
    case "tiktok":
      return String(copy.tiktok || "");
    case "facebook":
      return String(copy.facebook || "");
    case "instagram":
      return String(copy.instagram || "");
    case "threads":
      return String(copy.threads || "");
    case "x":
      return String(copy.x || "");
    default:
      return "";
  }
}

function extractImageUrls(row: RawRow): string[] {
  const fromMulti = extractUrls(pickRowValue(row, IMAGE_URL_KEYS));

  const fromColumns = [
    pickRowValue(row, IMAGE1_KEYS),
    pickRowValue(row, IMAGE2_KEYS),
    pickRowValue(row, IMAGE3_KEYS),
  ]
    .flatMap((v) => extractUrls(v))
    .filter(isValidShopeeImageUrl);

  return uniqueStrings([...fromMulti, ...fromColumns]).filter(isValidShopeeImageUrl).slice(0, 3);
}

function toImportRow(row: RawRow, idx: number): BatchTask | null {
  const title = pickRowValue(row, TITLE_KEYS);
  const price = normalizeNumber(pickRowValue(row, PRICE_KEYS));
  const productUrl = pickRowValue(row, PRODUCT_KEYS);
  const promoUrl = pickRowValue(row, PROMO_KEYS);
  const imageUrls = extractImageUrls(row);
  const reviewRating = pickRowValue(row, REVIEW_RATING_KEYS);
  const reviewCount = pickRowValue(row, REVIEW_COUNT_KEYS);
  const reviewSummary = pickRowValue(row, REVIEW_SUMMARY_KEYS);
  const manualPublishCopy = buildV404ManualPublishCopy(row);

  if (!productUrl) return null;

  return {
    id: `imported-${Date.now()}-${idx}`,
    productUrl,
    productId: null,
    title,
    price,
    promoUrl,
    highlights: [],
    images: imageUrls,
    imageUrls,
    script: "",
    videoUrl: "",
    reviewRating,
    reviewCount,
    reviewSummary,
    manualPublishCopy,
    manualCopyVersion: "v40.4",
  } as BatchTask & {
    imageUrls: string[];
    reviewRating?: string;
    reviewCount?: string;
    reviewSummary?: string;
    manualPublishCopy: V404ManualPublishCopy;
    manualCopyVersion: string;
  };
}

async function parseExcelCsvFile(file: File): Promise<BatchTask[]> {
  const name = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();

  const normalizeRowKeys = (row: RawRow): RawRow => {
    const out: RawRow = {};
    Object.entries(row || {}).forEach(([key, value]) => {
      const cleanKey = String(key || "")
        .replace(/^\uFEFF/, "")
        .replace(/\u00A0/g, " ")
        .trim();
      if (cleanKey) out[cleanKey] = value as any;
    });
    return out;
  };

  let rows: RawRow[] = [];
  let papaErrors: any[] = [];

  if (name.endsWith(".csv") || name.endsWith(".tsv")) {
    const rawText = new TextDecoder("utf-8").decode(buffer);
    const text = rawText.replace(/^\uFEFF/, "");
    const parsed = Papa.parse<RawRow>(text, {
      header: true,
      skipEmptyLines: "greedy",
      delimiter: name.endsWith(".tsv") ? "\t" : ",",
      transformHeader: (header: string) =>
        String(header || "")
          .replace(/^\uFEFF/, "")
          .replace(/\u00A0/g, " ")
          .trim(),
    });
    papaErrors = Array.isArray(parsed.errors) ? parsed.errors : [];
    rows = ((parsed.data as RawRow[]) || []).map(normalizeRowKeys);

    // Fallback: SheetJS also parses CSV well and gives us a second independent
    // path if browser/Papa behavior changes.
    const papaTasks = rows.map(toImportRow).filter(Boolean) as BatchTask[];
    if (papaTasks.length > 0) {
      console.info("[V40.3.7 CSV] Papa rows/tasks", rows.length, papaTasks.length, papaErrors);
      return papaTasks;
    }

    try {
      const workbook = XLSX.read(buffer, { type: "array", codepage: 65001 });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      rows = XLSX.utils
        .sheet_to_json<RawRow>(sheet, { defval: "", raw: false })
        .map(normalizeRowKeys);
    } catch (fallbackError) {
      console.error("[V40.3.7 CSV] XLSX fallback failed", fallbackError);
    }
  } else {
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    rows = XLSX.utils
      .sheet_to_json<RawRow>(sheet, { defval: "", raw: false })
      .map(normalizeRowKeys);
  }

  const tasks = rows.map(toImportRow).filter(Boolean) as BatchTask[];
  console.info("[V40.3.7 IMPORT] rows/tasks", rows.length, tasks.length, {
    filename: file.name,
    headers: rows[0] ? Object.keys(rows[0]) : [],
    papaErrors,
  });
  return tasks;
}

async function fileToCsvText(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".csv")) {
    return await file.text();
  }

  if (name.endsWith(".tsv")) {
    const text = await file.text();
    const parsed = Papa.parse<RawRow>(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: "\t",
    });
    return Papa.unparse(parsed.data as RawRow[]);
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
  return Papa.unparse(rows);
}

function downloadJsonFile(filename: string, data: any) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function postMainAction<T = any>(
  action: string,
  body?: Record<string, unknown>,
): Promise<ApiResponse<T>> {
  const res = await fetch(`/api/main?action=${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = (await res.json().catch(() => ({}))) as ApiResponse<T>;
  if (!res.ok || data.ok === false) {
    throw new Error(data.message || data.error || `API ${action} failed`);
  }
  return data;
}


const V4038_IMPORT_CACHE_KEY = "rxv_v4038_shopee_import_cache";

function saveV4038ImportCache(tasks: any[], meta: any = {}) {
  try {
    window.sessionStorage.setItem(
      V4038_IMPORT_CACHE_KEY,
      JSON.stringify({
        savedAt: Date.now(),
        tasks,
        meta,
      }),
    );
  } catch (err) {
    console.warn("[V40.3.8] import cache save failed", err);
  }
}

function loadV4038ImportCache(): { tasks: any[]; meta: any; savedAt: number } | null {
  try {
    const raw = window.sessionStorage.getItem(V4038_IMPORT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.tasks) || parsed.tasks.length === 0) return null;
    // Same-tab recovery only; expire old imports after 12 hours.
    if (!parsed.savedAt || Date.now() - Number(parsed.savedAt) > 12 * 60 * 60 * 1000) {
      window.sessionStorage.removeItem(V4038_IMPORT_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn("[V40.3.8] import cache load failed", err);
    return null;
  }
}

function getTaskImages(task: any): string[] {
  if (Array.isArray(task.imageUrls)) return task.imageUrls.filter(Boolean).slice(0, 3);
  if (Array.isArray(task.images)) return task.images.filter(Boolean).slice(0, 3);
  return [];
}

async function autoFillMissingShopeeImages(tasks: BatchTask[]): Promise<BatchTask[]> {
  // V36.9：每次重新匯入 CSV / Excel，都重新向 Shopee gallery 抓一次。
  // 不再因為目前畫面已經有 3/3 就沿用舊圖，避免舊影片封面或舊錯序圖片
  // 被帶進新版本的 MP4。
  const targets = tasks
    .map((task: any, index) => ({
      index,
      productUrl: String(task.productUrl || "").trim(),
      images: getTaskImages(task),
    }))
    .filter((item) => item.productUrl);

  if (targets.length === 0) return tasks;

  // V3：目前用 npm run dev:all，只啟動 Vite 3005 + 影片服務 3006。
  // 不走 /api/main，避免新增第 13 支 API，也避免 Vercel API 未啟動時補圖失敗。
  const res = await fetch("http://localhost:3006/shopee-images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      forceRefresh: true,
      items: targets.map((item) => ({ index: item.index, productUrl: item.productUrl })),
    }),
  });

  const data = (await res.json().catch(() => ({}))) as ApiResponse<{ results?: ShopeeImageResult[] }>;
  if (!res.ok || data.ok === false) {
    throw new Error(data.message || data.error || "自動補圖服務失敗");
  }

  const resultMap = new Map<number, ShopeeImageResult>();
  (data.results || []).forEach((item) => resultMap.set(Number(item.index), item));

  return tasks.map((task: any, index) => {
    const currentImages = getTaskImages(task);
    const fetchedImages = uniqueStrings(resultMap.get(index)?.images || []).slice(0, 3);

    // Fresh Shopee capture wins.  Do NOT merge old images in front of the new
    // result, otherwise a stale video poster can remain image #1 forever.
    const finalImages =
      fetchedImages.length >= 3 ? fetchedImages : currentImages.slice(0, 3);

    return {
      ...task,
      images: finalImages,
      imageUrls: finalImages,
      autoImageSource:
        fetchedImages.length >= 3
          ? "video-server-shopee-images-v36.9-fresh"
          : task.autoImageSource || "import-file",
      shopeeRefreshError:
        fetchedImages.length >= 3
          ? ""
          : resultMap.get(index)?.error || "",
    };
  });
}

function ShopeeVideoPageInner() {
  const { t } = useTranslation();
  const { tasks, loading: batchLoading, setTasks } = useBatchVideo(t);

  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [jobId, setJobId] = useState("");
  const [jobInfo, setJobInfo] = useState<any>(null);
  const [renderLog, setRenderLog] = useState("");
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [sourceFileName, setSourceFileName] = useState("");
  const [manualPublishPlatform, setManualPublishPlatform] =
    useState<V404ManualPlatform>("tiktok");  const V405_SCROLL_KEY = "rxv_v40541_scroll_anchor";

  useEffect(() => {
    // V40.5.4.1: preserve the exact video-card position across accidental dev reloads.
    // We store card index + offset instead of only absolute scrollY.
    const previousRestoration = window.history.scrollRestoration;
    const previousHtmlAnchor = document.documentElement.style.overflowAnchor;
    const previousBodyAnchor = document.body.style.overflowAnchor;
    window.history.scrollRestoration = "manual";
    document.documentElement.style.overflowAnchor = "none";
    document.body.style.overflowAnchor = "none";

    let saveTimer = 0;
    let userInteracting = false;

    const captureAnchor = () => {
      const cards = Array.from(document.querySelectorAll<HTMLElement>("[data-rxv-video-index]"));
      let selected: HTMLElement | null = null;
      for (const card of cards) {
        const rect = card.getBoundingClientRect();
        if (rect.bottom > 80) { selected = card; break; }
      }
      try {
        if (selected) {
          const index = selected.getAttribute("data-rxv-video-index") || "0";
          const offset = selected.getBoundingClientRect().top;
          sessionStorage.setItem(V405_SCROLL_KEY, JSON.stringify({ index, offset, y: window.scrollY || 0 }));
        } else {
          sessionStorage.setItem(V405_SCROLL_KEY, JSON.stringify({ index: "", offset: 0, y: window.scrollY || 0 }));
        }
      } catch {}
    };

    const onScroll = () => {
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(captureAnchor, 100);
    };
    const beginInteraction = () => { userInteracting = true; };
    const endInteraction = () => { window.setTimeout(() => { userInteracting = false; captureAnchor(); }, 180); };

    let saved: any = null;
    try { saved = JSON.parse(sessionStorage.getItem(V405_SCROLL_KEY) || "null"); } catch {}

    const restore = () => {
      if (userInteracting || !saved) return;
      const index = String(saved.index || "");
      if (index) {
        const card = document.querySelector<HTMLElement>(`[data-rxv-video-index="${index}"]`);
        if (card) {
          const target = window.scrollY + card.getBoundingClientRect().top - Number(saved.offset || 0);
          window.scrollTo({ top: Math.max(0, target), left: 0, behavior: "auto" });
          return;
        }
      }
      const y = Number(saved.y || 0);
      if (Number.isFinite(y) && y > 0) window.scrollTo({ top: y, left: 0, behavior: "auto" });
    };

    const timers = [80, 250, 700, 1400, 2400].map((ms) => window.setTimeout(restore, ms));
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pagehide", captureAnchor);
    window.addEventListener("beforeunload", captureAnchor);
    window.addEventListener("wheel", beginInteraction, { passive: true });
    window.addEventListener("touchstart", beginInteraction, { passive: true });
    window.addEventListener("pointerdown", beginInteraction, { passive: true });
    window.addEventListener("pointerup", endInteraction, { passive: true });
    window.addEventListener("keyup", endInteraction);

    return () => {
      captureAnchor();
      window.clearTimeout(saveTimer);
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", captureAnchor);
      window.removeEventListener("beforeunload", captureAnchor);
      window.removeEventListener("wheel", beginInteraction);
      window.removeEventListener("touchstart", beginInteraction);
      window.removeEventListener("pointerdown", beginInteraction);
      window.removeEventListener("pointerup", endInteraction);
      window.removeEventListener("keyup", endInteraction);
      window.history.scrollRestoration = previousRestoration;
      document.documentElement.style.overflowAnchor = previousHtmlAnchor;
      document.body.style.overflowAnchor = previousBodyAnchor;
    };
  }, []);


  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [affiliateDbSummary, setAffiliateDbSummary] =
    useState<AffiliateDbSummary | null>(null);
  const [geminiConnected, setGeminiConnected] = useState(false);
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [geminiStatusText, setGeminiStatusText] = useState("檢查中");
  const [openClawConnected, setOpenClawConnected] = useState(false);
  const [openClawStatusText, setOpenClawStatusText] = useState("檢查中");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    [...ROTATION_PLATFORM_KEYS],
  );

  const [publisherStatus, setPublisherStatus] =
    useState<PublisherStatus | null>(null);
  const [publisherJobs, setPublisherJobs] = useState<PublisherJob[]>([]);
  const [publisherLoading, setPublisherLoading] = useState(false);
  const [publisherPlatformFilter, setPublisherPlatformFilter] = useState(
    () => {
      const saved =
        localStorage.getItem("rxv_publisher_platform_filter") || "";
      return saved === "instagram" ? "facebook" : saved;
    },
  );
  const [publisherStatusFilter, setPublisherStatusFilter] = useState(
    () => localStorage.getItem("rxv_publisher_status_filter") || "",
  );
  const [rotationState, setRotationState] = useState<RotationState | null>(null);
  const [publisherScheduleDrafts, setPublisherScheduleDrafts] =
    useState<Record<number, string>>({});
  const [publisherPreviewJobId, setPublisherPreviewJobId] =
    useState<number | null>(null);

  const [metaStatus, setMetaStatus] = useState<MetaStatus | null>(null);
  const [metaTesting, setMetaTesting] = useState(false);
  const [browserStatus, setBrowserStatus] =
    useState<BrowserStatus | null>(null);
  const [publisherExtensionStatus, setPublisherExtensionStatus] =
    useState<PublisherExtensionStatus | null>(null);
  const [browserActionLoading, setBrowserActionLoading] = useState(false);
  const [publisherActionJobId, setPublisherActionJobId] =
    useState<number | null>(null);
  const [youtubeStatus, setYouTubeStatus] =
    useState<YouTubeStatus | null>(null);
  const [youtubeTesting, setYouTubeTesting] = useState(false);

  useEffect(() => {
    setRenderLog("");
    setBatchResults([]);
    setActionError("");
    setJobId("");
    setJobInfo(null);
    setSourceFileName("");
    setImportError(null);

    localStorage.removeItem("shopee_batch_results");
    localStorage.removeItem("shopee_render_log");
    localStorage.removeItem("shopee_video_results");
    localStorage.removeItem("shopee_video_render_log");

    const recoveredImport = loadV4038ImportCache();
    if (recoveredImport?.tasks?.length) {
      const recoveredTasks = recoveredImport.tasks;
      const recoveredMeta = recoveredImport.meta || {};
      setTasks([...recoveredTasks]);
      const recoveredJobId = String(recoveredMeta.jobId || `recovered-${Date.now()}`);
      setJobId(recoveredJobId);
      setSourceFileName(String(recoveredMeta.sourceFileName || ""));
      setJobInfo({
        jobId: recoveredJobId,
        count: recoveredTasks.length,
        jobPath: "session-recovery-v40.3.8",
        parserVersion: "V40.3.8",
        parseStatus: "restored",
        sourceFileName: String(recoveredMeta.sourceFileName || ""),
        autoFilledImages: recoveredTasks.filter((task: any) => getTaskImages(task).length >= 3).length,
        refreshedShopeeImages: recoveredTasks.filter((task: any) => getTaskImages(task).length >= 3).length,
        imageRefreshPending: false,
        imageRefreshError: "",
      });
      console.info("[V40.3.8] restored import cache", recoveredTasks.length);
    }

    refreshAffiliateDbSummary();
    refreshGeminiStatus();
    refreshOpenClawStatus();
    refreshPublisherCenter();
    refreshBrowserStatus();
    refreshPublisherExtensionStatus();
    refreshMetaStatus(true);
    refreshYouTubeStatus(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("rxv_publisher_platform_filter", publisherPlatformFilter);
  }, [publisherPlatformFilter]);

  useEffect(() => {
    localStorage.setItem("rxv_publisher_status_filter", publisherStatusFilter);
  }, [publisherStatusFilter]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      refreshPublisherExtensionStatus();
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.origin !== "http://localhost:3006") return;
      if (event.data?.type === "rxv-youtube-oauth-success") {
        toast.success("YouTube OAuth 授權完成");
        refreshYouTubeStatus(true);
        refreshPublisherCenter();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);


  if (!featureFlags.videoTool) {
    return <Navigate to="/" replace />;
  }

  const refreshAffiliateDbSummary = async () => {
    try {
      const res = await fetch("http://localhost:3006/affiliate-db/status");
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok !== false) {
        setAffiliateDbSummary({
          total: Number(data.total || 0),
          completed: Number(data.completed || 0),
          failed: Number(data.failed || 0),
          pendingPublish: Number(data.pendingPublish || 0),
          published: Number(data.published || 0),
          platformCounts:
            data.platformCounts && typeof data.platformCounts === "object"
              ? data.platformCounts
              : {},
          dbPath: String(data.dbPath || ""),
        });
      }
    } catch {
      // 3006 還沒啟動時不阻斷頁面。
    }
  };

  const refreshGeminiStatus = async () => {
    try {
      const res = await fetch("http://localhost:3006/gemini/status");
      const data = await res.json().catch(() => ({}));
      const configured = Boolean(data.configured);
      const connected = Boolean(data.connected);

      setGeminiConfigured(configured);
      setGeminiConnected(connected);

      if (connected) {
        setGeminiStatusText(
          `已連線｜主模型 ${data.primaryModel || "gemini-3.5-flash-lite"}｜備援 ${data.fallbackModel || "gemini-2.5-flash"}`,
        );
      } else if (!configured) {
        setGeminiStatusText(
          "V40.5.7 已停用 Gemini / OpenClaw 自動文案，影片改用匯入 CSV 文案。",
        );
      } else {
        setGeminiStatusText(
          data.error || "Gemini API Key 已設定，但目前模型連線失敗。",
        );
      }
    } catch (error: any) {
      setGeminiConfigured(false);
      setGeminiConnected(false);
      setGeminiStatusText(
        error?.message || "無法檢查 Gemini 狀態",
      );
    }
  };

  const refreshOpenClawStatus = async () => {
    try {
      const res = await fetch("http://localhost:3006/openclaw-native/status");
      const data = await res.json().catch(() => ({}));
      const connected = Boolean(res.ok && data.ok && data.connected);
      setOpenClawConnected(connected);

      if (connected) {
        const models = Array.isArray(data.models)
          ? data.models.join(", ")
          : "";
        setOpenClawStatusText(
          models
            ? `已連線｜${models}`
            : "已連線｜OpenClaw Gateway 正常",
        );
      } else {
        setOpenClawStatusText(
          data.error || "OpenClaw Gateway 尚未連線",
        );
      }
    } catch (error: any) {
      setOpenClawConnected(false);
      setOpenClawStatusText(
        error?.message || "無法連到 OpenClaw Gateway",
      );
    }
  };





  const refreshPublisherExtensionStatus = async () => {
    try {
      const res = await fetch(
        "http://localhost:3006/publisher-extension/status",
      );
      const data = await res.json().catch(() => ({}));
      setPublisherExtensionStatus(data as PublisherExtensionStatus);
      return data;
    } catch {
      setPublisherExtensionStatus(null);
      return null;
    }
  };

  const handlePublisherExtensionSetup = async () => {
    try {
      const res = await fetch(
        "http://localhost:3006/publisher-extension/open-setup",
        { method: "POST" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) {
        throw new Error(data?.message || data?.error || "無法開啟擴充功能安裝頁");
      }
      toast.success("已開啟 Edge 擴充功能頁與 RxV Publisher 資料夾");
    } catch (error: any) {
      toast.error(error?.message || "無法開啟擴充功能安裝頁");
    }
  };

  const refreshBrowserStatus = async () => {
    try {
      const res = await fetch("http://localhost:3006/browser/status");
      const data = await res.json().catch(() => ({}));
      if (data?.status) setBrowserStatus(data.status as BrowserStatus);
      return data;
    } catch {
      return null;
    }
  };

  const handleBrowserOpen = async (target: "home" | "facebook" | "instagram" | "tiktok" | "threads" | "x") => {
    setBrowserActionLoading(true);
    try {
      const res = await fetch("http://localhost:3006/browser/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.message || data.error || "無法開啟 RxV 專用 Edge");
      if (data?.status) setBrowserStatus(data.status as BrowserStatus);
      toast.success("RxV 專用 Edge 已開啟；第一次請手動登入平台");
    } catch (error: any) {
      toast.error(error?.message || "瀏覽器啟動失敗");
    } finally {
      setBrowserActionLoading(false);
    }
  };

  const handleBrowserClose = async () => {
    setBrowserActionLoading(true);
    try {
      const res = await fetch("http://localhost:3006/browser/close", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (data?.status) setBrowserStatus(data.status as BrowserStatus);
      toast.success("RxV 專用 Edge 已關閉");
    } catch {
      toast.error("瀏覽器關閉失敗");
    } finally {
      setBrowserActionLoading(false);
    }
  };

  const handleBrowserCleanup = async () => {
    setBrowserActionLoading(true);
    try {
      const res = await fetch("http://localhost:3006/browser/cleanup-cache", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || "請先關閉 RxV 專用 Edge");
      toast.success(`已清理瀏覽器快取資料夾：${Number(data.removed || 0)} 個`);
    } catch (error: any) {
      toast.error(error?.message || "快取清理失敗");
    } finally {
      setBrowserActionLoading(false);
    }
  };

  const handleBrowserConfirmPublished = async (job: PublisherJob) => {
    try {
      const res = await fetch("http://localhost:3006/publisher/browser-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.message || data.error || "標記失敗");
      toast.success("已標記為已發布");
      await refreshPublisherCenter();
    } catch (error: any) {
      toast.error(error?.message || "標記已發布失敗");
    }
  };



  const applyRotationResult = async (data: any, fallbackTitle = "") => {
    const currentPlatform = String(data?.platform || data?.job?.platform || "");
    const progress = data?.progress && typeof data.progress === "object"
      ? (data.progress as RotationProgress) : null;
    setRotationState({
      productKey: String(data?.productKey || progress?.productKey || ""),
      productTitle: String(data?.job?.productTitle || fallbackTitle || ""),
      currentPlatform,
      progress,
      skipped: Array.isArray(data?.skipped) ? data.skipped : [],
      done: Boolean(data?.done || progress?.done),
    });

    if (currentPlatform) {
      setPublisherPlatformFilter(currentPlatform);
      localStorage.setItem("rxv_publisher_platform_filter", currentPlatform);
    }

    await Promise.all([
      refreshPublisherCenter(currentPlatform || publisherPlatformFilter, publisherStatusFilter),
      refreshAffiliateDbSummary(),
    ]);

    if (data?.done || progress?.done) {
      toast.success(`這支影片五平台輪播完成：${Number(progress?.published || 0)} 個已發布`);
    } else if (data?.needsManualAction && data?.prepared) {
      toast.success(`${ROTATION_PLATFORM_LABELS[currentPlatform] || currentPlatform} 已準備到最後一步；發佈後回 RxV 按「已發佈，下一平台」`);
    } else if (data?.needsManualAction) {
      toast(`${ROTATION_PLATFORM_LABELS[currentPlatform] || currentPlatform} 需要人工處理：${data?.error || "請查看瀏覽器"}`);
    }
  };

  const handleRotationStart = async (job: PublisherJob) => {
    setPublisherActionJobId(job.id);
    try {
      const res = await fetch("http://localhost:3006/publisher/rotation/start", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, productKey: job.productKey }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.message || data?.error || "跨平台輪播啟動失敗");
      if (Number(data?.resetCount || 0) > 0) {
        toast.success(`已清除 ${Number(data.resetCount)} 筆舊的未完成狀態，正在重新準備第一個平台`);
      }
      await applyRotationResult(data, job.productTitle);
    } catch (error: any) {
      toast.error(error?.message || "跨平台輪播啟動失敗");
      await refreshPublisherCenter();
    } finally { setPublisherActionJobId(null); }
  };

  const handleRotationConfirmNext = async (job: PublisherJob) => {
    setPublisherActionJobId(job.id);
    try {
      const res = await fetch("http://localhost:3006/publisher/rotation/confirm-next", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: job.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.message || data?.error || "下一平台準備失敗");
      await applyRotationResult(data, job.productTitle);
    } catch (error: any) {
      toast.error(error?.message || "下一平台準備失敗"); await refreshPublisherCenter();
    } finally { setPublisherActionJobId(null); }
  };

  const handleRotationSkipNext = async (job: PublisherJob) => {
    if (!window.confirm(`確定跳過 ${ROTATION_PLATFORM_LABELS[job.platform] || job.platform}，直接跑下一平台？`)) return;
    setPublisherActionJobId(job.id);
    try {
      const res = await fetch("http://localhost:3006/publisher/rotation/skip-next", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: job.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data?.ok === false) throw new Error(data?.message || data?.error || "跳過平台失敗");
      await applyRotationResult(data, job.productTitle);
    } catch (error: any) {
      toast.error(error?.message || "跳過平台失敗"); await refreshPublisherCenter();
    } finally { setPublisherActionJobId(null); }
  };

  const handleFastConfirmNext = async (
    job: PublisherJob,
  ) => {
    setPublisherActionJobId(job.id);

    try {
      const confirmRes =
        await fetch(
          "http://localhost:3006/publisher/fast-confirm-next",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              jobId: job.id,
            }),
          },
        );

      const confirmData =
        await confirmRes
          .json()
          .catch(() => ({}));

      if (
        !confirmRes.ok ||
        confirmData?.ok === false
      ) {
        throw new Error(
          confirmData?.message ||
            confirmData?.error ||
            "確認發布失敗",
        );
      }

      const nextJobId =
        Number(
          confirmData?.nextJobId || 0,
        );

      await refreshPublisherCenter();

      if (!nextJobId) {
        toast.success(
          "這支已記錄完成，目前沒有下一支 Facebook 待發布",
        );
        return;
      }

      toast.success(
        "這支已完成，正在準備下一支 Facebook...",
      );

      // Give Facebook a short moment to finish the user's manual submit
      // before closing the old composer and preparing the next item.
      await new Promise(
        (resolve) =>
          window.setTimeout(
            resolve,
            1500,
          ),
      );

      setPublisherActionJobId(
        nextJobId,
      );

      const nextRes =
        await fetch(
          "http://localhost:3006/publisher/dispatch",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              jobId: nextJobId,
            }),
          },
        );

      const nextData =
        await nextRes
          .json()
          .catch(() => ({}));

      if (
        nextData?.needsManualAction &&
        nextData?.prepared
      ) {
        toast.success(
          "下一支已準備到 Facebook 最後「發佈」頁",
        );
      } else if (
        !nextRes.ok ||
        nextData?.ok === false
      ) {
        throw new Error(
          nextData?.message ||
            nextData?.error ||
            "下一支準備失敗",
        );
      }

      await refreshPublisherCenter();
    } catch (error: any) {
      toast.error(
        error?.message ||
          "快速下一支失敗",
      );
      await refreshPublisherCenter();
    } finally {
      setPublisherActionJobId(null);
    }
  };

  const handlePublisherRetry = async (job: PublisherJob) => {
    if (
      !window.confirm(
        `要把 ${getPublisherPlatformLabel(
          job.platform,
        )} 這筆工作重設為「待發布」並重新測試嗎？`,
      )
    ) {
      return;
    }

    setPublisherActionJobId(job.id);
    try {
      const res = await fetch(
        "http://localhost:3006/publisher/retry",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobId: job.id }),
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(
          data?.message ||
            data?.error ||
            "重新測試重設失敗",
        );
      }

      const adapterMode =
        publisherStatus?.settings?.find(
          (item) => item.platform === job.platform,
        )?.adapterMode ||
        (["facebook", "tiktok"].includes(job.platform)
          ? "extension"
          : "browser");

      const useExtensionQueue =
        adapterMode === "extension" &&
        ["facebook", "tiktok"].includes(job.platform);

      if (useExtensionQueue) {
        const queueRes = await fetch(
          "http://localhost:3006/publisher-extension/requeue-publisher-job",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ jobId: job.id }),
          },
        );
        const queueData = await queueRes.json().catch(() => ({}));

        if (!queueRes.ok || queueData?.ok === false) {
          throw new Error(
            queueData?.message ||
              queueData?.error ||
              "Publisher Extension 工作送出失敗",
          );
        }

        toast.success(
          `${getPublisherPlatformLabel(job.platform)} 已重設並直接送入 RxV Publisher Helper`,
        );
        await Promise.all([
          refreshPublisherCenter(),
          refreshPublisherExtensionStatus(),
        ]);
        return;
      }

      toast.success(
        data?.clearedRateGuard
          ? "已重設為待發布，並清除這筆誤判造成的發布間隔保護；現在可立即再測"
          : "已重設為待發布，可以再按一次「立即發布」",
      );
      await refreshPublisherCenter();
    } catch (error: any) {
      toast.error(
        error?.message ||
          "重新測試重設失敗",
      );
    } finally {
      setPublisherActionJobId(null);
    }
  };

  const refreshYouTubeStatus = async (verify = false) => {
    try {
      const res = await fetch(`http://localhost:3006/youtube/status?verify=${verify ? "1" : "0"}`);
      const data = await res.json().catch(() => ({}));
      if (data?.status) setYouTubeStatus(data.status as YouTubeStatus);
      return data;
    } catch { return null; }
  };

  const handleYouTubeConnect = () => {
    const popup = window.open(
      "http://localhost:3006/youtube/oauth/start",
      "rxv-youtube-oauth",
      "width=720,height=820",
    );
    if (!popup) toast.error("瀏覽器擋住彈出視窗，請允許 localhost 彈出視窗");
  };

  const handleYouTubeTest = async () => {
    setYouTubeTesting(true);
    try {
      const res = await fetch("http://localhost:3006/youtube/test", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const data = await res.json().catch(() => ({}));
      if (data?.status) setYouTubeStatus(data.status as YouTubeStatus);
      if (!res.ok || data.ok === false) throw new Error(data?.verified?.error || data?.message || data?.error || "YouTube 連線測試失敗");
      toast.success(`YouTube 已連線${data?.verified?.channelTitle ? `：${data.verified.channelTitle}` : ""}`);
      await refreshPublisherCenter();
    } catch (error: any) {
      toast.error(error?.message || "YouTube 連線測試失敗");
    } finally { setYouTubeTesting(false); }
  };

  const refreshMetaStatus = async (verify = false) => {
    try {
      const res = await fetch(
        `http://localhost:3006/meta/status?verify=${verify ? "1" : "0"}`,
      );
      const data = await res.json().catch(() => ({}));
      const status = data?.status;
      if (status && typeof status === "object") {
        setMetaStatus(status as MetaStatus);
      }
      return data;
    } catch {
      return null;
    }
  };

  const handleMetaTest = async () => {
    setMetaTesting(true);
    try {
      const res = await fetch("http://localhost:3006/meta/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json().catch(() => ({}));
      if (data?.status) {
        setMetaStatus(data.status as MetaStatus);
      }

      if (!res.ok || data.ok === false) {
        const fbError = String(
          data?.status?.facebook?.error || "",
        );
        const igError = String(
          data?.status?.instagram?.error || "",
        );
        throw new Error(
          [fbError, igError, data?.message]
            .filter(Boolean)
            .join("；") || "Meta 連線尚未完成",
        );
      }

      toast.success("Meta 連線測試成功");
      await refreshPublisherCenter();
    } catch (error: any) {
      toast.error(error?.message || "Meta 連線測試失敗");
    } finally {
      setMetaTesting(false);
    }
  };

  const handlePublisherDispatch = async (job: PublisherJob) => {
    if (
      ![
        "facebook",
        "instagram",
        "tiktok",
        "youtube_shorts",
        "youtube_video",
        "threads",
        "x",
      ].includes(job.platform)
    ) {
      toast.error("這個平台尚未接發布器");
      return;
    }

    if (
      job.platform !== "facebook" &&
      !window.confirm(
        `確定要由目前設定的發布器處理 ${getPublisherPlatformLabel(
          job.platform,
        )}？`,
      )
    ) {
      return;
    }

    setPublisherActionJobId(job.id);
    try {
      const adapterMode =
        publisherStatus?.settings?.find(
          (item) => item.platform === job.platform,
        )?.adapterMode ||
        (["facebook", "tiktok"].includes(job.platform)
          ? "extension"
          : job.platform.startsWith("youtube_")
            ? "api"
            : "browser");

      const useExtensionQueue =
        adapterMode === "extension" &&
        ["facebook", "tiktok"].includes(job.platform);

      const res = await fetch(
        useExtensionQueue
          ? "http://localhost:3006/publisher-extension/requeue-publisher-job"
          : "http://localhost:3006/publisher/dispatch",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: job.id }),
        },
      );
      const data = await res.json().catch(() => ({}));

      if (useExtensionQueue) {
        if (!res.ok || data?.ok === false) {
          throw new Error(
            data?.message ||
              data?.error ||
              "Publisher Extension 工作送出失敗",
          );
        }

        toast.success(
          `${getPublisherPlatformLabel(job.platform)} 已直接送入 RxV Publisher Helper 工作佇列`,
        );
        await Promise.all([
          refreshPublisherCenter(),
          refreshPublisherExtensionStatus(),
        ]);
        return;
      }

      if (data?.needsManualAction) {
        const reason = String(data?.error || "MANUAL_ACTION_REQUIRED");
        if (data?.prepared) {
          toast.success(
            "Facebook 已準備完成：影片＋文案＋AI 標籤都已處理。現在在 Edge 按最後藍色「發佈」，完成後回 RxV 按「已發佈，下一支」",
          );
        } else {
          const message =
            reason === "FAST_MODE_READY_TO_PUBLISH"
              ? "Facebook 已準備完成，現在只要按最後藍色「發佈」"
              : reason === "FACEBOOK_CONTINUE_NOT_READY"
              ? "Facebook 影片已選取，但「繼續」在 120 秒內仍未可按，請先看 Edge 是否仍在處理影片"
              : reason === "FACEBOOK_REEL_WIZARD_NEEDS_MANUAL_CONFIRM"
                ? "Facebook 已通過影片上傳頁，但後續版面與目前 selector 不同；請在 Edge 手動繼續"
                : reason === "FACEBOOK_AI_LABEL_NOT_FOUND" ||
                    reason === "FACEBOOK_AI_LABEL_SWITCH_NOT_FOUND"
                  ? "找不到 Facebook「新增 AI 標籤」開關，為避免未揭露 AI，Auto 已停下"
                  : reason === "FACEBOOK_AI_LABEL_TOGGLE_FAILED" ||
                      reason === "FACEBOOK_AI_LABEL_NOT_CONFIRMED_ON"
                    ? "Facebook AI 標籤無法確認已開啟，Auto 已停下，不會自動發布"
                    : reason === "FACEBOOK_REEL_URL_NOT_FOUND" ||
                        reason === "FACEBOOK_REEL_NOT_VERIFIED"
                      ? "Facebook 已嘗試發布，但找不到可證明是這支商品的 Reel；Auto 已停下"
                      : reason === "FACEBOOK_REEL_WRONG_PUBLISHER"
                        ? "找到 Reel，但發布者不是 RXV 好物分享；已拒絕寫入貼文連結，Auto 停止"
                        : reason === "FACEBOOK_REEL_WRONG_CONTENT"
                          ? "找到 Reel，但內容與目前商品／文案不吻合；已拒絕寫入貼文連結，Auto 停止"
                          : reason === "FACEBOOK_V38_4_6_REVERIFY_REQUIRED"
                            ? "舊 Facebook 貼文連結不可信，已重設。請按「重新測試」"
                            : reason === "FACEBOOK_CAPTION_NOT_FILLED" ||
                                reason === "FACEBOOK_CAPTION_EMPTY"
                              ? "Facebook 已到最後頁，但商品文案沒有成功填入；為避免發空白文案已停止"
                              : reason === "FACEBOOK_FINAL_BUTTON_NOT_CLICKED" ||
                                  reason === "FACEBOOK_FINAL_CLICK_NOT_CONFIRMED"
                                ? "Facebook 已到最後『發佈』頁，但程式仍無法確認真正送出；已停止"
                                : reason === "FACEBOOK_PUBLISH_RESET_TO_UPLOAD"
                                  ? "Facebook 最後『發佈』已被點擊，但 Facebook 隨後把建立 Reel 畫面重設回『上傳影片』。這表示不是按鈕沒按，而是 Facebook 提交後失敗／被拒絕；已保存診斷紀錄"
                                  : `Browser 已停下等待人工處理：${reason}`;
          toast(message);
        }
        await refreshBrowserStatus();
        await refreshPublisherCenter();
        return;
      }

      if (!res.ok || data.ok === false) {
        if (data?.deferred) {
          const nextText = data?.nextAllowedAt
            ? new Date(data.nextAllowedAt).toLocaleString()
            : "";
          const reasonLabel =
            data?.error === "MIN_INTERVAL_GUARD"
              ? "RxV 本機最小發布間隔保護"
              : data?.error === "DAILY_LIMIT_GUARD"
                ? "RxV 本機每日目標保護"
                : data?.error === "BROWSER_PLATFORM_BUSY"
                  ? "Facebook 目前已有一支影片正在處理，請等這支完成"
                  : data?.error || "RxV 本機發布保護";
          throw new Error(
            `${reasonLabel}${
              nextText ? `，下次可發：${nextText}` : ""
            }（不是 Facebook API 限流）`,
          );
        }
        const browserDetail = data?.browserStatus?.lastError
          ? `；Browser：${data.browserStatus.lastError}`
          : "";
        throw new Error(
          `${
            data?.message ||
            data?.error ||
            "平台發布失敗"
          }${browserDetail}`,
        );
      }

      toast.success(
        `${getPublisherPlatformLabel(
          job.platform,
        )} 發布成功`,
      );
      await Promise.all([
        refreshPublisherCenter(),
        refreshAffiliateDbSummary(),
        refreshMetaStatus(false),
      ]);
    } catch (error: any) {
      toast.error(error?.message || "平台發布失敗");
      await refreshPublisherCenter();
    } finally {
      setPublisherActionJobId(null);
    }
  };

  const refreshPublisherCenter = async (
    platformFilter = publisherPlatformFilter,
    statusFilter = publisherStatusFilter,
  ) => {
    setPublisherLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (platformFilter) params.set("platform", platformFilter);
      if (statusFilter) params.set("status", statusFilter);

      const [statusRes, jobsRes] = await Promise.all([
        fetch("http://localhost:3006/publisher/status"),
        fetch(
          `http://localhost:3006/publisher/jobs?${params.toString()}`,
        ),
      ]);

      const statusData = await statusRes.json().catch(() => ({}));
      const jobsData = await jobsRes.json().catch(() => ({}));

      if (statusRes.ok && statusData.ok !== false) {
        setPublisherStatus({
          readyProducts: Number(statusData.readyProducts || 0),
          actualPublishingEnabled: Boolean(
            statusData.actualPublishingEnabled,
          ),
          counts: {
            total: Number(statusData.counts?.total || 0),
            queued: Number(statusData.counts?.queued || 0),
            scheduled: Number(statusData.counts?.scheduled || 0),
            publishing: Number(statusData.counts?.publishing || 0),
            published: Number(statusData.counts?.published || 0),
            failed: Number(statusData.counts?.failed || 0),
            needsManualAction: Number(statusData.counts?.needsManualAction || 0),
            cancelled: Number(statusData.counts?.cancelled || 0),
          },
          settings: Array.isArray(statusData.settings)
            ? statusData.settings
            : [],
          connections:
            statusData.connections &&
            typeof statusData.connections === "object"
              ? statusData.connections
              : {},
          note: String(statusData.note || ""),
        });
      }

      if (jobsRes.ok && jobsData.ok !== false) {
        setPublisherJobs(
          Array.isArray(jobsData.jobs) ? jobsData.jobs : [],
        );
      }
    } catch (error: any) {
      toast.error(
        error?.message || "無法載入 V38 發布中心",
      );
    } finally {
      setPublisherLoading(false);
    }
  };

  const handlePublisherSync = async () => {
    setPublisherLoading(true);
    try {
      const res = await fetch("http://localhost:3006/publisher/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw new Error(data.message || data.error || "同步失敗");
      }
      toast.success(
        `發布佇列已同步：新增 ${Number(data.sync?.created || 0)} 筆`,
      );
      await refreshPublisherCenter();
    } catch (error: any) {
      toast.error(error?.message || "發布佇列同步失敗");
    } finally {
      setPublisherLoading(false);
    }
  };

  const handlePublisherSettingUpdate = async (
    platform: string,
    patch: Partial<PublisherSetting>,
  ) => {
    try {
      const current = publisherStatus?.settings?.find(
        (item) => item.platform === platform,
      );
      const body = {
        platform,
        enabled:
          patch.enabled ?? current?.enabled ?? true,
        dailyLimit:
          patch.dailyLimit ?? current?.dailyLimit ?? 8,
        minIntervalMinutes:
          patch.minIntervalMinutes ??
          current?.minIntervalMinutes ??
          90,
        autoPublish:
          patch.autoPublish ?? current?.autoPublish ?? false,
        adapterMode:
          patch.adapterMode ?? current?.adapterMode ?? "browser",
        browserFinalConfirm:
          patch.browserFinalConfirm ?? current?.browserFinalConfirm ?? true,
        browserVisibility:
          patch.browserVisibility ?? current?.browserVisibility ?? "private",
      };

      const res = await fetch(
        "http://localhost:3006/publisher/settings",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw new Error(
          data.message || data.error || "設定更新失敗",
        );
      }

      setPublisherStatus((currentStatus) =>
        currentStatus
          ? {
              ...currentStatus,
              settings: Array.isArray(data.settings)
                ? data.settings
                : currentStatus.settings,
            }
          : currentStatus,
      );
    } catch (error: any) {
      toast.error(error?.message || "平台設定更新失敗");
    }
  };

  const handleTikTokAutoSchedule = async () => {
    try {
      setPublisherLoading(true);
      const res = await fetch(
        "http://localhost:3006/publisher/tiktok-auto-schedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayStartHour: 8,
            dayEndHour: 22,
            maxJobs: 100,
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw new Error(data.message || data.error || "TikTok 自動排程失敗");
      }
      const first = data.firstScheduledAt
        ? new Date(data.firstScheduledAt).toLocaleString()
        : "—";
      const last = data.lastScheduledAt
        ? new Date(data.lastScheduledAt).toLocaleString()
        : "—";
      toast.success(
        data.scheduledCount > 0
          ? `TikTok 已一鍵排程 ${data.scheduledCount} 支｜${first} ～ ${last}`
          : "沒有新的 TikTok MP4 可排程",
      );
      await refreshPublisherCenter("tiktok", publisherStatusFilter);
    } catch (error: any) {
      toast.error(error?.message || "TikTok 自動排程失敗");
    } finally {
      setPublisherLoading(false);
    }
  };

  const handleOpenShopeeMobileHelper = () => {
    window.open(
      "http://localhost:3006/shopee/mobile-helper",
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handlePublisherSchedule = async (job: PublisherJob) => {
    const raw = String(
      publisherScheduleDrafts[job.id] || "",
    ).trim();
    if (!raw) {
      toast.error("請先選擇排程日期與時間");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:3006/publisher/schedule",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobId: job.id,
            scheduledAt: new Date(raw).toISOString(),
          }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw new Error(
          data.message || data.error || "排程失敗",
        );
      }
      toast.success("已儲存排程");
      await refreshPublisherCenter();
    } catch (error: any) {
      toast.error(error?.message || "排程失敗");
    }
  };

  const handlePublisherCancel = async (job: PublisherJob) => {
    try {
      const res = await fetch(
        "http://localhost:3006/publisher/cancel",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobId: job.id }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) {
        throw new Error(
          data.message || data.error || "取消失敗",
        );
      }
      toast.success("已取消這筆發布工作");
      await refreshPublisherCenter();
    } catch (error: any) {
      toast.error(error?.message || "取消失敗");
    }
  };

  const getPublisherPlatformLabel = (platform: string) =>
    PUBLISH_PLATFORM_OPTIONS.find(
      (item) => item.key === platform,
    )?.label || platform;

  const validTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.productUrl != null && String(task.productUrl).trim() !== "",
      ),
    [tasks],
  );

  const importSummary: ImportSummary = useMemo(() => {
    const with3Images = validTasks.filter(
      (t: any) => (t.imageUrls || t.images || []).length >= 3,
    ).length;
    const withAnyImages = validTasks.filter(
      (t: any) => (t.imageUrls || t.images || []).length > 0,
    ).length;
    return {
      total: validTasks.length,
      with3Images,
      withAnyImages,
    };
  }, [validTasks]);

  const recoverV4041ShopeeImagesFromHelper = async (inputTasks: any[]) => {
    const normalizeUrl = (value: any) => {
      const raw = String(value || "").trim();
      if (!raw) return "";
      try {
        const u = new URL(raw);
        return (u.origin + u.pathname).replace(/\/$/, "");
      } catch {
        return raw.split("?")[0].replace(/\/$/, "");
      }
    };
    try {
      const response = await fetch("http://localhost:3006/shopee-extension/status", { cache: "no-store" });
      if (!response.ok) return inputTasks;
      const data = await response.json();
      const done = Array.isArray(data?.recentJobs) ? data.recentJobs : [];
      const byUrl = new Map<string, string[]>();
      for (const job of done) {
        if (String(job?.status || "") !== "done") continue;
        const imgs = Array.isArray(job?.debug?.finalImages)
          ? job.debug.finalImages.filter(Boolean).slice(0, 3)
          : [];
        if (imgs.length < 3) continue;
        const key = normalizeUrl(job?.productUrl);
        if (key) byUrl.set(key, imgs);
      }
      return inputTasks.map((task: any) => {
        if (getTaskImages(task).length >= 3) return task;
        const imgs = byUrl.get(normalizeUrl(task?.productUrl));
        if (!imgs || imgs.length < 3) return task;
        return {
          ...task,
          images: [...imgs],
          imageUrls: [...imgs],
          autoImageSource: "shopee-helper-status-v40.4.1",
        };
      });
    } catch (err) {
      console.warn("[V40.4.1] helper image recovery skipped", err);
      return inputTasks;
    }
  };

  const waitAndRecoverV4041ShopeeImages = async (inputTasks: any[]) => {
    let current = inputTasks;
    let lastReadyCount = -1;
    // V40.5.1.1: 5/9/large CSV batches can take longer than the old ~12s window.
    // Poll every 2 seconds for up to 180 seconds and update the actual tasks state progressively.
    for (let attempt = 0; attempt < 90; attempt += 1) {
      current = await recoverV4041ShopeeImagesFromHelper(current);
      const readyCount = current.filter((task: any) => getTaskImages(task).length >= 3).length;
      if (readyCount !== lastReadyCount) {
        lastReadyCount = readyCount;
        setTasks([...current]);
      }
      if (current.length > 0 && readyCount >= current.length) break;
      await new Promise((resolve) => window.setTimeout(resolve, 2000));
    }
    return current;
  };

  // If the page/session restored the CSV after reload, resume helper recovery automatically.
  useEffect(() => {
    if (!sourceFileName || validTasks.length === 0) return;
    if (validTasks.every((task: any) => getTaskImages(task).length >= 3)) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      try {
        const recovered = await waitAndRecoverV4041ShopeeImages(validTasks);
        if (!cancelled) setTasks([...recovered]);
      } catch (err) {
        console.warn("[V40.5.1.1] restored image polling skipped", err);
      }
    }, 700);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // Intentionally depend on batch identity/count only, not every image update.
  }, [sourceFileName, validTasks.length]);


  const handleImportExcelCsv = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const isCsv = name.endsWith(".csv") || name.endsWith(".tsv");
    const isExcel =
      name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".xlsm");

    if (!isCsv && !isExcel) {
      setImportError("請上傳 CSV、TSV 或 Excel 檔案");
      toast.error("請上傳 CSV、TSV 或 Excel 檔案");
      return;
    }

    sessionStorage.removeItem(V4038_IMPORT_CACHE_KEY);
    setImportError(null);
    setActionError("");
    setImporting(true);
    setRenderLog("");

    const localJobId = `import-${Date.now()}`;
    setJobId(localJobId);
    setSourceFileName(file.name);
    setJobInfo({
      jobId: localJobId,
      count: 0,
      jobPath: "local-ui-import-v40.3.7",
      parserVersion: "V40.3.7",
      parseStatus: "reading",
      sourceFileName: file.name,
      autoFilledImages: 0,
      refreshedShopeeImages: 0,
      imageRefreshPending: false,
    });

    try {
      const parsedRawTasks = await parseExcelCsvFile(file);
      const seenKeys = new Set<string>();
      const parsedTasks = parsedRawTasks.filter((task: any) => {
        const productUrl = String(task.productUrl || "").trim();
        const promoUrl = String(task.promoUrl || "").trim();
        if (!productUrl) return false;
        const key = `${productUrl}|${promoUrl}`;
        if (seenKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      });
      const duplicateCount = parsedRawTasks.length - parsedTasks.length;

      if (parsedTasks.length === 0) {
        throw new Error(
          "CSV 已讀取，但找不到『商品連結』欄位的有效網址。請確認欄名為 商品連結。",
        );
      }

      // Commit + cache immediately, before calling /shopee-images.
      saveV4038ImportCache(parsedTasks, {
        jobId: localJobId,
        sourceFileName: file.name,
      });
      setTasks([...parsedTasks]);
      setJobInfo({
        jobId: localJobId,
        count: parsedTasks.length,
        jobPath: "local-ui-import-v40.3.7",
        parserVersion: "V40.3.7",
        parseStatus: "parsed",
        sourceFileName: file.name,
        duplicateCount,
        autoFilledImages: 0,
        refreshedShopeeImages: 0,
        imageRefreshPending: true,
        imageRefreshError: "",
      });
      toast.success(
        `CSV 已讀入 ${parsedTasks.length} 筆；現在開始抓 Shopee 圖` +
          (duplicateCount ? `，略過重覆 ${duplicateCount} 筆` : ""),
      );

      // Yield one frame so the import summary visibly becomes 9 before network work.
      await new Promise<void>((resolve) => window.requestAnimationFrame(() => resolve()));

      try {
        const beforeCount = parsedTasks.filter(
          (task: any) => getTaskImages(task).length >= 3,
        ).length;
        const queuedTasks = await autoFillMissingShopeeImages(parsedTasks);
        const newTasks = await waitAndRecoverV4041ShopeeImages(queuedTasks);
        const afterCount = newTasks.filter(
          (task: any) => getTaskImages(task).length >= 3,
        ).length;
        const autoFilledCount = Math.max(0, afterCount - beforeCount);
        const refreshedCount = newTasks.filter(
          (task: any) =>
            String(task.autoImageSource || "").includes("shopee"),
        ).length;

        saveV4038ImportCache(newTasks, {
          jobId: localJobId,
          sourceFileName: file.name,
        });
        setTasks([...newTasks]);
        setJobInfo({
          jobId: localJobId,
          count: newTasks.length,
          jobPath: "local-ui-import-v40.3.7",
          parserVersion: "V40.3.7",
          parseStatus: "done",
          sourceFileName: file.name,
          duplicateCount,
          autoFilledImages: autoFilledCount,
          refreshedShopeeImages: refreshedCount,
          imageRefreshPending: false,
          imageRefreshError: "",
        });
        toast.success(
          `匯入完成 ${newTasks.length} 筆｜Shopee 新圖 ${refreshedCount} 筆`,
        );
      } catch (imageErr: any) {
        const imageMsg = imageErr?.message || "Shopee 自動抓圖失敗";
        console.error("[V40.3.7] image refresh failed; keeping parsed rows", imageErr);
        setTasks([...parsedTasks]);
        setJobInfo({
          jobId: localJobId,
          count: parsedTasks.length,
          jobPath: "local-ui-import-v40.3.7",
          parserVersion: "V40.3.7",
          parseStatus: "parsed-image-failed",
          sourceFileName: file.name,
          duplicateCount,
          autoFilledImages: 0,
          refreshedShopeeImages: 0,
          imageRefreshPending: false,
          imageRefreshError: imageMsg,
        });
        setImportError(
          `已保留 ${parsedTasks.length} 筆商品；Shopee 抓圖失敗：${imageMsg}`,
        );
        toast.error(`9 筆等資料已保留；只有抓圖失敗，可稍後重試`);
      }
    } catch (err: any) {
      const errorMsg = err?.message || "匯入失敗";
      console.error("[V40.3.7] import failed", err);
      setJobInfo((prev: any) => ({
        ...(prev || {}),
        jobId: localJobId,
        count: 0,
        jobPath: "local-ui-import-v40.3.7",
        parserVersion: "V40.3.7",
        parseStatus: "error",
        sourceFileName: file.name,
        parseError: errorMsg,
      }));
      setImportError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleRetryShopeeImages = async () => {
    if (validTasks.length === 0) {
      toast.error("目前沒有可重新抓圖的商品");
      return;
    }
    try {
      setActionLoading(true);
      setActionError("");
      setImportError(null);
      const queuedRefreshedTasks = await autoFillMissingShopeeImages(validTasks);
      const refreshedTasks = await waitAndRecoverV4041ShopeeImages(queuedRefreshedTasks);
      const refreshedCount = refreshedTasks.filter(
        (task: any) =>
          String(task.autoImageSource || "").includes("shopee"),
      ).length;
      saveV4038ImportCache(refreshedTasks, {
        jobId: jobId || jobInfo?.jobId || `retry-${Date.now()}`,
        sourceFileName: sourceFileName || jobInfo?.sourceFileName || "",
      });
      setTasks([...refreshedTasks]);
      setJobInfo((prev: any) => ({
        ...(prev || {}),
        count: refreshedTasks.length,
        parseStatus: "done",
        refreshedShopeeImages: refreshedCount,
        imageRefreshPending: false,
        imageRefreshError: "",
      }));
      toast.success(`重新抓圖完成：${refreshedCount}/${refreshedTasks.length}`);
    } catch (err: any) {
      const msg = err?.message || "重新抓 Shopee 圖失敗";
      setActionError(msg);
      setJobInfo((prev: any) => ({
        ...(prev || {}),
        imageRefreshPending: false,
        imageRefreshError: msg,
      }));
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadScriptsJson = () => {
    if (validTasks.length === 0) {
      toast.error("目前沒有可匯出的批次資料");
      return;
    }

    const payload = validTasks.map((task: any) => ({
      title: task.title || "",
      price: task.price || "",
      productUrl: task.productUrl?.trim() || "",
      promoUrl: task.promoUrl?.trim() || "",
      imageUrls: Array.isArray(task.imageUrls)
        ? task.imageUrls
        : Array.isArray(task.images)
          ? task.images
          : [],
    }));

    downloadJsonFile("shopee_batch_jobs.json", payload);
    toast.success("已下載 shopee_batch_jobs.json");
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`已複製 ${label}`);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        toast.success(`已複製 ${label}`);
      } catch (fallbackErr) {
        toast.error(`複製 ${label} 失敗`);
      }
      document.body.removeChild(textArea);
    }
  };

  const buildShareText = (result: any) => {
    return [
      result.shortTitle || '',
      result.shortDescription || '',
      result.affiliateUrl || '',
      result.hashtagKeywords || result.keywords || '',
    ].filter(Boolean).join('\n\n');
  };

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareFacebook = (result: any) => {
    const shareUrl = encodeURIComponent(result.publicPageUrl || result.publicVideoUrl || result.affiliateUrl || window.location.href);
    openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`);
  };

  const handleShareLine = (result: any) => {
    const shareUrl = encodeURIComponent(result.publicPageUrl || result.publicVideoUrl || result.affiliateUrl || window.location.href);
    const text = encodeURIComponent(buildShareText(result));
    openShareWindow(`https://social-plugins.line.me/lineit/share?url=${shareUrl}&text=${text}`);
  };

  const handleShareThreads = (result: any) => {
    const text = encodeURIComponent(buildShareText(result));
    openShareWindow(`https://www.threads.net/intent/post?text=${text}`);
  };

  const handleShareX = (result: any) => {
    const text = encodeURIComponent(buildShareText(result));
    const url = encodeURIComponent(result.publicPageUrl || result.publicVideoUrl || result.affiliateUrl || window.location.href);
    openShareWindow(`https://twitter.com/intent/tweet?url=${url}&text=${text}`);
  };

  const handleShareTelegram = (result: any) => {
    const text = encodeURIComponent(buildShareText(result));
    const url = encodeURIComponent(result.publicPageUrl || result.publicVideoUrl || result.affiliateUrl || window.location.href);
    openShareWindow(`https://t.me/share/url?url=${url}&text=${text}`);
  };

  const handleShareWhatsApp = (result: any) => {
    const text = encodeURIComponent(buildShareText(result));
    openShareWindow(`https://wa.me/?text=${text}`);
  };

  const handleRenderJob = async () => {
    if (!jobId) {
      toast.error("請先匯入 TSV / CSV / Excel");
      return;
    }
if (selectedPlatforms.length === 0) {
      toast.error("請至少勾選一個要產文案／加入佇列的平台");
      return;
    }

    setActionLoading(true);
    setActionError("");
    setRenderLog("");

    try {
      const payload = {
        items: validTasks.map((task: any) => ({
          title: task.title || "",
          price: task.price || "",
          productUrl: task.productUrl?.trim() || "",
          promoUrl: task.promoUrl?.trim() || "",
          imageUrls: Array.isArray(task.imageUrls)
            ? task.imageUrls
            : Array.isArray(task.images)
              ? task.images
              : [],
          reviewRating: task.reviewRating || "",
          reviewCount: task.reviewCount || "",
          reviewSummary: task.reviewSummary || "",
          selectedPlatforms,
          // V40.5.7 CSV copy payload: no Gemini/OpenClaw generation.
          voiceText: String(task?.manualPublishCopy?.shopee || task?.manualPublishCopy?.common || "")
            .replace(/(?:^|\s)#[^\s#]+/g, "")
            .trim(),
          shortTitle: String(task?.manualPublishCopy?.youtubeTitle || task?.title || "").trim(),
          keywords: String(task?.["SEO關鍵字"] || task?.seoKeywords || "").trim(),
          titleWithKeywords: String(task?.manualPublishCopy?.youtubeTitle || task?.title || "").trim(),
          shortDescription: String(task?.manualPublishCopy?.shopee || "").trim(),
          fullPost: String(task?.manualPublishCopy?.common || task?.manualPublishCopy?.shopee || "").trim(),
          scriptMode: "csv",
          useAi: false,
          skipUpload: true,
          skipPublicShare: true,
          skipDatabaseSave: false,
        })),
        scriptMode: "csv",
        costSafeMode: true,
        forceRegenerate,
      };

      const res = await fetch("http://localhost:3006/render-batch-from-ui", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.message || data.error || "批量產片失敗");
      }

      const results = data.results || [];
      const renderedLog = JSON.stringify(data, null, 2);

      setRenderLog(renderedLog);
      setBatchResults(results);
      await refreshAffiliateDbSummary();
      await refreshPublisherCenter();

      const renderedCount = Number(data.renderedCount || 0);
      const skippedExisting = Number(data.skippedExisting || 0);
      toast.success(
        `批量處理完成：新產 ${renderedCount} 支` +
          (skippedExisting
            ? `，SQLite 已產過略過 ${skippedExisting} 支`
            : ""),
      );
    } catch (e: any) {
      setActionError(e.message || "批量產片失敗");
      toast.error(e.message || "批量產片失敗");
    } finally {
      setActionLoading(false);
    }
  };

  const getV405PublisherJob = (task: any) => {
    const productUrl = String(task?.productUrl || "").trim();
    if (!productUrl) return undefined;
    return publisherJobs.find(
      (job: any) =>
        Boolean(job?.videoExists) &&
        String(job?.productUrl || "").trim() === productUrl,
    );
  };

  const handleV4051PushAllUnsentVideosToPhone = async () => {
    const videos = validTasks.map((task: any, index: number) => {
      const job: any = getV405PublisherJob(task);
      return {
        index,
        productKey: String(job?.productKey || "").trim(),
        productUrl: String(task?.productUrl || job?.productUrl || "").trim(),
        productTitle: String(task?.title || job?.productTitle || "").trim(),
        videoName: String(getV404VideoName(task) || "").trim(),
      };
    });

    if (!videos.length) {
      toast.error("目前沒有可傳送的影片。");
      return;
    }

    try {
      let requested = 0;
      let pushed = 0;
      let skipped = 0;
      let missing = 0;
      let failed = 0;
      let firstError = "";

      for (let offset = 0; offset < videos.length; offset += 30) {
        const chunk = videos.slice(offset, offset + 30);
        const response = await fetch("http://localhost:3006/shopee-mobile/push-files", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videos: chunk }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data?.ok === false) {
          throw new Error(data?.message || data?.error || "批次傳送 MP4 到手機失敗");
        }

        requested += Number(data?.requested || chunk.length);
        pushed += Number(data?.pushed || 0);
        skipped += Number(data?.skippedAlreadyOnPhone || 0);
        missing += Number(data?.missingLocal || 0);
        failed += Number(data?.failed || 0);

        if (!firstError && Array.isArray(data?.results)) {
          const bad = data.results.find((x: any) => x?.status === "missing_local" || x?.status === "failed");
          if (bad) {
            firstError = String(bad?.productTitle || bad?.requestedVideoName || "未知影片") +
              "：" + String(bad?.error || bad?.status || "失敗");
          }
        }
      }

      const summary =
        "手機批次：本批 " + requested +
        " 支，新傳 " + pushed +
        "，手機已有 " + skipped +
        "，本機找不到 " + missing +
        "，失敗 " + failed;

      if (missing || failed) {
        toast.error(summary + (firstError ? "；" + firstError : ""));
      } else {
        toast.success(summary);
      }
      // V40.5.6: do not refresh the whole publisher center here; keep the current viewport stable.
    } catch (err: any) {
      toast.error(err?.message || "批次傳送 MP4 到手機失敗");
    }
  };

  const handleV405PushVideoToPhone = async (task: any) => {
    const job: any = getV405PublisherJob(task);
    const payload = {
      productKey: String(job?.productKey || "").trim(),
      productUrl: String(task?.productUrl || job?.productUrl || "").trim(),
      productTitle: String(task?.title || job?.productTitle || "").trim(),
      videoName: String(getV404VideoName(task) || "").trim(),
    };

    try {
      const response = await fetch("http://localhost:3006/shopee-mobile/push-files", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos: [payload] }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) {
        throw new Error(data?.message || data?.error || "影片傳到手機失敗");
      }

      if (Number(data?.pushed || 0) > 0) {
        toast.success("已傳此 MP4 到手機 Movies/RxV");
      } else if (Number(data?.skippedAlreadyOnPhone || 0) > 0) {
        toast.success("這支 MP4 已經在手機 Movies/RxV");
      } else if (Number(data?.missingLocal || 0) > 0) {
        toast.error("D:\\out_mp4 找不到這支商品的 MP4。");
      } else {
        const bad = Array.isArray(data?.results) ? data.results.find((x: any) => x?.ok === false) : null;
        toast.error(String(bad?.error || "影片傳到手機失敗"));
      }
    } catch (err: any) {
      toast.error(err?.message || "影片傳到手機失敗");
    }
  };

  const handleV405OpenShopeeApp = async () => {
    try {
      const response = await fetch("http://localhost:3006/shopee-mobile/open-shopee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) throw new Error(data?.message || data?.error || "開啟蝦皮 App 失敗");
      toast.success("已送出開啟蝦皮 App 指令");
    } catch (err: any) {
      toast.error(err?.message || "開啟蝦皮 App 失敗");
    }
  };

  const handleV405OpenPhoneScreen = async () => {
    try {
      const response = await fetch("http://localhost:3006/shopee-mobile/open-scrcpy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.ok === false) throw new Error(data?.message || data?.error || "開啟手機畫面失敗");
      toast.success("已開啟手機畫面");
    } catch (err: any) {
      toast.error(err?.message || "開啟手機畫面失敗");
    }
  };

  const handleV404CopyText = async (text: string, label: string) => {
    const value = String(text || "").trim();
    if (!value) {
      toast.error(`${label}沒有內容；請確認匯入的是 V40.4 加強版 CSV`);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`已複製：${label}`);
      return;
    } catch {
      // Fallback for browsers that block Clipboard API on the current origin.
    }
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
    toast.success(`已複製：${label}`);
  };

  const getV404VideoName = (task: any): string => {
    const productUrl = String(task?.productUrl || "").trim();
    const matched = publisherJobs.find(
      (job) =>
        Boolean(job.videoExists) &&
        String(job.productUrl || "").trim() === productUrl,
    );
    if (matched?.videoFilename) return matched.videoFilename;
    if (task?.videoFilename) return String(task.videoFilename);
    if (task?.videoUrl) return String(task.videoUrl);
    return "尚未在發布資料中找到 MP4；可先完成批量產片";
  };

  const formatPromoUrl = (url: string): string => {
    if (url.length <= 60) return url;
    return `${url.substring(0, 60)}...`;
  };

  return (
    <>
      <SEO
        title="Shopee 批次短影音工具｜Gemini 3.5 Flash-Lite＋發布佇列 - RxV AI工具中心"
        description="匯入 TSV、CSV 或 Excel，批量產生本機 MP4 測試影片；目前不呼叫 Gemini、不上傳、不建立公開分享頁、不寫入資料庫，適合先測影片效果。"
        keywords="Shopee 批次短影音工具, AI 生成標題, 關鍵字優化, 行銷內容, 批量影片, MP4 產生"
        path="/tools/shopee-video"
      />

      <div className="w-full max-w-none px-2 py-4 sm:px-3 lg:px-4 xl:px-6">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-bold">
            Shopee 批次短影音工具＋V39.5 快速輪播發布中心
          </h1>
          <p className="text-gray-600">
            現在流程固定為：匯入 TSV / CSV / Excel → 自動抓三張商品圖 → 小龍蝦產痛點文案 →
            產生 15 秒 MP4 → 寫入本機 SQLite 分潤紀錄。已產過且影片仍存在的商品，預設自動略過。
          </p>
          <p className="mt-2 text-sm text-amber-700">
            Gemini 產片與平台文案完成後寫入 SQLite；V39.5 目前輪播只跑 Facebook／YouTube Shorts／Threads／X。Instagram、TikTok 暫停；影片固定輸出到 D:\out_mp4。
          </p>
        </div>

        <div className="space-y-8">
          <SectionCard title="1. 匯入資料檔">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                支援欄位：商品名稱、商品原網址、推廣連結、圖片網址、圖片1、圖片2、圖片3、評分、評價數、評價摘要。
                <br />V40.5.4 欄位：蝦皮文案、共用完整文案、YT標題、YT完整說明。其他文案欄位不再顯示於主工作區。
                若「圖片網址」同一格放多張圖，可用
                <code className="mx-1 rounded bg-gray-100 px-1">|</code>、
                換行、
                <code className="mx-1 rounded bg-gray-100 px-1">,</code>、
                <code className="mx-1 rounded bg-gray-100 px-1">;</code>
                分隔。
              </p>
              <label className="block">
                <span className="sr-only">選擇檔案</span>
                <input
                  type="file"
                  accept=".csv,.tsv,.xlsx,.xls,.xlsm,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={handleImportExcelCsv}
                  disabled={importing || actionLoading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </label>

              {sourceFileName ? (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                  目前檔案：
                  <span className="font-medium">{sourceFileName}</span>
                </div>
              ) : null}

              {importError && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3">
                  <p className="text-sm text-red-700">{importError}</p>
                </div>
              )}

              {importing && (
                <div className="text-sm text-indigo-600">
                  正在解析檔案、自動補圖片與建立批次任務...
                </div>
              )}
            </div>
          </SectionCard>


          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">📱 手機發片文案入口</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  批量影片完成後，手機打開這頁即可一鍵複製每支影片的蝦皮文案。
                </p>
              </div>
              <a
                href="/tools/shopee-copy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-base font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.99]"
              >
                📋 開啟手機文案複製頁
              </a>
            </div>
          </div>

          <SectionCard title="2. 匯入摘要">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Job ID</div>
                <div className="mt-1 break-all font-medium text-slate-900">
                  {jobId || "尚未建立"}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">匯入筆數</div>
                <div className="mt-1 font-medium text-slate-900">
                  {importSummary.total}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">有任一圖片</div>
                <div className="mt-1 font-medium text-slate-900">
                  {importSummary.withAnyImages}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">至少 3 張圖片</div>
                <div className="mt-1 font-medium text-slate-900">
                  {importSummary.with3Images}
                </div>
              </div>

              {jobInfo?.autoFilledImages != null && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 md:col-span-4">
                  <div className="text-sm text-emerald-700">自動補圖</div>
                  <div className="mt-1 text-sm font-medium text-emerald-900">
                    已自動補齊至少 3 張圖：{jobInfo.autoFilledImages} 筆
                  </div>
                </div>
              )}

              {jobInfo?.jobPath && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 md:col-span-4">
                  <div className="text-sm text-slate-500">Job 路徑</div>
                  <div className="mt-1 break-all text-sm text-slate-900">
                    {jobInfo.jobPath}
                  </div>
                </div>
              )}
            </div>

            {validTasks.length > 0 && importSummary.with3Images < importSummary.total && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleRetryShopeeImages}
                  disabled={importing || actionLoading}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  重新抓 Shopee 三張圖
                </button>
                {jobInfo?.imageRefreshError ? (
                  <span className="text-sm text-red-700">
                    上次抓圖失敗：{jobInfo.imageRefreshError}
                  </span>
                ) : (
                  <span className="text-sm text-slate-600">
                    CSV 已保留；抓圖失敗時不會再把匯入筆數清成 0。
                  </span>
                )}
              </div>
            )}

            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
              <div className="font-semibold">V40.3.8 CSV / Vite 穩定器</div>
              <div>
                {jobInfo?.sourceFileName
                  ? `檔案：${jobInfo.sourceFileName}｜解析：${jobInfo.parseStatus || "—"}｜筆數：${Number(jobInfo.count || 0)}`
                  : "尚未選擇 CSV / Excel"}
              </div>
              {jobInfo?.parseError && (
                <div className="mt-1 text-red-700">解析錯誤：{jobInfo.parseError}</div>
              )}
              {validTasks.length > 0 && importSummary.with3Images < importSummary.total && (
                <button
                  type="button"
                  onClick={handleRetryShopeeImages}
                  disabled={importing || actionLoading}
                  className="mt-2 rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  重新抓 Shopee 三張圖
                </button>
              )}
            </div>

            {actionError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {actionError}
              </div>
            )}
          </SectionCard>

          {validTasks.length > 0 && (
            <SectionCard title={`3. 資料預覽（${validTasks.length} 筆）`}>
              <div className="space-y-5">
                <p className="text-sm text-slate-600">
                  這裡會預覽匯入後資料；若 Excel 沒有圖片，系統會透過本機影片服務 3006 用商品原網址自動補主圖。
                </p>

                <div className="grid gap-4">
                  {validTasks.slice(0, 8).map((task: any, idx) => {
                    const imageUrls = Array.isArray(task.imageUrls)
                      ? task.imageUrls
                      : Array.isArray(task.images)
                        ? task.images
                        : [];

                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs text-slate-500">
                              #{idx + 1}
                            </div>
                            <div className="text-base font-semibold text-slate-900">
                              {task.title || "未命名商品"}
                            </div>
                            <div className="mt-1 break-all text-sm text-slate-600">
                              商品原網址：{task.productUrl || "—"}
                            </div>
                            <div className="mt-1 break-all text-sm text-slate-600">
                              推廣連結：
                              {task.promoUrl?.trim() ? (
                                <a
                                  href={task.promoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 text-blue-700 hover:underline"
                                  title={task.promoUrl}
                                >
                                  {formatPromoUrl(task.promoUrl)}
                                </a>
                              ) : (
                                <span className="ml-1 text-gray-400">—</span>
                              )}
                            </div>
                            {(task.reviewRating || task.reviewCount || task.reviewSummary) ? (
                              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                                評價卡：{task.reviewRating || "高評價"}
                                {task.reviewCount ? `｜${task.reviewCount} 則` : ""}
                                {task.reviewSummary ? `｜${task.reviewSummary}` : ""}
                              </div>
                            ) : null}
                          </div>

                          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            圖片 {imageUrls.length} / 3
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                          {[0, 1, 2].map((imageIndex) => {
                            const imageUrl = imageUrls[imageIndex];
                            return (
                              <div
                                key={`${task.id}-${imageIndex}`}
                                className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                              >
                                <div className="flex h-44 items-center justify-center bg-slate-100">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={`${task.title || "商品"}-${imageIndex + 1}`}
                                      className="h-full w-full object-contain"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <span className="text-sm text-slate-400">
                                      圖片 {imageIndex + 1} 缺少
                                    </span>
                                  )}
                                </div>
                                <div className="border-t border-slate-200 p-2 text-xs text-slate-500">
                                  {imageUrl || "無"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {validTasks.length > 8 && (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 text-center text-sm text-slate-500">
                    僅顯示前 8 筆，完整資料會在批量產片時使用。
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {validTasks.length > 0 && (
            <SectionCard title="4. 執行操作">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={handleDownloadScriptsJson}
                  disabled={!validTasks.length || importing || actionLoading}
                  className="flex-1 h-[52px] rounded-xl bg-blue-600 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  下載批次 jobs.json
                </button>

                <button
                  type="button"
                  onClick={handleRenderJob}
                  disabled={
                    !jobId || importing || actionLoading || batchLoading
                  }
                  className="flex-1 h-[52px] rounded-xl bg-red-500 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  開始批量產生 MP4
                </button>
              </div>

              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                V37.14 SQLite＋Gemini 平台文案最終安全鎖：
                <code className="mx-1 rounded bg-white px-1">D:\Pomodoro-app\data\affiliate-publish.db</code>
                。MP4：
                <code className="mx-1 rounded bg-white px-1">D:\out_mp4</code>
                ，避免備份專案時連影片一起備份。
              </div>

              <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-emerald-900">
                      Gemini 3.5 Flash-Lite｜主文案引擎
                    </div>
                    <div className="mt-1 text-xs text-emerald-700">
                      V40.5.7：蝦皮影片改用匯入 CSV 文案，不呼叫 Google Gemini。
                      主模型：
                      <code className="mx-1 rounded bg-white px-1">
                        gemini-3.5-flash-lite
                      </code>
                      ，失敗才改用
                      <code className="mx-1 rounded bg-white px-1">
                        gemini-2.5-flash
                      </code>
                      。
                    </div>
                    <div className="mt-2 text-sm text-emerald-900">
                      {geminiStatusText}
                    </div>
                    {!geminiConfigured && (
                      <div className="mt-2 text-xs text-amber-700">
                        請在 V37.5 解壓縮資料夾執行 SET_GEMINI_KEY.bat；
                        Key 會存 Windows 使用者環境變數，不寫進網站、SQLite 或 GitHub。
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        geminiConnected
                          ? "bg-emerald-100 text-emerald-700"
                          : geminiConfigured
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {geminiConnected
                        ? "Gemini 已連線"
                        : geminiConfigured
                          ? "Key 已設定"
                          : "未設定 Key"}
                    </span>
                    <button
                      type="button"
                      onClick={refreshGeminiStatus}
                      className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      重新檢查
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 p-3">
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-semibold text-violet-900">
                      OpenClaw｜第二備援
                    </div>
                    <div className="mt-1 text-xs text-violet-700">
                      只有 Flash-Lite 與 Flash 都失敗時才呼叫 OpenClaw，
                      因此正常大量產片不會一直消耗 OpenClaw 額度。
                    </div>
                    <div className="mt-1 text-xs text-violet-800">
                      {openClawStatusText}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        openClawConnected
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {openClawConnected ? "備援可用" : "備援未連線"}
                    </span>
                    <button
                      type="button"
                      onClick={refreshOpenClawStatus}
                      className="rounded-lg border border-violet-300 bg-white px-3 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-100"
                    >
                      重新檢查
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="mb-3">
                  <div className="font-semibold text-blue-900">
                    這批要產文案並加入待發布佇列的平台
                  </div>
                  <div className="mt-1 text-xs text-blue-700">
                    只勾需要的平台；V37.14 安全文案完成後會進 V38 發布佇列。V39.5 固定 YouTube Shorts 使用官方 API；Facebook／Threads／X 用本機瀏覽器，預設停在最後一步人工確認。Instagram、TikTok 暫停。
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PUBLISH_PLATFORM_OPTIONS.map((platform) => {
                    const checked = selectedPlatforms.includes(platform.key);
                    return (
                      <label
                        key={platform.key}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                          checked
                            ? "border-blue-400 bg-white text-blue-900"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedPlatforms((current) =>
                              e.target.checked
                                ? [...current, platform.key].filter(
                                    (value, index, array) =>
                                      array.indexOf(value) === index,
                                  )
                                : current.filter(
                                    (value) => value !== platform.key,
                                  ),
                            );
                          }}
                          className="h-4 w-4"
                        />
                        {platform.label}
                      </label>
                    );
                  })}
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedPlatforms(
                        PUBLISH_PLATFORM_OPTIONS.map((item) => item.key),
                      )
                    }
                    className="rounded-md border border-blue-300 bg-white px-3 py-1.5 text-xs font-medium text-blue-700"
                  >
                    全選
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPlatforms([])}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
                  >
                    清除
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                  {affiliateDbSummary ? (
                    <>
                      SQLite 已記錄 <strong>{affiliateDbSummary.total}</strong> 個商品，
                      已產片 <strong>{affiliateDbSummary.completed}</strong>，
                      待發布 <strong>{affiliateDbSummary.pendingPublish}</strong>，
                      已發布 <strong>{affiliateDbSummary.published}</strong>。
                    </>
                  ) : (
                    <>SQLite 統計載入中；3006 啟動後會自動顯示。</>
                  )}
                </div>

                {affiliateDbSummary?.platformCounts && (
                  <div className="md:col-span-2 rounded-lg border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
                    <div className="mb-2 font-semibold">
                      各平台發布紀錄
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {[
                        ["Facebook", "facebook"],
                        ["Instagram", "instagram"],
                        ["TikTok", "tiktok"],
                        ["YouTube Shorts", "youtube_shorts"],
                        ["YouTube", "youtube_video"],
                        ["Threads", "threads"],
                        ["X", "x"],
                      ].map(([label, key]) => {
                        const count =
                          affiliateDbSummary.platformCounts?.[key] || {};
                        return (
                          <span key={key}>
                            {label}：已發 {count.published || 0}／待發{" "}
                            {count.notPublished || 0}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={forceRegenerate}
                    onChange={(e) => setForceRegenerate(e.target.checked)}
                    className="h-4 w-4"
                  />
                  重新產生已完成商品
                </label>
              </div>

              {(actionLoading || importing) && (
                <div className="mt-4 text-sm text-blue-600">處理中...</div>
              )}
            </SectionCard>
          )}

          {jobId && renderLog && (
            <SectionCard title="5. 批量產生 MP4 Log">
              <pre className="max-h-[420px] overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-green-200 whitespace-pre-wrap break-all">
                {renderLog}
              </pre>
            </SectionCard>
          )}

          {jobId && batchResults.length > 0 && (
            <SectionCard title="6. 批量產生結果">
              <div className="mb-4 flex justify-end">
                <button
                  onClick={() => {
                    const exportData = batchResults.map((result, index) => ({
                      編號: index + 1,
                      商品名稱: result.title || "",
                      狀態: result.ok ? "成功" : "失敗",
                      短影片標題: result.shortTitle || "",
                      關鍵字: result.keywords || "",
                      Hashtag關鍵字: result.hashtagKeywords || "",
                      "標題+關鍵字": result.titleWithKeywords || "",
                      "蝦皮短影音標題關鍵字": result.shopeeVideoTitleKeywords || result.titleWithKeywords || "",
                      短描述: result.shortDescription || "",
                      完整貼文內容: result.fullPost || "",

                      Facebook文案: result.facebookPost || "",
                      FacebookHashtag: result.facebookHashtags || "",
                      Instagram文案: result.instagramCaption || "",
                      InstagramHashtag: result.instagramHashtags || "",
                      TikTok文案: result.tiktokCaption || "",
                      TikTokHashtag: result.tiktokHashtags || "",

                      YouTubeShorts標題:
                        result.youtubeShortsTitle || "",
                      YouTubeShorts說明:
                        result.youtubeShortsDescription || "",
                      YouTube標題: result.youtubeVideoTitle || "",
                      YouTube說明:
                        result.youtubeVideoDescription || "",
                      YouTubeHashtag: result.youtubeHashtags || "",

                      Threads文案: result.threadsPost || "",
                      X文案: result.xPost || "",

                      推廣連結: result.affiliateUrl || "",
                      商品分享頁: "測試安全模式未產生",
                      影片公開網址: "測試安全模式未產生",
                      影片檔案: result.output || "",
                      錯誤訊息: result.ok ? "" : result.message || "",
                      圖片網址: Array.isArray(result.imageUrls)
                        ? result.imageUrls.join("\n")
                        : Array.isArray(result.images)
                          ? result.images.join("\n")
                          : "",
                    }));

                    const worksheet = XLSX.utils.json_to_sheet(exportData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(
                      workbook,
                      worksheet,
                      "批量結果",
                    );
                    XLSX.writeFile(
                      workbook,
                      `批量產生結果_${new Date().toISOString().split("T")[0]}.xlsx`,
                    );
                    toast.success("已匯出批量結果到 Excel");
                  }}
                  className="rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600 transition"
                >
                  匯出 Excel
                </button>
              </div>
              <div className="space-y-6">
                {batchResults.map((result, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">
                        #{index + 1} {result.title || "未命名商品"}
                      </h3>
                      <div className="flex items-center gap-2">
                        {result.ok ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                            成功
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                            失敗
                          </span>
                        )}
                      </div>
                    </div>

                    {result.ok && (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                短影片標題
                              </label>
                              <div className="flex gap-2">
                                <textarea
                                  value={result.shortTitle || ""}
                                  readOnly
                                  placeholder="無"
                                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white resize-y whitespace-pre-wrap min-h-[96px]"
                                />
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      result.shortTitle || "",
                                      "短影片標題",
                                    )
                                  }
                                  className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
                                >
                                  複製
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                關鍵字
                              </label>
                              <div className="flex gap-2">
                                <textarea
                                  value={result.keywords || ""}
                                  readOnly
                                  placeholder="無"
                                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white resize-y whitespace-pre-wrap min-h-[120px]"
                                />
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      result.keywords || "",
                                      "關鍵字",
                                    )
                                  }
                                  className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
                                >
                                  複製
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                標題+關鍵字
                              </label>
                              <div className="flex gap-2">
                                <textarea
                                  value={result.titleWithKeywords || ""}
                                  readOnly
                                  placeholder="無"
                                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white resize-y whitespace-pre-wrap min-h-[140px]"
                                />
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      result.titleWithKeywords || "",
                                      "標題+關鍵字",
                                    )
                                  }
                                  className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
                                >
                                  複製
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                短描述
                              </label>
                              <div className="flex gap-2">
                                <textarea
                                  value={result.shortDescription || ""}
                                  readOnly
                                  placeholder="無"
                                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white resize-y whitespace-pre-wrap min-h-[140px]"
                                />
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      result.shortDescription || "",
                                      "短描述",
                                    )
                                  }
                                  className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition self-start"
                                >
                                  複製
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                完整貼文內容
                              </label>
                              <div className="flex gap-2">
                                <textarea
                                  value={result.fullPost || ""}
                                  readOnly
                                  placeholder="無"
                                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white resize-y whitespace-pre-wrap min-h-[220px]"
                                />
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      result.fullPost || "",
                                      "完整貼文內容",
                                    )
                                  }
                                  className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition self-start"
                                >
                                  複製
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                        {(result.hashtagKeywords || result.shopeeVideoTitleKeywords) && (
                          <div className="grid gap-3 md:grid-cols-2">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                Hashtag 關鍵字
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={result.hashtagKeywords || ""}
                                  readOnly
                                  placeholder="無"
                                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
                                />
                                <button
                                  onClick={() => copyToClipboard(result.hashtagKeywords || "", "Hashtag關鍵字")}
                                  className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
                                >
                                  複製
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">
                                蝦皮短影音標題關鍵字
                              </label>
                              <div className="flex gap-2">
                                <textarea
                                  value={result.shopeeVideoTitleKeywords || result.titleWithKeywords || ""}
                                  readOnly
                                  rows={3}
                                  placeholder="無"
                                  className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white resize-none"
                                />
                                <button
                                  onClick={() => copyToClipboard(result.shopeeVideoTitleKeywords || result.titleWithKeywords || "", "蝦皮短影音標題關鍵字")}
                                  className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition self-start"
                                >
                                  複製
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="rounded-xl border border-indigo-200 bg-white p-4">
                          <div className="mb-4">
                            <div className="text-base font-semibold text-indigo-900">
                              各平台專用文案
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              同一商品只呼叫一次 OpenClaw，再一次產出各平台版本。
                            </div>
                          </div>

                          <div className="grid gap-4 lg:grid-cols-2">
                            {[
                              {
                                label: "Facebook",
                                value: result.facebookPost || "",
                                tags: result.facebookHashtags || "",
                              },
                              {
                                label: "Instagram Reels",
                                value: result.instagramCaption || "",
                                tags: result.instagramHashtags || "",
                              },
                              {
                                label: "TikTok",
                                value: result.tiktokCaption || "",
                                tags: result.tiktokHashtags || "",
                              },
                              {
                                label: "Threads",
                                value: result.threadsPost || "",
                                tags: "",
                              },
                              {
                                label: "X",
                                value: result.xPost || "",
                                tags: "",
                              },
                            ].map((platform) => (
                              <div
                                key={platform.label}
                                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                              >
                                <div className="mb-2 flex items-center justify-between">
                                  <div className="font-medium text-slate-800">
                                    {platform.label}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      copyToClipboard(
                                        [platform.value, platform.tags]
                                          .filter(Boolean)
                                          .join("\n\n"),
                                        `${platform.label} 文案`,
                                      )
                                    }
                                    className="rounded-md bg-blue-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-600"
                                  >
                                    複製
                                  </button>
                                </div>
                                <textarea
                                  value={platform.value}
                                  readOnly
                                  className="min-h-[150px] w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                                />
                                {platform.tags && (
                                  <div className="mt-2 whitespace-pre-wrap break-words text-xs text-slate-500">
                                    {platform.tags}
                                  </div>
                                )}
                              </div>
                            ))}

                            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <div className="font-medium text-red-900">
                                  YouTube Shorts
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(
                                      [
                                        result.youtubeShortsTitle || "",
                                        result.youtubeShortsDescription || "",
                                        result.youtubeHashtags || "",
                                      ]
                                        .filter(Boolean)
                                        .join("\n\n"),
                                      "YouTube Shorts 文案",
                                    )
                                  }
                                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                                >
                                  複製
                                </button>
                              </div>
                              <input
                                value={result.youtubeShortsTitle || ""}
                                readOnly
                                className="mb-2 w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium"
                              />
                              <textarea
                                value={result.youtubeShortsDescription || ""}
                                readOnly
                                className="min-h-[110px] w-full resize-y rounded-md border border-red-200 bg-white px-3 py-2 text-sm"
                              />
                              {result.youtubeHashtags && (
                                <div className="mt-2 text-xs text-red-800">
                                  {result.youtubeHashtags}
                                </div>
                              )}
                            </div>

                            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                              <div className="mb-2 flex items-center justify-between">
                                <div className="font-medium text-red-900">
                                  YouTube 一般影片
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(
                                      [
                                        result.youtubeVideoTitle || "",
                                        result.youtubeVideoDescription || "",
                                        result.youtubeHashtags || "",
                                      ]
                                        .filter(Boolean)
                                        .join("\n\n"),
                                      "YouTube 影片文案",
                                    )
                                  }
                                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                                >
                                  複製
                                </button>
                              </div>
                              <input
                                value={result.youtubeVideoTitle || ""}
                                readOnly
                                className="mb-2 w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium"
                              />
                              <textarea
                                value={result.youtubeVideoDescription || ""}
                                readOnly
                                className="min-h-[170px] w-full resize-y rounded-md border border-red-200 bg-white px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                        </div>

                        {result.affiliateUrl && (
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              推廣連結
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={result.affiliateUrl}
                                readOnly
                                placeholder="無"
                                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
                              />
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    result.affiliateUrl,
                                    "推廣連結",
                                  )
                                }
                                className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
                              >
                                複製
                              </button>
                            </div>
                          </div>
                        )}

                        {false && (result.publicPageUrl || result.publicVideoUrl) && (
                          <div className="grid gap-3 md:grid-cols-2">
                            {result.publicPageUrl && (
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  商品分享頁
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={result.publicPageUrl}
                                    readOnly
                                    placeholder="無"
                                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
                                  />
                                  <button
                                    onClick={() => copyToClipboard(result.publicPageUrl, "商品分享頁")}
                                    className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
                                  >
                                    複製
                                  </button>
                                </div>
                              </div>
                            )}

                            {result.publicVideoUrl && (
                              <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                  影片公開網址
                                </label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={result.publicVideoUrl}
                                    readOnly
                                    placeholder="無"
                                    className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
                                  />
                                  <button
                                    onClick={() => copyToClipboard(result.publicVideoUrl, "影片公開網址")}
                                    className="rounded-md bg-blue-500 px-3 py-2 text-sm font-medium text-white hover:bg-blue-600 transition"
                                  >
                                    複製
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {false && (result.publicPageUrl || result.fullPost) && (
                          <div className="rounded-lg border border-slate-200 bg-white p-4">
                            <div className="mb-3 text-sm font-medium text-slate-700">一鍵分享</div>
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => handleShareLine(result)} className="rounded-md bg-[#06C755] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition">分享到 LINE</button>
                              <button onClick={() => handleShareFacebook(result)} className="rounded-md bg-[#1877F2] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition">分享到 Facebook</button>
                              <button onClick={() => handleShareThreads(result)} className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition">分享到脆</button>
                              <button onClick={() => handleShareX(result)} className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition">分享到 X</button>
                              <button onClick={() => handleShareTelegram(result)} className="rounded-md bg-[#229ED9] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition">Telegram</button>
                              <button onClick={() => handleShareWhatsApp(result)} className="rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition">WhatsApp</button>
                              <button onClick={() => copyToClipboard(buildShareText(result), "分享文案")} className="rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition">複製分享文案</button>
                            </div>
                          </div>
                        )}

                        {result.localPreviewUrl && (
                          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                            <div className="text-sm text-blue-800">
                              <strong>本機預覽：</strong> 只限目前電腦測試，不是公開網址。
                            </div>
                            <a href={result.localPreviewUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700">
                              開啟本機影片預覽
                            </a>
                          </div>
                        )}

                        {result.output && (
                          <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                            <div className="text-sm text-green-800">
                              <strong>影片檔案：</strong> {result.output}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!result.ok && result.message && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                        <div className="text-sm text-red-800">
                          <strong>錯誤：</strong> {result.message}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}


          <SectionCard title="7. V40.5.6 蝦皮優先逐支影片發布工作台">
            <div className="space-y-5">
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm leading-6 text-orange-950">
                <div className="font-bold">流程：匯入 CSV → 抓圖 → 轉 MP4 → 每支影片直接複製蝦皮／共用／YouTube 文案 → 手動上架。</div>
                <div className="mt-1">主工作區只保留 3 組文案：蝦皮（150 字內）、共用社群文案（含蝦皮分潤網址）、YouTube 標題＋說明。</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleV4051PushAllUnsentVideosToPhone}
                    className="rounded-xl bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700"
                  >
                    一鍵匯入全部未傳過 MP4 到手機
                  </button>
                  <span className="text-xs text-orange-800">已傳過／已發布會自動跳過。</span>
                </div>
              </div>

              {validTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-600">
                  請先在上方匯入 V40.5.4 CSV。需要欄位：蝦皮文案、共用完整文案、YT標題、YT完整說明。
                </div>
              ) : (
                <div className="space-y-6">
                  {validTasks.map((task: any, index: number) => {
                    const copy = (task.manualPublishCopy || {}) as V404ManualPublishCopy;
                    const job: any = getV405PublisherJob(task);
                    const videoReady = Boolean(job?.videoExists);
                    const shopeeText = String(copy.shopee || "");
                    const commonText = String(copy.common || copy.facebook || copy.tiktok || "");
                    const ytTitle = String(copy.youtubeTitle || "");
                    const ytDescription = String(copy.youtubeDescription || "");
                    const shopeeCount = Array.from(shopeeText).length;
                    const shopeeRemaining = 150 - shopeeCount;
                    const missingFields = [
                      !shopeeText ? "蝦皮文案" : "",
                      !commonText ? "共用完整文案" : "",
                      !ytTitle ? "YT標題" : "",
                      !ytDescription ? "YT完整說明" : "",
                    ].filter(Boolean);
                    return (
                      <div
                        key={String(task.id || task.productUrl || index)}
                        data-rxv-video-index={index}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-orange-700">第 {index + 1} 支影片</div>
                            <div className="mt-1 text-lg font-bold leading-7 text-slate-900">{task.title || "未命名商品"}</div>
                            <div className="mt-2 break-all text-xs text-slate-500">MP4：{getV404VideoName(task)}</div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (videoReady ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800")}>
                                {videoReady ? "MP4 ready" : "等待 MP4"}
                              </span>
                              <span className={"rounded-full px-3 py-1 text-xs font-semibold " + (missingFields.length ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-800")}>
                                {missingFields.length ? "缺欄位：" + missingFields.join("、") : "文案 ready"}
                              </span>
                            </div>
                          </div>

                          <div className="flex w-full flex-col gap-2 xl:w-56">
                            <button type="button" onClick={() => handleV405PushVideoToPhone(task)} disabled={!videoReady} className="rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:bg-slate-300">
                              傳此 MP4 到手機
                            </button>
                            <button type="button" onClick={handleV405OpenPhoneScreen} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">在電腦開手機畫面</button>
                            <button type="button" onClick={handleV405OpenShopeeApp} className="rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800 hover:bg-orange-100">開啟蝦皮 App</button>
                          </div>
                        </div>

                        <div className="mt-5 space-y-4">
                          <div className="rounded-xl border-2 border-orange-300 bg-orange-50 p-4">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <div className="font-bold text-orange-950">① 蝦皮短影音文案</div>
                                <div className={"mt-1 text-xs font-semibold " + (shopeeCount > 150 ? "text-red-600" : "text-orange-700")}>
                                  {shopeeCount}/150 字 · {shopeeCount <= 150 ? "還可 " + shopeeRemaining + " 字" : "超過 " + Math.abs(shopeeRemaining) + " 字"}
                                </div>
                              </div>
                              <button type="button" onClick={() => handleV404CopyText(shopeeText, "蝦皮文案")} disabled={!shopeeText} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 disabled:bg-slate-300">一鍵複製蝦皮文案</button>
                            </div>
                            <textarea value={shopeeText} readOnly rows={5} placeholder="CSV 沒有蝦皮文案" className="w-full whitespace-pre-wrap rounded-lg border border-orange-200 bg-white p-3 text-sm leading-7 text-slate-800" />
                          </div>

                          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <div className="font-bold text-blue-950">② 共用社群完整文案</div>
                                <div className="mt-1 text-xs text-blue-700">Facebook／TikTok／Instagram／Threads／X 共用，CSV 內直接包含蝦皮分潤網址。</div>
                              </div>
                              <button type="button" onClick={() => handleV404CopyText(commonText, "共用完整文案")} disabled={!commonText} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:bg-slate-300">一鍵複製共用文案</button>
                            </div>
                            <textarea value={commonText} readOnly rows={7} placeholder="CSV 沒有共用完整文案" className="w-full whitespace-pre-wrap rounded-lg border border-blue-200 bg-white p-3 text-sm leading-7 text-slate-800" />
                          </div>

                          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                            <div className="mb-3 font-bold text-red-900">③ YouTube Shorts</div>
                            <div className="space-y-4">
                              <div>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <span className="text-sm font-semibold">標題</span>
                                  <button type="button" onClick={() => handleV404CopyText(ytTitle, "YouTube 標題")} disabled={!ytTitle} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:bg-slate-300">一鍵複製標題</button>
                                </div>
                                <textarea value={ytTitle} readOnly rows={2} className="w-full whitespace-pre-wrap rounded-lg border border-red-200 bg-white p-3 text-sm leading-7" />
                              </div>
                              <div>
                                <div className="mb-2 flex items-center justify-between gap-2">
                                  <span className="text-sm font-semibold">完整說明</span>
                                  <button type="button" onClick={() => handleV404CopyText(ytDescription, "YouTube 完整說明")} disabled={!ytDescription} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:bg-slate-300">一鍵複製說明</button>
                                </div>
                                <textarea value={ytDescription} readOnly rows={7} className="w-full whitespace-pre-wrap rounded-lg border border-red-200 bg-white p-3 text-sm leading-7" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard title="8. 舊版自動發布工具（備用）">
            <div className="space-y-5">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="font-semibold text-emerald-950">
                      V39.5：一般 Edge 擴充＋跨平台快速輪播
                    </div>
                    <div className="mt-1 text-xs leading-relaxed text-emerald-800">
                      Facebook／TikTok 改用「正常 Edge＋RxV Publisher 擴充｜TikTok 喚醒橋接＋自動清除舊草稿＋分潤網址＋Hashtag＋自動發佈」；不再由 Playwright 登入。YouTube Shorts 使用官方 API；Threads／X 暫時保留 Playwright。Instagram 仍暫停。
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={handlePublisherExtensionSetup}
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
                      安裝／重載 Publisher 擴充
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open("http://127.0.0.1:3006/pinterest-helper", "_blank", "noopener,noreferrer")}
                      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                    >
                      Pinterest 一鍵填入
                    </button>
                    <button type="button" onClick={() => handleBrowserOpen("threads")} disabled={browserActionLoading || !browserStatus?.dependencyAvailable}
                      className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
                      專用 Edge：Threads
                    </button>
                    <button type="button" onClick={() => handleBrowserOpen("x")} disabled={browserActionLoading || !browserStatus?.dependencyAvailable}
                      className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
                      專用 Edge：X
                    </button>
                    <button type="button" onClick={handleBrowserClose} disabled={browserActionLoading || !browserStatus?.contextOpen}
                      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:opacity-50">
                      關閉專用 Edge
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className={`rounded-lg border p-3 ${publisherExtensionStatus?.online ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`}>
                    <div className="text-sm font-semibold text-slate-900">RxV Publisher 擴充</div>
                    <div className="mt-1 text-xs text-slate-700">
                      {publisherExtensionStatus?.online
                        ? `已連線｜${publisherExtensionStatus?.extension?.browser || "正常 Edge"}｜V${publisherExtensionStatus?.extension?.version || "39"}`
                        : "尚未連線；請按上方『安裝／重載 Publisher 擴充』"}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-500">Facebook／Pinterest 最後人工發佈｜TikTok 驗證文案後自動發佈</div>
                  </div>
                  <div className={`rounded-lg border p-3 ${browserStatus?.dependencyAvailable ? "border-slate-200 bg-white" : "border-red-200 bg-red-50"}`}>
                    <div className="text-sm font-semibold text-slate-900">Playwright 備援</div>
                    <div className="mt-1 text-xs text-slate-600">Threads／X 暫時保留；Facebook／TikTok 不再用 webdriver Edge 登入。</div>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-white p-3">
                    <div className="text-sm font-semibold text-slate-900">成本</div>
                    <div className="mt-1 text-xs text-emerald-700">Facebook／Pinterest 擴充：API NT$0；TikTok／YouTube Shorts 維持既有官方 API 流程。</div>
                  </div>
                </div>
                <div className="mt-3 rounded-xl border-2 border-indigo-300 bg-indigo-50 p-4 text-sm leading-relaxed text-indigo-950">
                  <div className="text-base font-bold">V39.5 一般 Edge 擴充試行｜Instagram 暫停，先跑 5 平台</div>
                  <div className="mt-2 font-semibold">Facebook → TikTok → YouTube Shorts → Threads → X</div>
                  <div className="mt-2">Facebook／TikTok 由一般 Edge 擴充自動準備 MP4＋文案到最後一步；你發佈後回 RxV 按 <strong>「已發佈，下一平台」</strong>。YouTube Shorts 仍走官方 API。</div>
                  <div className="mt-2 text-xs text-indigo-800">Instagram 仍暫停。TikTok 重新加入，但改在你平常的正常 Edge 人工登入一次後由擴充操作，不再使用 Google 會拒絕的自動化 Edge。</div>
                  {rotationState?.progress && (
                    <div className="mt-3 rounded-lg bg-white/80 p-3">
                      <div className="font-semibold">目前輪播：{rotationState.productTitle || rotationState.productKey}</div>
                      <div className="mt-1 text-xs">進度 {rotationState.progress.completed}/{rotationState.progress.total}｜已發布 {rotationState.progress.published}｜剩餘 {rotationState.progress.remaining}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="font-semibold text-blue-950">
                  Instagram 暫停｜Facebook → TikTok → YouTube Shorts → Threads → X。按「跑此影片 5 平台」會逐平台準備。
                </div>
                <div className="mt-1 text-xs leading-relaxed text-blue-800">
                  Instagram 先不處理。Facebook／TikTok 請直接在一般 Edge 正常登入；Publisher 擴充沿用該登入狀態，不處理密碼、CAPTCHA 或 2FA。
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      Meta 連線
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Graph API：{metaStatus?.graphVersion || "v26.0"}。
                      尚未設定時，先執行更新包內的 SET_META_CONFIG.bat。
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleMetaTest}
                    disabled={metaTesting}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {metaTesting ? "測試中..." : "測試 Meta 連線"}
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div
                    className={`rounded-lg border p-3 ${
                      metaStatus?.facebook?.connected
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      Facebook Page
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      {metaStatus?.facebook?.connected
                        ? `已連線：${
                            metaStatus.facebook.pageName ||
                            metaStatus.facebook.pageId ||
                            "Page"
                          }`
                        : metaStatus?.facebook?.configured
                          ? "已設定，尚未驗證"
                          : "尚未設定 Page ID / Token"}
                    </div>
                    {metaStatus?.facebook?.error && (
                      <div className="mt-1 break-words text-xs text-red-600">
                        {metaStatus.facebook.error}
                      </div>
                    )}
                  </div>

                  <div
                    className={`rounded-lg border p-3 ${
                      metaStatus?.instagram?.connected
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900">
                      Instagram Reels
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      {metaStatus?.instagram?.connected
                        ? `已連線：@${
                            metaStatus.instagram.username ||
                            metaStatus.instagram.igUserId ||
                            "Instagram"
                          }`
                        : metaStatus?.instagram?.configured
                          ? "已設定，尚未驗證"
                          : "尚未完成 IG / Meta 設定"}
                    </div>
                    {metaStatus?.instagram?.error && (
                      <div className="mt-1 break-words text-xs text-red-600">
                        {metaStatus.instagram.error}
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="text-sm font-semibold text-slate-900">
                      雲端暫存成本
                    </div>
                    <div className="mt-1 text-xs text-emerald-700">
                      預設 NT$0：Instagram 直接使用 Meta resumable upload，不使用 R2 暫存影片。
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="font-semibold text-red-950">YouTube Shorts＋YouTube 一般影片</div>
                    <div className="mt-1 text-xs leading-relaxed text-red-800">
                      直接從 D:\out_mp4 使用 YouTube Data API resumable upload，不使用 Cloudflare R2 或 Supabase Storage。
                      V39.5 預設 privacyStatus = {youtubeStatus?.privacyStatus || "private"}。
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={handleYouTubeConnect} disabled={!youtubeStatus?.configured}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:bg-slate-300">
                      {youtubeStatus?.storedAuthorization ? "重新授權 YouTube" : "連接 YouTube"}
                    </button>
                    <button type="button" onClick={handleYouTubeTest} disabled={youtubeTesting || !youtubeStatus?.configured}
                      className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                      {youtubeTesting ? "測試中..." : "測試 YouTube"}
                    </button>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <div className={`rounded-lg border p-3 ${youtubeStatus?.configured ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                    <div className="text-sm font-semibold text-slate-900">OAuth Client</div>
                    <div className="mt-1 text-xs text-slate-600">{youtubeStatus?.configured ? "已設定 Client ID / Secret" : "尚未設定，先執行 SET_YOUTUBE_CONFIG.bat"}</div>
                  </div>
                  <div className={`rounded-lg border p-3 ${youtubeStatus?.authorized ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}>
                    <div className="text-sm font-semibold text-slate-900">YouTube 頻道</div>
                    <div className="mt-1 text-xs text-slate-600">{youtubeStatus?.authorized ? `已連線：${youtubeStatus.channelTitle || youtubeStatus.channelId || "YouTube"}` : youtubeStatus?.storedAuthorization ? "已授權，請按測試 YouTube" : "尚未 OAuth 授權"}</div>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="text-sm font-semibold text-slate-900">雲端中轉成本</div>
                    <div className="mt-1 text-xs text-emerald-700">預設 NT$0：本機 MP4 直接送 YouTube，不使用 R2 暫存。</div>
                  </div>
                </div>
                {!youtubeStatus?.configured && (
                  <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    Google Cloud OAuth Client 的 Authorized redirect URI 請填：
                    <code className="mx-1 rounded bg-white px-1 py-0.5">http://localhost:3006/youtube/oauth/callback</code>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handlePublisherSync}
                  disabled={publisherLoading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  同步 V37.14 待發布資料
                </button>
                <button
                  type="button"
                  onClick={handleTikTokAutoSchedule}
                  disabled={publisherLoading}
                  title="排好發布時間；TikTok 官方 Direct Post 到點仍需你確認立即發布，本功能不會在背景偷偷送出"
                  className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-700 disabled:opacity-50"
                >
                  TikTok 一鍵排程（到點需確認）
                </button>
                <button
                  type="button"
                  onClick={handleOpenShopeeMobileHelper}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  蝦皮短影音批次助手
                </button>
                <button
                  type="button"
                  onClick={() => {
                    refreshPublisherCenter();
                    refreshMetaStatus(false);
                  }}
                  disabled={publisherLoading}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  重新整理
                </button>
                {publisherLoading && (
                  <span className="text-sm text-indigo-600">
                    載入中...
                  </span>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  [
                    "可發布商品",
                    publisherStatus?.readyProducts || 0,
                    "bg-emerald-50 border-emerald-200 text-emerald-900",
                  ],
                  [
                    "待發布工作",
                    publisherStatus?.counts?.queued || 0,
                    "bg-blue-50 border-blue-200 text-blue-900",
                  ],
                  [
                    "已排程",
                    publisherStatus?.counts?.scheduled || 0,
                    "bg-violet-50 border-violet-200 text-violet-900",
                  ],
                  [
                    "已發布",
                    publisherStatus?.counts?.published || 0,
                    "bg-slate-50 border-slate-200 text-slate-900",
                  ],
                ].map(([label, value, className]) => (
                  <div
                    key={String(label)}
                    className={`rounded-lg border p-4 ${String(
                      className,
                    )}`}
                  >
                    <div className="text-xs font-medium">{label}</div>
                    <div className="mt-1 text-2xl font-bold">
                      {Number(value)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="mb-3">
                  <div className="font-semibold text-slate-900">
                    平台每日目標與發布間隔
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    V39.5：Facebook／TikTok 使用一般 Edge 擴充；YouTube Shorts 走官方 API；Threads／X 暫用 Playwright；Instagram 暫停。
                  </div>
                </div>

                <div className="w-full overflow-x-hidden">
                  <table className="w-full table-fixed text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                        <th className="px-2 py-2">平台</th>
                        <th className="px-2 py-2">發布方式</th>
                        <th className="px-2 py-2">最後確認</th>
                        <th className="px-2 py-2">YT可見度</th>
                        <th className="px-2 py-2">每日目標</th>
                        <th className="px-2 py-2">最小間隔</th>
                        <th className="px-2 py-2">啟用</th>
                        <th className="px-2 py-2">Auto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(publisherStatus?.settings || []).map((setting) => {
                        const isMeta =
                          setting.platform === "facebook" ||
                          setting.platform === "instagram";
                        const isYouTube =
                          setting.platform === "youtube_shorts" ||
                          setting.platform === "youtube_video";
                        const browserSupported = [
                          "facebook",
                          "instagram",
                          "tiktok",
                          "threads",
                          "x",
                        ].includes(setting.platform);
                        const extensionSupported = [
                          "facebook",
                          "tiktok",
                        ].includes(setting.platform);
                        const metaConnected =
                          setting.platform === "facebook"
                            ? Boolean(metaStatus?.facebook?.connected)
                            : setting.platform === "instagram"
                              ? Boolean(metaStatus?.instagram?.connected)
                              : false;
                        const youtubeConnected =
                          isYouTube && Boolean(youtubeStatus?.authorized);
                        const apiConnected =
                          metaConnected || youtubeConnected;
                        const adapterMode =
                          setting.adapterMode ||
                          (isYouTube
                            ? "api"
                            : extensionSupported
                              ? "extension"
                              : browserSupported
                                ? "browser"
                                : "off");
                        const autoAllowed =
                          setting.enabled &&
                          adapterMode !== "off" &&
                          (adapterMode === "extension"
                            ? false
                            : adapterMode === "browser"
                              ? browserSupported &&
                                Boolean(browserStatus?.dependencyAvailable) &&
                                !(setting.browserFinalConfirm ?? true)
                              : apiConnected);

                        return (
                          <tr
                            key={setting.platform}
                            className="border-b border-slate-100"
                          >
                            <td className="px-2 py-3 font-medium text-slate-800">
                              {getPublisherPlatformLabel(setting.platform)}
                            </td>

                            <td className="px-2 py-3">
                              <select
                                value={adapterMode}
                                onChange={(e) =>
                                  handlePublisherSettingUpdate(
                                    setting.platform,
                                    {
                                      adapterMode: e.target.value as
                                        | "extension"
                                        | "browser"
                                        | "api"
                                        | "off",
                                    },
                                  )
                                }
                                className="rounded border border-slate-300 bg-white px-2 py-1.5 text-xs"
                              >
                                {extensionSupported && (
                                  <option value="extension">一般 Edge 擴充</option>
                                )}
                                {browserSupported && (
                                  <option value="browser">Playwright 瀏覽器</option>
                                )}
                                {(isMeta || isYouTube) && (
                                  <option value="api">API</option>
                                )}
                                <option value="off">關閉</option>
                              </select>
                              <div className="mt-1 text-[11px] text-slate-500">
                                {adapterMode === "browser"
                                  ? browserStatus?.dependencyAvailable
                                    ? "本機 Edge"
                                    : "Playwright 未安裝"
                                  : adapterMode === "api"
                                    ? apiConnected
                                      ? "API 已連線"
                                      : "API 待設定"
                                    : "停用"}
                              </div>
                            </td>

                            <td className="px-2 py-3">
                              {browserSupported ? (
                                <label className="flex items-center gap-1 text-xs text-slate-600">
                                  <input
                                    type="checkbox"
                                    checked={
                                      setting.browserFinalConfirm ?? true
                                    }
                                    disabled={adapterMode !== "browser"}
                                    onChange={(e) =>
                                      handlePublisherSettingUpdate(
                                        setting.platform,
                                        {
                                          browserFinalConfirm:
                                            e.target.checked,
                                        },
                                      )
                                    }
                                  />
                                  停在最後一步
                                </label>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>

                            <td className="px-2 py-3">
                              {isYouTube ? (
                                <span className="text-xs text-slate-600">
                                  API：{youtubeStatus?.privacyStatus || "private"}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>

                            <td className="px-2 py-3">
                              <input
                                type="number"
                                min={1}
                                max={100}
                                value={setting.dailyLimit}
                                onChange={(e) =>
                                  handlePublisherSettingUpdate(
                                    setting.platform,
                                    {
                                      dailyLimit: Number(
                                        e.target.value || 1,
                                      ),
                                    },
                                  )
                                }
                                className="w-20 rounded border border-slate-300 px-2 py-1.5"
                              />
                            </td>

                            <td className="px-2 py-3">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={5}
                                  max={1440}
                                  value={setting.minIntervalMinutes}
                                  onChange={(e) =>
                                    handlePublisherSettingUpdate(
                                      setting.platform,
                                      {
                                        minIntervalMinutes: Number(
                                          e.target.value || 5,
                                        ),
                                      },
                                    )
                                  }
                                  className="w-20 rounded border border-slate-300 px-2 py-1.5"
                                />
                                <span className="text-xs text-slate-500">
                                  分
                                </span>
                              </div>
                            </td>

                            <td className="px-2 py-3">
                              <input
                                type="checkbox"
                                checked={setting.enabled}
                                onChange={(e) =>
                                  handlePublisherSettingUpdate(
                                    setting.platform,
                                    { enabled: e.target.checked },
                                  )
                                }
                                className="h-4 w-4"
                              />
                            </td>

                            <td className="px-2 py-3">
                              <input
                                type="checkbox"
                                disabled={!autoAllowed}
                                checked={setting.autoPublish}
                                onChange={(e) =>
                                  handlePublisherSettingUpdate(
                                    setting.platform,
                                    { autoPublish: e.target.checked },
                                  )
                                }
                                className="h-4 w-4 disabled:opacity-40"
                              />
                              {adapterMode === "browser" &&
                                (setting.browserFinalConfirm ?? true) && (
                                  <div className="mt-1 text-[11px] text-amber-600">
                                    先關閉最後確認才能 Auto
                                  </div>
                                )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="w-full rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
                <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      發布工作佇列
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      改為精簡表格；點「預覽」才展開真正發布文案。
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <label className="text-xs text-slate-600">
                      <span className="mb-1 block">平台</span>
                      <select
                        value={publisherPlatformFilter}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPublisherPlatformFilter(value);
                          localStorage.setItem("rxv_publisher_platform_filter", value);
                          refreshPublisherCenter(
                            value,
                            publisherStatusFilter,
                          );
                        }}
                        className="rounded border border-slate-300 bg-white px-2 py-2 text-sm"
                      >
                        <option value="">全部平台</option>
                        {PUBLISH_PLATFORM_OPTIONS.map((item) => (
                          <option key={item.key} value={item.key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="text-xs text-slate-600">
                      <span className="mb-1 block">狀態</span>
                      <select
                        value={publisherStatusFilter}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPublisherStatusFilter(value);
                          localStorage.setItem("rxv_publisher_status_filter", value);
                          refreshPublisherCenter(
                            publisherPlatformFilter,
                            value,
                          );
                        }}
                        className="rounded border border-slate-300 bg-white px-2 py-2 text-sm"
                      >
                        <option value="">全部狀態</option>
                        <option value="queued">待發布</option>
                        <option value="scheduled">已排程</option>
                        <option value="publishing">發布中</option>
                        <option value="failed">失敗</option>
                        <option value="needs_manual_action">等待人工確認</option>
                        <option value="published">已發布</option>
                        <option value="cancelled">已取消</option>
                      </select>
                    </label>
                  </div>
                </div>

                {publisherJobs.length === 0 ? (
                  <div className="rounded-lg bg-slate-50 p-6 text-center text-sm text-slate-500">
                    目前沒有符合篩選條件的發布工作。
                  </div>
                ) : (
                  <div className="w-full overflow-x-hidden">
                    <table className="w-full table-fixed text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
                          <th className="w-[12%] px-2 py-2">平台</th>
                          <th className="w-[28%] px-2 py-2">商品</th>
                          <th className="w-[14%] px-2 py-2">狀態</th>
                          <th className="w-[10%] px-2 py-2">安全</th>
                          <th className="w-[18%] px-2 py-2">排程</th>
                          <th className="w-[18%] px-2 py-2">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {publisherJobs.map((job) => {
                          const previewOpen =
                            publisherPreviewJobId === job.id;
                          const payload =
                            job.platformPayload || {};
                          const previewText =
                            payload.publishText ||
                            payload.publishDescription ||
                            payload.body ||
                            payload.caption ||
                            payload.description ||
                            "";
                          const previewTitle =
                            payload.title || "";

                          const isFacebook =
                            job.platform === "facebook";
                          const isInstagram =
                            job.platform === "instagram";
                          const isMeta = isFacebook || isInstagram;
                          const isYouTube = job.platform === "youtube_shorts" || job.platform === "youtube_video";
                          const isTikTok = job.platform === "tiktok";
                          const tiktokConnection = publisherStatus?.connections?.tiktok;
                          const metaConnected = isFacebook
                            ? Boolean(metaStatus?.facebook?.connected)
                            : isInstagram
                              ? Boolean(metaStatus?.instagram?.connected)
                              : false;
                          const youtubeConnected = isYouTube && Boolean(youtubeStatus?.authorized);
                          const adapterConnected = isMeta || isYouTube || isTikTok;
                          const platformConnected =
                            metaConnected ||
                            youtubeConnected ||
                            (isTikTok && Boolean(tiktokConnection?.connected));

                          const jobSetting = publisherStatus?.settings?.find(
                            (item) => item.platform === job.platform,
                          );
                          const browserSupported = [
                            "facebook",
                            "instagram",
                            "tiktok",
                            "threads",
                            "x",
                          ].includes(job.platform);
                          const extensionSupported = [
                            "facebook",
                            "tiktok",
                          ].includes(job.platform);
                          const jobAdapter = jobSetting?.adapterMode ||
                            (isYouTube
                              ? "api"
                              : extensionSupported
                                ? "extension"
                                : browserSupported
                                  ? "browser"
                                  : "off");
                          const extensionCapable =
                            jobAdapter === "extension" &&
                            extensionSupported &&
                            Boolean(publisherExtensionStatus?.online);
                          const browserCapable =
                            jobAdapter === "browser" &&
                            browserSupported &&
                            Boolean(browserStatus?.dependencyAvailable);
                          const apiCapable =
                            jobAdapter === "api" &&
                            adapterConnected &&
                            platformConnected;

                          const canPublish =
                            (extensionCapable || browserCapable || apiCapable) &&
                            job.videoExists &&
                            job.safety?.ok === true &&
                            !["publishing", "published", "needs_manual_action"].includes(
                              job.status,
                            );

                          return (
                            <Fragment key={job.id}>
                              <tr className="border-b border-slate-100 align-top">
                                <td className="min-w-0 px-2 py-3 align-top">
                                  <div className="break-words font-medium text-slate-900">
                                    {getPublisherPlatformLabel(
                                      job.platform,
                                    )}
                                  </div>
                                  {jobAdapter === "extension" ? (
                                    <div
                                      className={`mt-1 text-xs ${
                                        publisherExtensionStatus?.online
                                          ? "text-emerald-600"
                                          : "text-amber-600"
                                      }`}
                                    >
                                      {publisherExtensionStatus?.online
                                        ? "一般 Edge 擴充｜已連線"
                                        : "一般 Edge 擴充｜待安裝"}
                                    </div>
                                  ) : jobAdapter === "browser" ? (
                                    <div
                                      className={`mt-1 text-xs ${
                                        browserStatus?.dependencyAvailable
                                          ? "text-emerald-600"
                                          : "text-amber-600"
                                      }`}
                                    >
                                      {browserStatus?.dependencyAvailable
                                        ? "Browser／本機 Edge"
                                        : "Browser 待安裝"}
                                    </div>
                                  ) : isTikTok && jobAdapter === "api" ? (
                                    <div
                                      className={`mt-1 text-xs ${
                                        tiktokConnection?.connected
                                          ? "text-emerald-600"
                                          : "text-amber-600"
                                      }`}
                                    >
                                      {tiktokConnection?.connected
                                        ? "TikTok 摰 API嚚歇??"
                                        : tiktokConnection?.configured
                                          ? "TikTok 摰 API嚚? OAuth"
                                          : "TikTok 摰 API嚚?閮剖?"}
                                    </div>
                                  ) : isMeta ? (
                                    <div
                                      className={`mt-1 text-xs ${
                                        metaConnected
                                          ? "text-emerald-600"
                                          : "text-amber-600"
                                      }`}
                                    >
                                      {metaConnected
                                        ? "Meta API 已連線"
                                        : "Meta API 待設定"}
                                    </div>
                                  ) : isYouTube ? (
                                    <div
                                      className={`mt-1 text-xs ${
                                        youtubeConnected
                                          ? "text-emerald-600"
                                          : "text-amber-600"
                                      }`}
                                    >
                                      {youtubeConnected
                                        ? "YouTube API 已連線"
                                        : "YouTube API 待設定"}
                                    </div>
                                  ) : null}
                                </td>

                                <td className="min-w-0 px-2 py-3 align-top">
                                  <div
                                    className="break-words whitespace-normal font-medium leading-snug text-slate-900"
                                    title={job.productTitle}
                                  >
                                    {job.productTitle}
                                  </div>
                                  <div
                                    className="mt-1 break-all whitespace-normal text-xs leading-snug text-slate-500"
                                    title={job.videoFilename}
                                  >
                                    {job.videoFilename}
                                  </div>
                                  {!job.videoExists && (
                                    <div className="mt-1 text-xs font-semibold text-red-600">
                                      MP4 不存在
                                    </div>
                                  )}
                                </td>

                                <td className="px-2 py-3">
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs ${
                                      job.status === "needs_manual_action"
                                        ? "bg-amber-100 text-amber-700"
                                        : "bg-slate-100 text-slate-700"
                                    }`}
                                  >
                                    {job.status === "needs_manual_action"
                                      ? "等待人工確認"
                                      : job.status === "published"
                                        ? "已確認發布"
                                        : job.status}
                                  </span>
                                  {job.publishedUrl && (
                                    <a
                                      href={job.publishedUrl}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="mt-2 block text-xs text-blue-600 underline"
                                    >
                                      查看已驗證貼文
                                    </a>
                                  )}
                                  {job.lastError && (
                                    <div
                                      className="mt-2 min-w-0 break-words whitespace-normal text-xs text-red-600"
                                      title={job.lastError}
                                    >
                                      {job.lastError}
                                    </div>
                                  )}
                                </td>

                                <td className="px-2 py-3">
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs ${
                                      job.safety?.ok
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                                  >
                                    {job.safety?.ok
                                      ? "Safety OK"
                                      : "BLOCK"}
                                  </span>
                                </td>

                                <td className="px-2 py-3">
                                  {job.status === "published" ? (
                                    <span className="text-xs text-slate-500">
                                      已確認發布
                                    </span>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="datetime-local"
                                        value={
                                          publisherScheduleDrafts[
                                            job.id
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          setPublisherScheduleDrafts(
                                            (current) => ({
                                              ...current,
                                              [job.id]:
                                                e.target.value,
                                            }),
                                          )
                                        }
                                        className="w-full min-w-0 rounded border border-slate-300 px-2 py-1.5 text-xs xl:max-w-[170px]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handlePublisherSchedule(
                                            job,
                                          )
                                        }
                                        className="rounded bg-violet-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-violet-700"
                                      >
                                        排程
                                      </button>
                                    </div>
                                  )}
                                  {job.scheduledAt && (
                                    <div className="mt-1 text-xs text-violet-700">
                                      {new Date(
                                        job.scheduledAt,
                                      ).toLocaleString()}
                                    </div>
                                  )}
                                </td>

                                <td className="px-2 py-3">
                                  <div className="flex min-w-0 flex-wrap gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPublisherPreviewJobId(
                                          previewOpen
                                            ? null
                                            : job.id,
                                        )
                                      }
                                      className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                      {previewOpen
                                        ? "收起"
                                        : "預覽"}
                                    </button>

                                    {ROTATION_PLATFORM_KEYS.includes(job.platform as any) &&
                                      ["queued", "failed", "cancelled", "published"].includes(job.status) && (
                                        <button
                                          type="button"
                                          disabled={publisherActionJobId === job.id}
                                          onClick={() => handleRotationStart(job)}
                                          className="rounded bg-indigo-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                          跑此影片 5 平台
                                        </button>
                                      )}

                                    <button
                                      type="button"
                                      disabled={
                                        !canPublish ||
                                        publisherActionJobId ===
                                          job.id
                                      }
                                      onClick={() =>
                                        handlePublisherDispatch(job)
                                      }
                                      title={
                                        jobAdapter === "browser"
                                          ? !browserStatus?.dependencyAvailable
                                            ? "Playwright 尚未安裝"
                                            : "Playwright 備援；遇驗證會停下"
                                          : jobAdapter === "api"
                                            ? !adapterConnected
                                              ? "此平台尚未接 API"
                                              : !platformConnected
                                                ? isYouTube
                                                  ? "請先完成 YouTube OAuth"
                                                  : "請先完成 Meta 連線"
                                                : ""
                                            : "此平台已關閉"
                                      }
                                      className="rounded bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                                    >
                                      {publisherActionJobId ===
                                      job.id
                                        ? "準備中..."
                                        : job.platform === "facebook"
                                          ? "準備 Facebook"
                                          : "立即發布"}
                                    </button>

                                    {[
                                      "published",
                                      "failed",
                                      "needs_manual_action",
                                    ].includes(job.status) && (
                                      <button
                                        type="button"
                                        disabled={
                                          publisherActionJobId === job.id
                                        }
                                        onClick={() =>
                                          handlePublisherRetry(job)
                                        }
                                        className="rounded border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50"
                                      >
                                        重新測試
                                      </button>
                                    )}

                                    {job.status === "needs_manual_action" &&
                                      ROTATION_PLATFORM_KEYS.includes(job.platform as any) &&
                                      job.platform !== "youtube_shorts" && (
                                        <>
                                          <button
                                            type="button"
                                            disabled={publisherActionJobId === job.id}
                                            onClick={() => handleRotationConfirmNext(job)}
                                            className="rounded bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                                          >
                                            已發佈，下一平台
                                          </button>
                                          <button
                                            type="button"
                                            disabled={publisherActionJobId === job.id}
                                            onClick={() => handleRotationSkipNext(job)}
                                            className="rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                          >
                                            跳過，下一平台
                                          </button>
                                        </>
                                      )}

                                    {job.status === "needs_manual_action" &&
                                      !ROTATION_PLATFORM_KEYS.includes(job.platform as any) && (
                                        <button
                                          type="button"
                                          onClick={() => handleBrowserConfirmPublished(job)}
                                          className="rounded border border-emerald-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                                        >
                                          我已手動發布
                                        </button>
                                      )}

                                    {(job.status === "queued" ||
                                      job.status ===
                                        "scheduled") && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handlePublisherCancel(
                                            job,
                                          )
                                        }
                                        className="rounded border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                      >
                                        取消
                                      </button>
                                    )}

                                    {(job.status === "failed" ||
                                      job.status ===
                                        "cancelled") && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handlePublisherRetry(
                                            job,
                                          )
                                        }
                                        className="rounded border border-blue-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                                      >
                                        放回
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>

                              {previewOpen && (
                                <tr className="border-b border-blue-100 bg-blue-50/50">
                                  <td
                                    colSpan={6}
                                    className="px-4 py-3"
                                  >
                                    {previewTitle && (
                                      <div className="mb-2">
                                        <span className="text-xs font-semibold text-slate-500">
                                          標題：
                                        </span>
                                        <span className="ml-2 break-words text-sm text-slate-900">
                                          {previewTitle}
                                        </span>
                                      </div>
                                    )}
                                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded bg-white p-3 text-xs text-slate-800">
                                      {previewText ||
                                        "尚無文案"}
                                    </pre>
                                    <div className="mt-2 break-all text-xs text-slate-500">
                                      MP4：{job.videoPath}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </SectionCard>

          <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              目前工具流程
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
              <li>上傳 TSV / CSV / Excel</li>
              <li>解析商品原網址、推廣連結與圖片欄位；缺圖時自動補 Shopee 商品主圖</li>
              <li>預覽每筆資料是否有 3 張圖片</li>
              <li>建立批次任務後呼叫 Gemini 產生安全文案並產生本機 MP4，寫入 SQLite</li>
              <li>V37.14 安全鎖建立各平台 publishPayload，再同步到 V38 發布工作佇列</li>
              <li>在 V38 發布中心預覽、排程與管理各平台工作；外部 API 會在後續版本逐一接上</li>
            </ol>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              這個版本先採測試安全模式，自動產生短影片標題、關鍵字、短描述、完整貼文內容，讓你先確認影片效果。優先使用你在 TSV / CSV / Excel 維護的圖片網址欄位，缺圖時自動補主圖，減少手動貼圖片網址的時間。
            </p>

            <RelatedTools
              items={getRelatedToolsItems("shopee-video")}
              title="相關工具"
            />
            <RelatedGuides items={getRelatedGuideItems("shopee-video")} />
          </section>
        </div>
      </div>
    </>
  );
}

export default function ShopeeVideoPage() {
  return <ShopeeVideoPageInner />;
}
