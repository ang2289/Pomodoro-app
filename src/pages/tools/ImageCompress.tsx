import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { RelatedGuides } from "@/components/seo/RelatedGuides";
import {
  getRelatedGuideItems,
  getRelatedToolsItems,
} from "@/data/internalLinks";
import JSZip from "jszip";

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

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
type OutputFormat = "jpg" | "webp" | "png";

type ProcessedImage = {
  id: string;
  file: File;
  originalUrl: string;
  compressedUrl: string;
  compressedBlob: Blob;
  width: number;
  height: number;
  outputMimeType: string;
};

type FAQItem = {
  q: string;
  a: string;
};

const MIME_MAP: Record<OutputFormat, string> = {
  jpg: "image/jpeg",
  webp: "image/webp",
  png: "image/png",
};

const EXT_MAP: Record<OutputFormat, "jpg" | "webp" | "png"> = {
  jpg: "jpg",
  webp: "webp",
  png: "png",
};

function formatBytes(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${size.toFixed(i === 0 ? 0 : 2)} ${units[i]}`;
}

function clampQuality(value: number): number {
  if (Number.isNaN(value)) return 0.8;
  return Math.min(1, Math.max(0.1, value));
}

/** Stable error codes for i18n mapping */
const IC_ERR = {
  LOAD: "IC_LOAD",
  CANVAS: "IC_CANVAS",
  COMPRESS: "IC_COMPRESS",
} as const;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(IC_ERR.LOAD));
    };

    image.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(IC_ERR.COMPRESS));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

function getOutputLabel(mimeType: string): "JPG" | "WebP" | "PNG" {
  if (mimeType === "image/jpeg") return "JPG";
  if (mimeType === "image/png") return "PNG";
  return "WebP";
}

function getFileExtFromMimeType(mimeType: string): "jpg" | "webp" | "png" {
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/png") return "png";
  return "jpg";
}

async function exportBlobForFile(
  file: File,
  targetQuality: number,
  format: OutputFormat,
): Promise<Blob> {
  const image = await loadImageFromFile(file);
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error(IC_ERR.CANVAS);
  ctx.drawImage(image, 0, 0);

  const mimeType = MIME_MAP[format];
  const useQuality = mimeType === "image/jpeg" || mimeType === "image/webp";
  return canvasToBlob(canvas, mimeType, useQuality ? targetQuality : undefined);
}

function mapCompressError(message: string, t: (k: string) => string): string {
  if (message === IC_ERR.LOAD) return t("imageCompress.err_load");
  if (message === IC_ERR.CANVAS) return t("imageCompress.err_canvas");
  if (message === IC_ERR.COMPRESS) return t("imageCompress.err_compress");
  return t("imageCompress.err_generic");
}

export default function ImageCompress() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<ProcessedImage[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [quality, setQuality] = useState<number>(0.8);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("jpg");
  const [error, setError] = useState<string>("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipError, setZipError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeItem = items[activeIndex] ?? null;
  const sourceSize = activeItem?.file.size ?? 0;
  const compressedSize = activeItem?.compressedBlob.size ?? 0;
  const savedBytes = Math.max(sourceSize - compressedSize, 0);
  const savedPercent = sourceSize > 0 ? (savedBytes / sourceSize) * 100 : 0;
  const totalSourceSize = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );
  const totalCompressedSize = useMemo(
    () => items.reduce((sum, item) => sum + item.compressedBlob.size, 0),
    [items],
  );
  const totalSavedBytes = Math.max(totalSourceSize - totalCompressedSize, 0);
  const totalSavedPercent =
    totalSourceSize > 0 ? (totalSavedBytes / totalSourceSize) * 100 : 0;
  const outputFormatLabel =
    outputFormat === "jpg" ? "JPG" : outputFormat === "webp" ? "WebP" : "PNG";

  useEffect(() => {
    return () => {
      for (const item of items) {
        URL.revokeObjectURL(item.originalUrl);
        URL.revokeObjectURL(item.compressedUrl);
      }
    };
  }, [items]);

  const compressSingleFile = async (
    file: File,
    targetQuality: number,
    format: OutputFormat,
  ): Promise<ProcessedImage> => {
    const image = await loadImageFromFile(file);
    const blob = await exportBlobForFile(file, targetQuality, format);
    const outputMimeType = MIME_MAP[format];

    return {
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      originalUrl: URL.createObjectURL(file),
      compressedUrl: URL.createObjectURL(blob),
      compressedBlob: blob,
      width: image.naturalWidth,
      height: image.naturalHeight,
      outputMimeType,
    };
  };

  const processFiles = async (
    files: File[],
    targetQuality: number,
    format: OutputFormat,
  ) => {
    if (files.length === 0) return;
    setIsCompressing(true);
    setError("");
    try {
      const validFiles = files.filter((file) =>
        ACCEPTED_TYPES.includes(file.type),
      );
      if (validFiles.length !== files.length) {
        setError(t("imageCompress.err_partial"));
      }

      const nextItems: ProcessedImage[] = [];
      for (const file of validFiles) {
        // 逐一處理，避免同時解碼太多圖片造成 UI 卡頓
        const processed = await compressSingleFile(file, targetQuality, format);
        nextItems.push(processed);
      }

      setItems((prev) => {
        for (const item of prev) {
          URL.revokeObjectURL(item.originalUrl);
          URL.revokeObjectURL(item.compressedUrl);
        }
        return nextItems;
      });
      setActiveIndex(0);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(mapCompressError(msg, t));
      setItems((prev) => {
        for (const item of prev) {
          URL.revokeObjectURL(item.originalUrl);
          URL.revokeObjectURL(item.compressedUrl);
        }
        return [];
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList) return;
    await processFiles(Array.from(fileList), quality, outputFormat);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    await handleFilesSelected(event.target.files);
    event.target.value = "";
  };

  const handleQualityChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const nextQuality = clampQuality(Number(event.target.value));
    setQuality(nextQuality);

    if (items.length > 0) {
      await processFiles(
        items.map((item) => item.file),
        nextQuality,
        outputFormat,
      );
    }
  };

  const handleOutputFormatChange = async (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const nextFormat = event.target.value as OutputFormat;
    setOutputFormat(nextFormat);

    if (items.length > 0) {
      await processFiles(
        items.map((item) => item.file),
        quality,
        nextFormat,
      );
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    await handleFilesSelected(event.dataTransfer.files);
  };

  const handleDownload = () => {
    if (!activeItem) return;

    const link = document.createElement("a");
    const ext = getFileExtFromMimeType(activeItem.outputMimeType);
    const baseName = activeItem.file.name.replace(/\.[^.]+$/, "");
    link.href = activeItem.compressedUrl;
    link.download = `${baseName}-compressed.${ext}`;
    link.click();
  };

  const handleDownloadSingle = (item: ProcessedImage) => {
    const link = document.createElement("a");
    const ext = getFileExtFromMimeType(item.outputMimeType);
    const baseName = item.file.name.replace(/\.[^.]+$/, "");
    link.href = item.compressedUrl;
    link.download = `${baseName}-compressed.${ext}`;
    link.click();
  };

  const handleDownloadZip = async () => {
    if (items.length === 0 || isZipping) return;
    setZipError("");
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const extension = EXT_MAP[outputFormat];
      for (const item of items) {
        const blob = await exportBlobForFile(item.file, quality, outputFormat);
        const baseName = item.file.name.replace(/\.[^.]+$/, "");
        zip.file(`${baseName}-compressed.${extension}`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(zipBlob);
      link.download = "compressed-images.zip";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      setZipError(t("imageCompress.err_zip"));
    } finally {
      setIsZipping(false);
    }
  };

  const faqItems: FAQItem[] = useMemo(() => {
    const base: FAQItem[] = [
      { q: t("imageCompress.faq.q1"), a: t("imageCompress.faq.a1") },
    ];
    const pushIfMissing = (q: string, a: string, keywords: string[]) => {
      const hasSimilar = base.some((item) =>
        keywords.some((keyword) =>
          item.q.toLowerCase().includes(keyword.toLowerCase()),
        ),
      );
      if (!hasSimilar) base.push({ q, a });
    };
    pushIfMissing(t("imageCompress.faq.q2"), t("imageCompress.faq.a2"), [
      "畫質",
      "quality",
      "壓縮",
    ]);
    pushIfMissing(t("imageCompress.faq.q3"), t("imageCompress.faq.a3"), [
      "webp",
      "jpg",
      "網站",
      "site",
    ]);
    pushIfMissing(t("imageCompress.faq.q4"), t("imageCompress.faq.a4"), [
      "png",
      "很大",
      "lossless",
    ]);
    return base;
  }, [t]);

  const canonicalUrl =
    "https://pomodoro-app-eight-rouge.vercel.app/tools/image-compress";
  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.a,
        },
      })),
    }),
    [faqItems],
  );
  const webPageJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: t("imageCompress.jsonLd.webName"),
      description: t("imageCompress.jsonLd.webDesc"),
      url: canonicalUrl,
      inLanguage: i18n.language?.startsWith("zh") ? "zh-TW" : "en",
    }),
    [t, i18n.language],
  );
  const softwareJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: t("imageCompress.jsonLd.webName"),
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      description: t("imageCompress.jsonLd.appDesc"),
      url: canonicalUrl,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "TWD",
      },
    }),
    [t],
  );

  return (
    <>
      <SEO
        title={t("imageCompress.seo.title")}
        description={t("imageCompress.seo.description")}
        keywords={t("imageCompress.seo.keywords")}
        path="/tools/image-compress"
        jsonLdList={[webPageJsonLd, softwareJsonLd, faqJsonLd]}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
          {t("imageCompress.h1")}
        </h1>
        <p className="mt-3 text-slate-600">{t("imageCompress.intro")}</p>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <div
            className={`rounded-xl border-2 border-dashed p-4 transition ${
              isDragging ? "border-blue-400 bg-blue-50" : "border-transparent"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-blue-200 px-4 py-2 text-blue-600 hover:bg-blue-50">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                    multiple
                  />
                  {t("imageCompress.upload")}
                </label>
                <p className="mt-2 text-xs text-slate-500">
                  {t("imageCompress.upload_hint")}
                </p>
              </div>
              <div className="w-full md:w-[320px]">
                <label
                  htmlFor="output-format"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  {t("imageCompress.output_format")}
                </label>
                <select
                  id="output-format"
                  value={outputFormat}
                  onChange={handleOutputFormatChange}
                  className="mb-3 w-full rounded-lg border border-blue-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none"
                >
                  <option value="jpg">{t("imageCompress.opt_jpg")}</option>
                  <option value="webp">{t("imageCompress.opt_webp")}</option>
                  <option value="png">{t("imageCompress.opt_png")}</option>
                </select>
                <label
                  htmlFor="quality"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  {t("imageCompress.quality", { v: quality.toFixed(1) })}
                </label>
                <input
                  id="quality"
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={quality}
                  onChange={handleQualityChange}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            {t("imageCompress.format_note_jpg")}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {t("imageCompress.format_note_webp")}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {t("imageCompress.format_note_png")}
          </p>
          {outputFormat === "png" ? (
            <div className="mt-2 rounded-md border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-700">
              <p>{t("imageCompress.png_warn_title")}</p>
              <p>{t("imageCompress.png_warn_body")}</p>
            </div>
          ) : null}
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              {t("imageCompress.original")}
            </h2>
            <div className="flex min-h-[240px] items-center justify-center overflow-hidden rounded-xl bg-slate-50">
              {activeItem ? (
                <img
                  src={activeItem.originalUrl}
                  alt={t("imageCompress.alt_original")}
                  className="max-h-[420px] w-auto object-contain"
                />
              ) : (
                <p className="text-sm text-slate-500">
                  {t("imageCompress.please_upload")}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              {t("imageCompress.compressed")}
            </h2>
            <div className="flex min-h-[240px] items-center justify-center overflow-hidden rounded-xl bg-slate-50">
              {isCompressing ? (
                <p className="text-sm text-slate-500">
                  {t("imageCompress.compressing")}
                </p>
              ) : activeItem ? (
                <img
                  src={activeItem.compressedUrl}
                  alt={t("imageCompress.alt_compressed")}
                  className="max-h-[420px] w-auto object-contain"
                />
              ) : (
                <p className="text-sm text-slate-500">
                  {t("imageCompress.no_result")}
                </p>
              )}
            </div>
          </div>
        </section>

        {items.length > 1 ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              {t("imageCompress.batch_title")}
            </h2>
            <div className="space-y-2">
              {items.map((item, index) => {
                const itemSavedBytes = Math.max(
                  item.file.size - item.compressedBlob.size,
                  0,
                );
                const itemSavedPercent =
                  item.file.size > 0
                    ? (itemSavedBytes / item.file.size) * 100
                    : 0;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      index === activeIndex
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <p className="font-medium text-slate-800">
                      {item.file.name}
                    </p>
                    <p className="mt-1 text-slate-600">
                      {t("imageCompress.orig_size", {
                        v: formatBytes(item.file.size),
                      })}
                    </p>
                    <p className="text-slate-600">
                      {t("imageCompress.comp_size", {
                        v: formatBytes(item.compressedBlob.size),
                      })}
                    </p>
                    <p className="text-slate-600">
                      {t("imageCompress.saved", {
                        v: formatBytes(itemSavedBytes),
                      })}
                    </p>
                    <p className="text-slate-600">
                      {t("imageCompress.saved_pct", {
                        v: itemSavedPercent.toFixed(2),
                      })}
                    </p>
                    <p className="text-slate-600">
                      {t("imageCompress.out_fmt", {
                        v: getOutputLabel(item.outputMimeType),
                      })}
                    </p>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDownloadSingle(item);
                        }}
                        className="rounded-lg border border-blue-200 px-3 py-1.5 text-blue-600 hover:bg-blue-50"
                      >
                        {t("imageCompress.download_this")}
                      </button>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-slate-700">
              <p>
                {t("imageCompress.orig_size", { v: formatBytes(sourceSize) })}
              </p>
              <p>
                {t("imageCompress.comp_size", {
                  v: formatBytes(compressedSize),
                })}
              </p>
              <p>{t("imageCompress.saved", { v: formatBytes(savedBytes) })}</p>
              <p>
                {t("imageCompress.saved_pct", { v: savedPercent.toFixed(2) })}
              </p>
              <p>
                {t("imageCompress.out_fmt", {
                  v: activeItem
                    ? getOutputLabel(activeItem.outputMimeType)
                    : "-",
                })}
              </p>
              <p>
                {t("imageCompress.dim", {
                  v: activeItem
                    ? `${activeItem.width} × ${activeItem.height}`
                    : "-",
                  v2: activeItem
                    ? `${activeItem.width} × ${activeItem.height}`
                    : "-",
                })}
              </p>
              {items.length > 1 ? (
                <p className="pt-1 text-slate-800">
                  {t("imageCompress.batch_total", {
                    o: formatBytes(totalSourceSize),
                    c: formatBytes(totalCompressedSize),
                    s: formatBytes(totalSavedBytes),
                    p: totalSavedPercent.toFixed(2),
                  })}
                </p>
              ) : null}
              <p className="pt-1">
                {t("imageCompress.processed_n", { n: items.length })}
              </p>
              <p>{t("imageCompress.zip_will", { v: outputFormatLabel })}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="self-start rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {t("imageCompress.current_fmt", { v: outputFormatLabel })}
              </div>
              <button
                type="button"
                onClick={handleDownload}
                disabled={!activeItem}
                className="rounded-lg bg-blue-600 px-4 py-2 !text-white hover:bg-blue-700 hover:!text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("imageCompress.download_one")}
              </button>
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={items.length === 0 || isZipping}
                className="rounded-lg border border-blue-200 px-4 py-2 text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isZipping
                  ? t("imageCompress.zipping")
                  : t("imageCompress.download_zip")}
              </button>
              {items.length === 0 ? (
                <p className="text-xs text-slate-500">
                  {t("imageCompress.zip_need_files")}
                </p>
              ) : null}
              {zipError ? (
                <p className="text-xs text-red-600">{zipError}</p>
              ) : null}
            </div>
          </div>
        </section>

        {/* --- 新增：輕量贊助區塊（避免干擾使用者） --- */}
        <section className="mt-8 rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <div className="text-center">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              ❤️ 支持免費工具開發
            </h2>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              如果這個圖片壓縮工具有幫助到你，可以小額支持；不用也沒關係，有幫助再支持就好
              🙌
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
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
        {/* --- 輕量贊助區塊結束 --- */}

        <section className="mt-12">
          <h2 className="text-xl font-semibold mb-4">
            {t("imageCompress.how_title")}
          </h2>
          <p className="text-gray-600 mb-2 leading-relaxed">
            <span className="font-medium text-gray-800">
              {t("imageCompress.who_label")}
            </span>
            {t("imageCompress.who")}
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed">
            {t("imageCompress.how_p")}
          </p>

          <h3 className="font-semibold mt-4 mb-2">
            {t("imageCompress.steps_title")}
          </h3>
          <ol className="list-decimal ml-5 text-gray-600 space-y-1">
            <li>{t("imageCompress.s1")}</li>
            <li>{t("imageCompress.s2")}</li>
            <li>{t("imageCompress.s3")}</li>
            <li>{t("imageCompress.s4")}</li>
          </ol>

          <h3 className="font-semibold mt-4 mb-2">
            {t("imageCompress.use_cases_title")}
          </h3>
          <ul className="list-disc ml-5 text-gray-600 space-y-1">
            <li>{t("imageCompress.uc1")}</li>
            <li>{t("imageCompress.uc2")}</li>
            <li>{t("imageCompress.uc3")}</li>
          </ul>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("imageCompress.faq_title")}
          </h2>
          <div className="mt-3 space-y-3 text-sm text-slate-700">
            {faqItems.map((item) => (
              <div key={item.q}>
                <p className="font-medium text-slate-900">{item.q}</p>
                <p>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("imageCompress.rec_title")}
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            {t("imageCompress.rec_p")}{" "}
            <Link
              to="/tools/image-resize"
              className="text-blue-600 hover:underline"
            >
              {t("imageCompress.rec_resize")}
            </Link>
            {t("imageCompress.rec_mid")}
            <Link to="/tools/qr-code" className="text-blue-600 hover:underline">
              {t("imageCompress.rec_qr")}
            </Link>
            {t("imageCompress.rec_tail")}
            <Link to="/summary" className="text-blue-600 hover:underline">
              {t("imageCompress.rec_ai")}
            </Link>
            {t("imageCompress.rec_end")}
          </p>
          <PhotoRoomAffiliateBlock />
          <RelatedTools
            items={getRelatedToolsItems("image-compress")}
            title={t("related_tools_section_title")}
          />
          <RelatedGuides items={getRelatedGuideItems("image-compress")} />
        </section>
      </div>
    </>
  );
}
