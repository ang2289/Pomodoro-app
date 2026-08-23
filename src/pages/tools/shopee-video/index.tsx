// src/pages/tools/shopee-video/index.tsx

import { useEffect, useMemo, useState } from "react";
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

type ShopeeImageResult = {
  index: number;
  productUrl: string;
  images: string[];
  ok?: boolean;
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
  } as BatchTask & { imageUrls: string[]; reviewRating?: string; reviewCount?: string; reviewSummary?: string };
}

async function parseExcelCsvFile(file: File): Promise<BatchTask[]> {
  const name = file.name.toLowerCase();
  let rows: RawRow[] = [];

  if (name.endsWith(".csv") || name.endsWith(".tsv")) {
    const text = await file.text();
    const delimiter = name.endsWith(".tsv") ? "\t" : "";
    const parsed = Papa.parse<RawRow>(text, {
      header: true,
      skipEmptyLines: true,
      delimiter,
    });
    rows = (parsed.data as RawRow[]) || [];
  } else {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: "" });
  }

  return rows.map(toImportRow).filter(Boolean) as BatchTask[];
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


function getTaskImages(task: any): string[] {
  if (Array.isArray(task.imageUrls)) return task.imageUrls.filter(Boolean).slice(0, 3);
  if (Array.isArray(task.images)) return task.images.filter(Boolean).slice(0, 3);
  return [];
}

async function autoFillMissingShopeeImages(tasks: BatchTask[]): Promise<BatchTask[]> {
  const targets = tasks
    .map((task: any, index) => ({
      index,
      productUrl: String(task.productUrl || "").trim(),
      images: getTaskImages(task),
    }))
    .filter((item) => item.productUrl && item.images.length < 3);

  if (targets.length === 0) return tasks;

  // V3：目前用 npm run dev:all，只啟動 Vite 3005 + 影片服務 3006。
  // 不走 /api/main，避免新增第 13 支 API，也避免 Vercel API 未啟動時補圖失敗。
  const res = await fetch("http://localhost:3006/shopee-images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
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
    const fetchedImages = resultMap.get(index)?.images || [];
    const mergedImages = uniqueStrings([...currentImages, ...fetchedImages]).slice(0, 3);
    return {
      ...task,
      images: mergedImages,
      imageUrls: mergedImages,
      autoImageSource: fetchedImages.length ? "video-server-shopee-images" : task.autoImageSource || "import-file",
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
  }, []);

  if (!featureFlags.videoTool) {
    return <Navigate to="/" replace />;
  }

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

    setImportError(null);
    setActionError("");
    setImporting(true);
    setRenderLog("");

    try {
      const parsedRawTasks = await parseExcelCsvFile(file);
      const existingKeys = new Set(
        validTasks.map((task: any) => `${String(task.productUrl || "").trim()}|${String(task.promoUrl || "").trim()}`),
      );
      const seenKeys = new Set<string>();
      const parsedTasks = parsedRawTasks.filter((task: any) => {
        const key = `${String(task.productUrl || "").trim()}|${String(task.promoUrl || "").trim()}`;
        if (!key.trim() || seenKeys.has(key) || existingKeys.has(key)) return false;
        seenKeys.add(key);
        return true;
      });
      const duplicateCount = parsedRawTasks.length - parsedTasks.length;

      if (parsedTasks.length === 0) {
        throw new Error(duplicateCount > 0 ? "匯入失敗：這批商品已匯入過，沒有新增資料" : "匯入失敗：沒有可用的商品原網址");
      }

      const beforeCount = parsedTasks.filter((task: any) => getTaskImages(task).length >= 3).length;
      const newTasks = await autoFillMissingShopeeImages(parsedTasks);
      const afterCount = newTasks.filter((task: any) => getTaskImages(task).length >= 3).length;
      const autoFilledCount = Math.max(0, afterCount - beforeCount);

      setTasks(newTasks);
      setSourceFileName(file.name);

      const localJobId = `local-${Date.now()}`;
      setJobId(localJobId);
      setJobInfo({
        jobId: localJobId,
        count: newTasks.length,
        jobPath: "local-ui-import",
        autoFilledImages: autoFilledCount,
      });

      toast.success(`已匯入 ${newTasks.length} 筆資料，自動補圖 ${autoFilledCount} 筆${duplicateCount ? `，略過重覆 ${duplicateCount} 筆` : ""}`);
    } catch (err: any) {
      console.error("匯入 Excel/CSV 失敗:", err);
      const errorMsg = err?.message || "匯入失敗";
      setImportError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setImporting(false);
      e.target.value = "";
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

    setActionLoading(true);
    setActionError("");
    setRenderLog("");

    try {
      const payload = {
        items: validTasks.map((task: any) => ({
          title: task.title || "",
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
          scriptMode: "template",
          useAi: false,
          skipUpload: true,
          skipPublicShare: true,
          skipDatabaseSave: true,
        })),
        scriptMode: "template",
        costSafeMode: true,
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
      toast.success("批量產生 MP4 完成");
    } catch (e: any) {
      setActionError(e.message || "批量產片失敗");
      toast.error(e.message || "批量產片失敗");
    } finally {
      setActionLoading(false);
    }
  };

  const formatPromoUrl = (url: string): string => {
    if (url.length <= 60) return url;
    return `${url.substring(0, 60)}...`;
  };

  return (
    <>
      <SEO
        title="Shopee 批次短影音工具｜免費模板文案測試版 - RxV AI工具中心"
        description="匯入 TSV、CSV 或 Excel，批量產生本機 MP4 測試影片；目前不呼叫 Gemini、不上傳、不建立公開分享頁、不寫入資料庫，適合先測影片效果。"
        keywords="Shopee 批次短影音工具, AI 生成標題, 關鍵字優化, 行銷內容, 批量影片, MP4 產生"
        path="/tools/shopee-video"
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-bold">
            Shopee 批次短影音工具（免費模板文案測試版）
          </h1>
          <p className="text-gray-600">
            現在流程固定為：匯入 TSV / CSV / Excel → 讀取圖片欄位 → 預覽三張圖 → 自動帶入評價卡 →
            批量產生本機 MP4 測試影片；目前不呼叫 Gemini、不上傳影片、不建立公開分享頁、不寫入資料庫，避免測試期產生成本。
          </p>
          <p className="mt-2 text-sm text-amber-700">
            本工具已改為資料匯入流程，不再使用登入、爬蟲抓圖、驗證頁流程。文案模式預設為 template，適合先測字幕、圖片、BGM 與影片版型。
          </p>
        </div>

        <div className="space-y-8">
          <SectionCard title="1. 匯入資料檔">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                支援欄位：商品名稱、商品原網址、推廣連結、圖片網址、圖片1、圖片2、圖片3、評分、評價數、評價摘要。
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
                目前為測試安全模式：優先吃匯入檔圖片欄位；缺圖時才用商品原網址補主圖；文案使用免費 template 模式，不呼叫 Gemini；只產生本機 MP4，不上傳、不公開、不寫資料庫。
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

          <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              目前工具流程
            </h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-slate-600">
              <li>上傳 TSV / CSV / Excel</li>
              <li>解析商品原網址、推廣連結與圖片欄位；缺圖時自動補 Shopee 商品主圖</li>
              <li>預覽每筆資料是否有 3 張圖片</li>
              <li>建立批次任務後產生本機 MP4；不呼叫 Gemini、不上傳、不寫資料庫</li>
              <li>複製模板產生的標題、關鍵字、描述、貼文內容</li>
              <li>匯出完整結果到 Excel 檔案</li>
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
