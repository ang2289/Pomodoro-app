import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import JSZip from "jszip";
import { useTranslation } from "react-i18next";
import SEO, { getBaseUrl } from "@/components/SEO";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { RelatedGuides } from "@/components/seo/RelatedGuides";
import {
  getRelatedGuideItems,
  getRelatedToolsItems,
} from "@/data/internalLinks";

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

function DonationLite() {
  return (
    <section className="mt-10 mb-12 rounded-2xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
      <div className="text-center">
        <h2 className="text-base font-black text-slate-900 tracking-tight">
          ❤️ 支持免費工具開發
        </h2>
        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
          如果這個工具有幫助到你，可以小額支持；不用也沒關係，有幫助再支持就好 🙌
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <a
          href="https://p.ecpay.com.tw/FD7CD6D"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-black !text-white shadow-md transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-amber-600 hover:!text-white hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
        >
          ☕ 台灣小額支持
        </a>
        <a
          href="https://ko-fi.com/ang2289"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md transition duration-200 ease-out hover:-translate-y-0.5 hover:bg-blue-700 hover:!text-white hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
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

const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

export type OutputMime = "image/jpeg" | "image/png" | "image/webp";

type PresetId =
  | "png-jpg"
  | "jpg-png"
  | "png-webp"
  | "webp-png"
  | "jpg-webp"
  | "webp-jpg";

const PRESET: Record<
  PresetId,
  {
    labelKey: string;
    inputHint: ("image/png" | "image/jpeg" | "image/webp")[];
    out: OutputMime;
  }
> = {
  "png-jpg": {
    labelKey: "imageConvert.preset_png_jpg",
    inputHint: ["image/png"],
    out: "image/jpeg",
  },
  "jpg-png": {
    labelKey: "imageConvert.preset_jpg_png",
    inputHint: ["image/jpeg"],
    out: "image/png",
  },
  "png-webp": {
    labelKey: "imageConvert.preset_png_webp",
    inputHint: ["image/png"],
    out: "image/webp",
  },
  "webp-png": {
    labelKey: "imageConvert.preset_webp_png",
    inputHint: ["image/webp"],
    out: "image/png",
  },
  "jpg-webp": {
    labelKey: "imageConvert.preset_jpg_webp",
    inputHint: ["image/jpeg"],
    out: "image/webp",
  },
  "webp-jpg": {
    labelKey: "imageConvert.preset_webp_jpg",
    inputHint: ["image/webp"],
    out: "image/jpeg",
  },
};

function extFromMime(m: string): string {
  if (m === "image/png") return "png";
  if (m === "image/webp") return "webp";
  return "jpg";
}

function labelFromMime(m: string): string {
  if (m === "image/png") return "PNG";
  if (m === "image/webp") return "WebP";
  return "JPG";
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("LOAD"));
    };
    img.src = url;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (!b) reject(new Error("BLOB"));
        else resolve(b);
      },
      type,
      quality,
    );
  });
}

async function convertFile(
  file: File,
  outMime: OutputMime,
  quality: number,
): Promise<Blob> {
  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS");

  if (outMime === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  const q =
    outMime === "image/png" ? undefined : Math.min(1, Math.max(0.1, quality));
  return canvasToBlob(canvas, outMime, q);
}

type Row = {
  id: string;
  file: File;
  blob: Blob;
  url: string;
  outMime: OutputMime;
};

/** ZIP 內檔名：來源主檔名 + 輸出副檔名；重名時加上 (2)、(3)… */
function zipEntryNamesForRows(rows: Row[]): string[] {
  const counts = new Map<string, number>();
  return rows.map((row) => {
    const stem = row.file.name.replace(/\.[^.]+$/, "") || row.file.name;
    const ext = extFromMime(row.outMime);
    const candidate = `${stem}.${ext}`;
    const key = candidate.toLowerCase();
    const n = counts.get(key) ?? 0;
    counts.set(key, n + 1);
    if (n === 0) return candidate;
    return `${stem} (${n + 1}).${ext}`;
  });
}

export default function ImageConvert() {
  const { t, i18n } = useTranslation();
  const inLang = i18n.language?.startsWith("en") ? "en-US" : "zh-TW";
  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const path = "/tools/image-convert";

  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [quality, setQuality] = useState(0.92);
  const [preset, setPreset] = useState<PresetId>("png-jpg");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [zipBusy, setZipBusy] = useState(false);
  const [zipError, setZipError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const outMime = PRESET[preset].out;

  const revokeRows = useCallback((list: Row[]) => {
    for (const r of list) URL.revokeObjectURL(r.url);
  }, []);

  useEffect(() => {
    return () => revokeRows(rows);
  }, [rows, revokeRows]);

  const pickValidFiles = (files: File[]) => {
    const hint = PRESET[preset].inputHint;
    return files.filter(
      (f) =>
        ACCEPT.includes(f.type) &&
        hint.includes(f.type as "image/png" | "image/jpeg" | "image/webp"),
    );
  };

  const handleFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const all = Array.from(list);
    const valid = pickValidFiles(all);
    if (valid.length === 0) {
      setError(t("imageConvert.err_type"));
      return;
    }
    if (valid.length < all.length) setError(t("imageConvert.err_partial"));
    else setError("");
    setSourceFiles(valid);
  };

  useEffect(() => {
    if (sourceFiles.length === 0) {
      setRows((prev) => {
        revokeRows(prev);
        return [];
      });
      return;
    }
    let cancelled = false;
    (async () => {
      setBusy(true);
      setError("");
      try {
        const next: Row[] = [];
        for (const file of sourceFiles) {
          const blob = await convertFile(file, outMime, quality);
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          next.push({
            id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
            file,
            blob,
            url,
            outMime,
          });
        }
        if (!cancelled) {
          setRows((prev) => {
            revokeRows(prev);
            return next;
          });
        }
      } catch {
        if (!cancelled) {
          setError(t("imageConvert.err_generic"));
          setRows((prev) => {
            revokeRows(prev);
            return [];
          });
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceFiles, outMime, quality, revokeRows]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  useEffect(() => {
    setSourceFiles((prev) => {
      const hint = PRESET[preset].inputHint;
      return prev.filter((f) =>
        hint.includes(f.type as "image/png" | "image/jpeg" | "image/webp"),
      );
    });
  }, [preset]);

  const faqSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: t("imageConvert.faq.q1"),
          acceptedAnswer: { "@type": "Answer", text: t("imageConvert.faq.a1") },
        },
        {
          "@type": "Question",
          name: t("imageConvert.faq.q2"),
          acceptedAnswer: { "@type": "Answer", text: t("imageConvert.faq.a2") },
        },
        {
          "@type": "Question",
          name: t("imageConvert.faq.q3"),
          acceptedAnswer: { "@type": "Answer", text: t("imageConvert.faq.a3") },
        },
        {
          "@type": "Question",
          name: t("imageConvert.faq.q4"),
          acceptedAnswer: { "@type": "Answer", text: t("imageConvert.faq.a4") },
        },
      ],
    }),
    [t],
  );

  const breadcrumbSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: t("nav_home"),
          item: `${baseUrl}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: t("nav.breadcrumb.toolsHub"),
          item: `${baseUrl}/tools`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: t("imageConvert.jsonLd.webName"),
          item: `${baseUrl}${path}`,
        },
      ],
    }),
    [baseUrl, t],
  );

  const webPageSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: t("imageConvert.h1"),
      description: t("imageConvert.seo.description"),
      url: `${baseUrl}${path}`,
      inLanguage: inLang,
    }),
    [baseUrl, inLang, t],
  );

  const relatedTools = useMemo(() => getRelatedToolsItems("image-convert"), []);
  const relatedGuides = useMemo(
    () => getRelatedGuideItems("image-convert"),
    [],
  );

  const handleDownloadAllZip = useCallback(async () => {
    if (rows.length === 0 || busy || zipBusy) return;
    setZipError("");
    setZipBusy(true);
    try {
      const zip = new JSZip();
      const names = zipEntryNamesForRows(rows);
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const name = names[i];
        if (row && name) zip.file(name, row.blob);
      }
      const outBlob = await zip.generateAsync({ type: "blob" });
      const blobUrl = URL.createObjectURL(outBlob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = "rxv-image-convert-batch.zip";
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      setZipError(t("imageConvert.zip_error"));
    } finally {
      setZipBusy(false);
    }
  }, [rows, busy, zipBusy, t]);

  const handleClearResults = useCallback(() => {
    setZipError("");
    setError("");
    setSourceFiles([]);
  }, []);

  const canDownloadZip = rows.length > 0 && !busy && !zipBusy;
  const canClear = sourceFiles.length > 0 || rows.length > 0;

  const acceptAttr = PRESET[preset].inputHint.join(",");

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 md:py-10">
      <SEO
        title={t("imageConvert.seo.title")}
        description={t("imageConvert.seo.description")}
        path={path}
        jsonLdList={[webPageSchema, breadcrumbSchema, faqSchema]}
      />

      <nav className="mb-6 text-sm text-slate-500">
        <a href="/" className="text-blue-600 hover:underline">
          {t("nav_home")}
        </a>
        <span className="mx-2">/</span>
        <a href="/tools" className="text-blue-600 hover:underline">
          {t("nav.breadcrumb.toolsHub")}
        </a>
        <span className="mx-2">/</span>
        <span className="text-slate-700">
          {t("imageConvert.jsonLd.webName")}
        </span>
      </nav>

      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
        {t("imageConvert.h1")}
      </h1>
      <p className="mt-3 text-slate-600 leading-relaxed">
        {t("imageConvert.intro")}
      </p>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {t("imageConvert.preset_title")}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(PRESET) as PresetId[]).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPreset(id)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                preset === id
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
              }`}
            >
              {t(PRESET[id].labelKey)}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {t("imageConvert.preset_hint", { fmt: labelFromMime(outMime) })}
        </p>

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-800">
            {t("imageConvert.quality", { v: quality.toFixed(2) })}
          </label>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.02}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            disabled={outMime === "image/png"}
            className="mt-2 w-full max-w-md disabled:opacity-40"
          />
          {outMime === "image/png" ? (
            <p className="mt-1 text-xs text-slate-500">
              {t("imageConvert.png_lossless")}
            </p>
          ) : null}
        </div>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50/50"
              : "border-slate-200 bg-slate-50/80 hover:border-slate-300"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            multiple
            className="hidden"
            onChange={handleChange}
          />
          <span className="text-base font-medium text-slate-800">
            {t("imageConvert.upload")}
          </span>
          <span className="mt-1 text-sm text-slate-500">
            {t("imageConvert.upload_hint")}
          </span>
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {busy ? (
          <p className="mt-3 text-sm text-blue-600">
            {t("imageConvert.converting")}
          </p>
        ) : null}
      </section>

      {rows.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900">
            {t("imageConvert.results")}
          </h2>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleDownloadAllZip()}
                disabled={!canDownloadZip}
                className="inline-flex min-h-[2.5rem] items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold !text-white hover:!text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {zipBusy
                  ? t("imageConvert.zipping")
                  : t("imageConvert.download_all_zip")}
              </button>
              <button
                type="button"
                onClick={handleClearResults}
                disabled={!canClear || zipBusy}
                className="inline-flex min-h-[2.5rem] items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("imageConvert.clear_results")}
              </button>
            </div>
          </div>
          {zipError ? (
            <p className="mt-2 text-sm text-red-600">{zipError}</p>
          ) : null}
          <ul className="mt-4 space-y-4">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 md:flex-row md:items-center"
              >
                <img
                  src={r.url}
                  alt=""
                  className="h-24 w-auto max-w-full rounded border border-slate-100 object-contain"
                />
                <div className="min-w-0 flex-1 text-sm text-slate-600">
                  <p className="font-medium text-slate-800">{r.file.name}</p>
                  <p>
                    {t("imageConvert.out_label")}: {labelFromMime(r.outMime)} ·{" "}
                    {t("imageConvert.size_out", {
                      v: (r.blob.size / 1024).toFixed(1),
                    })}
                  </p>
                </div>
                <a
                  href={r.url}
                  download={`${r.file.name.replace(/\.[^.]+$/, "")}-converted.${extFromMime(r.outMime)}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-blue-600 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                >
                  {t("imageConvert.download")}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <DonationLite />

      <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {t("imageConvert.faq_title")}
        </h2>
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          <div>
            <p className="font-medium text-slate-900">
              {t("imageConvert.faq.q1")}
            </p>
            <p>{t("imageConvert.faq.a1")}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {t("imageConvert.faq.q2")}
            </p>
            <p>{t("imageConvert.faq.a2")}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {t("imageConvert.faq.q3")}
            </p>
            <p>{t("imageConvert.faq.a3")}</p>
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {t("imageConvert.faq.q4")}
            </p>
            <p>{t("imageConvert.faq.a4")}</p>
          </div>
        </div>
      </section>

      <PhotoRoomAffiliateBlock />
      <RelatedTools items={relatedTools} title={t("imageConvert.rec_title")} />
      <RelatedGuides items={relatedGuides} />
    </div>
  );
}
