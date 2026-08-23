import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEO from "@/components/SEO";
import { isLoggedIn } from "@/lib/auth";
import { trackEvent } from "@/utils/analytics";

type ProductType = "dessert" | "drink" | "food" | "beauty" | "accessory" | "shopee" | "other";
type StyleId = "white" | "premium" | "social" | "delivery" | "promo";
type OutputRatio = "1:1" | "4:5" | "9:16" | "16:9";

type StyleOption = {
  id: StyleId;
  title: string;
  points: number;
  description: string;
  bestFor: string;
  badge: string;
};

type GeneratedResult = {
  imageUrl?: string;
  imageBase64?: string;
  remainingPoints?: number;
  usedPoints?: number;
  message?: string;
  sourceUploadKey?: string;
  sourceFileName?: string;
};

// AI 高級商業圖測試模式：false = 呼叫 Supabase Edge Function / OpenAI mini 並正常扣點。
// 若臨時要零成本測 UI，可改成 true。
const LOCAL_FAITHFUL_RETOUCH_TEST_MODE = false;

const RXV_PRODUCT_IMAGE_ADMIN_EMAILS = ["ang2289@gmail.com", "ang2289@yahoo.com.tw"];
const PRODUCT_SHOWCASE_BONUS_BANNER = "/promo/ai-product-page-bonus-banner.png";
const DOUBLE_POINTS_PROMO_ACTIVE = true;
const DOUBLE_POINTS_PROMO_END_DATE = "7/15";
const DOUBLE_POINTS_PROMO_LABEL = `限時活動｜${DOUBLE_POINTS_PROMO_END_DATE} 前購買點數雙倍送`;

const PRODUCT_IMAGE_PLAN_POINTS = {
  starter: 100000,
  growth: 300000,
} as const;

const PRODUCT_IMAGE_STYLE_POINTS: Record<"white" | "premium" | "social" | "delivery", number> = {
  white: 20000,
  premium: 30000,
  social: 30000,
  delivery: 30000,
};

function getCurrentUserEmailFromStorage(): string {
  if (typeof window === "undefined") return "";

  const directKeys = [
    "userEmail",
    "email",
    "rxv_user_email",
    "currentUserEmail",
    "loginEmail",
  ];

  for (const key of directKeys) {
    const value = window.localStorage.getItem(key);
    if (value && value.includes("@")) return value.trim().toLowerCase();
  }

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const email =
        parsed?.email ||
        parsed?.user?.email ||
        parsed?.profile?.email ||
        parsed?.account?.email;

      if (typeof email === "string" && email.includes("@")) {
        return email.trim().toLowerCase();
      }
    } catch {
      // ignore non-JSON localStorage values
    }
  }

  return "";
}

function getAuthTokenFromStorage(): string {
  if (typeof window === "undefined") return "";
  return (
    window.localStorage.getItem("auth_token") ||
    window.localStorage.getItem("token") ||
    ""
  ).trim();
}

function getEnvValue(key: string): string {
  return String(((import.meta as any).env?.[key] || "")).trim();
}

function getSupabaseFunctionsBaseUrl(): string {
  return (
    getEnvValue("VITE_SUPABASE_URL") ||
    getEnvValue("NEXT_PUBLIC_SUPABASE_URL") ||
    "https://icuxwmpdpsfhztsbyeds.supabase.co"
  ).replace(/\/$/, "");
}

function getSupabaseAnonKey(): string {
  return (
    getEnvValue("VITE_SUPABASE_ANON_KEY") ||
    getEnvValue("NEXT_PUBLIC_SUPABASE_ANON_KEY") ||
    getEnvValue("SUPABASE_ANON_KEY")
  );
}

function createProductImageApiError(status: number, responseBody: any) {
  const message =
    responseBody?.error ||
    responseBody?.message ||
    `PRODUCT_IMAGE_FUNCTION_${status}`;
  const error = new Error(message) as Error & {
    status?: number;
    responseBody?: any;
  };
  error.status = status;
  error.responseBody = responseBody;
  return error;
}

function getProductImageErrorMessage(error: unknown) {
  const status = Number((error as any)?.status || 0);
  const backendMessage = String((error as any)?.message || "").trim();

  if (LOCAL_FAITHFUL_RETOUCH_TEST_MODE) {
    return "本地保真修圖失敗，請重新上傳 JPG、PNG 或 WebP 圖片再試。";
  }

  if (status === 401 || status === 403) {
    return "登入已失效，請重新登入後再使用商品圖生成。";
  }

  if (status === 402) {
    return "目前可用商品圖額度不足，請先選擇商品圖方案後再生成。";
  }

  if (status === 404) {
    return "商品圖額度資料尚未建立或讀取失敗，請重新登入後再試。";
  }

  if (status === 503) {
    return "AI 商品圖生成服務暫時無法使用，請稍後再試。";
  }

  if (backendMessage && !backendMessage.startsWith("PRODUCT_IMAGE_FUNCTION_")) {
    return backendMessage;
  }

  return "AI 商品圖生成暫時失敗，請稍後再試。若畫面顯示已扣點，請聯繫站方協助確認。";
}

const OUTPUT_RATIOS: Array<{ id: OutputRatio; label: string; desc: string }> = [
  { id: "1:1", label: "1:1 方形", desc: "蝦皮、商品清單、IG 方圖" },
  { id: "4:5", label: "4:5 直式", desc: "IG／FB 貼文、商品展示" },
  { id: "9:16", label: "9:16 限動", desc: "限動、短影音封面" },
  { id: "16:9", label: "16:9 橫式", desc: "網站橫幅、文章封面" },
];

const PRODUCT_TYPES: Array<{ id: ProductType; label: string }> = [
  { id: "dessert", label: "甜點／蛋塔／烘焙" },
  { id: "drink", label: "飲料／咖啡／手搖飲" },
  { id: "food", label: "便當／早餐／小吃" },
  { id: "beauty", label: "美甲／美睫／美業" },
  { id: "accessory", label: "飾品／手作商品" },
  { id: "shopee", label: "蝦皮／電商商品" },
  { id: "other", label: "其他商品" },
];

const STYLE_OPTIONS: StyleOption[] = [
  {
    id: "white",
    title: "AI 白底商品圖",
    points: PRODUCT_IMAGE_STYLE_POINTS.white,
    description: "將商品照整理成乾淨白底或淺色背景，適合商品頁與型錄。AI 會依原圖生成，細節可能略有差異。",
    bestFor: "蝦皮、商品清單、官網商品頁",
    badge: "入門推薦",
  },
  {
    id: "premium",
    title: "AI 高級商業圖",
    points: PRODUCT_IMAGE_STYLE_POINTS.premium,
    description: "把隨手拍商品照升級成更有質感的商業視覺，適合預購頁、社群與品牌展示。",
    bestFor: "甜點、飲料、禮盒、手作品牌",
    badge: "最適合小店",
  },
  {
    id: "social",
    title: "AI 社群吸睛圖",
    points: PRODUCT_IMAGE_STYLE_POINTS.social,
    description: "做成適合 FB、IG、Threads 發文的吸睛商品圖，強調氛圍、停留感與分享感。",
    bestFor: "新品上市、社群貼文、粉專宣傳",
    badge: "熱門",
  },
  {
    id: "delivery",
    title: "AI 外送平台主圖",
    points: PRODUCT_IMAGE_STYLE_POINTS.delivery,
    description: "強化餐點清楚度、食慾感與縮圖辨識度，加入少量乾淨配件但不搶主體，適合菜單與外送平台參考使用。",
    bestFor: "便當、早餐、熱炒、飲料、小吃",
    badge: "餐飲推薦",
  },
];

const DEMO_CASES = [
  {
    tag: "甜點店示範",
    title: "普通桌拍 → 可發文的甜點商品圖",
    note: "適合預購頁、粉專貼文、IG 圖卡。",
    src: "/images/product-demo/demo-dessert.png",
  },
  {
    tag: "飲料店示範",
    title: "飲料隨手拍 → 清爽新品宣傳圖",
    note: "適合新品上市、限時優惠、社群分享。",
    src: "/images/product-demo/demo-drink.png",
  },
  {
    tag: "電商示範",
    title: "亂背景商品照 → 乾淨白底電商圖",
    note: "適合蝦皮、商品清單、官網商品頁。",
    src: "/images/product-demo/demo-ecommerce.png",
  },
  {
    tag: "餐飲示範",
    title: "餐點照 → 更有食慾感的主圖",
    note: "適合外送平台、菜單、LINE 訂餐圖。",
    src: "/images/product-demo/demo-food.png",
  },
];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("FILE_READER_EMPTY"));
    };
    reader.onerror = () => reject(new Error("FILE_READER_FAILED"));
    reader.readAsDataURL(file);
  });
}

function buildUploadKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

function getCanvasSizeByRatio(outputRatio: OutputRatio) {
  switch (outputRatio) {
    case "4:5":
      return { width: 1200, height: 1500 };
    case "9:16":
      return { width: 1080, height: 1920 };
    case "16:9":
      return { width: 1600, height: 900 };
    case "1:1":
    default:
      return { width: 1400, height: 1400 };
  }
}

function getLocalRetouchFilter(styleId: StyleId) {
  switch (styleId) {
    case "white":
      return "brightness(1.1) contrast(1.08) saturate(1.04)";
    case "premium":
      return "brightness(1.1) contrast(1.1) saturate(1.08)";
    case "social":
      return "brightness(1.12) contrast(1.12) saturate(1.12)";
    case "delivery":
      return "brightness(1.1) contrast(1.14) saturate(1.1)";
    case "promo":
      return "brightness(1.11) contrast(1.12) saturate(1.12)";
    default:
      return "brightness(1.08) contrast(1.08) saturate(1.06)";
  }
}

function getLocalBackgroundColor(styleId: StyleId) {
  switch (styleId) {
    case "white":
      return "#fbfbfb";
    case "premium":
      return "#f8f1e7";
    case "social":
      return "#eef9f6";
    case "delivery":
      return "#fff4df";
    case "promo":
      return "#fff0e8";
    default:
      return "#f8fafc";
  }
}

async function createLocalFaithfulRetouch(params: {
  imageDataUrl: string;
  outputRatio: OutputRatio;
  styleId: StyleId;
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const { width: canvasWidth, height: canvasHeight } = getCanvasSizeByRatio(params.outputRatio);
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("CANVAS_NOT_SUPPORTED"));
        return;
      }

      const bgColor = getLocalBackgroundColor(params.styleId);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // 不去背測試版：先用原圖做柔焦背景，讓畫面較有商業感，但商品本體仍完全來自原圖。
      const bgScale = Math.max(canvasWidth / img.width, canvasHeight / img.height) * 1.08;
      const bgW = img.width * bgScale;
      const bgH = img.height * bgScale;
      const bgX = (canvasWidth - bgW) / 2;
      const bgY = (canvasHeight - bgH) / 2;
      ctx.save();
      ctx.filter = params.styleId === "white"
        ? "blur(20px) brightness(1.18) saturate(0.82) opacity(0.18)"
        : "blur(24px) brightness(1.16) saturate(0.9) opacity(0.32)";
      ctx.drawImage(img, bgX, bgY, bgW, bgH);
      ctx.restore();

      // 加一層乾淨淡色遮罩，避免背景太亂。
      const overlay = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
      overlay.addColorStop(0, params.styleId === "white" ? "rgba(255,255,255,0.88)" : "rgba(255,250,242,0.76)");
      overlay.addColorStop(1, params.styleId === "white" ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.64)");
      ctx.fillStyle = overlay;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      const paddingRatio = params.styleId === "delivery" ? 0.08 : 0.12;
      const maxW = canvasWidth * (1 - paddingRatio * 2);
      const maxH = canvasHeight * (1 - paddingRatio * 2);
      const scale = Math.min(maxW / img.width, maxH / img.height, 1.45);
      const drawW = Math.round(img.width * scale);
      const drawH = Math.round(img.height * scale);
      const drawX = Math.round((canvasWidth - drawW) / 2);
      const drawY = Math.round((canvasHeight - drawH) / 2);

      // 柔和陰影，不改商品內容。
      ctx.save();
      ctx.shadowColor = "rgba(15, 23, 42, 0.18)";
      ctx.shadowBlur = 34;
      ctx.shadowOffsetY = 18;
      ctx.fillStyle = "rgba(255,255,255,0.72)";
      const radius = 30;
      ctx.beginPath();
      ctx.roundRect(drawX - 10, drawY - 10, drawW + 20, drawH + 20, radius);
      ctx.fill();
      ctx.restore();

      // 商品照片本體：只做亮度、對比、色彩與清晰度，不重畫、不新增、不去背。
      ctx.save();
      ctx.filter = getLocalRetouchFilter(params.styleId);
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      ctx.restore();

      // 微弱高光，讓畫面乾淨一點，但不破壞商品結構。
      const highlight = ctx.createRadialGradient(
        canvasWidth * 0.34,
        canvasHeight * 0.18,
        20,
        canvasWidth * 0.34,
        canvasHeight * 0.18,
        canvasWidth * 0.76,
      );
      highlight.addColorStop(0, "rgba(255,255,255,0.28)");
      highlight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = highlight;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      resolve(canvas.toDataURL("image/png", 0.95));
    };

    img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    img.src = params.imageDataUrl;
  });
}

function formatPointCost(points: number) {
  return `${points.toLocaleString()} 商品圖額度`;
}

function getPromoBonusPoints(points: number) {
  return DOUBLE_POINTS_PROMO_ACTIVE ? points : 0;
}

function getPromoTotalPoints(points: number) {
  return points + getPromoBonusPoints(points);
}

function estimateImagesByStyle(points: number, costPerImage: number) {
  return Math.floor(points / costPerImage);
}

function getPreviewLabel(styleId: StyleId) {
  switch (styleId) {
    case "white":
      return "乾淨白底";
    case "premium":
      return "高級質感";
    case "social":
      return "新品推薦";
    case "delivery":
      return "人氣商品";
    case "promo":
      return "限時優惠";
    default:
      return "版型預覽";
  }
}

function getPreviewShellClass(styleId: StyleId) {
  switch (styleId) {
    case "white":
      return "bg-white border-slate-200";
    case "premium":
      return "bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-amber-100";
    case "social":
      return "bg-gradient-to-br from-sky-100 via-cyan-50 to-emerald-100 border-sky-100";
    case "delivery":
      return "bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 border-orange-100";
    case "promo":
      return "bg-gradient-to-br from-rose-100 via-amber-50 to-yellow-100 border-rose-100";
    default:
      return "bg-slate-50 border-slate-200";
  }
}


function getProductDemo(productType: ProductType) {
  switch (productType) {
    case "dessert":
      return { icon: "🍰", raw: "隨手拍甜點照", polished: "高級甜點商品圖", scene: "木質桌面、柔光、乾淨背景" };
    case "drink":
      return { icon: "🧋", raw: "隨手拍飲料照", polished: "清爽飲品宣傳圖", scene: "明亮背景、水珠、清爽光線" };
    case "food":
      return { icon: "🍱", raw: "隨手拍餐點照", polished: "外送平台餐點主圖", scene: "食慾感光線、份量感、乾淨菜單風" };
    case "beauty":
      return { icon: "💅", raw: "隨手拍美業作品", polished: "質感美業作品圖", scene: "柔和燈光、乾淨背景、細節清楚" };
    case "accessory":
      return { icon: "💍", raw: "隨手拍飾品照", polished: "高級飾品商品圖", scene: "細緻陰影、展示台、精品感" };
    case "shopee":
      return { icon: "📦", raw: "背景雜亂商品照", polished: "白底電商商品圖", scene: "白底置中、陰影、商品清楚" };
    default:
      return { icon: "🛍️", raw: "手機隨手拍商品照", polished: "商品宣傳圖", scene: "乾淨背景、商業光線、主體清楚" };
  }
}

function getStyleDemoText(styleId: StyleId) {
  switch (styleId) {
    case "white":
      return { headline: "乾淨白底電商圖", label: "白底參考", bg: "from-white via-slate-50 to-blue-50", note: "適合商品頁、蝦皮、型錄清單。" };
    case "premium":
      return { headline: "高級質感商品圖", label: "質感參考", bg: "from-amber-50 via-orange-50 to-rose-50", note: "適合甜點、禮盒、手作品牌。" };
    case "social":
      return { headline: "社群吸睛宣傳圖", label: "社群參考", bg: "from-sky-100 via-cyan-50 to-emerald-100", note: "適合 FB、IG、Threads 發文。" };
    case "delivery":
      return { headline: "外送平台主圖", label: "外送參考", bg: "from-orange-50 via-yellow-50 to-red-50", note: "適合便當、早餐、飲料與小吃。" };
    case "promo":
      return { headline: "限時促銷活動圖", label: "促銷參考", bg: "from-rose-100 via-amber-50 to-yellow-100", note: "適合特價、預購、買一送一活動。" };
    default:
      return { headline: "商品圖示範", label: "參考示範", bg: "from-slate-50 to-white", note: "正式生成會依照片重製。" };
  }
}

function ReferenceDemoPreview({
  previewUrl,
  styleId,
  productType,
  title,
}: {
  previewUrl: string;
  styleId: StyleId;
  productType: ProductType;
  title: string;
}) {
  const productDemo = getProductDemo(productType);
  const styleDemo = getStyleDemoText(styleId);

  return (
    <div className="mt-5 rounded-3xl border border-emerald-100 bg-emerald-50/50 p-4">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-emerald-700">免費參考預覽</p>
          <p className="text-xs leading-relaxed text-slate-600">
            這裡顯示「所選商品類型＋風格」的示範參考，不呼叫 AI、不扣點；正式生成會依你上傳的照片產出 AI 高級商業圖。
          </p>
        </div>
        <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-700 shadow-sm">
          預覽不扣點
        </span>
      </div>

      <div className="grid gap-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-black text-slate-500">優化前參考</p>
          <div className="flex min-h-[210px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-3 text-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="上傳商品照片預覽"
                className="max-h-40 max-w-full rounded-2xl object-contain shadow-md"
              />
            ) : (
              <span className="text-5xl">{productDemo.icon}</span>
            )}
            <p className="mt-3 text-sm font-black text-slate-700">
              {previewUrl ? "你上傳的商品照" : productDemo.raw}
            </p>
            <p className="mt-1 text-xs text-slate-500">此區只做原圖／示範參考</p>
          </div>
        </div>

        <div className={`rounded-3xl border border-white bg-gradient-to-br ${styleDemo.bg} p-3 shadow-sm`}>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-black text-emerald-700">修改後示範參考</p>
            <span className="rounded-full bg-slate-950 px-2 py-1 text-[10px] font-black !text-white" style={{ color: "#ffffff" }}>
              {styleDemo.label}
            </span>
          </div>
          <div className="relative flex min-h-[210px] flex-col items-center justify-center overflow-hidden rounded-2xl bg-white/75 p-4 text-center shadow-inner">
            {styleId === "social" && (
              <div className="absolute left-3 top-3 rounded-xl bg-cyan-500 px-3 py-1 text-xs font-black !text-white shadow" style={{ color: "#ffffff" }}>
                新品推薦
              </div>
            )}
            {styleId === "delivery" && (
              <div className="absolute left-3 top-3 rounded-xl bg-orange-500 px-3 py-1 text-xs font-black !text-white shadow" style={{ color: "#ffffff" }}>
                人氣商品
              </div>
            )}
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white text-6xl shadow-xl">
              {productDemo.icon}
            </div>
            <h4 className="mt-4 text-base font-black text-slate-950">{styleDemo.headline}</h4>
            <p className="mt-1 text-xs font-bold leading-relaxed text-slate-600">{productDemo.scene}</p>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-500">{styleDemo.note}</p>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-white p-3 text-xs leading-relaxed text-slate-600 shadow-sm">
        <span className="font-black text-slate-800">目前選擇：</span>
        {title}。正式生成會依原圖與風格產生高級商業感圖片，結果可能因商品、拍攝角度與光線略有差異。
      </div>
    </div>
  );
}


async function downloadImageFile(src: string, filename: string): Promise<boolean> {
  const triggerDownload = (href: string) => {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.rel = "noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  try {
    if (src.startsWith("data:")) {
      triggerDownload(src);
      return true;
    }

    const response = await fetch(src, { mode: "cors" });
    if (!response.ok) throw new Error("DOWNLOAD_FETCH_FAILED");

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    triggerDownload(objectUrl);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    return true;
  } catch (error) {
    console.warn("[ProductImageGenerator] download fallback", error);
    try {
      triggerDownload(src);
      return true;
    } catch (fallbackError) {
      console.error("[ProductImageGenerator] download failed", fallbackError);
      return false;
    }
  }
}


function BeforeAfterComparison({
  beforeSrc,
  afterSrc,
}: {
  beforeSrc: string;
  afterSrc: string;
}) {
  const [position, setPosition] = useState(50);
  const [compareAspectRatio, setCompareAspectRatio] = useState("1 / 1");
  const clipRight = 100 - position;

  useEffect(() => {
    let cancelled = false;

    const loadImageSize = (src: string) =>
      new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          if (!width || !height) {
            reject(new Error("IMAGE_SIZE_EMPTY"));
            return;
          }
          resolve({ width, height });
        };
        img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
        img.src = src;
      });

    Promise.allSettled([loadImageSize(afterSrc), loadImageSize(beforeSrc)]).then((results) => {
      if (cancelled) return;

      const resolved = results
        .filter((item): item is PromiseFulfilledResult<{ width: number; height: number }> => item.status === "fulfilled")
        .map((item) => item.value);

      const preferred = resolved[0] || resolved[1];
      if (!preferred) return;

      const ratio = preferred.width / preferred.height;
      const safeRatio = Math.min(1.78, Math.max(0.56, ratio || 1));
      setCompareAspectRatio(String(safeRatio));
    });

    return () => {
      cancelled = true;
    };
  }, [beforeSrc, afterSrc]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-slate-950">優化前 / AI 優化後對比</p>
          <p className="text-xs leading-relaxed text-slate-500">
            上方先完整顯示兩張圖，下面用滑桿比較前後差異；圖片會盡量完整顯示，不做滿版裁切。
          </p>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
          完整顯示＋拖曳比較
        </span>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 shadow-sm">
          <div className="mb-2 inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs font-black !text-white" style={{ color: "#ffffff" }}>
            優化前原圖
          </div>
          <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-slate-100 bg-white p-3 sm:min-h-[300px]">
            <img
              src={beforeSrc}
              alt="優化前原始商品照"
              className="max-h-[360px] max-w-full object-contain"
              loading="eager"
              draggable={false}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-3 shadow-sm">
          <div className="mb-2 inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-black !text-white" style={{ color: "#ffffff" }}>
            AI 優化後
          </div>
          <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-emerald-100 bg-white p-3 sm:min-h-[300px]">
            <img
              src={afterSrc}
              alt="AI 優化後商品圖"
              className="max-h-[360px] max-w-full object-contain"
              loading="eager"
              draggable={false}
            />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between text-xs font-bold text-slate-500">
          <span>滑桿比較</span>
          <span>拖曳下方圓點查看前後差異</span>
        </div>

        <div className="mx-auto w-full max-w-3xl">
          <div
            className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-inner"
            style={{ aspectRatio: compareAspectRatio }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#ffffff,_#f8fafc_70%)]" />

            <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-4">
              <img
                src={afterSrc}
                alt="AI 優化後商品圖"
                className="max-h-full max-w-full object-contain select-none"
                loading="eager"
                draggable={false}
              />
            </div>

            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${clipRight}% 0 0)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center bg-white p-3 sm:p-4">
                <img
                  src={beforeSrc}
                  alt="優化前原始商品照"
                  className="max-h-full max-w-full object-contain select-none"
                  loading="eager"
                  draggable={false}
                />
              </div>
            </div>

            <div className="pointer-events-none absolute inset-y-0 z-10" style={{ left: `${position}%` }}>
              <div className="h-full w-0.5 bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.05)]" />
              <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-slate-700 shadow-lg">
                ↔
              </div>
            </div>

            <div
              className="absolute left-3 top-3 z-20 rounded-full bg-slate-950/85 px-3 py-1 text-xs font-black !text-white shadow-sm"
              style={{ color: "#ffffff" }}
            >
              優化前
            </div>
            <div
              className="absolute right-3 top-3 z-20 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black !text-white shadow-sm"
              style={{ color: "#ffffff" }}
            >
              AI 優化後
            </div>
          </div>

          <div className="mt-4 px-1">
            <input
              type="range"
              min="8"
              max="92"
              value={position}
              onChange={(event) => setPosition(Number(event.target.value))}
              className="h-2 w-full cursor-ew-resize accent-emerald-600"
              aria-label="調整優化前後比較比例"
            />
            <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <span>原圖較多</span>
              <span>AI 圖較多</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function ProductImageGeneratorPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const demoUploadInputRef = useRef<HTMLInputElement | null>(null);
  const resultSectionRef = useRef<HTMLElement | null>(null);
  const autoDownloadedResultRef = useRef("");
  const generateInFlightRef = useRef(false);
  const productType: ProductType = "other";
  const [outputRatio, setOutputRatio] = useState<OutputRatio>("1:1");
  const [styleId, setStyleId] = useState<StyleId>("premium");
  const [productDetail, setProductDetail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [activeUploadKey, setActiveUploadKey] = useState("");
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [remainingPoints, setRemainingPoints] = useState<number | null>(null);
  const [hasAuthToken, setHasAuthToken] = useState(false);
  const [creditsReadFailed, setCreditsReadFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadStatus, setDownloadStatus] = useState("");
  const [customDemoImages, setCustomDemoImages] = useState<Array<{ id: string; src: string; title: string }>>([]);

  const selectedStyle = useMemo(
    () => STYLE_OPTIONS.find((item) => item.id === styleId) || STYLE_OPTIONS[1],
    [styleId],
  );
  const canManageDemoImages = RXV_PRODUCT_IMAGE_ADMIN_EMAILS.includes(getCurrentUserEmailFromStorage());

  const resultBelongsToCurrentUpload = Boolean(
    result?.sourceUploadKey && activeUploadKey && result.sourceUploadKey === activeUploadKey,
  );
  const resultImageSrc = resultBelongsToCurrentUpload ? result?.imageUrl || result?.imageBase64 || "" : "";
  const displayImageSrc = resultImageSrc;
  const downloadableImageSrc = resultImageSrc;

  useEffect(() => {
    trackEvent("view_product_image_generator");
  }, []);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("rxv-product-demo-images");
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setCustomDemoImages(
          parsed.filter(
            (item) =>
              item &&
              typeof item.id === "string" &&
              typeof item.src === "string" &&
              typeof item.title === "string",
          ),
        );
      }
    } catch (storageError) {
      console.warn("[ProductImageGenerator] demo images load failed", storageError);
    }
  }, []);

  useEffect(() => {
    const authToken = getAuthTokenFromStorage();
    setHasAuthToken(Boolean(authToken));

    if (!authToken) {
      setRemainingPoints(null);
      setCreditsReadFailed(false);
      return;
    }

    const fetchCredits = async () => {
      try {
        const response = await fetch("/api/main?action=get-current-user-credits", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 404 || data?.error === "User credits not found") {
          setRemainingPoints(0);
          setCreditsReadFailed(false);
          return;
        }

        if (!response.ok || typeof data?.remaining_chars !== "number") {
          throw new Error(data?.error || "CREDITS_READ_FAILED");
        }

        setRemainingPoints(data.remaining_chars);
        setCreditsReadFailed(false);
      } catch (creditError) {
        console.error("[ProductImageGenerator] credits load failed", creditError);
        setRemainingPoints(null);
        setCreditsReadFailed(true);
      }
    };

    fetchCredits();
  }, []);



  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      setError("請上傳 JPG、PNG 或 WebP 圖片檔。");
      return;
    }

    if (selected.size > 12 * 1024 * 1024) {
      setError("圖片檔案過大，請先壓縮到 12MB 以下再上傳。");
      return;
    }

    try {
      setError("");
      setDownloadStatus("");
      setResult(null);
      autoDownloadedResultRef.current = "";

      const dataUrl = await fileToDataUrl(selected);
      const uploadKey = buildUploadKey(selected);

      setFile(selected);
      setPreviewUrl(dataUrl);
      setActiveUploadKey(uploadKey);
    } catch (fileError) {
      console.error("[ProductImageGenerator] file preview failed", fileError);
      setFile(null);
      setPreviewUrl("");
      setActiveUploadKey("");
      setResult(null);
      setError("圖片讀取失敗，請重新選擇 JPG、PNG 或 WebP 圖片。");
    }
  };



  const persistCustomDemoImages = (items: Array<{ id: string; src: string; title: string }>) => {
    setCustomDemoImages(items);
    try {
      window.localStorage.setItem("rxv-product-demo-images", JSON.stringify(items));
    } catch (storageError) {
      console.warn("[ProductImageGenerator] demo images save failed", storageError);
    }
  };

  const handleDemoImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) return;

    const imageFiles = selectedFiles.filter((item) => item.type.startsWith("image/"));
    if (!imageFiles.length) {
      setError("請上傳 JPG、PNG 或 WebP 示範圖片。");
      return;
    }

    try {
      const newItems = await Promise.all(
        imageFiles.slice(0, 12).map(async (item) => ({
          id: `${item.name}-${item.size}-${item.lastModified}-${Date.now()}`,
          src: await fileToDataUrl(item),
          title: item.name.replace(/\.[^.]+$/, ""),
        })),
      );

      persistCustomDemoImages([...newItems, ...customDemoImages].slice(0, 24));
      if (demoUploadInputRef.current) demoUploadInputRef.current.value = "";
    } catch (demoError) {
      console.error("[ProductImageGenerator] demo upload failed", demoError);
      setError("示範圖片讀取失敗，請重新選擇 JPG、PNG 或 WebP 圖片。");
    }
  };

  const removeCustomDemoImage = (id: string) => {
    persistCustomDemoImages(customDemoImages.filter((item) => item.id !== id));
  };


  const handleStartNewProduct = () => {
    setFile(null);
    setPreviewUrl("");
    setActiveUploadKey("");
    setResult(null);
    setError("");
    setDownloadStatus("");
    setProductDetail("");
    autoDownloadedResultRef.current = "";
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      window.setTimeout(() => fileInputRef.current?.click(), 0);
    }
  };

  const handleGenerate = async () => {
    if (generateInFlightRef.current) return;

    if (!LOCAL_FAITHFUL_RETOUCH_TEST_MODE && !isLoggedIn()) {
      alert("請先登入並購買商品圖額度，再回來生成自己的商品圖。");
      navigate("/login");
      return;
    }

    const authToken = getAuthTokenFromStorage();
    if (!LOCAL_FAITHFUL_RETOUCH_TEST_MODE && !authToken) {
      alert("請先登入並購買商品圖額度後再使用");
      navigate("/login");
      return;
    }

    if (!file || !previewUrl) {
      setError("請先上傳一張商品照片。");
      fileInputRef.current?.click();
      return;
    }

    if (!LOCAL_FAITHFUL_RETOUCH_TEST_MODE && remainingPoints !== null && remainingPoints < selectedStyle.points) {
      setError(`商品圖額度不足。本風格需要 ${formatPointCost(selectedStyle.points)}，請先選擇商品圖方案。`);
      return;
    }

    const confirmed = window.confirm(
      LOCAL_FAITHFUL_RETOUCH_TEST_MODE
        ? `目前是「本地保真修圖測試模式」，不呼叫外部 API、不扣點、不去背。確認要處理「${selectedStyle.title}」嗎？`
        : `本次將扣除 ${formatPointCost(selectedStyle.points)}，生成 1 張「${selectedStyle.title}」。AI 會自動判斷商品類型；結果可能因商品、角度與風格略有差異，請生成後確認與實品是否一致。若需更精準可加購人工精修。確認要開始生成嗎？`,
    );
    if (!confirmed) return;

    const currentUploadKey = activeUploadKey || buildUploadKey(file);

    generateInFlightRef.current = true;
    setLoading(true);
    setError("");
    setDownloadStatus("");
    autoDownloadedResultRef.current = "";

    try {
      if (LOCAL_FAITHFUL_RETOUCH_TEST_MODE) {
        const resultBase64 = await createLocalFaithfulRetouch({
          imageDataUrl: previewUrl,
          outputRatio,
          styleId,
        });

        setResult({
          imageBase64: resultBase64,
          usedPoints: 0,
          remainingPoints: remainingPoints ?? undefined,
          message: "本地保真修圖測試完成：未呼叫外部 API、未扣點、未去背。",
          sourceUploadKey: currentUploadKey,
          sourceFileName: file.name,
        });

        setTimeout(() => {
          resultSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);

        trackEvent("use_product_image_generator_local_test", {
          style: styleId,
          product_type: productType,
          output_ratio: outputRatio,
          points: 0,
        });
        return;
      }

      const functionName = import.meta.env.VITE_VERCEL_ENV === "preview"
        ? "product-image-generator-phase2-preview"
        : import.meta.env.VITE_VERCEL_ENV === "production"
          ? "product-image-generator-phase2"
          : "product-image-generator";
      const functionUrl = `${getSupabaseFunctionsBaseUrl()}/functions/v1/${functionName}`;
      const anonKey = getSupabaseAnonKey();

      const functionResponse = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(anonKey
            ? { apikey: anonKey, Authorization: `Bearer ${anonKey}` }
            : { Authorization: `Bearer ${authToken}` }),
          "x-rxv-auth-token": authToken,
        },
        body: JSON.stringify({
          productType,
          outputRatio,
          styleId,
          textOverlay: false,
          promptNote: "請產生純商品圖，不要在圖片上加入任何文字、標語、價格或浮水印。商品類型、可用配件與禁止配件請由 AI 根據上傳圖片自動判斷，避免依使用者誤選類別生成錯誤商品。禁止新增不存在的標籤或杯貼，但允許符合商品類別的無文字商業配件。定位為 AI 高級商業圖，若需更精準可後續人工精修。",
          productDetail: productDetail.trim(),
          pointsCost: selectedStyle.points,
          imageDataUrl: previewUrl,
          fileName: file.name,
        }),
      });

      const data = await functionResponse.json().catch(() => ({}));

      if (!functionResponse.ok) {
        throw createProductImageApiError(functionResponse.status, data);
      }

      const response = data as GeneratedResult;
      if (!response?.imageUrl && !response?.imageBase64) {
        throw new Error("NO_IMAGE_RESULT");
      }

      setResult({
        ...response,
        sourceUploadKey: currentUploadKey,
        sourceFileName: file.name,
      });
      if (typeof response.remainingPoints === "number") {
        setRemainingPoints(response.remainingPoints);
      }
      setTimeout(() => {
        resultSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);

      trackEvent("use_product_image_generator", {
        style: styleId,
        product_type: productType,
        output_ratio: outputRatio,
        text_overlay: false,
        points: selectedStyle.points,
      });
    } catch (err) {
      console.error("[ProductImageGenerator] generate failed", err);
      setError(getProductImageErrorMessage(err));
    } finally {
      generateInFlightRef.current = false;
      setLoading(false);
    }
  };

  const handleDownload = async (mode: "auto" | "manual" = "manual") => {
    if (!downloadableImageSrc) return false;

    const filename = `rxv-product-image-${styleId}-${Date.now()}.png`;
    const ok = await downloadImageFile(downloadableImageSrc, filename);

    if (mode === "auto") {
      setDownloadStatus(
        ok
          ? "圖片已生成，已自動下載一次。若沒有看到檔案，請再按下方「下載商品圖」。"
          : "圖片已生成，但瀏覽器可能阻擋自動下載，請按下方「下載商品圖」手動下載。",
      );
    } else {
      setDownloadStatus(ok ? "圖片已重新下載。重複下載不會再扣點。" : "下載失敗，請點圖片另開大圖後另存。");
    }

    return ok;
  };

  useEffect(() => {
    if (!downloadableImageSrc) return;
    if (autoDownloadedResultRef.current === downloadableImageSrc) return;

    autoDownloadedResultRef.current = downloadableImageSrc;
    setDownloadStatus("圖片已生成，正在自動下載...");

    window.setTimeout(() => {
      void handleDownload("auto");
    }, 350);
  }, [downloadableImageSrc]);

  const visibleRemainingPointsValue = hasAuthToken
    ? typeof remainingPoints === "number"
      ? `${remainingPoints.toLocaleString()} 點`
      : creditsReadFailed
        ? "讀取失敗"
        : "0 點"
    : "0 點";

  const remainingPointsHintText = !hasAuthToken
    ? "目前以 0 點顯示；登入後會同步你的實際剩餘商品圖額度。"
    : creditsReadFailed
      ? "商品圖額度暫時無法讀取，請重新整理或重新登入再試。"
      : typeof remainingPoints === "number" && remainingPoints > 0
        ? "白底商品圖每張 20,000 點；高級商業圖、社群吸睛圖與外送平台主圖每張 30,000 點。"
        : "目前可用商品圖額度為 0 點；請先購買商品圖額度後再開始生成。";

  const starterBasePoints = PRODUCT_IMAGE_PLAN_POINTS.starter;
  const starterBonusPoints = getPromoBonusPoints(starterBasePoints);
  const starterTotalPoints = getPromoTotalPoints(starterBasePoints);
  const growthBasePoints = PRODUCT_IMAGE_PLAN_POINTS.growth;
  const growthBonusPoints = getPromoBonusPoints(growthBasePoints);
  const growthTotalPoints = getPromoTotalPoints(growthBasePoints);

  const productImageFaqItems = [
    [
      "AI 商品圖生成器適合哪些店家使用？",
      "適合甜點店、飲料店、餐飲店、便當店、美業、香水保養品牌、手作商品、蝦皮賣家與個人品牌，特別適合需要快速產生社群貼文、預購頁、商品展示與外送平台主圖的小店家。",
    ],
    [
      "手機隨手拍的商品照也可以變成商業圖嗎？",
      "可以。只要商品主體清楚、不要太暗、不要嚴重遮住，工具會依照片內容整理光線、背景、構圖與商業感，幫助日常商品照變成更適合發文與展示的圖片。",
    ],
    [
      "不用 5 分鐘真的可以拿到商品圖嗎？",
      "一般情況下，選好尺寸與風格、上傳照片後即可生成，適合臨時要發新品、預購、菜單、電商商品頁或社群貼文的店家。實際時間仍可能受網路、圖片大小與 AI 服務狀態影響。",
    ],
    [
      "商品圖怎麼收費？",
      DOUBLE_POINTS_PROMO_ACTIVE
        ? "商品圖採額度（點數）制使用。限時活動：7/15 前購買點數雙倍送。NT$99 原有 100,000 商品圖額度，活動再送 100,000，合計 200,000；NT$199 原有 300,000，活動再送 300,000，合計 600,000。白底商品圖每張 20,000 額度，約 NT$19 起；高級商業圖、社群吸睛圖與外送平台主圖每張 30,000 額度，約 NT$29 起。生成前會顯示本次扣點內容。"
        : "商品圖採額度（點數）制使用：NT$99 可得 100,000 商品圖額度，NT$199 可得 300,000 商品圖額度。白底商品圖每張 20,000 額度，約 NT$19 起；高級商業圖、社群吸睛圖與外送平台主圖每張 30,000 額度，約 NT$29 起。生成前會顯示本次扣點內容。",
    ],
    [
      "為什麼比找人修圖或拍照更省？",
      "傳統商品攝影或設計接案常需要詢價、排程、溝通、等待與修改。AI 商品圖工具適合先用低成本快速產出可用圖，日常發文、測新品與更新商品頁更省時間。",
    ],
    [
      "AI 商品圖可以幫店家達成什麼？",
      "可以讓商品看起來更乾淨、更有質感、更適合發文與展示，幫助提升顧客停留、點擊、詢問與下單意願。",
    ],
    [
      "AI 商品圖可以用在哪裡？",
      "可用於 Facebook、Instagram、Threads、LINE、預購頁、商品展示、蝦皮或官網商品圖與外送平台主圖參考。正式使用前仍請確認圖片與實際商品是否一致。",
    ],
    [
      "會跟原商品完全一樣嗎？",
      "AI 會盡量依照原圖的商品品類、主體外觀與特色生成，但構圖、光線、擺設與細節可能會有差異。若需要完全精準的品牌圖、標籤或法規用途圖片，建議後續人工精修。",
    ],
    [
      "圖片不符合想要的效果怎麼辦？",
      "7/15 前購買商品圖方案並生成圖片的用戶，可將原圖、AI 圖與想調整的方向寄至 rxv0227@gmail.com，申請免費人工精修一次。",
    ],
  ] as const;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI 商品圖生成器｜手機商品照變高級商業圖",
    description:
      "AI 商品圖生成器可將手機隨手拍商品照快速優化成高級商業圖、白底商品圖、社群吸睛圖與外送平台主圖，適合小店家、電商賣家、甜點飲料店與個人品牌節省拍攝、設計與溝通成本。",
    url: "https://pomodoro-app-eight-rouge.vercel.app/tools/product-image-generator",
    inLanguage: "zh-TW",
  };

  const softwareApplicationJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "RxV AI 商品圖工具",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description:
      "上傳商品照片，快速產生高級商業商品圖、白底商品圖、社群宣傳圖與外送平台主圖，適合小店家與電商賣家日常行銷使用。",
    offers: {
      "@type": "Offer",
      priceCurrency: "TWD",
      price: "19.8",
      description: DOUBLE_POINTS_PROMO_ACTIVE
        ? "白底商品圖約 NT$19 起；高級商業圖、社群吸睛圖與外送平台主圖約 NT$29 起。限時活動：7/15 前購買點數雙倍送。NT$99 共可得 200,000 商品圖額度，NT$199 共可得 600,000 商品圖額度。採商品圖額度（點數）制，實際扣點依所選風格與商品圖方案為準。"
        : "白底商品圖約 NT$19 起；高級商業圖、社群吸睛圖與外送平台主圖約 NT$29 起。採商品圖額度（點數）制，實際扣點依所選風格與商品圖方案為準。",
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: productImageFaqItems.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "首頁",
        item: "https://pomodoro-app-eight-rouge.vercel.app/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "工具專區",
        item: "https://pomodoro-app-eight-rouge.vercel.app/tools",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "AI 商品圖生成器",
        item: "https://pomodoro-app-eight-rouge.vercel.app/tools/product-image-generator",
      },
    ],
  };

  return (
    <main className="relative left-1/2 w-screen max-w-none -translate-x-1/2 overflow-x-hidden px-3 py-6 sm:px-6 lg:px-10">
      <SEO
        title="AI 商品圖生成器｜手機照變高級商業圖・白底商品圖・社群圖｜RxV"
        description={DOUBLE_POINTS_PROMO_ACTIVE
          ? "AI 商品圖生成器讓手機隨手拍商品照快速整理成高級商業圖、白底商品圖、社群吸睛圖與外送平台主圖。白底商品圖約 NT$19 起，高級商業圖約 NT$29 起，限時活動：7/15 前購買點數雙倍送。NT$99 共可得 200,000 商品圖額度，NT$199 共可得 600,000 商品圖額度，適合小店家與電商賣家準備上架和發文素材。"
          : "AI 商品圖生成器讓手機隨手拍商品照快速整理成高級商業圖、白底商品圖、社群吸睛圖與外送平台主圖。白底商品圖約 NT$19 起，高級商業圖約 NT$29 起，採商品圖額度（點數）制，適合小店家與電商賣家準備上架和發文素材。"}
        keywords="AI商品圖生成器, 商品圖生成器, 商品照美化, 手機商品照, 高級商業圖, 白底商品圖, 社群商品圖, 外送平台主圖, 蝦皮商品圖, 小店商品圖, 商品攝影替代方案, 商品圖AI, 餐飲商品圖, 甜點商品圖, 香水商品圖, 保養品商品圖, 小店行銷工具"
        path="/tools/product-image-generator"
        jsonLdList={[webPageJsonLd, softwareApplicationJsonLd, faqJsonLd, breadcrumbJsonLd]}
      />

      <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="space-y-6">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
              AI 商品圖工具｜小店、電商、餐飲與個人品牌適用
            </div>
            <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl">
              一杯咖啡的預算，讓商品照更有質感
            </h1>
            <p className="mt-5 text-base leading-relaxed text-slate-600 sm:text-lg">
              商品明明不差，照片卻拍不出客人想買的感覺？上傳一張商品照，AI 幫你整理光線、背景、構圖與商品主體清楚度，快速做出可放到社群、菜單、外送平台與電商商品頁的商品圖。
            </p>
            <div className="mt-5 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              <span className="font-black">不是保證業績，</span>
              但更清楚、更有質感的第一眼，能幫助客人更快看懂商品，增加停留、點擊、詢問與下單的機會。
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="#demo"
                className="inline-flex w-fit self-start whitespace-nowrap min-h-[54px] items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-center text-sm font-black leading-snug !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg sm:text-base"
                style={{ color: "#ffffff" }}
              >
                先看前後示範
              </a>
              <a
                href="#product-image-plans"
                className="inline-flex w-fit self-start whitespace-nowrap min-h-[54px] items-center justify-center rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-center text-sm font-black leading-snug text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 hover:shadow-md sm:text-base"
              >
                購買商品圖額度
              </a>
            </div>
            <p className="mt-4 text-sm font-bold leading-relaxed text-slate-500">
              白底商品圖平均 NT$19 起｜高級商業、社群與外送圖平均 NT$29 起<br className="hidden sm:block" />
              先登入並購買商品圖額度，再生成自己的商品圖
            </p>
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-sm">
                <p className="text-sm font-black text-emerald-700">先看前後差異</p>
                <p className="mt-2 text-base font-black leading-snug text-slate-950">
                  手機原圖變成可發文商品圖
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  第一屏就引導訪客先看範例，再決定要試做或購買，降低第一次付費的猶豫。
                </p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 shadow-sm">
                <p className="text-sm font-black text-sky-700">直接用在銷售入口</p>
                <p className="mt-2 text-base font-black leading-snug text-slate-950">
                  IG、LINE、菜單、外送、商品頁
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  不只修圖，也幫店家快速準備上架、發文、預購與下單連結素材。
                </p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-4 shadow-sm">
                <p className="text-sm font-black text-rose-700">
                  限時到 {DOUBLE_POINTS_PROMO_END_DATE}
                </p>
                <p className="mt-2 text-base font-black leading-snug text-slate-950">
                  NT$99 約 {estimateImagesByStyle(starterTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.white)} 張白底圖，NT$199 約 {estimateImagesByStyle(growthTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.white)} 張
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  高級商業圖、社群圖、外送主圖則分別約 {estimateImagesByStyle(starterTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.premium)} 張與 {estimateImagesByStyle(growthTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.premium)} 張。
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-white/90 p-4 shadow-sm">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-sm font-black text-emerald-700">目前商品圖額度</p>
                  <p className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{visibleRemainingPointsValue}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{remainingPointsHintText}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold leading-relaxed text-emerald-800">
                  白底每張 20,000 點<br />
                  高級／社群／外送每張 30,000 點
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-emerald-100 bg-white p-5 shadow-xl">
            <p className="text-sm font-black text-emerald-700">第一次使用，照這樣做</p>
            {DOUBLE_POINTS_PROMO_ACTIVE && (
              <div className="mt-4 rounded-2xl border-2 border-rose-300 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-4 shadow-sm sm:p-5">
                <span className="inline-flex rounded-full bg-rose-600 px-3 py-1.5 text-sm font-black !text-white shadow-sm" style={{ color: "#ffffff" }}>
                  🔥 限時活動｜7/15 前購買點數雙倍送
                </span>
                <h3 className="mt-3 text-xl font-black leading-tight text-rose-800">
                  現在買，商品圖額度直接加倍
                </h3>
                <ul className="mt-4 divide-y divide-rose-200 overflow-hidden rounded-2xl border border-rose-200 bg-white text-[15px] leading-relaxed text-slate-800">
                  <li className="p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="font-black text-slate-950">NT$99 入門方案</p>
                      <p className="text-lg font-black text-rose-700">共 {starterTotalPoints.toLocaleString()} 點</p>
                    </div>
                    <p className="mt-1.5 font-bold text-slate-700">原有 {starterBasePoints.toLocaleString()} 點 ＋ 活動送 {starterBonusPoints.toLocaleString()} 點</p>
                    <p className="mt-2 font-bold text-slate-700">✓ 白底約 {estimateImagesByStyle(starterTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.white)} 張　✓ 高級／社群／外送約 {estimateImagesByStyle(starterTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.premium)} 張</p>
                  </li>
                  <li className="p-4">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                      <p className="font-black text-slate-950">NT$199 進階方案</p>
                      <p className="text-lg font-black text-rose-700">共 {growthTotalPoints.toLocaleString()} 點</p>
                    </div>
                    <p className="mt-1.5 font-bold text-slate-700">原有 {growthBasePoints.toLocaleString()} 點 ＋ 活動送 {growthBonusPoints.toLocaleString()} 點</p>
                    <p className="mt-2 font-bold text-slate-700">✓ 白底約 {estimateImagesByStyle(growthTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.white)} 張　✓ 高級／社群／外送約 {estimateImagesByStyle(growthTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.premium)} 張</p>
                  </li>
                </ul>
                <a
                  href="#product-image-plans"
                  className="mt-4 inline-flex w-fit self-start whitespace-nowrap min-h-11 items-center justify-center rounded-xl bg-rose-600 px-5 py-2.5 text-base font-black !text-white shadow-sm transition hover:bg-rose-700"
                  style={{ color: "#ffffff" }}
                >
                  查看雙倍送方案
                </a>
              </div>
            )}
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="font-black text-slate-950">1. 先看前後示範</p>
                <p className="mt-1 text-sm text-slate-600">先確認你想要的是白底、質感、社群或餐飲主圖效果。</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="font-black text-slate-950">2. 購買商品圖額度</p>
                <p className="mt-1 text-sm text-slate-600">{DOUBLE_POINTS_PROMO_ACTIVE ? `限時活動：7/15 前購買點數雙倍送。NT$99 共 ${starterTotalPoints.toLocaleString()} 點；NT$199 共 ${growthTotalPoints.toLocaleString()} 點，可製作更多商品圖。` : "NT$99 有 100,000 點；NT$199 有 300,000 點，可製作多張商品圖。"}</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="font-black text-slate-950">3. 上傳照片，選擇用途與效果</p>
                <p className="mt-1 text-sm text-slate-600">告訴工具你要放蝦皮、社群、菜單或外送平台。</p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                <p className="font-black text-slate-950">4. 確認扣點，下載商品圖</p>
                <p className="mt-1 text-sm text-slate-600">生成前會顯示本次所需額度，完成後可直接下載使用。</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-emerald-50 p-5 shadow-sm sm:p-6">
        <div>
          <p className="text-sm font-black text-violet-700">費用比較</p>
          <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
            日常商品照，不必每一張都從頭找人設計
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            新品、預購、菜單更新與社群貼文常需要快速有圖。RxV 讓你先用較低成本產出可用版本；需要精準品牌視覺、合成或大量修改時，再選擇人工精修。
          </p>
        </div>

        <div className="mt-5 grid gap-4">
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-base font-black text-slate-950">基礎去背／調色</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">外部人工參考</span>
            </div>
            <p className="mt-4 text-lg font-black text-slate-400 line-through decoration-rose-400 decoration-2">NT$50～600／張</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">適合單色背景、基本裁切與調色。</p>
          </div>

          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-base font-black text-slate-950">人工商品修圖／設計</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-black text-slate-500">外部人工參考</span>
            </div>
            <p className="mt-4 text-lg font-black text-slate-400 line-through decoration-rose-400 decoration-2">NT$500～2,000+／張</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">依精修、排版、改稿與是否拍攝而異。</p>
          </div>

          <div className="min-w-0 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-base font-black text-slate-950">RxV AI 商品圖</p>
              <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-black !text-white" style={{ color: "#ffffff" }}>本站平均成本</span>
            </div>
            <div className="mt-3 grid gap-2">
              <div className="flex items-baseline justify-between gap-3 rounded-xl bg-white/80 px-3 py-2">
                <span className="text-sm font-bold text-slate-600">白底商品圖</span>
                <span className="whitespace-nowrap text-lg font-black text-emerald-700">NT$19 起</span>
              </div>
              <div className="flex items-baseline justify-between gap-3 rounded-xl bg-white/80 px-3 py-2">
                <span className="text-sm font-bold text-slate-600">高級／社群／外送</span>
                <span className="whitespace-nowrap text-lg font-black text-emerald-700">NT$29 起</span>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          劃線價格為外部人工服務的常見報價區間參考，並非本站原價或特價。實際人工費用會依照片難度、是否拍攝、文字排版、修改次數與設計師而異。RxV 為 AI 生成工具，不等同人工精修、商業攝影或保證業績服務。
        </p>
      </section>

      <section id="generator" className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
        <div>
          <p className="text-sm font-black text-emerald-700">商品圖生成工作區</p>
          <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">
            購買商品圖額度後，上傳商品照開始製作
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            使用順序：先購買商品圖額度 → 選擇圖片用途與效果 → 上傳商品照 → 確認扣除額度 → 下載生成結果。
          </p>
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-bold leading-relaxed text-amber-900">
              尚未購買商品圖額度？請先選擇商品圖方案。白底商品圖約 NT$19 起；高級商業、社群與外送主圖約 NT$29 起，生成時才會扣除對應額度。
            </p>
            <a
              href="#product-image-plans"
              className="inline-flex self-start shrink-0 items-center justify-center rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-black !text-white shadow-sm transition hover:bg-amber-700"
              style={{ color: "#ffffff" }}
            >
              先選商品圖方案
            </a>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <section className="rounded-3xl border border-emerald-100 bg-emerald-50/70 p-5">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-base font-black !text-white" style={{ color: "#ffffff" }}>AI</div>
              <div>
                <h3 className="text-xl font-black text-slate-950">自動套用適合的商品圖風格</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  上傳商品照後，工具會依照片內容套用適合的商業圖方向。甜點、飲料、餐點、香水保養、飾品與一般商品，都能用更省力的方式產生適合發文與展示的商品圖。
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-base font-black !text-white" style={{ color: "#ffffff" }}>1</div>
              <div>
                <h3 className="text-xl font-black text-slate-950">選擇圖片要放在哪裡</h3>
                <p className="text-sm text-slate-600">蝦皮、FB／IG、限動或網站橫幅；依用途選擇建議尺寸。</p>
              </div>
            </div>
            <div className="grid gap-3">
              {OUTPUT_RATIOS.map((item) => {
                const active = item.id === outputRatio;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOutputRatio(item.id)}
                    className={`rounded-2xl border px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                      active ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-300"
                    }`}
                  >
                    <span className="block text-base font-black text-slate-950">{item.label}</span>
                    <span className="mt-2 block text-sm leading-6 text-slate-500">{item.desc}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-base font-black !text-white" style={{ color: "#ffffff" }}>2</div>
              <div>
                <h3 className="text-xl font-black text-slate-950">選擇你想呈現的效果</h3>
                <p className="text-sm text-slate-600">白底上架、質感展示、社群發文或餐飲主圖；確認生成時才扣點。</p>
              </div>
            </div>
            <div className="grid gap-3">
              {STYLE_OPTIONS.map((item) => {
                const active = item.id === styleId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setStyleId(item.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                      active ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-black text-slate-950">{item.title}</span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">{item.badge}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                        <p className="mt-2 text-xs font-bold text-slate-500">適合：{item.bestFor}</p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center justify-center rounded-full px-4 py-2 text-sm font-black ${
                          active ? "bg-emerald-600 !text-white" : "bg-emerald-50 text-emerald-700"
                        }`}
                        style={active ? { color: "#ffffff" } : undefined}
                      >
                        使用 {formatPointCost(item.points)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-3xl border border-amber-100 bg-amber-50/70 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500 text-base font-black !text-white" style={{ color: "#ffffff" }}>3</div>
              <div>
                <h3 className="text-xl font-black text-slate-950">場景微調說明（選填）</h3>
                <p className="text-sm text-slate-600">可補充想要的光線、背景、道具限制或風格方向；系統仍會優先保留商品本體。</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-amber-800">
              例如：高級甜點店感、不要出現文字、不要變成草莓口味、背景想要奶油白。若要非常精準的擺盤、道具或構圖，建議後續加購人工精修。
            </p>
            <textarea
              value={productDetail}
              onChange={(e) => setProductDetail(e.target.value)}
              rows={4}
              placeholder="例：希望木質桌面、自然陽光、不要加水果、不要出現文字、想要日系簡約或高級咖啡店感。"
              className="mt-4 w-full rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            />
          </section>

          <section className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-base font-black !text-white" style={{ color: "#ffffff" }}>4</div>
              <div>
                <h3 className="text-xl font-black text-slate-950">上傳你的商品照片</h3>
                <p className="text-sm text-slate-600">全部選好後再上傳，流程更順。請先購買商品圖額度；按下「確認扣除額度並生成」時才會扣除本次額度。</p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onClick={(event) => {
                event.currentTarget.value = "";
              }}
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex min-h-[240px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-white p-5 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="商品照片預覽" className="max-h-80 rounded-2xl object-contain shadow-md" />
              ) : (
                <>
                  <span className="text-5xl">📸</span>
                  <span className="mt-3 text-lg font-black text-emerald-700">點這裡上傳商品照</span>
                  <span className="mt-2 text-sm text-slate-500">支援 JPG、PNG、WebP，建議 12MB 以下</span>
                </>
              )}
            </button>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex w-fit self-start whitespace-nowrap items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black !text-white shadow-sm transition hover:bg-emerald-700"
                style={{ color: "#ffffff" }}
              >
                {previewUrl ? "重新選擇照片" : "選擇商品照片"}
              </button>
              <button
                type="button"
                onClick={handleStartNewProduct}
                className="inline-flex w-fit self-start whitespace-nowrap items-center justify-center rounded-2xl border border-emerald-200 bg-white px-6 py-3 text-sm font-black text-emerald-700 transition hover:bg-emerald-50"
              >
                換下一個商品
              </button>
            </div>
          </section>

          <section
            ref={resultSectionRef}
            className="scroll-mt-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-white to-emerald-50 p-5 shadow-sm"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-base font-black !text-white" style={{ color: "#ffffff" }}>5</div>
              <div>
                <h3 className="text-xl font-black text-slate-950">確認扣點並生成</h3>
                <p className="text-sm text-slate-600">生成後可直接檢查前後差異並下載商品圖。</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-4">
              {resultImageSrc ? (
                <>
                  {previewUrl ? (
                    <BeforeAfterComparison beforeSrc={previewUrl} afterSrc={displayImageSrc} />
                  ) : (
                    <a href={displayImageSrc} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={displayImageSrc}
                        alt="AI 高級商業商品圖"
                        className="mx-auto max-h-[640px] w-full rounded-2xl object-contain shadow-lg"
                      />
                    </a>
                  )}
                  <div className="mt-3 flex flex-col items-center gap-2 text-center">
                    <a href={displayImageSrc} target="_blank" rel="noreferrer" className="text-xs font-bold text-emerald-700 underline underline-offset-4">
                      點此另開大圖檢查細節
                    </a>
                    <span className="hidden text-slate-300 sm:inline">｜</span>
                    <span className="text-xs font-bold text-slate-500">正式使用前請確認與實品是否一致</span>
                  </div>
                </>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
                  <span className="text-5xl">🖼️</span>
                  <p className="mt-3 text-lg font-black text-slate-700">待生成</p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
                    購買商品圖額度後，上傳商品照片並完成設定，再按下方「確認扣除額度並生成」。生成完成後，結果會直接顯示在這裡。
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm">
              <p className="text-sm font-black text-emerald-700">本次選擇</p>
              <h4 className="mt-1 text-2xl font-black text-slate-950">{selectedStyle.title}</h4>
              <p className="mt-2 text-sm font-bold text-slate-600">
                AI 自動判斷商品類型｜尺寸：{outputRatio}｜圖片文字：不加字
              </p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                本次生成將扣除
                <span className="font-bold text-slate-500"> {formatPointCost(selectedStyle.points)}</span>。
                目前商品圖額度：<span className="font-bold text-slate-700">{visibleRemainingPointsValue}</span>
              </p>
              {resultImageSrc && (
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  本張結果對應目前上傳的商品照；換下一個商品後會自動清除舊結果。正式使用前請確認與實品是否一致。
                </p>
              )}
              {downloadStatus && (
                <p className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm font-bold text-blue-700">
                  {downloadStatus}
                </p>
              )}
              {error && (
                <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                  {error}
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="inline-flex w-fit self-start whitespace-nowrap min-h-[56px] items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-center text-base font-black leading-6 !text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                style={{ color: "#ffffff" }}
              >
                {loading
                  ? "AI 高級商業圖生成中，請稍候..."
                  : LOCAL_FAITHFUL_RETOUCH_TEST_MODE
                    ? "AI 商品圖測試"
                    : "確認扣點並生成"}
              </button>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#demo"
                  className="inline-flex w-fit self-start whitespace-nowrap items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-black text-amber-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
                >
                  先看大圖示範
                </a>
                <a
                  href="#product-image-plans"
                  className="inline-flex w-fit self-start whitespace-nowrap items-center justify-center rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-black text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50"
                >
                  選擇商品圖方案
                </a>
                <button
                  type="button"
                  onClick={() => void handleDownload("manual")}
                  disabled={!downloadableImageSrc}
                  className="inline-flex w-fit self-start whitespace-nowrap items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  style={{ color: "#ffffff" }}
                >
                  下載商品圖
                </button>
                <button
                  type="button"
                  onClick={handleStartNewProduct}
                  className="inline-flex w-fit self-start whitespace-nowrap items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  換下一個商品
                </button>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-800">
              <p className="font-black">7/15 前上線限定｜免費人工精修 1 次</p>
              <p className="mt-1">
                若本次 AI 生成圖與您心中想要的商品圖風格有落差，7/15 前購買商品圖方案並生成圖片的用戶，
                可將「原始商品照＋AI 生成圖＋想調整的方向」寄至 rxv0227@gmail.com，我們可免費協助人工精修 1 次。
              </p>
              <p className="mt-2 text-xs leading-relaxed text-amber-700">
                免費精修以基礎商品圖優化為主，例如背景、光線、構圖、裁切與整體質感調整；不包含複雜合成、品牌主視覺設計、大量改圖或無限制修改。
              </p>
              <a
                href="mailto:rxv0227@gmail.com?subject=7/15前免費人工精修申請&body=請附上：1. 原始商品照 2. AI生成圖 3. 想調整的方向"
                className="mt-3 inline-flex items-center justify-center rounded-2xl bg-amber-600 px-5 py-2.5 text-sm font-black !text-white shadow-sm transition hover:bg-amber-700"
                style={{ color: "#ffffff" }}
              >
                寄信申請免費精修
              </a>
            </div>
          </section>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-black text-emerald-700">風格說明</p>
          <h2 className="text-2xl font-black text-slate-950">需要時再看詳細說明</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            上方是常用操作區；如果你想知道每一種風格適合什麼用途，再看這裡即可。AI 生成結果可能因原圖、角度與風格略有差異；若要加價格、優惠或活動文字，建議後續用 Canva 或圖片編輯器另外加，避免 AI 產生錯字。
          </p>
        </div>
        <div className="grid gap-3">
          {STYLE_OPTIONS.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-base font-black text-slate-950">{item.title}</h3>
                <span className="w-fit whitespace-nowrap rounded-full bg-emerald-50 px-3 py-1.5 text-center text-xs font-black text-emerald-700">
                  {formatPointCost(item.points)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
              <p className="mt-2 text-xs font-bold text-slate-500">適合：{item.bestFor}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-emerald-50 p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex rounded-full bg-cyan-100 px-4 py-2 text-xs font-black text-cyan-700">
              商品圖額度方案｜另加贈商品展示網頁
            </div>
            <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              一次購買商品圖額度，製作多張商品圖
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              高級商業圖約 NT$29 起，白底商品圖約 NT$19 起；方案另加贈可分享的商品展示網頁。
            </p>
            {DOUBLE_POINTS_PROMO_ACTIVE && (
              <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700">
                <span>{DOUBLE_POINTS_PROMO_LABEL}</span>
                <span className="text-rose-500">｜</span>
                <span>NT$99 共 {starterTotalPoints.toLocaleString()} 點</span>
                <span className="text-rose-500">｜</span>
                <span>NT$199 共 {growthTotalPoints.toLocaleString()} 點</span>
              </div>
            )}
          </div>
          <a
            href="#product-image-plans"
            className="inline-flex min-h-[52px] shrink-0 items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-cyan-700"
            style={{ color: "#ffffff" }}
          >
            查看商品圖方案
          </a>
        </div>

        <a
          href={PRODUCT_SHOWCASE_BONUS_BANNER}
          target="_blank"
          rel="noreferrer"
          className="group block overflow-hidden rounded-[1.8rem] border border-white bg-white shadow-xl transition hover:-translate-y-0.5 hover:shadow-2xl"
          title="點擊放大查看商品展示網頁贈送內容"
        >
          <img
            src={PRODUCT_SHOWCASE_BONUS_BANNER}
            alt="商品圖方案加贈商品展示網頁活動圖：商品圖展示、商品介紹、聯絡按鈕、分享網址與 QR Code"
            className="block w-full object-cover transition duration-300 group-hover:scale-[1.01]"
            loading="lazy"
          />
        </a>
        <p className="mt-3 text-center text-xs font-bold text-cyan-700">點擊活動圖可放大查看</p>

        <div id="product-image-plans" className="mt-6 space-y-5">
          <div>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              先購買商品圖額度，再依想做的圖片風格扣點。白底商品圖每張 20,000 額度；高級商業圖、社群吸睛圖與外送平台主圖每張 30,000 額度。<span className="mx-1 font-bold text-rose-700">7/15 前購買點數，商品圖額度雙倍送。</span>生成完成的商品圖，也可集中放到專屬商品展示頁，搭配商品介紹、價格文字、LINE／電話聯絡按鈕、公開網址與 QR Code，方便直接分享給客戶、社團與 LINE 群組。
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {["商品圖展示", "商品介紹", "價格文字", "LINE／電話聯絡", "公開網址＋QR Code"].map((item) => (
                <span key={item} className="rounded-full border border-cyan-200 bg-white px-3 py-2 text-xs font-black text-cyan-700 shadow-sm">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="rounded-2xl border-2 border-cyan-300 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-black text-cyan-800">商品圖入門方案｜NT$99</p>
                {DOUBLE_POINTS_PROMO_ACTIVE && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-black text-rose-700">雙倍送</span>}
              </div>
              <p className="mt-2 text-base font-black leading-relaxed text-slate-950">原有 {starterBasePoints.toLocaleString()} 點{DOUBLE_POINTS_PROMO_ACTIVE ? ` ＋ 活動送 ${starterBonusPoints.toLocaleString()} 點 ＝ 共 ${starterTotalPoints.toLocaleString()} 點` : " 商品圖額度"}</p>
              <div className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-3">
                <p className="text-sm font-bold text-cyan-800">可製作：</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">白底商品圖約 {estimateImagesByStyle(starterTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.white)} 張，或高級商業／社群／外送主圖約 {estimateImagesByStyle(starterTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.premium)} 張。</p>
              </div>
              <p className="mt-3 text-sm font-bold text-cyan-800">送商品展示基本版 3 個月</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">最多 3 項商品展示＋公開網址＋QR Code</p>
              <Link to="/payment/bank-transfer?plan=99&promo=double-points" className="mt-4 inline-flex w-fit self-start whitespace-nowrap min-h-11 items-center justify-center rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-black !text-white shadow-sm transition hover:bg-cyan-700" style={{ color: "#ffffff" }}>
                選擇 NT$99 方案
              </Link>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-black text-emerald-800">商品圖進階方案｜NT$199</p>
                {DOUBLE_POINTS_PROMO_ACTIVE && <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-black text-rose-700">雙倍送</span>}
              </div>
              <p className="mt-2 text-base font-black leading-relaxed text-slate-950">原有 {growthBasePoints.toLocaleString()} 點{DOUBLE_POINTS_PROMO_ACTIVE ? ` ＋ 活動送 ${growthBonusPoints.toLocaleString()} 點 ＝ 共 ${growthTotalPoints.toLocaleString()} 點` : " 商品圖額度"}</p>
              <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                <p className="text-sm font-bold text-emerald-800">可製作：</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-700">白底商品圖約 {estimateImagesByStyle(growthTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.white)} 張，或高級商業／社群／外送主圖約 {estimateImagesByStyle(growthTotalPoints, PRODUCT_IMAGE_STYLE_POINTS.premium)} 張。</p>
              </div>
              <p className="mt-3 text-sm font-bold text-emerald-800">送商品展示標準版 6 個月</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">最多 9 項商品展示＋公開網址＋QR Code</p>
              <Link to="/payment/bank-transfer?plan=199&promo=double-points" className="mt-4 inline-flex w-fit self-start whitespace-nowrap min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black !text-white shadow-sm transition hover:bg-emerald-700" style={{ color: "#ffffff" }}>
                選擇 NT$199 方案
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-5 text-xs leading-relaxed text-slate-500">
          商品展示頁可放商品圖片、介紹、價格文字與聯絡方式；不含購物車與站內付款功能。
        </p>
      </section>

      <section className="mt-6 rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-black text-emerald-700">為小店家省時間、省預算、省溝通</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              不用等設計師排程，商品圖可以今天就拿來用
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              傳統商品攝影或設計接案常需要先詢價、說明需求、等待排程、來回修改。這個工具讓店家用少少成本先產出可發文的商業圖，快速測新品、測活動、更新菜單與商品頁。
            </p>
          </div>
          <div className="grid gap-3">
            {[
              ["最快不用 5 分鐘", "臨時要發新品、預購或外送主圖時，不用等人接案。"],
              ["省下溝通時間", "不用反覆說明光線、背景、風格；先選版型即可開始。"],
              ["省下拍攝預算", "不用每次都租棚、找攝影師或設計師，先用低成本做出可用圖。"],
              ["立即可用於行銷", "適合粉專、IG、Threads、蝦皮、預購頁、菜單與外送平台參考圖。"],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
                <p className="text-base font-black text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-5 shadow-sm sm:p-6">
        <div className="space-y-5">
          <div>
            <p className="text-sm font-black text-sky-700">店家行銷用途</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-slate-950 sm:text-3xl">
              一張商品照，可延伸成多種銷售場景
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              不只讓圖片變好看，更是幫店家快速準備上架與發文素材。新品上市、限時預購、菜單更新、蝦皮商品頁、Google 商家照片、LINE 群組推廣，都能先用 AI 商品圖快速測試市場反應。
            </p>
          </div>
          <div className="grid gap-3">
            {[
              ["新品上市", "快速做出新品宣傳圖，減少等待設計與拍攝時間。"],
              ["預購開團", "讓商品看起來更完整，提升顧客詢問與下單意願。"],
              ["社群發文", "FB、IG、Threads、LINE 都能有更清楚的商品視覺。"],
              ["電商上架", "白底圖、商品展示圖與外送主圖可依用途選擇。"],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
                <p className="text-base font-black text-slate-950">{title}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4">
          <div>
            <div className="inline-flex rounded-full bg-amber-100 px-4 py-2 text-xs font-black text-amber-700">
              7/15 前上線限定｜免費人工精修 1 次
            </div>
            <h2 className="mt-3 text-2xl font-black leading-tight text-slate-950">
              購買商品圖方案後，圖片不符合想要的效果，可免費協助精修一次
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              即日起至 7/15 前，凡購買商品圖方案並使用本工具生成商品圖，若 AI 生成結果與您心中想要的商品圖風格有落差，
              可將「原始商品照＋AI 生成圖＋想調整的方向」寄至
              <a href="mailto:rxv0227@gmail.com" className="mx-1 font-black text-emerald-700 underline underline-offset-4">
                rxv0227@gmail.com
              </a>
              ，我們可免費協助人工精修 1 次。
            </p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              免費精修以基礎商品圖優化為主，例如背景、光線、構圖、裁切與整體質感調整；不包含複雜合成、品牌主視覺設計、大量改圖或無限制修改。
            </p>
          </div>
          <a
            href="mailto:rxv0227@gmail.com?subject=7/15前免費人工精修申請&body=請附上：1. 原始商品照 2. AI生成圖 3. 想調整的方向"
            className="inline-flex w-fit self-start whitespace-nowrap shrink-0 items-center justify-center rounded-2xl bg-amber-600 px-6 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-amber-700"
            style={{ color: "#ffffff" }}
          >
            寄信申請精修
          </a>
        </div>
      </section>

      <section id="demo" className="mt-12 scroll-mt-8">
        <div className="mb-6 rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50 to-sky-50 p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-sm font-black text-emerald-600">商品圖示範</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">
                不同類別一次看懂，想看細節再開啟大圖
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                示範改為桌機雙欄、手機單欄的適中卡片，先快速看不同商品的呈現效果；需要仔細看時再點圖開啟大圖，不會因為單張示範太大讓頁面變得太長。
              </p>
            </div>
            {canManageDemoImages && (
              <button
                type="button"
                onClick={() => demoUploadInputRef.current?.click()}
                className="inline-flex w-fit self-start whitespace-nowrap shrink-0 items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700"
                style={{ color: "#ffffff" }}
              >
                上傳示範圖
              </button>
            )}
          </div>
        </div>

        <section className="mb-8 rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-5 shadow-sm sm:p-6">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-black text-amber-700">小店家常見痛點</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-slate-950">
                商品明明好吃、好用，照片卻不夠吸引人？
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                很多店家的商品本身很好，但手機隨手拍常常光線暗、背景亂、主體不明顯，發在粉專、預購頁或商品頁時就容易被滑過。
                這個工具用少少預算，把日常商品照快速升級成更適合發文、展示與促銷的 AI 商品圖，先讓客人願意停下來看。
              </p>
              <div className="mt-4 grid gap-3">
                {[
                  "不用花時間找人接案，也能先做出可發文商品圖",
                  "不用來回溝通修圖方向，選好風格即可生成",
                  "少少成本取得可用圖，適合新品測試與日常行銷",
                  "可用於粉專、IG、預購頁、商品頁與外送主圖",
                  "確認生成才扣點，先看示範再決定是否使用",
                  "圖片不滿意可依活動規則申請人工精修一次",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-emerald-100 bg-white p-3 text-sm font-bold leading-relaxed text-slate-700 shadow-sm">
                    ✓ {item}
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a
                  href="#generator"
                  className="inline-flex w-fit self-start whitespace-nowrap min-h-[52px] items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-center text-sm font-black leading-snug !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg sm:text-base"
                  style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                >
                  <span className="whitespace-nowrap">立即上傳商品照</span>
                </a>
                <a
                  href="mailto:rxv0227@gmail.com?subject=AI商品圖工具使用問題"
                  className="inline-flex w-fit self-start whitespace-nowrap min-h-[52px] items-center justify-center rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-center text-sm font-black leading-snug text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md sm:text-base"
                >
                  <span className="whitespace-nowrap">使用上有問題可來信</span>
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-emerald-700">常見問題 FAQ</p>
              <div className="mt-3 divide-y divide-slate-100">
                {productImageFaqItems.map(([question, answer]) => (
                  <details key={question} className="group py-3">
                    <summary className="cursor-pointer list-none text-sm font-black text-slate-900">
                      {question}
                      <span className="float-right text-emerald-600 group-open:rotate-45">＋</span>
                    </summary>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          {DEMO_CASES.map((demo) => (
            <article
              key={demo.title}
              className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <a
                href={demo.src}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[230px] items-center justify-center bg-slate-50 p-3 sm:min-h-[280px]"
              >
                <img
                  src={demo.src}
                  alt={demo.title}
                  className="max-h-[320px] w-full object-contain"
                  loading="lazy"
                />
              </a>
              <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    {demo.tag}
                  </span>
                  <a
                    href={demo.src}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-black text-emerald-700 underline underline-offset-4"
                  >
                    點圖可看大圖
                  </a>
                </div>
                <h3 className="mt-3 text-xl font-black leading-tight text-slate-950 sm:text-2xl">{demo.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{demo.note}</p>
              </div>
            </article>
          ))}
        </div>

        {canManageDemoImages && (
          <section className="mt-10 rounded-[2rem] border border-dashed border-emerald-300 bg-emerald-50/50 p-5 sm:p-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-black text-emerald-700">示範圖管理區</p>
                <h3 className="mt-2 text-2xl font-black leading-tight text-slate-950">
                  上傳想先預覽的示範圖
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  這個區塊只在管理帳號登入時顯示，方便你先檢查示範圖在頁面上的呈現效果。
                </p>
              </div>
              <input
                ref={demoUploadInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                multiple
                className="hidden"
                onClick={(event) => {
                  event.currentTarget.value = "";
                }}
                onChange={handleDemoImageUpload}
              />
              <button
                type="button"
                onClick={() => demoUploadInputRef.current?.click()}
                className="inline-flex w-fit self-start whitespace-nowrap shrink-0 items-center justify-center rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-black !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-700"
                style={{ color: "#ffffff" }}
              >
                上傳示範圖
              </button>
            </div>

            {customDemoImages.length > 0 && (
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                {customDemoImages.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
                    <a
                      href={item.src}
                      target="_blank"
                      rel="noreferrer"
                      className="flex min-h-[200px] items-center justify-center bg-slate-50 p-3 sm:min-h-[240px]"
                    >
                      <img src={item.src} alt={item.title} className="max-h-[300px] w-full object-contain" />
                    </a>
                    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-black text-emerald-700">示範圖預覽</p>
                        <h4 className="mt-1 text-lg font-black text-slate-950">{item.title}</h4>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <a
                          href={item.src}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex w-fit self-start whitespace-nowrap items-center justify-center rounded-2xl border border-emerald-200 bg-white px-4 py-2 text-sm font-black text-emerald-700 hover:bg-emerald-50"
                        >
                          看大圖
                        </a>
                        <button
                          type="button"
                          onClick={() => removeCustomDemoImage(item.id)}
                          className="inline-flex w-fit self-start whitespace-nowrap items-center justify-center rounded-2xl border border-red-200 bg-white px-4 py-2 text-sm font-black text-red-600 hover:bg-red-50"
                        >
                          移除
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
      </section>

      <section className="mt-10 grid gap-5">
        {[
          ["先看示範", "頁面提供大圖示範，不需免費試用也能先了解效果。"],
          ["確認才扣點", "上傳、選風格與預覽都不扣點，按下確認生成後才會送出。"],
          ["適合小店", "商品圖可用於發文、預購、商品頁與外送平台主圖。"],
        ].map(([title, desc]) => (
          <div key={title} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-black text-slate-950">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
