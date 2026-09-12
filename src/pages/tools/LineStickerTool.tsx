import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import LineStickerAuthorCard from "@/components/LineStickerAuthorCard";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { RelatedGuides } from "@/components/seo/RelatedGuides";
import {
  getRelatedGuideItems,
  getRelatedToolsItems,
} from "@/data/internalLinks";
import JSZip from "jszip";
import { saveAs } from "file-saver";

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
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-amber-600 hover:!text-white active:scale-[0.98] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
        >
          ☕ 台灣小額支持
        </a>
        <a
          href="https://ko-fi.com/ang2289"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-blue-700 hover:!text-white active:scale-[0.98] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
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

function LineStickerGuideEntry() {
  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black tracking-widest text-white">
          新手教學
        </span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black text-emerald-700">
          LINE 貼圖上架流程
        </span>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.35fr_0.65fr] md:items-center">
        <div>
          <h2 className="text-xl font-black leading-tight text-slate-900">
            第一次做 LINE 貼圖？先看完整教學再開始
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            從 AI 生圖、去背、切圖、壓縮、命名到 ZIP
            打包，一步一步整理成新手也看得懂的流程。你可以先看教學，再回到本工具上傳圖片製作上架包。
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/80 p-3 text-center font-bold shadow-sm">
              ① AI 生圖
            </div>
            <div className="rounded-2xl bg-white/80 p-3 text-center font-bold shadow-sm">
              ② 去背修圖
            </div>
            <div className="rounded-2xl bg-white/80 p-3 text-center font-bold shadow-sm">
              ③ 切圖壓縮
            </div>
            <div className="rounded-2xl bg-white/80 p-3 text-center font-bold shadow-sm">
              ④ ZIP 上架
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/tools/line-sticker-guide"
            className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-blue-700 hover:!text-white active:scale-[0.98] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
          >
            📘 查看完整教學
          </Link>
          <a
            href="#line-sticker-quick-guide"
            className="inline-flex items-center justify-center rounded-2xl border border-blue-200 bg-white px-5 py-3 text-sm font-black text-blue-700 shadow-sm transition hover:bg-blue-50 duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-100 duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
          >
            先看本頁快速教學
          </a>
        </div>
      </div>
    </section>
  );
}

function StickerWorkflowAssist() {
  return (
    <section className="mb-6 overflow-hidden rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="rounded-full bg-violet-600 px-3 py-1 text-[10px] font-black tracking-widest text-white">
          貼圖流程
        </span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-700">
          新功能規劃中
        </span>
      </div>
      <h2 className="text-xl font-black leading-tight text-slate-900">
        不知道怎麼生圖、切圖、整理上架？照這 4 步驟做
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">
        先產生貼圖提示詞，再把 AI 產出的 4x4 或 4x5
        大圖切開，最後回到本工具整理尺寸與 ZIP
        上架包。本站已提供提示詞、圖片分割與整理打包工具，照流程即可完成上架素材。
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
        <Link
          to="/tools/sticker-prompt"
          className="rounded-2xl bg-white/90 p-4 text-center shadow-sm transition hover:shadow-md duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-100"
        >
          <p className="text-2xl">①</p>
          <p className="mt-1 text-xs font-black text-slate-900">產生提示詞</p>
          <p className="mt-1 text-[11px] text-slate-500">
            情侶／品牌／遊戲／寵物
          </p>
        </Link>
        <div className="rounded-2xl bg-white/80 p-4 text-center shadow-sm">
          <p className="text-2xl">②</p>
          <p className="mt-1 text-xs font-black text-slate-900">AI 生圖</p>
          <p className="mt-1 text-[11px] text-slate-500">
            產生 4x4 或 4x5 大圖
          </p>
        </div>
        <Link
          to="/tools/sticker-splitter"
          className="rounded-2xl bg-white/90 p-4 text-center shadow-sm transition hover:shadow-md duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-100"
        >
          <p className="text-2xl">③</p>
          <p className="mt-1 text-xs font-black text-slate-900">本站圖片分割</p>
          <p className="mt-1 text-[11px] text-slate-500">支援 4×4／5×4 與拖曳線</p>
        </Link>
        <a
          href="#line-sticker-pack-tool"
          className="rounded-2xl bg-white/90 p-4 text-center shadow-sm transition hover:shadow-md duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-100"
        >
          <p className="text-2xl">④</p>
          <p className="mt-1 text-xs font-black text-slate-900">回來整理 ZIP</p>
          <p className="mt-1 text-[11px] text-slate-500">尺寸整理與打包</p>
        </a>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/tools/sticker-prompt"
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-violet-700 hover:!text-white active:scale-[0.98] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
        >
          ✨ 先產生貼圖提示詞
        </Link>
        <a
          href={PHOTOROOM_BG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-purple-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-purple-700 hover:!text-white duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
          style={{ color: "#ffffff" }}
        >
          🪄 PhotoRoom 去背
        </a>
        <Link
          to="/tools/sticker-splitter"
          className="inline-flex flex-1 items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-emerald-700 hover:!text-white duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
          style={{ color: "#ffffff" }}
        >
          🔪 本站圖片分割工具
        </Link>
      </div>
    </section>
  );
}

const ACCEPT_TYPES = ["image/png", "image/jpeg", "image/webp"];
const STICKER_SIZES = [8, 16, 24, 32, 40] as const;
const STICKER_BODY = { width: 370, height: 320 };
const PREVIEW_CARD_CANVAS = { width: 520, height: 450 };
const MAIN_IMG = { width: 240, height: 240 };
const TAB_IMG = { width: 96, height: 74 };
const ZIP_FILENAME = "line-sticker-ready.zip";
const PHOTOROOM_BG_URL = "https://www.photoroom.com/zh-tw/tools/background-remover";
const PHOTOROOM_AI_URL = "https://www.photoroom.com/zh-tw/tools/ai-image-generator";

const FAQ_KEYS = [
  { q: "line_sticker_faq_1_q", a: "line_sticker_faq_1_a" },
  { q: "line_sticker_faq_2_q", a: "line_sticker_faq_2_a" },
  { q: "line_sticker_faq_3_q", a: "line_sticker_faq_3_a" },
] as const;

type LineStickerCropMode = "contain-safe" | "crop" | "smart-safe";

type ImagePreview = {
  file: File;
  url: string;
  img: HTMLImageElement;
  width: number;
  height: number;
  status: "ok" | "process" | "warn_small" | "warn_no_transparency";
  hasTransparency: boolean;
  transparencyRatio: number;
};

type ItemOffset = { x: number; y: number };

const SAFE_PADDING = 10;
const SMART_SAFE_PADDING = 4;
const ALPHA_THRESHOLD = 12;

type ContentBox = { x: number; y: number; width: number; height: number };

type QualitySeverity = "error" | "warning" | "ok";

type StickerQualityIssue = {
  code: "no_transparency" | "empty" | "touches_edge" | "small" | "fragment";
  severity: Exclude<QualitySeverity, "ok">;
  message: string;
};

type StickerQualityReport = {
  index: number;
  severity: QualitySeverity;
  issues: StickerQualityIssue[];
};

const QUALITY_ALPHA_THRESHOLD = 12;
const QUALITY_EDGE_MARGIN = 3;
const QUALITY_MIN_CONTENT_RATIO = 0.08;
const QUALITY_FRAGMENT_MAX_RATIO = 0.025;

function analyzeStickerCanvas(
  canvas: HTMLCanvasElement,
  index: number,
): StickerQualityReport {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return {
      index,
      severity: "error",
      issues: [{ code: "empty", severity: "error", message: "無法讀取圖片內容" }],
    };
  }

  const { width, height } = canvas;
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const mask = new Uint8Array(width * height);
  let opaqueCount = 0;
  let transparentCount = 0;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let i = 0; i < width * height; i += 1) {
    const alpha = pixels[i * 4 + 3];
    if (alpha < 250) transparentCount += 1;
    if (alpha > QUALITY_ALPHA_THRESHOLD) {
      mask[i] = 1;
      opaqueCount += 1;
      const x = i % width;
      const y = Math.floor(i / width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  const issues: StickerQualityIssue[] = [];
  if (!opaqueCount) {
    issues.push({ code: "empty", severity: "error", message: "圖片是空白的" });
  }
  if (!transparentCount) {
    issues.push({
      code: "no_transparency",
      severity: "error",
      message: "沒有透明背景",
    });
  }
  if (
    opaqueCount &&
    (minX <= QUALITY_EDGE_MARGIN ||
      minY <= QUALITY_EDGE_MARGIN ||
      maxX >= width - 1 - QUALITY_EDGE_MARGIN ||
      maxY >= height - 1 - QUALITY_EDGE_MARGIN)
  ) {
    issues.push({
      code: "touches_edge",
      severity: "warning",
      message: "圖案太靠近邊界，可能被裁切",
    });
  }
  if (opaqueCount / (width * height) < QUALITY_MIN_CONTENT_RATIO) {
    issues.push({ code: "small", severity: "warning", message: "主要圖案可能太小" });
  }

  // Find small disconnected alpha components. These are often slivers from an
  // adjacent grid cell, such as the extra artwork previously found on #31.
  if (opaqueCount) {
    const seen = new Uint8Array(mask.length);
    const components: Array<{ size: number; touchesEdge: boolean }> = [];
    const queue = new Int32Array(mask.length);
    for (let start = 0; start < mask.length; start += 1) {
      if (!mask[start] || seen[start]) continue;
      let head = 0;
      let tail = 0;
      queue[tail++] = start;
      seen[start] = 1;
      let size = 0;
      let touchesEdge = false;
      while (head < tail) {
        const current = queue[head++];
        size += 1;
        const x = current % width;
        const y = Math.floor(current / width);
        if (
          x <= QUALITY_EDGE_MARGIN ||
          y <= QUALITY_EDGE_MARGIN ||
          x >= width - 1 - QUALITY_EDGE_MARGIN ||
          y >= height - 1 - QUALITY_EDGE_MARGIN
        ) {
          touchesEdge = true;
        }
        const neighbors = [
          x > 0 ? current - 1 : -1,
          x + 1 < width ? current + 1 : -1,
          y > 0 ? current - width : -1,
          y + 1 < height ? current + width : -1,
        ];
        for (const next of neighbors) {
          if (next >= 0 && mask[next] && !seen[next]) {
            seen[next] = 1;
            queue[tail++] = next;
          }
        }
      }
      components.push({ size, touchesEdge });
    }
    components.sort((a, b) => b.size - a.size);
    const suspicious = components.slice(1).some(
      ({ size, touchesEdge }) =>
        touchesEdge && size >= 8 && size / opaqueCount <= QUALITY_FRAGMENT_MAX_RATIO,
    );
    if (suspicious) {
      issues.push({
        code: "fragment",
        severity: "warning",
        message: "偵測到孤立小圖，請確認是否為切圖殘留",
      });
    }
  }

  return {
    index,
    severity: issues.some((issue) => issue.severity === "error")
      ? "error"
      : issues.length
        ? "warning"
        : "ok",
    issues,
  };
}

function getImageTransparencyInfo(img: HTMLImageElement): {
  hasTransparency: boolean;
  transparencyRatio: number;
  box: ContentBox | null;
} {
  const sourceW = img.naturalWidth || img.width;
  const sourceH = img.naturalHeight || img.height;
  if (!sourceW || !sourceH)
    return { hasTransparency: false, transparencyRatio: 0, box: null };

  const canvas = document.createElement("canvas");
  canvas.width = sourceW;
  canvas.height = sourceH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx)
    return {
      hasTransparency: false,
      transparencyRatio: 0,
      box: { x: 0, y: 0, width: sourceW, height: sourceH },
    };

  ctx.clearRect(0, 0, sourceW, sourceH);
  ctx.drawImage(img, 0, 0, sourceW, sourceH);

  const { data } = ctx.getImageData(0, 0, sourceW, sourceH);
  let transparentPixels = 0;
  let minX = sourceW;
  let minY = sourceH;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < sourceH; y += 1) {
    for (let x = 0; x < sourceW; x += 1) {
      const alpha = data[(y * sourceW + x) * 4 + 3];
      if (alpha < 250) transparentPixels += 1;
      if (alpha > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  const totalPixels = sourceW * sourceH;
  const transparencyRatio = totalPixels ? transparentPixels / totalPixels : 0;
  const hasTransparency = transparencyRatio > 0.003;
  const box =
    maxX >= minX && maxY >= minY
      ? { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 }
      : null;

  return { hasTransparency, transparencyRatio, box };
}

function drawStickerToTransparentCanvas(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  targetW: number,
  targetH: number,
  mode: LineStickerCropMode,
  scalePercent = 100,
  offset: ItemOffset = { x: 0, y: 0 },
): void {
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 透明背景修正：只清除畫布，不填白底、不填灰底，匯出 PNG 時保留 alpha。
  ctx.clearRect(0, 0, targetW, targetH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  const sourceW = img.naturalWidth || img.width;
  const sourceH = img.naturalHeight || img.height;
  if (!sourceW || !sourceH) return;

  const transparencyInfo = getImageTransparencyInfo(img);
  const sourceBox =
    transparencyInfo.hasTransparency && transparencyInfo.box
      ? transparencyInfo.box
      : { x: 0, y: 0, width: sourceW, height: sourceH };

  const safeScale = Math.max(0.7, Math.min(1.3, scalePercent / 100));

  if (mode === "crop") {
    const scale =
      Math.max(targetW / sourceBox.width, targetH / sourceBox.height) *
      safeScale;
    const drawW = sourceBox.width * scale;
    const drawH = sourceBox.height * scale;
    const dx = (targetW - drawW) / 2 + offset.x;
    const dy = (targetH - drawH) / 2 + offset.y;
    ctx.drawImage(
      img,
      sourceBox.x,
      sourceBox.y,
      sourceBox.width,
      sourceBox.height,
      dx,
      dy,
      drawW,
      drawH,
    );
    return;
  }

  const padding = mode === "smart-safe" ? SMART_SAFE_PADDING : SAFE_PADDING;
  const maxW = Math.max(1, targetW - padding * 2);
  const maxH = Math.max(1, targetH - padding * 2);
  const scale =
    Math.min(maxW / sourceBox.width, maxH / sourceBox.height) * safeScale;
  const drawW = Math.round(sourceBox.width * scale);
  const drawH = Math.round(sourceBox.height * scale);
  const dx = Math.round((targetW - drawW) / 2 + offset.x);
  const dy = Math.round((targetH - drawH) / 2 + offset.y);
  ctx.drawImage(
    img,
    sourceBox.x,
    sourceBox.y,
    sourceBox.width,
    sourceBox.height,
    dx,
    dy,
    drawW,
    drawH,
  );
}

function canvasHasTransparency(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return false;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true;
  }
  return false;
}

function loadImage(
  file: File,
  t: (key: string) => string,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(t("line_sticker_error_load")));
    };
    img.src = url;
  });
}

function resizeImageToCanvas(
  img: HTMLImageElement,
  targetW: number,
  targetH: number,
  mode: LineStickerCropMode,
  scalePercent = 100,
  offset: ItemOffset = { x: 0, y: 0 },
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  drawStickerToTransparentCanvas(
    img,
    canvas,
    targetW,
    targetH,
    mode,
    scalePercent,
    offset,
  );
  return canvas;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  t: (key: string) => string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error(t("line_sticker_error_blob")))),
      "image/png",
    );
  });
}

async function splitMotherSheet(
  file: File,
  rows: number,
  columns: number,
  t: (key: string) => string,
): Promise<File[]> {
  const image = await loadImage(file, t);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const results: File[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const left = Math.round((column * sourceWidth) / columns);
      const top = Math.round((row * sourceHeight) / rows);
      const right = Math.round(((column + 1) * sourceWidth) / columns);
      const bottom = Math.round(((row + 1) * sourceHeight) / rows);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, right - left);
      canvas.height = Math.max(1, bottom - top);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("無法建立母圖切割畫布");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        left,
        top,
        canvas.width,
        canvas.height,
        0,
        0,
        canvas.width,
        canvas.height,
      );
      const blob = await canvasToBlob(canvas, t);
      results.push(
        new File(
          [blob],
          `${file.name.replace(/\.[^.]+$/, "")}-${String(row * columns + column + 1).padStart(2, "0")}.png`,
          { type: "image/png" },
        ),
      );
    }
  }
  return results;
}

function PreviewCard({
  preview,
  index,
  cropMode,
  itemScale,
  onScaleChange,
  offset,
  onOffsetChange,
  isMain,
  onSetMain,
  isExcluded,
  onToggleExclude,
}: {
  preview: ImagePreview;
  index: number;
  cropMode: LineStickerCropMode;
  itemScale: number;
  onScaleChange: (nextScale: number) => void;
  offset: ItemOffset;
  onOffsetChange: (nextOffset: ItemOffset) => void;
  isMain: boolean;
  onSetMain: () => void;
  isExcluded: boolean;
  onToggleExclude: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  const previewW = PREVIEW_CARD_CANVAS.width;
  const previewH = PREVIEW_CARD_CANVAS.height;

  const clampOffset = useCallback((next: ItemOffset): ItemOffset => {
    return {
      x: Math.max(-90, Math.min(90, Math.round(next.x))),
      y: Math.max(-90, Math.min(90, Math.round(next.y))),
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawStickerToTransparentCanvas(
      preview.img,
      canvas,
      previewW,
      previewH,
      cropMode,
      itemScale,
      offset,
    );
  }, [cropMode, preview.img, itemScale, offset.x, offset.y]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      baseX: offset.x,
      baseY: offset.y,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    onOffsetChange(
      clampOffset({
        x: dragRef.current.baseX + event.clientX - dragRef.current.startX,
        y: dragRef.current.baseY + event.clientY - dragRef.current.startY,
      }),
    );
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // pointer may already be released
    }
    dragRef.current = null;
  };

  return (
    <div
      className={`rounded-2xl border bg-white p-3 transition ${
        isMain ? "border-blue-500 ring-2 ring-blue-100" : "border-slate-200"
      } ${isExcluded ? "opacity-50 grayscale" : ""} min-w-0`}
    >
      <div
        className="relative mx-auto aspect-[520/450] w-full cursor-grab touch-none overflow-hidden rounded-xl border-[3px] border-sky-500 bg-white active:cursor-grabbing"
        title="直接拖曳圖片可上下左右微調位置"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <canvas
          ref={canvasRef}
          className="h-full w-full select-none"
          width={previewW}
          height={previewH}
        />
        <div className="pointer-events-none absolute inset-0 rounded-xl border border-sky-200" />
        <div className="pointer-events-none absolute inset-2 rounded-lg border border-dashed border-slate-300/80" />
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
        <span>{preview.width}×{preview.height}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onSetMain}
            disabled={isExcluded}
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${
              isMain ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {isMain ? "★主圖" : "選主圖"}
          </button>
          <button
            type="button"
            onClick={onToggleExclude}
            className={`rounded-full px-2 py-1 text-[10px] font-bold ${
              isExcluded ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-500"
            }`}
          >
            {isExcluded ? "已排除" : "排除"}
          </button>
        </div>
      </div>

      {!isExcluded && (
        <>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-bold text-slate-600">
            <button type="button" className="rounded-xl bg-slate-100 px-3 py-2 hover:bg-slate-200" onClick={() => onOffsetChange(clampOffset({ ...offset, y: offset.y - 4 }))}>上移</button>
            <button type="button" className="rounded-xl bg-slate-100 px-3 py-2 hover:bg-slate-200" onClick={() => onOffsetChange({ x: 0, y: 0 })}>置中</button>
            <button type="button" className="rounded-xl bg-slate-100 px-3 py-2 hover:bg-slate-200" onClick={() => onOffsetChange(clampOffset({ ...offset, y: offset.y + 4 }))}>下移</button>
            <button type="button" className="rounded-xl bg-slate-100 px-3 py-2 hover:bg-slate-200" onClick={() => onOffsetChange(clampOffset({ ...offset, x: offset.x - 4 }))}>左移</button>
            <span className="rounded-xl bg-white px-3 py-2 text-center text-slate-500">{offset.x},{offset.y}</span>
            <button type="button" className="rounded-xl bg-slate-100 px-3 py-2 hover:bg-slate-200" onClick={() => onOffsetChange(clampOffset({ ...offset, x: offset.x + 4 }))}>右移</button>
          </div>

          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="w-12">單張縮放</span>
              <span className="rounded-xl bg-white px-3 py-2 text-center text-xs font-bold text-slate-500">
                {itemScale}%
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="130"
              value={itemScale}
              onChange={(e) => onScaleChange(Number(e.target.value))}
              className="mt-2 w-full accent-blue-600"
            />
          </div>
        </>
      )}
    </div>
  );
}

export default function LineStickerTool() {
  const { t } = useTranslation();
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_KEYS.map((item) => ({
      "@type": "Question",
      name: t(item.q),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(item.a),
      },
    })),
  };
  const [files, setFiles] = useState<ImagePreview[]>([]);
  const [stickerCount, setStickerCount] = useState<8 | 16 | 24 | 32 | 40>(8);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [cropMode, setCropMode] = useState<LineStickerCropMode>("smart-safe");
  const [cropScale, setCropScale] = useState<number>(100);
  const [itemScales, setItemScales] = useState<Record<number, number>>({});
  const [itemOffsets, setItemOffsets] = useState<Record<number, ItemOffset>>({});
  const [reviewedWarnings, setReviewedWarnings] = useState<Record<number, boolean>>({});
  const [motherSheetGrid, setMotherSheetGrid] = useState<"4x4" | "4x5">("4x4");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const motherSheetInputRef = useRef<HTMLInputElement>(null);
  const getToolShareData = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = "RxV LINE 貼圖整理工具";
    const text = "免費整理 LINE 貼圖尺寸、主圖與 ZIP 打包，也可搭配 PhotoRoom 產生素材與去背。";
    return { url, title, text };
  }, []);

  const openToolShare = useCallback((type: "line" | "facebook" | "x") => {
    const { url, title, text } = getToolShareData();
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(`${title}｜${text}`);
    const shareUrl =
      type === "line"
        ? `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`
        : type === "facebook"
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`
          : `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=720,height=640");
  }, [getToolShareData]);

  const copyToolShareLink = useCallback(async () => {
    const { url } = getToolShareData();
    try {
      await navigator.clipboard.writeText(url);
      alert("已複製 LINE 貼圖工具連結，可以貼到 LINE、FB 或社團分享。");
    } catch {
      alert("複製失敗，請手動複製網址列連結。");
    }
  }, [getToolShareData]);


  const validateAndAddFiles = useCallback(
    async (newFiles: File[]) => {
      setError(null);
      const valid = newFiles.filter((f) => ACCEPT_TYPES.includes(f.type));
      if (valid.length === 0) return;

      const previews: ImagePreview[] = [];
      for (const f of valid) {
        try {
          const img = await loadImage(f, t);
          const transparency = getImageTransparencyInfo(img);
          previews.push({
            file: f,
            url: URL.createObjectURL(f),
            img,
            width: img.naturalWidth,
            height: img.naturalHeight,
            status: transparency.hasTransparency
              ? "ok"
              : "warn_no_transparency",
            hasTransparency: transparency.hasTransparency,
            transparencyRatio: transparency.transparencyRatio,
          });
        } catch {
          /* skip */
        }
      }
      setFiles((prev) => {
        const startIndex = prev.length;
        setItemScales((oldScales) => {
          const next = { ...oldScales };
          previews.forEach((_, offset) => {
            const idx = startIndex + offset;
            if (next[idx] == null) next[idx] = cropScale;
          });
          return next;
        });
        return [...prev, ...previews];
      });
    },
    [cropScale, t],
  );

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const list = e.target.files;
      if (list?.length) validateAndAddFiles(Array.from(list));
      e.target.value = "";
    },
    [validateAndAddFiles],
  );

  const handleMotherSheetChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(event.target.files || []);
      event.target.value = "";
      if (!selected.length) return;
      setLoading(true);
      setError(null);
      try {
        const [columns, rows] = motherSheetGrid.split("x").map(Number);
        const splitFiles: File[] = [];
        for (const file of selected) {
          if (!ACCEPT_TYPES.includes(file.type)) continue;
          splitFiles.push(...(await splitMotherSheet(file, rows, columns, t)));
        }
        await validateAndAddFiles(splitFiles);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "母圖自動切割失敗");
      } finally {
        setLoading(false);
      }
    },
    [motherSheetGrid, t, validateAndAddFiles],
  );

  const clearAll = useCallback(() => {
    files.forEach((p) => URL.revokeObjectURL(p.url));
    setFiles([]);
    setItemScales({});
    setReviewedWarnings({});
    setMainImageIndex(0);
  }, [files]);

  const needMore = stickerCount - files.length;
  const canDownload = files.length >= stickerCount;
  const noTransparencyCount = files.filter((p) => !p.hasTransparency).length;
  const getScaleForIndex = useCallback(
    (index: number) => itemScales[index] ?? cropScale,
    [itemScales, cropScale],
  );

  const updateItemScale = useCallback((index: number, nextScale: number) => {
    setItemScales((prev) => ({ ...prev, [index]: nextScale }));
  }, []);

  const updateGlobalScale = useCallback((nextScale: number) => {
    setCropScale(nextScale);
    setItemScales((prev) => {
      const next: Record<number, number> = { ...prev };
      files.forEach((_, index) => {
        next[index] = nextScale;
      });
      return next;
    });
  }, [files]);

  const getOffsetForIndex = useCallback(
    (index: number) => itemOffsets[index] ?? { x: 0, y: 0 },
    [itemOffsets],
  );

  const updateItemOffset = useCallback((index: number, nextOffset: ItemOffset) => {
    setItemOffsets((prev) => ({ ...prev, [index]: nextOffset }));
  }, []);

  useEffect(() => {
    setReviewedWarnings({});
  }, [files, stickerCount, cropMode, cropScale, itemScales, itemOffsets]);

  const qualityReports = useMemo<StickerQualityReport[]>(() => {
    return files.slice(0, stickerCount).map((preview, index) => {
      const canvas = resizeImageToCanvas(
        preview.img,
        STICKER_BODY.width,
        STICKER_BODY.height,
        cropMode,
        getScaleForIndex(index),
        getOffsetForIndex(index),
      );
      return analyzeStickerCanvas(canvas, index);
    });
  }, [files, stickerCount, cropMode, getScaleForIndex, getOffsetForIndex]);

  const qualityErrorCount = qualityReports.filter(
    (report) => report.severity === "error",
  ).length;
  const qualityWarningCount = qualityReports.filter(
    (report) => report.severity === "warning" && !reviewedWarnings[report.index],
  ).length;
  const qualityPassedCount = qualityReports.filter(
    (report) => report.severity === "ok" || reviewedWarnings[report.index],
  ).length;

  const generateZip = useCallback(async () => {
    if (!canDownload) return;
    if (qualityErrorCount > 0) {
      setError(`尚有 ${qualityErrorCount} 張嚴重品質問題，請先修正再輸出 ZIP。`);
      return;
    }
    setLoading(true);
    try {
      const zip = new JSZip();
      const targetMainImg = files[mainImageIndex]?.img || files[0].img;
      const mainScale = getScaleForIndex(mainImageIndex);
      const mainCanvas = resizeImageToCanvas(
        targetMainImg,
        MAIN_IMG.width,
        MAIN_IMG.height,
        cropMode,
        mainScale,
        getOffsetForIndex(mainImageIndex),
      );
      const tabCanvas = resizeImageToCanvas(
        targetMainImg,
        TAB_IMG.width,
        TAB_IMG.height,
        cropMode,
        mainScale,
        getOffsetForIndex(mainImageIndex),
      );
      if (
        !canvasHasTransparency(mainCanvas) ||
        !canvasHasTransparency(tabCanvas)
      ) {
        throw new Error("輸出不是透明 PNG，請確認上傳的是已去背 PNG/WebP。");
      }
      zip.file("main.png", await canvasToBlob(mainCanvas, t));
      zip.file("tab.png", await canvasToBlob(tabCanvas, t));

      for (let i = 0; i < stickerCount; i++) {
        const canvas = resizeImageToCanvas(
          files[i].img,
          STICKER_BODY.width,
          STICKER_BODY.height,
          cropMode,
          getScaleForIndex(i),
          getOffsetForIndex(i),
        );
        if (!canvasHasTransparency(canvas)) {
          throw new Error(
            `第 ${i + 1} 張輸出不是透明 PNG，請確認該張原圖是已去背 PNG/WebP。`,
          );
        }
        zip.file(
          `${String(i + 1).padStart(2, "0")}.png`,
          await canvasToBlob(canvas, t),
        );
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, ZIP_FILENAME);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("line_sticker_pack_failed");
      setError(message || t("line_sticker_pack_failed"));
    } finally {
      setLoading(false);
    }
  }, [
    canDownload,
    files,
    stickerCount,
    cropMode,
    getScaleForIndex,
    getOffsetForIndex,
    mainImageIndex,
    qualityErrorCount,
    t,
  ]);

  return (
    <>
      <SEO
        title="LINE 貼圖製作工具｜免費LINE 貼圖製作工具 - RxV AI工具中心"
        description="免費LINE 貼圖製作工具，支援線上使用，快速完成任務，無需下載。"
        path="/tools/line-sticker"
        keywords="LINE 貼圖製作工具, AI工具, 免費工具"
        jsonLd={faqJsonLd}
      />

      <div className="min-h-screen bg-slate-50 px-4 py-8 pb-24 sm:pb-32">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/"
            className="text-xs text-slate-400 hover:text-blue-500 mb-4 inline-block"
          >
            {t("line_sticker_back_home")}
          </Link>

          <header className="mb-6">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              LINE 貼圖整理打包工具｜把貼圖圖片整理成上架素材包
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              已經有貼圖圖片了嗎？把圖片上傳後，本工具會協助整理 LINE
              貼圖尺寸、主圖、標籤圖與 ZIP
              打包，適合新手、創作者、店家品牌與客製貼圖接案使用。
            </p>
            <p className="text-slate-500 text-sm mt-2">
              {t("line_sticker_hero_desc")}
            </p>
          </header>

          <LineStickerGuideEntry />
          <StickerWorkflowAssist />
          <LineStickerAuthorCard />

          {files.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-3 bg-blue-600 text-white p-4 rounded-2xl shadow-lg">
              <div className="flex-1">
                <p className="text-[10px] uppercase font-bold opacity-80">
                  {t("line_sticker_progress_label")}
                </p>
                <p className="text-lg font-black">
                  {t("line_sticker_progress_count", {
                    current: files.length,
                    target: stickerCount,
                  })}
                </p>
              </div>
              <button
                onClick={clearAll}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-bold backdrop-blur-sm transition-all"
              >
                {t("line_sticker_clear_all")}
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {noTransparencyCount > 0 && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <p className="font-black">
                ⚠ 有 {noTransparencyCount} 張可能尚未去背
              </p>
              <p className="mt-1 text-xs leading-relaxed">
                LINE 貼圖建議使用透明背景 PNG / WebP；白底或 JPG 請先去背後再打包。
              </p>
            </div>
          )}

          <div className="space-y-4 mb-10">
            <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-600 px-3 py-1 text-[10px] font-black text-white">
                      一鍵母圖切割
                    </span>
                    <span className="text-xs font-bold text-violet-700">
                      可一次選擇多張母圖
                    </span>
                  </div>
                  <h2 className="mt-2 text-base font-black text-slate-900">
                    上傳母圖，自動切成單張並立即檢查
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    兩張 4×4 母圖可直接切成 32 張；切割順序為由左到右、由上到下。
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:min-w-[220px]">
                  <div className="grid grid-cols-2 gap-2">
                    {(["4x4", "4x5"] as const).map((grid) => (
                      <button
                        key={grid}
                        type="button"
                        onClick={() => setMotherSheetGrid(grid)}
                        className={`rounded-xl px-3 py-2 text-xs font-black ${
                          motherSheetGrid === grid
                            ? "bg-violet-600 text-white"
                            : "bg-white text-slate-600 shadow-sm"
                        }`}
                      >
                        {grid.replace("x", "×")}
                      </button>
                    ))}
                  </div>
                  <input
                    ref={motherSheetInputRef}
                    type="file"
                    accept={ACCEPT_TYPES.join(",")}
                    multiple
                    onChange={handleMotherSheetChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => motherSheetInputRef.current?.click()}
                    className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? "處理中…" : "選擇母圖並自動切割"}
                  </button>
                </div>
              </div>
            </section>

            <section
              id="line-sticker-pack-tool"
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer border-slate-300 bg-white hover:border-blue-400 hover:bg-blue-50/30 transition-all group duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-100 duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110 active:scale-[0.98]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT_TYPES.join(",")}
                multiple
                onChange={handleInputChange}
                className="hidden"
              />
              <p className="text-slate-600 font-bold">
                {t("line_sticker_upload_click")}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {t("line_sticker_upload_hint")}｜建議上傳已去背 PNG /
                WebP，系統會自動提示非透明背景
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <p className="text-[11px] font-black text-slate-400 uppercase mb-3">
                  {t("line_sticker_step_count")}
                </p>
                <div className="flex flex-wrap gap-2">
                  {STICKER_SIZES.map((n) => (
                    <button
                      key={n}
                      onClick={() => setStickerCount(n)}
                      className={`flex-1 min-w-[46px] whitespace-nowrap rounded-lg px-2 py-2 text-xs font-bold transition-all ${stickerCount === n ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200">
                <p className="text-[11px] font-black text-slate-400 uppercase mb-3">
                  {t("line_sticker_step_crop")}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setCropMode("contain-safe")}
                    className={`whitespace-nowrap rounded-lg px-2 py-2 text-[11px] font-black leading-none transition-all ${cropMode === "contain-safe" ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    文字保護
                  </button>
                  <button
                    onClick={() => setCropMode("smart-safe")}
                    className={`whitespace-nowrap rounded-lg px-2 py-2 text-[11px] font-black leading-none transition-all ${cropMode === "smart-safe" ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    智慧滿版
                  </button>
                  <button
                    onClick={() => setCropMode("crop")}
                    className={`whitespace-nowrap rounded-lg px-2 py-2 text-[11px] font-black leading-none transition-all ${cropMode === "crop" ? "bg-blue-600 text-white shadow-md" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
                  >
                    滿版
                  </button>
                </div>

                {(cropMode === "crop" || cropMode === "smart-safe") && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black text-slate-500">
                        安全縮放
                      </span>
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-black text-blue-600">
                        {cropScale}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={135}
                      step={1}
                      value={cropScale}
                      onChange={(e) => updateGlobalScale(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => updateGlobalScale(cropScale)}
                      className="mt-2 w-full rounded-lg bg-white px-3 py-2 text-[11px] font-black text-blue-600 hover:bg-blue-50"
                    >
                      套用目前縮放到全部貼圖
                    </button>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-500">
                      上方滑桿會即時套用全部貼圖；有文字建議 90%～100%，若單張太小可在下方卡片各別放大或微調位置。
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {files.length > 0 && (
            <section className="mb-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-[10px] font-black text-violet-700">
                      自動品質檢查
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      已掃描 {qualityReports.length} 張
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-black text-slate-900">
                    切圖後先檢查，再產生上架 ZIP
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    自動檢查透明背景、空白、碰邊、圖案過小及孤立碎圖。手腳、表情、錯字等內容問題仍請查看預覽確認。
                  </p>
                </div>
                <div className="grid min-w-[240px] grid-cols-3 gap-2 text-center">
                  <div className="rounded-2xl bg-emerald-50 px-3 py-2">
                    <div className="text-lg font-black text-emerald-600">{qualityPassedCount}</div>
                    <div className="text-[10px] font-bold text-emerald-700">通過</div>
                  </div>
                  <div className="rounded-2xl bg-amber-50 px-3 py-2">
                    <div className="text-lg font-black text-amber-600">{qualityWarningCount}</div>
                    <div className="text-[10px] font-bold text-amber-700">待確認</div>
                  </div>
                  <div className="rounded-2xl bg-rose-50 px-3 py-2">
                    <div className="text-lg font-black text-rose-600">{qualityErrorCount}</div>
                    <div className="text-[10px] font-bold text-rose-700">需修正</div>
                  </div>
                </div>
              </div>

              {qualityReports.some((report) => report.issues.length > 0) ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {qualityReports
                    .filter((report) => report.issues.length > 0)
                    .map((report) => {
                      const reviewed = Boolean(reviewedWarnings[report.index]);
                      return (
                        <div
                          key={report.index}
                          className={`rounded-2xl border p-3 ${
                            report.severity === "error"
                              ? "border-rose-200 bg-rose-50"
                              : reviewed
                                ? "border-emerald-200 bg-emerald-50"
                                : "border-amber-200 bg-amber-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-black text-slate-900">
                                第 {String(report.index + 1).padStart(2, "0")} 張
                              </p>
                              <ul className="mt-1 space-y-1 text-xs text-slate-600">
                                {report.issues.map((issue) => (
                                  <li key={issue.code}>• {issue.message}</li>
                                ))}
                              </ul>
                            </div>
                            {report.severity === "warning" && (
                              <button
                                type="button"
                                onClick={() =>
                                  setReviewedWarnings((previous) => ({
                                    ...previous,
                                    [report.index]: !reviewed,
                                  }))
                                }
                                className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-black ${
                                  reviewed
                                    ? "bg-emerald-600 text-white"
                                    : "bg-white text-amber-700 shadow-sm"
                                }`}
                              >
                                {reviewed ? "已確認" : "人工確認"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
                  自動檢查全部通過。請再用預覽確認角色手腳、表情、道具與文字。
                </div>
              )}
            </section>
          )}

          {files.length > 0 && (
            <section className="mb-10">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {t("line_sticker_preview_title")}
                </h3>
                <p className="text-xs font-bold text-slate-500">
                  預覽卡片已放大；可直接拖曳圖片微調位置，也可用下方縮放滑桿調整單張大小。
                </p>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {files.map((p, i) => (
                  <PreviewCard
                    key={i}
                    preview={p}
                    index={i}
                    cropMode={cropMode}
                    itemScale={getScaleForIndex(i)}
                    onScaleChange={(nextScale) => updateItemScale(i, nextScale)}
                    offset={getOffsetForIndex(i)}
                    onOffsetChange={(nextOffset) => updateItemOffset(i, nextOffset)}
                    isMain={mainImageIndex === i}
                    onSetMain={() => setMainImageIndex(i)}
                    isExcluded={i >= stickerCount}
                    onToggleExclude={() => {}}
                  />
                ))}
              </div>
            </section>
          )}

          {/* --- 修改開始：PhotoRoom 聯盟導流卡片 --- */}
          <section className="mt-10 mb-20 border-t border-slate-100 pt-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                AI Creator Tools
              </span>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                貼圖創作者推薦工具
              </h3>
            </div>
            <p className="mb-6 text-sm text-slate-500 leading-relaxed">
              ① 用 ChatGPT 或 PhotoRoom 產生素材 → ② 用本站分割與檢查透明背景 → ③ 回本工具整理 LINE 貼圖尺寸並打包 ZIP。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href={PHOTOROOM_AI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-blue-400 hover:shadow-md transition-all text-left duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-100"
              >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
                  AI
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600">
                    PhotoRoom 貼紙角色素材
                  </h4>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">
                    HOT
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  可用來測試可愛貼紙角色、商品圖與品牌素材；有字 LINE 貼圖建議仍以 ChatGPT 產圖或後製加字。
                </p>
                <span
                  className="mt-4 inline-flex w-fit rounded-lg bg-blue-600 px-3 py-2 text-xs font-black !text-white group-hover:bg-blue-700"
                  style={{ color: "#ffffff" }}
                >
                  測試貼紙素材
                </span>
              </a>

              <a
                href={PHOTOROOM_BG_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col p-5 bg-white rounded-2xl border border-slate-100 hover:border-purple-400 hover:shadow-md transition-all text-left duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:ring-2 hover:ring-blue-100"
              >
                <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white font-black text-xs mb-4 shadow-inner">
                  BG
                </div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600">
                    PhotoRoom 去背工具
                  </h4>
                  <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                    推薦
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  適合處理貼圖角色、商品照與品牌素材去背；去背後請回本站確認是否為透明 PNG。
                </p>
                <span
                  className="mt-4 inline-flex w-fit rounded-lg bg-purple-600 px-3 py-2 text-xs font-black !text-white group-hover:bg-purple-700"
                  style={{ color: "#ffffff" }}
                >
                  前往去背工具
                </span>
              </a>
            </div>

            <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="mb-3 text-sm font-bold text-slate-700">
                覺得 LINE 貼圖工具實用？分享給正在做貼圖、商品圖或品牌素材的朋友。
              </p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openToolShare("line")} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold !text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg" style={{ color: "#ffffff" }}>LINE 分享</button>
                <button type="button" onClick={() => openToolShare("facebook")} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-bold !text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg" style={{ color: "#ffffff" }}>FB 分享</button>
                <button type="button" onClick={() => openToolShare("x")} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-bold !text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg" style={{ color: "#ffffff" }}>X 分享</button>
                <button type="button" onClick={copyToolShareLink} className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-md transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-blue-700 hover:shadow-lg">複製連結</button>
              </div>
            </div>
          </section>
          {/* --- 修改結束 --- */}

          {/* --- 新增：品牌接案與行銷推廣服務區塊 --- */}
          <section className="mt-10 mb-12 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                Custom Service
              </span>
              <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                品牌行銷
              </span>
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              LINE 貼圖客製服務｜個人、公司品牌、工作室皆可
            </h2>
            <p className="mt-3 text-sm font-bold text-emerald-700">
              🔥 不只是貼圖，也可做公司品牌行銷推廣與活動曝光。
            </p>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              若你沒有時間自己製作，也可以委託 RxV 協助設計專屬 LINE
              貼圖。適合個人創作者、店家、公司品牌、工作室與活動宣傳使用。
            </p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <h3 className="text-sm font-black text-slate-900 mb-3">
                  服務內容
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li>✔ AI 角色設計，可依品牌風格客製</li>
                  <li>✔ LINE 貼圖製作，符合上架尺寸規格</li>
                  <li>✔ 貼圖尺寸整理、透明 PNG 與 ZIP 打包</li>
                  <li>✔ LINE 上架流程教學，新手也可委託</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-white/80 bg-white/80 p-4">
                <h3 className="text-sm font-black text-slate-900 mb-3">
                  品牌行銷應用
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  <li>✔ 公司品牌貼圖設計，提升辨識度</li>
                  <li>✔ 店家活動貼圖，增加顧客互動</li>
                  <li>✔ 工作室 IP 角色延伸，建立品牌記憶點</li>
                  <li>✔ 例如：蛋塔店、甜點品牌、早餐店、課程品牌都可規劃</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4">
              <h3 className="text-sm font-black text-slate-900 mb-2">
                品牌案例方向：蛋塔店也可以做
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                可將蛋塔、甜點、店家吉祥物或品牌角色設計成 LINE
                貼圖，用於顧客互動、節慶活動、優惠通知與社群推廣，讓品牌不只是賣商品，也能留下可愛記憶點。
              </p>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between rounded-2xl bg-white border border-emerald-200 p-4">
              <div>
                <p className="text-sm font-black text-slate-900">📩 詢問報價</p>
                <p className="text-xs text-slate-500 mt-1">
                  請附需求、張數、用途與參考風格，會依內容客製報價。
                </p>
                <p className="text-xs font-bold text-emerald-600 mt-2">
                  rxv0227@gmail.com
                </p>
              </div>

              <a
                href="mailto:rxv0227@gmail.com?subject=LINE貼圖製作與品牌行銷詢問&body=您好，我想詢問 LINE 貼圖客製服務。%0A%0A需求用途：%0A預計張數：%0A品牌/店家類型：%0A想要風格：%0A是否需要上架教學："
                className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black !text-white hover:!text-white visited:!text-white focus:!text-white active:!text-white no-underline transition hover:bg-emerald-600 active:scale-[0.98] shadow-md duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
                style={{
                  color: "#ffffff",
                  WebkitTextFillColor: "#ffffff",
                  textDecoration: "none",
                }}
              >
                <span
                  className="!text-white"
                  style={{ color: "#ffffff", WebkitTextFillColor: "#ffffff" }}
                >
                  👉 詢問 LINE 貼圖報價
                </span>
              </a>
            </div>
          </section>
          {/* --- 新增結束 --- */}

          {/* --- 新增：輕量贊助區塊（避免干擾使用者） --- */}
          <section className="mt-10 mb-12 rounded-3xl border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
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
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-amber-500 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-amber-600 hover:!text-white active:scale-[0.98] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
              >
                ☕ 台灣小額支持
              </a>
              <a
                href="https://ko-fi.com/ang2289"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-black !text-white shadow-md transition hover:bg-blue-700 hover:!text-white active:scale-[0.98] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
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
          <section
            id="line-sticker-quick-guide"
            className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm scroll-mt-24"
          >
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black tracking-widest text-white">
                快速教學
              </span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-black text-blue-700">
                新手必看
              </span>
            </div>

            <h2 className="text-xl font-black text-slate-900 mb-3">
              如何用本工具製作 LINE 貼圖上架包？
            </h2>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              先準備已去背的 PNG 或 WebP 圖片，再用本工具自動整理尺寸、產生
              main.png、tab.png 與貼圖圖片，最後打包成 ZIP，方便後續上傳 LINE
              Creators Market。
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <h3 className="text-sm font-black text-slate-900 mb-3">
                  使用步驟
                </h3>
                <ol className="list-decimal ml-5 text-sm text-slate-600 space-y-2 leading-relaxed">
                  <li>
                    先用 AI
                    產生同一角色的貼圖圖片，建議保留大間距，避免切到字或角色。
                  </li>
                  <li>使用去背工具整理成透明背景 PNG / WebP。</li>
                  <li>回到本頁上傳 8、16、24、32 或 40 張圖片。</li>
                  <li>選擇安全留白或滿版裁切，預覽每張圖是否正常。</li>
                  <li>選一張作為 main.png 與 tab.png 的代表圖。</li>
                  <li>點選打包下載，取得 LINE 貼圖上架用 ZIP。</li>
                </ol>
              </div>

              <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-100">
                <h3 className="text-sm font-black text-slate-900 mb-3">
                  上架前檢查
                </h3>
                <ul className="list-disc ml-5 text-sm text-slate-600 space-y-2 leading-relaxed">
                  <li>圖片背景是否透明。</li>
                  <li>文字是否為繁體中文且清楚可讀。</li>
                  <li>角色與文字是否有安全邊距。</li>
                  <li>是否有侵權、商標、名人肖像或不適合上架的內容。</li>
                  <li>ZIP 內是否包含 main.png、tab.png 與貼圖圖片。</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="text-xs leading-relaxed text-slate-600">
                小提醒：如果你是第一次製作，建議先做 8 張或 16
                張測試版，確認風格、文字、去背與尺寸都正常後，再延伸到 40
                張完整版本。
              </p>
            </div>
          </section>

          <section className="mt-10 border-t border-slate-200 pt-10">
            <h2 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-widest">
              {t("line_sticker_faq_title")}
            </h2>
            <div className="space-y-4">
              {FAQ_KEYS.map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-2xl border border-slate-100"
                >
                  <p className="text-sm font-bold text-slate-900 mb-2">
                    {t(item.q)}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {t(item.a)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12 mb-10 rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">
              什麼是LINE 貼圖製作工具？
            </h2>
            <p className="mt-3 text-slate-600 leading-relaxed">
              LINE
              貼圖製作工具是一種常見的AI工具，可幫助使用者提升效率，適合用於工作、學習與日常應用。
            </p>

            <h2 className="mt-6 text-xl font-semibold text-slate-900">
              為什麼使用這個工具？
            </h2>
            <ul className="list-disc pl-5 mt-3 space-y-1 text-slate-600">
              <li>免費使用</li>
              <li>不需安裝</li>
              <li>支援快速處理</li>
            </ul>

            <RelatedTools
              items={getRelatedToolsItems("line-sticker")}
              title="相關工具"
            />
            <RelatedGuides items={getRelatedGuideItems("line-sticker")} />
            <p className="mt-4 text-slate-600 leading-relaxed">
              LINE
              貼圖製作工具是創作者常用的AI工具，可快速整理上架規格。這款免費工具能減少重工流程，讓
              LINE
              貼圖製作工具更適合個人品牌與小團隊。若你正在找可立即使用的AI工具與免費工具，LINE
              貼圖製作工具會很實用。
            </p>
            <div className="mt-8">
              <Link
                to="/tools"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold !text-white hover:!!text-white hover:!text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-400 active:scale-[0.98] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:brightness-110"
              >
                前往 RxV 工具中心瀏覽完整工具清單
              </Link>
            </div>
          </section>
        </div>

        <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/85 px-3 py-2 backdrop-blur-xl sm:p-4">
          <div className="mx-auto flex max-w-5xl items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                {t("line_sticker_status_label")}
              </p>
              <p
                className={`text-sm font-black leading-none mt-1 ${canDownload ? "text-emerald-500" : "text-amber-500"}`}
              >
                {canDownload
                  ? t("line_sticker_ready")
                  : t("line_sticker_need_more", { count: needMore })}
              </p>
            </div>

            <button
              onClick={generateZip}
              disabled={!canDownload || loading}
              className={`h-12 min-h-12 flex-1 whitespace-nowrap rounded-2xl px-3 py-0 text-[15px] font-black leading-none tracking-tight shadow-lg transition-all active:scale-[0.97] sm:h-auto sm:min-h-[52px] sm:py-3.5 sm:text-sm ${!canDownload || loading ? "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"}`}
            >
              {loading
                ? t("line_sticker_processing")
                : canDownload
                  ? t("line_sticker_pack_download", { count: stickerCount })
                  : t("line_sticker_need_more_to_pack", { count: needMore })}
            </button>
          </div>
        </footer>
      </div>
    </>
  );
}
