import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import SEO from "@/components/SEO";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { RelatedGuides } from "@/components/seo/RelatedGuides";
import {
  getRelatedGuideItems,
  getRelatedToolsItems,
} from "@/data/internalLinks";
import { trackEvent } from "@/utils/analytics";
import JSZip from "jszip";
import {
  PresetKey,
  getTargetSize,
  canvasToBlob,
  type DrawMode,
} from "@/lib/imageResize";
import { type ImagePlacement } from "@/lib/imageLayout";

/** 各 preset 對應的 i18n key（顯示用，不改 imageResize 邏輯） */

function PhotoRoomAffiliateBlock() {
  const getShareData = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = "RxV 免費圖片工具";
    const text = "這個免費圖片工具可以處理圖片尺寸、壓縮、轉檔與社群圖片，分享給需要整理圖片的人。";
    return { url, title, text };
  };

  const openShare = (type: "line" | "facebook" | "x") => {
    const { url, title, text } = getShareData();
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${title}｜${text}`);
    const shareUrl =
      type === "line"
        ? `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`
        : type === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
          : `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=720,height=640");
  };

  const copyLink = async () => {
    const { url } = getShareData();
    try {
      await navigator.clipboard.writeText(url);
      alert("已複製連結，可以貼到 LINE、FB 或社團分享。");
    } catch {
      alert("複製失敗，請手動複製網址列連結。");
    }
  };

  return (
    <section className="mt-10 mb-12 border-t border-slate-100 pt-8">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
          AI Creator Tools
        </span>
        <h3 className="text-base font-black text-slate-900 tracking-tight">
          PhotoRoom 圖片創作者推薦工具
        </h3>
      </div>
      <p className="mb-5 text-sm text-slate-500 leading-relaxed">
        可搭配本頁工具使用：先用 PhotoRoom 產生圖片素材、去背整理，再壓縮、轉尺寸、做成貼圖、QR 圖卡或短影音。
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a
          href="https://www.photoroom.com/zh-tw/tools/ai-image-generator"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all text-left duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-100"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
            AI
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
              PhotoRoom AI 圖片生成
            </h4>
            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
              HOT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            可用來測試商品圖、貼圖角色、社群素材與短影音封面，做完再回到 RxV 工具整理尺寸。
          </p>
          <span className="mt-4 inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xs font-black !text-white group-hover:bg-blue-700" style={{ color: "#ffffff" }}>
            立即生成圖片
          </span>
        </a>
        <a
          href="https://www.photoroom.com/zh-tw/tools/background-remover"
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-purple-400 hover:shadow-md transition-all text-left duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-purple-100"
        >
          <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
            BG
          </div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600">
              PhotoRoom AI 去背工具
            </h4>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
              推薦
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            上架貼圖、商品圖或社群圖前先去背，讓素材更乾淨、更好搭配版面。
          </p>
          <span className="mt-4 inline-flex w-fit rounded-lg bg-purple-600 px-3 py-2 text-xs font-black !text-white group-hover:bg-purple-700" style={{ color: "#ffffff" }}>
            立即去背圖片
          </span>
        </a>
      </div>

      <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <p className="mb-3 text-sm font-bold text-slate-700">
          覺得工具實用？分享給正在整理圖片、商品圖或 LINE 貼圖的朋友。
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => openShare("line")} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold !text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg" style={{ color: "#ffffff" }}>LINE 分享</button>
          <button type="button" onClick={() => openShare("facebook")} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold !text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg" style={{ color: "#ffffff" }}>FB 分享</button>
          <button type="button" onClick={() => openShare("x")} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold !text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg" style={{ color: "#ffffff" }}>X 分享</button>
          <button type="button" onClick={copyLink} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-md transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-blue-700 hover:shadow-lg">複製連結</button>
        </div>
      </div>
    </section>
  );
}

const PRESET_I18N_KEYS: Record<PresetKey, string> = {
  "ig-post": "resize_preset_ig_post",
  "ig-portrait": "resize_preset_ig_portrait",
  "ig-story": "resize_preset_ig_story",
  "shopee-main": "resize_preset_shopee_main",
};

/** 檔名用的平台 key 與比例 */
const PRESET_TO_FILENAME_KEY: Record<PresetKey, string> = {
  "ig-post": "ig_square",
  "ig-portrait": "ig_portrait",
  "ig-story": "ig_story",
  "shopee-main": "shopee_square",
};
const PRESET_TO_RATIO: Record<PresetKey, string> = {
  "ig-post": "1:1",
  "ig-portrait": "4:5",
  "ig-story": "9:16",
  "shopee-main": "1:1",
};

/** 統一檔名：{baseName}_{platformKey}_{ratio}_{width}x{height}_{mode}.{ext} */
function buildOutputFilename(
  baseName: string,
  presetKey: PresetKey,
  width: number,
  height: number,
  mode: DrawMode,
  ext: string,
): string {
  const platformKey = PRESET_TO_FILENAME_KEY[presetKey];
  const ratio = PRESET_TO_RATIO[presetKey];
  return `${baseName}_${platformKey}_${ratio}_${width}x${height}_${mode}.${ext}`;
}

function DonationLite() {
  return (
    <section className="mt-10 mb-12 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
      <div className="text-center">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          ❤️ 支持免費工具開發
        </h2>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          如果這個工具有幫助到你，可以小額支持；不用也沒關係，有幫助再支持就好
          🙌
        </p>
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <a
          href="https://p.ecpay.com.tw/FD7CD6D"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-amber-600 hover:!text-white active:scale-[0.98]"
        >
          ☕ 台灣小額支持
        </a>
        <a
          href="https://ko-fi.com/ang2289"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-blue-700 hover:!text-white active:scale-[0.98]"
        >
          🌍 Ko-fi 海外支持
        </a>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        建議支持：50 元 / 100 元 / 200 元　｜　💡 功能建議：
        <a
          href="mailto:rxv0227@gmail.com"
          className="font-bold text-emerald-600 hover:text-emerald-700"
        >
          rxv0227@gmail.com
        </a>
      </p>
    </section>
  );
}

const ACCEPT_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const FILE_INPUT_ACCEPT = "image/jpeg,image/png,image/webp,image/*";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_DECODE_EDGE = 3000;
const MOBILE_IMAGE_LOAD_ERROR =
  "圖片載入失敗，可能是手機特殊格式或圖片過大，請改用截圖、另存 JPG，或換一張圖片再試。";
const MOBILE_IMAGE_HINT =
  "手機相簿圖片若無法載入，請先截圖後再上傳，或改用 JPG／PNG 圖片。";

const RESOLUTIONS = [1080, 1350, 1920] as const;
const PLATFORM_GROUP_ORDER: Array<NonNullable<PlatformSizeItem["group"]>> = [
  "IG",
  "YouTube",
  "TikTok",
  "Shopee",
  "Facebook",
];

type PlatformSizeItem = {
  key: string;
  title: string;
  ratio: string;
  width: number;
  height: number;
  description: string;
  group?: "IG" | "YouTube" | "TikTok" | "Shopee" | "Facebook";
  enableInZip?: boolean;
  sectionId: string;
  presetKey?: PresetKey;
  resolutionValue?: number;
};

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("IMAGE_LOAD_FAILED"));
    img.src = src;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("FILE_READER_EMPTY"));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("FILE_READER_FAILED"));
    reader.readAsDataURL(file);
  });
}

async function loadViaObjectUrl(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await loadHtmlImage(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function loadViaFileReader(file: File): Promise<HTMLImageElement> {
  const dataUrl = await readFileAsDataUrl(file);
  return loadHtmlImage(dataUrl);
}

function safeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getPlacementNumber(
  placement: unknown,
  keys: string[],
  fallback = 0,
): number {
  const obj =
    placement && typeof placement === "object"
      ? (placement as Record<string, unknown>)
      : null;
  if (!obj) return fallback;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return fallback;
}

function roundedInt(value: unknown, fallback = 0): number {
  return Math.round(safeNumber(value, fallback));
}

function fixed1(value: unknown, fallback = 0): string {
  return safeNumber(value, fallback).toFixed(1);
}

function downscaleImageIfNeeded(
  source: HTMLImageElement,
  maxEdge = MAX_DECODE_EDGE,
): HTMLImageElement | Promise<HTMLImageElement> {
  const naturalWidth = source.naturalWidth || source.width;
  const naturalHeight = source.naturalHeight || source.height;
  const longestEdge = Math.max(naturalWidth, naturalHeight);

  if (!naturalWidth || !naturalHeight || longestEdge <= maxEdge) {
    return source;
  }

  const ratio = maxEdge / longestEdge;
  const nextWidth = Math.max(1, Math.round(naturalWidth * ratio));
  const nextHeight = Math.max(1, Math.round(naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = nextWidth;
  canvas.height = nextHeight;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return source;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, nextWidth, nextHeight);
  return loadHtmlImage(canvas.toDataURL("image/jpeg", 0.92));
}

function drawImageToCanvasStable({
  canvas,
  image,
  targetWidth,
  targetHeight,
  mode,
  backgroundColor,
}: {
  canvas: HTMLCanvasElement;
  image: HTMLImageElement;
  targetWidth: number;
  targetHeight: number;
  mode: "contain" | "cover";
  backgroundColor: string;
}): ImagePlacement {
  const width = Math.max(1, Math.round(targetWidth));
  const height = Math.max(1, Math.round(targetHeight));
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { alpha: false });
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!ctx || !sourceWidth || !sourceHeight) {
    return {
      drawWidth: width,
      drawHeight: height,
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    };
  }

  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const scale =
    mode === "cover"
      ? Math.max(width / sourceWidth, height / sourceHeight)
      : Math.min(width / sourceWidth, height / sourceHeight);
  const drawWidth = Math.max(1, sourceWidth * scale);
  const drawHeight = Math.max(1, sourceHeight * scale);
  const x = (width - drawWidth) / 2;
  const y = (height - drawHeight) / 2;
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
  ctx.restore();
  return {
    drawWidth,
    drawHeight,
    offsetX: x,
    offsetY: y,
    scale,
  };
}

export default function ImageResize() {
  const { t, i18n } = useTranslation();

  const platformSizes: PlatformSizeItem[] = useMemo(
    () => [
      {
        key: "ig-post",
        sectionId: "size-ig-post",
        group: "IG",
        title: t("resize_card_ig_post_title"),
        ratio: t("resize_card_ig_post_ratio"),
        width: 1080,
        height: 1080,
        description: t("resize_card_ig_post_desc"),
        enableInZip: true,
        presetKey: "ig-post",
        resolutionValue: 1080,
      },
      {
        key: "ig-portrait",
        sectionId: "size-ig-portrait",
        group: "IG",
        title: t("resize_card_ig_portrait_title"),
        ratio: t("resize_card_ig_portrait_ratio"),
        width: 1080,
        height: 1350,
        description: t("resize_card_ig_portrait_desc"),
        enableInZip: true,
        presetKey: "ig-portrait",
        resolutionValue: 1350,
      },
      {
        key: "ig-story",
        sectionId: "size-ig-story",
        group: "IG",
        title: t("resize_card_ig_story_title"),
        ratio: t("resize_card_ig_story_ratio"),
        width: 1080,
        height: 1920,
        description: t("resize_card_ig_story_desc"),
        enableInZip: true,
        presetKey: "ig-story",
        resolutionValue: 1920,
      },
      {
        key: "shopee-main",
        sectionId: "size-shopee-main",
        group: "Shopee",
        title: t("resize_card_shopee_title"),
        ratio: t("resize_card_shopee_ratio"),
        width: 1080,
        height: 1080,
        description: t("resize_card_shopee_desc"),
        enableInZip: true,
        presetKey: "shopee-main",
        resolutionValue: 1080,
      },
      {
        key: "youtube-thumb",
        sectionId: "size-youtube-thumb",
        group: "YouTube",
        title: t("imageResizeExtra.card_youtube_title"),
        ratio: t("imageResizeExtra.card_youtube_ratio"),
        width: 1280,
        height: 720,
        description: t("imageResizeExtra.card_youtube_desc"),
        enableInZip: true,
      },
      {
        key: "facebook-share",
        sectionId: "size-facebook-share",
        group: "Facebook",
        title: t("imageResizeExtra.card_fb_title"),
        ratio: t("imageResizeExtra.card_fb_ratio"),
        width: 1200,
        height: 630,
        description: t("imageResizeExtra.card_fb_desc"),
        enableInZip: true,
      },
      {
        key: "tiktok-video",
        sectionId: "size-tiktok-video",
        group: "TikTok",
        title: t("imageResizeExtra.card_tiktok_title"),
        ratio: t("imageResizeExtra.card_tiktok_ratio"),
        width: 1080,
        height: 1920,
        description: t("imageResizeExtra.card_tiktok_desc"),
        enableInZip: true,
      },
      {
        key: "shopee-long",
        sectionId: "size-shopee-long",
        group: "Shopee",
        title: t("imageResizeExtra.card_shopee_long_title"),
        ratio: t("imageResizeExtra.card_shopee_long_ratio"),
        width: 1080,
        height: 1920,
        description: t("imageResizeExtra.card_shopee_long_desc"),
        enableInZip: true,
      },
    ],
    [t],
  );

  const zipEnabledPlatforms = useMemo(
    () => platformSizes.filter((item) => item.enableInZip),
    [platformSizes],
  );
  const platformTabs = useMemo(
    () =>
      PLATFORM_GROUP_ORDER.filter((group) =>
        platformSizes.some((item) => item.group === group),
      ),
    [platformSizes],
  );
  const [activePlatformTab, setActivePlatformTab] =
    useState<NonNullable<PlatformSizeItem["group"]>>("IG");
  const resizeCards = platformSizes.filter(
    (card) => card.group === activePlatformTab,
  );

  const initialZipPlatforms = zipEnabledPlatforms.reduce<
    Record<string, boolean>
  >((acc, item) => {
    acc[item.key] =
      item.key === "ig-post" ||
      item.key === "ig-portrait" ||
      item.key === "ig-story" ||
      item.key === "shopee-main";
    return acc;
  }, {});

  const [file, setFile] = useState<File | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState("");
  const [preset, setPreset] = useState<PresetKey>("ig-post");
  const [resolution, setResolution] = useState<number>(1080);
  const [customSize, setCustomSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [mode, setMode] = useState<DrawMode>("pad");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [lastDownloaded, setLastDownloaded] = useState<"png" | "jpeg" | null>(
    null,
  );
  const [zipPlatforms, setZipPlatforms] =
    useState<Record<string, boolean>>(initialZipPlatforms);
  const [zipFormat, setZipFormat] = useState<"jpeg" | "png">("jpeg");
  const [zipProgress, setZipProgress] = useState<string | null>(null);
  const [zipNotice, setZipNotice] = useState<string | null>(null);
  const [zipError, setZipError] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);
  const [showCrossPromo, setShowCrossPromo] = useState(false);
  const [previewPlacement, setPreviewPlacement] =
    useState<ImagePlacement | null>(null);
  const crossPromoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1024 : window.innerWidth,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  const isMobileViewport = viewportWidth < 768;
  const targetSize = customSize ?? getTargetSize(preset, resolution);

  const applyPresetSelection = useCallback(
    (nextPreset: PresetKey, nextResolution: number) => {
      setPreset(nextPreset);
      setResolution(nextResolution);
      setCustomSize(null);
    },
    [],
  );

  const applyCustomSize = useCallback((width: number, height: number) => {
    setCustomSize({ width, height });
  }, []);

  const validateFile = useCallback(
    (f: File): string | null => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      const validExts = ["jpg", "jpeg", "png", "webp"];
      if (!ext || !validExts.includes(ext)) {
        return t("resize_validation_format");
      }
      if (f.size > MAX_FILE_SIZE) {
        return t("resize_validation_size");
      }
      // 手機相簿或部分 Android 瀏覽器可能回傳空白 MIME / application/octet-stream，
      // 因此以副檔名為主、MIME 為輔，避免可用 JPG 被誤擋。
      if (
        f.type &&
        !ACCEPT_TYPES.includes(f.type) &&
        !f.type.startsWith("image/")
      ) {
        return t("resize_validation_type");
      }
      return null;
    },
    [t],
  );

  const loadImage = useCallback(async (f: File) => {
    setError(null);
    setLoading(true);

    try {
      // V153：手機瀏覽器/Android WebView 有時會讓 canvas 空白，但 dataURL 圖片本身可正常顯示。
      // 保留 dataURL 給手機預覽層使用，下載仍走原本 canvas 流程。
      const img = await loadViaFileReader(f);
      setSourcePreviewUrl(img.src || "");

      const safeImage = await downscaleImageIfNeeded(img);
      setImage(safeImage);
    } catch {
      setSourcePreviewUrl("");
      setImage(null);
      setError(MOBILE_IMAGE_LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    (f: File | null) => {
      if (!f) {
        setFile(null);
        setImage(null);
        setSourcePreviewUrl("");
        setError(null);
        return;
      }
      const err = validateFile(f);
      if (err) {
        setError(err);
        setFile(null);
        setImage(null);
        return;
      }
      setFile(f);
      loadImage(f);
    },
    [validateFile, loadImage],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFileSelect(f);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      handleFileSelect(f ?? null);
      e.target.value = "";
    },
    [handleFileSelect],
  );

  const showCrossPromoCard = useCallback(() => {
    if (crossPromoTimerRef.current) clearTimeout(crossPromoTimerRef.current);
    setShowCrossPromo(true);
    trackEvent("crosspromo_show_summary", { source: "image_resize" });
    crossPromoTimerRef.current = setTimeout(() => {
      setShowCrossPromo(false);
      crossPromoTimerRef.current = null;
    }, 6000);
  }, []);

  useEffect(() => {
    return () => {
      if (crossPromoTimerRef.current) clearTimeout(crossPromoTimerRef.current);
    };
  }, []);

  // Canvas 即時預覽
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    let cancelled = false;

    const draw = async () => {
      if (typeof image.decode === "function") {
        try {
          await image.decode();
        } catch {
          // 已載入的圖片在部分手機瀏覽器會丟 decode 例外，仍可繪製。
        }
      }

      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
      if (cancelled || !canvasRef.current) return;

      const placement = drawImageToCanvasStable({
        canvas: canvasRef.current,
        image,
        targetWidth: targetSize.width,
        targetHeight: targetSize.height,
        mode: mode === "pad" ? "contain" : "cover",
        backgroundColor: "#f3f4f6",
      });
      setPreviewPlacement(placement);
    };

    draw();
    return () => {
      cancelled = true;
    };
  }, [image, mode, targetSize.width, targetSize.height]);

  const download = useCallback(
    async (format: "png" | "jpeg") => {
      if (!canvasRef.current || !file) return;
      try {
        const mime = format === "jpeg" ? "image/jpeg" : "image/png";
        const quality = format === "jpeg" ? 0.92 : undefined;
        const blob = await canvasToBlob(canvasRef.current, mime, quality);
        const ext = format === "jpeg" ? "jpg" : "png";
        const baseName = file.name.replace(/\.[^.]+$/, "");
        const filename = customSize
          ? `${baseName}_custom_${targetSize.width}x${targetSize.height}_${mode}.${ext}`
          : buildOutputFilename(
              baseName,
              preset,
              targetSize.width,
              targetSize.height,
              mode,
              ext,
            );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        setDownloadNotice(t("resize_download_start", { filename }));
        setLastDownloaded(format);
        setTimeout(() => {
          setDownloadNotice(null);
          setLastDownloaded(null);
        }, 2000);
        trackEvent("image_resize_download", {
          format: format === "jpeg" ? "jpg" : "png",
          type: "single",
        });
        showCrossPromoCard();
      } catch (e) {
        setError(t("resize_download_failed"));
      }
    },
    [file, preset, targetSize, mode, showCrossPromoCard, t, customSize],
  );

  const handleZipPlatformToggle = useCallback((key: string) => {
    setZipPlatforms((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleZipSelectAll = useCallback(() => {
    setZipPlatforms(
      zipEnabledPlatforms.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.key] = true;
        return acc;
      }, {}),
    );
  }, [zipEnabledPlatforms]);

  const handleZipSelectNone = useCallback(() => {
    setZipPlatforms(
      zipEnabledPlatforms.reduce<Record<string, boolean>>((acc, item) => {
        acc[item.key] = false;
        return acc;
      }, {}),
    );
  }, [zipEnabledPlatforms]);

  const selectedZipCount = zipEnabledPlatforms.filter(
    (item) => zipPlatforms[item.key],
  ).length;
  const allZipSelected =
    zipEnabledPlatforms.length > 0 &&
    selectedZipCount === zipEnabledPlatforms.length;
  const isZipDownloadDisabled = selectedZipCount === 0 || isZipping;

  const downloadZip = useCallback(async () => {
    if (isZipping) return;
    setZipError(null);
    if (!image || !file) {
      setZipNotice(t("resize_zip_upload_first"));
      setTimeout(() => setZipNotice(null), 2000);
      return;
    }
    const selected = zipEnabledPlatforms.filter(
      (item) => zipPlatforms[item.key],
    );
    if (selected.length === 0) {
      setZipNotice(t("resize_zip_select_one"));
      setTimeout(() => setZipNotice(null), 2000);
      return;
    }
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const mime = zipFormat === "jpeg" ? "image/jpeg" : "image/png";
      const ext = zipFormat === "jpeg" ? "jpg" : "png";
      const baseName = file.name.replace(/\.[^.]+$/, "");
      const total = selected.length;
      for (let i = 0; i < selected.length; i++) {
        setZipProgress(t("resize_zip_progress", { current: i + 1, total }));
        const selectedPlatform = selected[i];
        const { width, height, key } = selectedPlatform;
        const offscreen = document.createElement("canvas");
        drawImageToCanvasStable({
          canvas: offscreen,
          image,
          targetWidth: width,
          targetHeight: height,
          mode: mode === "pad" ? "contain" : "cover",
          backgroundColor: "#f3f4f6",
        });
        const blob = await canvasToBlob(
          offscreen,
          mime,
          zipFormat === "jpeg" ? 0.92 : undefined,
        );
        const arrayBuffer = await blob.arrayBuffer();
        const filename = selectedPlatform.presetKey
          ? buildOutputFilename(
              baseName,
              selectedPlatform.presetKey,
              width,
              height,
              mode,
              ext,
            )
          : `${baseName}_${key}_${width}x${height}_${mode}.${ext}`;
        zip.file(filename, arrayBuffer);
      }
      setZipProgress(t("resize_zip_generating"));
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${baseName}_multi_platform.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setZipNotice(t("resize_zip_start"));
      setTimeout(() => setZipNotice(null), 2000);
      trackEvent("image_resize_download", { type: "zip" });
      showCrossPromoCard();
    } catch (e) {
      setZipError(t("imageResizeExtra.zip_fail"));
    } finally {
      setZipProgress(null);
      setIsZipping(false);
    }
  }, [
    image,
    file,
    zipPlatforms,
    zipEnabledPlatforms,
    zipFormat,
    mode,
    showCrossPromoCard,
    t,
    isZipping,
  ]);

  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const baseFaqItems: { q: string; a: string }[] = useMemo(
    () => [
      { q: t("resize_faq_1_q"), a: t("resize_faq_1_a") },
      { q: t("resize_faq_2_q"), a: t("resize_faq_2_a") },
      { q: t("resize_faq_3_q"), a: t("resize_faq_3_a") },
      { q: t("resize_faq_4_q"), a: t("resize_faq_4_a") },
      { q: t("resize_faq_5_q"), a: t("resize_faq_5_a") },
      { q: t("resize_faq_6_q"), a: t("resize_faq_6_a") },
      { q: t("resize_faq_7_q"), a: t("resize_faq_7_a") },
    ],
    [t],
  );

  const hasFaqKeyword = (keyword: string) =>
    baseFaqItems.some((item) =>
      item.q.toLowerCase().includes(keyword.toLowerCase()),
    );

  const faqItems: { q: string; a: string }[] = useMemo(() => {
    const list = [...baseFaqItems];
    if (!hasFaqKeyword("youtube")) {
      list.push({
        q: t("imageResizeExtra.faqExtra.youtube_q"),
        a: t("imageResizeExtra.faqExtra.youtube_a"),
      });
    }
    if (!hasFaqKeyword("tiktok")) {
      list.push({
        q: t("imageResizeExtra.faqExtra.tiktok_q"),
        a: t("imageResizeExtra.faqExtra.tiktok_a"),
      });
    }
    if (!hasFaqKeyword("facebook")) {
      list.push({
        q: t("imageResizeExtra.faqExtra.facebook_q"),
        a: t("imageResizeExtra.faqExtra.facebook_a"),
      });
    }
    return list;
  }, [baseFaqItems, t]);

  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        ...faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
        {
          "@type": "Question",
          name: t("resize_faq_jpg_png_q"),
          acceptedAnswer: {
            "@type": "Answer",
            text: t("resize_faq_jpg_png_a"),
          },
        },
        {
          "@type": "Question",
          name: t("resize_faq_zip_q"),
          acceptedAnswer: { "@type": "Answer", text: t("resize_faq_zip_a") },
        },
      ],
    }),
    [faqItems, t],
  );
  const canonicalUrl =
    "https://pomodoro-app-eight-rouge.vercel.app/tools/image-resize";
  const webPageJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: t("imageResizeExtra.jsonLd.webName"),
      description: t("imageResizeExtra.jsonLd.webDesc"),
      url: canonicalUrl,
      inLanguage: i18n.language?.startsWith("zh") ? "zh-TW" : "en",
    }),
    [t, i18n.language],
  );
  const softwareJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: t("imageResizeExtra.jsonLd.webName"),
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      description: t("imageResizeExtra.jsonLd.appDesc"),
      url: canonicalUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TWD",
      },
    }),
    [t],
  );

  useEffect(() => {
    if (!platformTabs.includes(activePlatformTab)) {
      setActivePlatformTab(platformTabs[0] ?? "IG");
    }
  }, [activePlatformTab, platformTabs]);

  const operationsPanel = (
    <div className="space-y-5">
      {/* 上傳區 */}
      <section>
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`
            border-2 border-dashed rounded-xl p-6 md:p-8 text-center cursor-pointer transition
            ${isDragging ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-slate-400"}
            ${error ? "border-red-300 bg-red-50/50" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={FILE_INPUT_ACCEPT}
            onChange={handleInputChange}
            className="hidden"
          />
          {loading ? (
            <p className="text-slate-600">{t("resize_processing")}</p>
          ) : file ? (
            <p className="text-slate-700">
              <span className="font-medium">{file.name}</span>
              <br />
              <span className="text-sm text-slate-500">
                {t("resize_click_or_drag")}
              </span>
            </p>
          ) : (
            <p className="text-slate-600">
              {t("resize_drop_here")}{" "}
              <span className="text-blue-600 font-medium">
                {t("resize_click_upload")}
              </span>
            </p>
          )}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {MOBILE_IMAGE_HINT}
        </p>
      </section>

      <section>
        <h3 className="text-sm font-medium text-slate-700 mb-2">
          {t("imageResizeExtra.output_wh")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min={1}
            value={targetSize.width}
            onChange={(e) => {
              const nextWidth = Number(e.target.value);
              if (nextWidth > 0) applyCustomSize(nextWidth, targetSize.height);
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={t("imageResizeExtra.aria_w")}
          />
          <input
            type="number"
            min={1}
            value={targetSize.height}
            onChange={(e) => {
              const nextHeight = Number(e.target.value);
              if (nextHeight > 0) applyCustomSize(targetSize.width, nextHeight);
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label={t("imageResizeExtra.aria_h")}
          />
        </div>
      </section>

      {/* 平台尺寸 / 輸出解析度 / 模式 / 下載 */}
      {image && (
        <>
          <section>
            <h3 className="text-sm font-medium text-slate-700 mb-2">
              {t("resize_section_platform")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {platformSizes.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (item.presetKey && item.resolutionValue) {
                      applyPresetSelection(
                        item.presetKey,
                        item.resolutionValue,
                      );
                    } else {
                      applyCustomSize(item.width, item.height);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                    ${
                      (
                        item.presetKey
                          ? preset === item.presetKey && !customSize
                          : targetSize.width === item.width &&
                            targetSize.height === item.height
                      )
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-slate-700 mb-2">
              {t("resize_section_resolution")}
            </h3>
            <div className="flex gap-2">
              {RESOLUTIONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => applyPresetSelection(preset, r)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition
                    ${resolution === r ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-medium text-slate-700 mb-2">
              {t("resize_section_mode")}
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "pad"}
                  onChange={() => setMode("pad")}
                  className="text-blue-600"
                />
                <span className="text-sm">{t("resize_mode_pad")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === "crop"}
                  onChange={() => setMode("crop")}
                  className="text-blue-600"
                />
                <span className="text-sm">{t("resize_mode_crop")}</span>
              </label>
            </div>
          </section>

          <section className="hidden md:block">
            <h3 className="text-sm font-medium text-slate-700 mb-2">
              {t("resize_section_download")}
            </h3>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => download("png")}
                className="px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-200"
              >
                {lastDownloaded === "png"
                  ? t("resize_downloaded")
                  : t("resize_download_png")}
              </button>
              <button
                type="button"
                onClick={() => download("jpeg")}
                className="px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {lastDownloaded === "jpeg"
                  ? t("resize_downloaded")
                  : t("resize_download_jpg")}
              </button>
            </div>
            {downloadNotice && (
              <p className="mt-2 text-sm text-emerald-600">{downloadNotice}</p>
            )}
          </section>

          {/* 多平台整包輸出（ZIP） */}
          <section>
            <h3 className="text-sm font-medium text-slate-700 mb-2">
              {t("resize_zip_title")}
            </h3>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleZipSelectAll}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium !text-white hover:!text-white hover:bg-blue-700 transition"
                >
                  {t("imageResizeExtra.zip_select_all")}
                </button>
                <button
                  type="button"
                  onClick={handleZipSelectNone}
                  className="rounded-lg border border-blue-200 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                >
                  {t("imageResizeExtra.zip_select_none")}
                </button>
                <span className="text-xs text-slate-500">
                  {t("imageResizeExtra.zip_selected", {
                    n: selectedZipCount,
                    total: zipEnabledPlatforms.length,
                    all: allZipSelected
                      ? t("imageResizeExtra.zip_all_suffix")
                      : "",
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t("imageResizeExtra.zip_checked_n", { n: selectedZipCount })}
              </p>
              <p className="text-xs text-slate-500">
                {t("imageResizeExtra.zip_preset_hint")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {zipEnabledPlatforms.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={zipPlatforms[item.key] ?? false}
                      onChange={() => handleZipPlatformToggle(item.key)}
                      className="rounded text-blue-600"
                    />
                    <span>{item.title}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="zipFormat"
                    checked={zipFormat === "jpeg"}
                    onChange={() => setZipFormat("jpeg")}
                    className="text-blue-600"
                  />
                  <span>JPG</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="radio"
                    name="zipFormat"
                    checked={zipFormat === "png"}
                    onChange={() => setZipFormat("png")}
                    className="text-blue-600"
                  />
                  <span>PNG</span>
                </label>
              </div>
              <button
                type="button"
                onClick={downloadZip}
                disabled={isZipDownloadDisabled}
                className={`w-full px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${
                  isZipDownloadDisabled
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isZipping
                  ? t("imageResizeExtra.zip_packaging")
                  : t("imageResizeExtra.zip_download")}
              </button>
              {selectedZipCount === 0 && !isZipping && (
                <p className="text-sm text-slate-600">
                  {t("imageResizeExtra.zip_pick")}
                </p>
              )}
              {(zipProgress || zipNotice || zipError) && (
                <p
                  className={`text-sm ${zipError ? "text-red-600" : zipNotice && !zipProgress ? "text-emerald-600" : "text-slate-600"}`}
                >
                  {zipError ?? zipProgress ?? zipNotice}
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );

  const downloadButtons = (
    <section>
      <h3 className="text-sm font-medium text-slate-700 mb-2">
        {t("resize_section_download")}
      </h3>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => download("png")}
          className="px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-200"
        >
          {lastDownloaded === "png"
            ? t("resize_downloaded")
            : t("resize_download_png")}
        </button>
        <button
          type="button"
          onClick={() => download("jpeg")}
          className="px-4 py-2 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {lastDownloaded === "jpeg"
            ? t("resize_downloaded")
            : t("resize_download_jpg")}
        </button>
      </div>
      {downloadNotice && (
        <p className="mt-2 text-sm text-emerald-600">{downloadNotice}</p>
      )}
    </section>
  );

  const previewCaption =
    mode === "pad"
      ? t("resize_preview_pad", {
          label: customSize
            ? t("imageResizeExtra.custom_label")
            : t(PRESET_I18N_KEYS[preset]),
        })
      : t("resize_preview_crop", {
          label: customSize
            ? t("imageResizeExtra.custom_label")
            : t(PRESET_I18N_KEYS[preset]),
        });

  const frameRatio = targetSize.width / targetSize.height;
  const previewMaxWidth = isMobileViewport
    ? Math.max(180, Math.min(viewportWidth - 96, 280))
    : 360;
  const previewMaxHeight = isMobileViewport ? 340 : 360;
  const previewBoxSize = (() => {
    const byWidth = {
      width: previewMaxWidth,
      height: Math.round(previewMaxWidth / frameRatio),
    };
    if (byWidth.height <= previewMaxHeight) return byWidth;
    return {
      width: Math.round(previewMaxHeight * frameRatio),
      height: previewMaxHeight,
    };
  })();

  const previewScaleX =
    targetSize.width > 0 ? previewBoxSize.width / targetSize.width : 1;
  const previewScaleY =
    targetSize.height > 0 ? previewBoxSize.height / targetSize.height : 1;
  const previewImgLeft = previewPlacement
    ? getPlacementNumber(previewPlacement, ["offsetX", "x", "left"]) *
      previewScaleX
    : 0;
  const previewImgTop = previewPlacement
    ? getPlacementNumber(previewPlacement, ["offsetY", "y", "top"]) *
      previewScaleY
    : 0;
  const previewImgWidth = previewPlacement
    ? getPlacementNumber(
        previewPlacement,
        ["drawWidth", "width", "renderWidth"],
        targetSize.width,
      ) * previewScaleX
    : previewBoxSize.width;
  const previewImgHeight = previewPlacement
    ? getPlacementNumber(
        previewPlacement,
        ["drawHeight", "height", "renderHeight"],
        targetSize.height,
      ) * previewScaleY
    : previewBoxSize.height;

  const previewPanel = image && (
    <section>
      <h3 className="text-sm font-medium text-slate-700 mb-2">
        {t("resize_section_preview")}
      </h3>
      <figure className="m-0">
        <div className="relative rounded-lg border border-slate-200 bg-slate-100 overflow-hidden p-2 md:p-3">
          <div className="mx-auto flex items-center justify-center">
            <div
              className="relative overflow-hidden rounded-md bg-slate-100 shadow-sm"
              style={{
                width: `${previewBoxSize.width}px`,
                height: `${previewBoxSize.height}px`,
                maxWidth: "100%",
                maxHeight: isMobileViewport ? "340px" : "64vh",
              }}
            >
              <canvas
                ref={canvasRef}
                width={targetSize.width}
                height={targetSize.height}
                className="absolute inset-0 block rounded-md"
                style={{
                  imageRendering: "auto",
                  width: "100%",
                  height: "100%",
                }}
                role="img"
                aria-label={previewCaption}
              />
              {sourcePreviewUrl ? (
                <img
                  src={sourcePreviewUrl}
                  alt="圖片預覽"
                  className="pointer-events-none absolute select-none"
                  style={{
                    left: previewImgLeft,
                    top: previewImgTop,
                    width: previewImgWidth,
                    height: previewImgHeight,
                    objectFit: mode === "pad" ? "contain" : "cover",
                    opacity: 0.98,
                  }}
                />
              ) : null}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className="relative rounded-[10px] border border-white/90 shadow-[0_0_0_1px_rgba(59,130,246,0.55)]"
              style={{
                width: `${previewBoxSize.width}px`,
                height: `${previewBoxSize.height}px`,
                maxWidth: isMobileViewport
                  ? "calc(100% - 16px)"
                  : "calc(100% - 24px)",
                maxHeight: isMobileViewport ? "340px" : "calc(100% - 24px)",
                boxShadow:
                  mode === "crop"
                    ? "0 0 0 9999px rgba(15, 23, 42, 0.35)"
                    : "0 0 0 9999px rgba(15, 23, 42, 0.22)",
              }}
            />
          </div>
        </div>
        <figcaption className="mt-2 text-xs text-slate-500">
          {previewCaption}，
          {t("resize_preview_output", {
            width: targetSize.width,
            height: targetSize.height,
          })}
        </figcaption>
        <p className="mt-1 text-xs text-slate-500">
          {mode === "pad"
            ? t("imageResizeExtra.preview_mode_pad")
            : t("imageResizeExtra.preview_mode_crop")}
        </p>
        {import.meta.env.DEV && image && previewPlacement ? (
          <p className="mt-1 text-[11px] text-slate-500">
            src: {image.naturalWidth}×{image.naturalHeight} | target:{" "}
            {targetSize.width}×{targetSize.height} | mode:{" "}
            {mode === "pad" ? "contain" : "cover"} | draw:{" "}
            {roundedInt(
              getPlacementNumber(previewPlacement, [
                "drawWidth",
                "width",
                "renderWidth",
              ]),
            )}
            ×
            {roundedInt(
              getPlacementNumber(previewPlacement, [
                "drawHeight",
                "height",
                "renderHeight",
              ]),
            )}{" "}
            | offset:{" "}
            {fixed1(
              getPlacementNumber(previewPlacement, ["offsetX", "x", "left"]),
            )}
            ,{" "}
            {fixed1(
              getPlacementNumber(previewPlacement, ["offsetY", "y", "top"]),
            )}
          </p>
        ) : null}
      </figure>
      <div className="md:hidden mt-4">{downloadButtons}</div>
    </section>
  );

  return (
    <>
      <SEO
        title={t("imageResizeExtra.seo.title")}
        description={t("imageResizeExtra.seo.description")}
        keywords={t("imageResizeExtra.seo.keywords")}
        path="/tools/image-resize"
        jsonLdList={[webPageJsonLd, softwareJsonLd]}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-6 pb-32 md:py-8 md:pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4">
            <Link
              to="/"
              className="text-sm text-slate-600 hover:text-slate-900"
            >
              {t("resize_back_home")}
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
            {t("imageResizeExtra.h1")}
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed mb-2">
            <span className="font-medium text-slate-800">
              {t("imageResizeExtra.audience_label")}
            </span>
            {t("imageResizeExtra.audience")}
          </p>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {t("imageResizeExtra.intro2")}
          </p>

          {/* 手機：預覽在上、設定在下（不使用 sticky） */}
          <div className="md:hidden">
            <div className="mb-6">{previewPanel}</div>
            <div>{operationsPanel}</div>
          </div>

          {/* 桌機：雙欄（左設定、右 sticky 預覽） */}
          <div className="hidden md:grid md:grid-cols-[minmax(0,1fr)_420px] md:gap-8">
            <div>{operationsPanel}</div>
            <div className="sticky top-24 self-start">{previewPanel}</div>
          </div>

          {/* 圖片尺寸對照（卡片式） */}
          <section className="mt-10 md:mt-12">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {t("resize_table_title")}
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              {t("resize_table_intro")}
            </p>
            <div className="mb-4 flex flex-wrap gap-2">
              {platformTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActivePlatformTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    activePlatformTab === tab
                      ? "bg-blue-600 text-white"
                      : "border border-blue-200 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  {t(`imageResizeExtra.group.${tab}`)}
                </button>
              ))}
            </div>
            <div className="space-y-4">
              {resizeCards.map((card) => (
                <div
                  key={card.key}
                  id={card.sectionId}
                  className="rounded-lg border border-slate-200 bg-white p-4 scroll-mt-24"
                >
                  <h3 className="text-sm font-semibold text-slate-800 mb-2">
                    {card.title}
                  </h3>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p>{card.ratio}</p>
                    <p>
                      {t("imageResizeExtra.suggested")}
                      {card.width} × {card.height}
                    </p>
                    <p>{card.description}</p>
                  </div>
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        if (card.presetKey && card.resolutionValue) {
                          applyPresetSelection(
                            card.presetKey,
                            card.resolutionValue,
                          );
                        } else {
                          applyCustomSize(card.width, card.height);
                        }
                      }}
                      className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium !text-white hover:!text-white hover:bg-blue-700 transition"
                    >
                      {t("imageResizeExtra.apply_size")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SEO 內鏈 */}
          <p className="mt-8 text-sm text-slate-600 text-center">
            {t("resize_seo_inner")}{" "}
            <Link
              to="/summary"
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
            >
              {t("resize_seo_link")}
            </Link>{" "}
            {t("resize_seo_inner_suffix")}
          </p>

          {/* 頁面摘要段落（Featured Snippet 友善） */}
          <section className="mt-10 md:mt-12">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              {t("resize_quick_title")}
            </h2>
            <p className="text-slate-700 leading-relaxed mb-4">
              {t("resize_quick_intro")}
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 mb-4">
              <li>{t("resize_quick_ig_post")}</li>
              <li>{t("resize_quick_ig_portrait")}</li>
              <li>{t("resize_quick_reels")}</li>
            </ul>
            <p className="text-sm text-slate-600">{t("resize_quick_shopee")}</p>
            <p className="mt-2 text-sm text-slate-600">
              {t("imageResizeExtra.sizes_extra_line")}
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-xl font-semibold mb-4">
              {t("imageResizeExtra.how_title")}
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              {t("imageResizeExtra.how_p")}
            </p>

            <h3 className="font-semibold mt-4 mb-2">
              {t("imageResizeExtra.steps_title")}
            </h3>
            <ol className="list-decimal ml-5 text-gray-600 space-y-1">
              <li>{t("imageResizeExtra.st1")}</li>
              <li>{t("imageResizeExtra.st2")}</li>
              <li>{t("imageResizeExtra.st3")}</li>
              <li>{t("imageResizeExtra.st4")}</li>
            </ol>

            <h3 className="font-semibold mt-4 mb-2">
              {t("imageResizeExtra.cases_title")}
            </h3>
            <ul className="list-disc ml-5 text-gray-600 space-y-1">
              <li>{t("imageResizeExtra.c1")}</li>
              <li>{t("imageResizeExtra.c2")}</li>
              <li>{t("imageResizeExtra.c3")}</li>
            </ul>
          </section>

          {/* FAQ Accordion（預設收合）｜手機：在預覽+下載之後 */}
          <section className="mt-10 md:mt-12">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              {t("resize_faq_title")}
            </h3>
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg overflow-hidden bg-white">
              {faqItems.map((item, i) => (
                <div key={i} itemScope itemType="https://schema.org/Question">
                  <button
                    type="button"
                    onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full px-4 py-3 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 flex justify-between items-center"
                  >
                    <span itemProp="name">{item.q}</span>
                    <span className="text-slate-400 shrink-0 ml-2">
                      {faqOpen === i ? "▲" : "▼"}
                    </span>
                  </button>
                  {faqOpen === i && (
                    <div
                      itemProp="acceptedAnswer"
                      itemScope
                      itemType="https://schema.org/Answer"
                      className="px-4 py-3 bg-slate-50 text-base leading-relaxed text-gray-700 border-t border-slate-100"
                    >
                      <p itemProp="text">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <DonationLite />

          {/* 隱私說明（最底部） */}
          <section className="mt-6 p-4 rounded-lg bg-slate-100 text-sm text-slate-700">
            <h3 className="font-medium text-slate-900 mb-2">
              {t("resize_privacy_title")}
            </h3>
            <p>{t("resize_privacy_desc")}</p>
          </section>

          <section className="mt-12 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              {t("imageResizeExtra.what_title")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {t("imageResizeExtra.what_p")}
            </p>

            <h2 className="mt-6 text-xl font-semibold text-slate-900">
              {t("imageResizeExtra.why_title")}
            </h2>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-sm text-slate-600">
              <li>{t("imageResizeExtra.why_li1")}</li>
              <li>{t("imageResizeExtra.why_li2")}</li>
              <li>{t("imageResizeExtra.why_li3")}</li>
            </ul>

            <PhotoRoomAffiliateBlock />

            <RelatedTools
              items={getRelatedToolsItems("image-resize")}
              title={t("related_tools_section_title")}
            />
            <RelatedGuides items={getRelatedGuideItems("image-resize")} />
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {t("imageResizeExtra.seo_bottom")}
            </p>
            <div className="mt-8">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold !text-white hover:!text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-[0.98]"
              >
                {t("batch1_tools_hub_cta")}
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* 導流提示卡（下載完成後顯示） */}
      {showCrossPromo && (
        <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setShowCrossPromo(false);
              if (crossPromoTimerRef.current) {
                clearTimeout(crossPromoTimerRef.current);
                crossPromoTimerRef.current = null;
              }
            }}
            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            aria-label={t("resize_promo_close")}
          >
            ✕
          </button>
          <h4 className="text-sm font-semibold text-slate-800 pr-6">
            {t("resize_promo_title")}
          </h4>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {t("resize_promo_desc")}
          </p>
          <Link
            to="/summary"
            onClick={() =>
              trackEvent("crosspromo_click_summary", { source: "image_resize" })
            }
            className="mt-3 block w-full rounded-lg bg-blue-600 py-2 text-center text-sm font-medium !text-white hover:!text-white hover:bg-blue-700 transition"
          >
            {t("resize_promo_btn")}
          </Link>
        </div>
      )}
    </>
  );
}
