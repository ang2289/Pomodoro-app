import React, { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import SEO, { getBaseUrl } from "@/components/SEO";
import LineStickerFlowSteps from "@/components/LineStickerFlowSteps";
import { stickerSaleTextRisks } from "@/lib/stickerCommercialSafety";
import {
  loadAnimatedStickerHandoffBundle,
  readLineStickerProject,
  updateLineStickerProject,
} from "@/lib/lineStickerFlow";
import { createWhatsAppAnimatedSticker } from "@/lib/whatsAppAnimatedWebp";
import { createWhatsAppTrayPng, partitionWhatsAppPacks } from "@/lib/whatsAppStickerExport";
import {
  AUTO_MOTION_PRESETS,
  generateAutoAnimationFrameFiles,
  type AutoMotionPreset,
} from "@/lib/animatedLineStickerAuto";

type WorkflowMode = "single" | "manual" | "batch";

type FrameItem = {
  id: string;
  file: File;
  url: string;
  name: string;
  width: number;
  height: number;
  transparent: boolean | null;
};

type CheckItem = {
  label: string;
  ok: boolean;
  message: string;
};

type Translate = (key: string, options?: Record<string, unknown>) => string;
type ByteArray = Uint8Array<ArrayBufferLike>;

const OUTPUT_WIDTH = 320;
const OUTPUT_HEIGHT = 270;
const LINE_MAIN_IMAGE_WIDTH = 240;
const LINE_MAIN_IMAGE_HEIGHT = 240;
const LINE_TAB_ICON_WIDTH = 96;
const LINE_TAB_ICON_HEIGHT = 74;
// 採用保守的十進位 1MB 上限，避免上架平台與瀏覽器的 MB 換算差異。
const LINE_APNG_MAX_BYTES = 1_000_000;
const MAX_LINE_ZIP_MB = 60;
const ALPHA_VISIBLE_THRESHOLD = 8;
const SOURCE_CROP_PADDING = 12;
const OUTPUT_SAFE_PADDING = 4;

type AlphaBounds = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type DrawRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type LineRenderPlan = {
  crop: AlphaBounds;
  target: DrawRect;
};

type LineOutputSummary = {
  originalSizeText: string;
  cropSizeText: string;
  outputSizeText: string;
  fillPercent: number;
  sameSourceSize: boolean;
  hasLargeTransparentMargin: boolean;
};

type LineRenderData = {
  images: HTMLImageElement[];
  plans: LineRenderPlan[];
  summary: LineOutputSummary;
};

type LinePreviewFrame = {
  id: string;
  url: string;
  name: string;
};

type BatchAnimatedPreview = {
  id: string;
  index: number;
  motionPreset: AutoMotionPreset;
  name: string;
  blob: Blob;
  url: string;
  sizeKb: number;
  overLimit: boolean;
};

type MotionPresetGalleryItem = {
  preset: AutoMotionPreset;
  urls: string[];
};

type BatchMotionMode = "mixed" | "single" | "custom";

const MIXED_BATCH_MOTION_PRESETS: AutoMotionPreset[] = [
  "auto",
  "bounce",
  "nod",
  "sway",
  "textPop",
  "sparkle",
  "pop",
  "pulse",
  "shake",
  "salute",
  "alert",
  "slideLeft",
  "slideRight",
  "breathe",
  "spin",
];


function makeFullBounds(width: number, height: number): AlphaBounds {
  return { left: 0, top: 0, right: width, bottom: height, width, height };
}

function normalizeBounds(bounds: AlphaBounds): AlphaBounds {
  return {
    ...bounds,
    width: Math.max(1, bounds.right - bounds.left),
    height: Math.max(1, bounds.bottom - bounds.top),
  };
}

function expandBounds(bounds: AlphaBounds, imageWidth: number, imageHeight: number, padding = SOURCE_CROP_PADDING): AlphaBounds {
  const left = Math.max(0, bounds.left - padding);
  const top = Math.max(0, bounds.top - padding);
  const right = Math.min(imageWidth, bounds.right + padding);
  const bottom = Math.min(imageHeight, bounds.bottom + padding);
  return normalizeBounds({ left, top, right, bottom, width: right - left, height: bottom - top });
}

function unionBounds(boundsList: AlphaBounds[]): AlphaBounds {
  const left = Math.min(...boundsList.map((bounds) => bounds.left));
  const top = Math.min(...boundsList.map((bounds) => bounds.top));
  const right = Math.max(...boundsList.map((bounds) => bounds.right));
  const bottom = Math.max(...boundsList.map((bounds) => bounds.bottom));
  return normalizeBounds({ left, top, right, bottom, width: right - left, height: bottom - top });
}

function detectAlphaBounds(image: HTMLImageElement): AlphaBounds | null {
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  if (!width || !height) return null;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return makeFullBounds(width, height);

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, width, height).data;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > ALPHA_VISIBLE_THRESHOLD) {
        if (x < left) left = x;
        if (y < top) top = y;
        if (x > right) right = x;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (right < left || bottom < top) return null;
  return normalizeBounds({ left, top, right: right + 1, bottom: bottom + 1, width: right - left + 1, height: bottom - top + 1 });
}

function detectCanvasAlphaBounds(canvas: HTMLCanvasElement): AlphaBounds | null {
  const width = canvas.width;
  const height = canvas.height;
  if (!width || !height) return null;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return makeFullBounds(width, height);

  const data = ctx.getImageData(0, 0, width, height).data;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > ALPHA_VISIBLE_THRESHOLD) {
        if (x < left) left = x;
        if (y < top) top = y;
        if (x > right) right = x;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (right < left || bottom < top) return null;
  return normalizeBounds({ left, top, right: right + 1, bottom: bottom + 1, width: right - left + 1, height: bottom - top + 1 });
}

function drawCanvasWithCropToTransparentOutput(
  sourceCanvas: HTMLCanvasElement,
  crop: AlphaBounds,
  targetWidth: number,
  targetHeight: number,
  padding = 4
): HTMLCanvasElement {
  const output = document.createElement("canvas");
  output.width = targetWidth;
  output.height = targetHeight;
  const ctx = output.getContext("2d");
  if (!ctx) throw new Error("小圖產生失敗，請重新整理後再試一次。");

  ctx.clearRect(0, 0, targetWidth, targetHeight);
  const safePadding = Math.max(0, Math.min(padding, Math.floor(Math.min(targetWidth, targetHeight) / 4)));
  const scale = Math.min(
    (targetWidth - safePadding * 2) / Math.max(1, crop.width),
    (targetHeight - safePadding * 2) / Math.max(1, crop.height)
  );
  const width = Math.round(crop.width * scale);
  const height = Math.round(crop.height * scale);
  const x = Math.round((targetWidth - width) / 2);
  const y = Math.round((targetHeight - height) / 2);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(sourceCanvas, crop.left, crop.top, crop.width, crop.height, x, y, width, height);
  return output;
}

function drawCanvasToTransparentOutput(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  padding = 4
): HTMLCanvasElement {
  const bounds = detectCanvasAlphaBounds(sourceCanvas) ?? makeFullBounds(sourceCanvas.width, sourceCanvas.height);
  return drawCanvasWithCropToTransparentOutput(sourceCanvas, bounds, targetWidth, targetHeight, padding);
}


async function createLineStaticSmallImageBlob(
  frames: FrameItem[],
  t: Translate,
  targetWidth: number,
  targetHeight: number,
  padding = 4
): Promise<Blob> {
  if (frames.length === 0) throw new Error("請先上傳至少 1 張圖片，才能匯出 LINE 小圖。");

  const renderData = await prepareLineRenderData([frames[0]], t);
  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = OUTPUT_WIDTH;
  baseCanvas.height = OUTPUT_HEIGHT;
  const baseCtx = baseCanvas.getContext("2d", { willReadFrequently: true });
  if (!baseCtx) throw new Error(t("animated_line_sticker.error_canvas_create"));

  drawPreparedFrame(baseCtx, renderData.images[0], renderData.plans[0]);
  const outputCanvas = drawCanvasToTransparentOutput(baseCanvas, targetWidth, targetHeight, padding);
  return canvasToPngBlob(outputCanvas);
}

async function createSizedApngFromCanvases(
  canvases: HTMLCanvasElement[],
  width: number,
  height: number,
  durationSec: number,
  loopCount: number,
  t: Translate
) {
  if (canvases.length < 5) throw new Error(t("animated_line_sticker.error_min_frames_apng"));

  const safeDurationSec = [1, 2, 3, 4].includes(durationSec) ? durationSec : 2;
  const totalDurationMs = safeDurationSec * 1000;
  const baseDelayMs = Math.floor(totalDurationMs / canvases.length);
  const remainderMs = totalDurationMs - baseDelayMs * canvases.length;
  const frameDelaysMs = canvases.map((_, index) => baseDelayMs + (index < remainderMs ? 1 : 0));

  const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = concatBytes([
    u32(width),
    u32(height),
    new Uint8Array([8, 6, 0, 0, 0]),
  ]);

  const chunks: Uint8Array[] = [
    pngSignature,
    pngChunk("IHDR", ihdrData),
    pngChunk("acTL", concatBytes([u32(canvases.length), u32(loopCount)])),
  ];

  let sequence = 0;
  let previousImageData: ImageData | null = null;
  for (let i = 0; i < canvases.length; i += 1) {
    const ctx = canvases[i].getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error(t("animated_line_sticker.error_canvas_create"));
    const imageData = ctx.getImageData(0, 0, width, height);
    const bounds = i === 0 ? fullImageDataBounds(imageData) : detectChangedBounds(previousImageData, imageData);
    const encodedImageData = i === 0 ? imageData : cropImageData(imageData, bounds);
    const compressed = await deflateBytes(toPngScanlines(encodedImageData), t);
    const frameControl = concatBytes([
      u32(sequence++),
      u32(encodedImageData.width),
      u32(encodedImageData.height),
      u32(bounds.left),
      u32(bounds.top),
      u16(frameDelaysMs[i]),
      u16(1000),
      new Uint8Array([0, 0]),
    ]);
    chunks.push(pngChunk("fcTL", frameControl));
    if (i === 0) {
      chunks.push(pngChunk("IDAT", compressed));
    } else {
      chunks.push(pngChunk("fdAT", concatBytes([u32(sequence++), compressed])));
    }
    previousImageData = imageData;
  }

  chunks.push(pngChunk("IEND"));
  return new Blob([concatBytes(chunks)], { type: "image/png" });
}

async function createLineMainImageApngBlob(
  frames: FrameItem[],
  durationSec: number,
  loopCount: number,
  t: Translate
): Promise<Blob> {
  if (frames.length < 5) throw new Error("主要圖片 APNG 至少需要 5 禎。請先上傳完整動畫禎。");

  const renderData = await prepareLineRenderData(frames, t);
  const baseCanvases = renderData.images.map((image, index) => {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error(t("animated_line_sticker.error_canvas_create"));
    drawPreparedFrame(ctx, image, renderData.plans[index]);
    return canvas;
  });

  const boundsList = baseCanvases.map((canvas) => detectCanvasAlphaBounds(canvas) ?? makeFullBounds(canvas.width, canvas.height));
  const crop = expandBounds(unionBounds(boundsList), OUTPUT_WIDTH, OUTPUT_HEIGHT, 2);
  const mainCanvases = baseCanvases.map((canvas) => (
    drawCanvasWithCropToTransparentOutput(canvas, crop, LINE_MAIN_IMAGE_WIDTH, LINE_MAIN_IMAGE_HEIGHT, 6)
  ));

  return createSizedApngFromCanvases(mainCanvases, LINE_MAIN_IMAGE_WIDTH, LINE_MAIN_IMAGE_HEIGHT, durationSec, loopCount, t);
}

async function createLineSmallImagesZip(frames: FrameItem[], durationSec: number, loopCount: number, t: Translate) {
  const mainBlob = await createLineMainImageApngBlob(frames, durationSec, loopCount, t);
  const tabBlob = await createLineStaticSmallImageBlob(frames, t, LINE_TAB_ICON_WIDTH, LINE_TAB_ICON_HEIGHT, 2);
  const note = [
    "LINE 動態貼圖小圖匯出",
    `main_240x240.png：主要圖片 ${LINE_MAIN_IMAGE_WIDTH}×${LINE_MAIN_IMAGE_HEIGHT}px，APNG 動態檔`,
    `tab_96x74.png：聊天室標籤圖片 ${LINE_TAB_ICON_WIDTH}×${LINE_TAB_ICON_HEIGHT}px，PNG 靜態檔`,
    "main 使用整組動畫禎輸出；tab 使用第 1 禎自動裁掉透明留白後置中輸出。",
    "注意：聊天室標籤圖片右上角的小播放符號由 LINE 系統自動加上，請不要自己加。",
  ].join("\n");

  return makeZip([
    { name: "main_240x240.png", data: new Uint8Array(await mainBlob.arrayBuffer()) },
    { name: "tab_96x74.png", data: new Uint8Array(await tabBlob.arrayBuffer()) },
    { name: "readme.txt", data: new TextEncoder().encode(note) },
  ]);
}


function buildTargetRect(crop: AlphaBounds, scale: number): DrawRect {
  const width = Math.round(crop.width * scale);
  const height = Math.round(crop.height * scale);
  return {
    x: Math.round((OUTPUT_WIDTH - width) / 2),
    y: Math.round((OUTPUT_HEIGHT - height) / 2),
    width,
    height,
  };
}

async function prepareLineRenderData(frames: FrameItem[], t: Translate): Promise<LineRenderData> {
  const images = await Promise.all(frames.map((frame) => loadHtmlImage(frame, t)));
  const sizes = images.map((image) => ({ width: image.naturalWidth || image.width, height: image.naturalHeight || image.height }));
  const sameSourceSize = sizes.length === 0 || sizes.every((size) => size.width === sizes[0].width && size.height === sizes[0].height);

  const rawBounds = images.map((image, index) => detectAlphaBounds(image) ?? makeFullBounds(sizes[index].width, sizes[index].height));
  const expandedBounds = rawBounds.map((bounds, index) => expandBounds(bounds, sizes[index].width, sizes[index].height));
  const union = sameSourceSize ? expandBounds(unionBounds(rawBounds), sizes[0].width, sizes[0].height) : unionBounds(expandedBounds);
  const maxCropWidth = sameSourceSize ? union.width : Math.max(...expandedBounds.map((bounds) => bounds.width));
  const maxCropHeight = sameSourceSize ? union.height : Math.max(...expandedBounds.map((bounds) => bounds.height));
  const scale = Math.min(
    (OUTPUT_WIDTH - OUTPUT_SAFE_PADDING * 2) / Math.max(1, maxCropWidth),
    (OUTPUT_HEIGHT - OUTPUT_SAFE_PADDING * 2) / Math.max(1, maxCropHeight)
  );

  const plans = images.map((_, index) => {
    const crop = sameSourceSize ? union : expandedBounds[index];
    return { crop, target: buildTargetRect(crop, scale) };
  });

  const maxTargetWidth = Math.max(...plans.map((plan) => plan.target.width), 1);
  const maxTargetHeight = Math.max(...plans.map((plan) => plan.target.height), 1);
  const fillPercent = Math.round(Math.max(maxTargetWidth / OUTPUT_WIDTH, maxTargetHeight / OUTPUT_HEIGHT) * 100);
  const originalSizeText = sameSourceSize && sizes[0]
    ? `${sizes[0].width}×${sizes[0].height}px`
    : sizes.map((size) => `${size.width}×${size.height}`).join("、");

  return {
    images,
    plans,
    summary: {
      originalSizeText,
      cropSizeText: sameSourceSize ? `${union.width}×${union.height}px` : `${maxCropWidth}×${maxCropHeight}px`,
      outputSizeText: `${OUTPUT_WIDTH}×${OUTPUT_HEIGHT}px`,
      fillPercent,
      sameSourceSize,
      hasLargeTransparentMargin: fillPercent < 82,
    },
  };
}

function drawPreparedFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  plan: LineRenderPlan,
  options: { contentScale?: number; quantizeBits?: number; fillWhite?: boolean } = {}
) {
  ctx.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  if (options.fillWhite) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  }

  const contentScale = Math.min(Math.max(options.contentScale ?? 1, 0.65), 1);
  const targetWidth = Math.round(plan.target.width * contentScale);
  const targetHeight = Math.round(plan.target.height * contentScale);
  const targetX = Math.round(plan.target.x + (plan.target.width - targetWidth) / 2);
  const targetY = Math.round(plan.target.y + (plan.target.height - targetHeight) / 2);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    plan.crop.left,
    plan.crop.top,
    plan.crop.width,
    plan.crop.height,
    targetX,
    targetY,
    targetWidth,
    targetHeight
  );
}

function getPreparedFrameImageData(
  image: HTMLImageElement,
  plan: LineRenderPlan,
  options: { contentScale?: number; quantizeBits?: number } = {}
) {
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas 建立失敗，請重新整理後再試一次。");
  drawPreparedFrame(ctx, image, plan, options);
  const imageData = ctx.getImageData(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
  const quantizeBits = options.quantizeBits ?? 8;
  if (quantizeBits < 8) {
    const step = 1 << (8 - quantizeBits);
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i + 3] === 0) continue;
      imageData.data[i] = Math.round(imageData.data[i] / step) * step;
      imageData.data[i + 1] = Math.round(imageData.data[i + 1] / step) * step;
      imageData.data[i + 2] = Math.round(imageData.data[i + 2] / step) * step;
      if (imageData.data[i + 3] > 245) imageData.data[i + 3] = 255;
    }
  }
  return imageData;
}

function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG 產生失敗，請重新整理後再試一次。"));
    }, "image/png");
  });
}

async function createLineReadyFrameFiles(frames: FrameItem[], t: Translate) {
  const renderData = await prepareLineRenderData(frames, t);
  const files: { name: string; data: Uint8Array }[] = [];

  for (let i = 0; i < frames.length; i += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error(t("animated_line_sticker.error_canvas_create"));
    drawPreparedFrame(ctx, renderData.images[i], renderData.plans[i]);
    const blob = await canvasToPngBlob(canvas);
    files.push({
      name: `frames/frame_${String(i + 1).padStart(3, "0")}.png`,
      data: new Uint8Array(await blob.arrayBuffer()),
    });
  }

  return { files, summary: renderData.summary };
}

async function createLineReadyPreviewFrames(frames: FrameItem[], t: Translate) {
  const renderData = await prepareLineRenderData(frames, t);
  const previewFrames: LinePreviewFrame[] = [];

  for (let i = 0; i < frames.length; i += 1) {
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error(t("animated_line_sticker.error_canvas_create"));
    drawPreparedFrame(ctx, renderData.images[i], renderData.plans[i]);
    const blob = await canvasToPngBlob(canvas);
    previewFrames.push({ id: frames[i].id, name: frames[i].name, url: URL.createObjectURL(blob) });
  }

  return { frames: previewFrames, summary: renderData.summary };
}

function readImageFile(file: File, t: Translate): Promise<FrameItem> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      let transparent: boolean | null = null;
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        try {
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          for (let i = 3; i < data.length; i += 4) {
            if (data[i] < 255) {
              transparent = true;
              break;
            }
          }
          if (transparent === null) transparent = false;
        } catch {
          transparent = null;
        }
      }
      resolve({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        url,
        name: file.name,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        transparent,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(t("animated_line_sticker.error_read_image", { name: file.name })));
    };
    img.src = url;
  });
}

function removeSmallTransparentEdgeFragments(
  canvas: HTMLCanvasElement,
  edgeRatio = 0.075,
  maxFragmentRatio = 0.018,
) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  const total = width * height;
  const mask = new Uint8Array(total);
  let visibleCount = 0;

  for (let i = 0; i < total; i += 1) {
    if (data[i * 4 + 3] > 20) {
      mask[i] = 1;
      visibleCount += 1;
    }
  }
  if (!visibleCount) return;

  const seen = new Uint8Array(total);
  const queue = new Int32Array(total);
  const components: Array<{
    pixels: number[];
    size: number;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  }> = [];

  for (let start = 0; start < total; start += 1) {
    if (!mask[start] || seen[start]) continue;
    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    seen[start] = 1;
    const pixels: number[] = [];
    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    while (head < tail) {
      const current = queue[head++];
      pixels.push(current);
      const x = current % width;
      const y = Math.floor(current / width);
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);

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

    components.push({
      pixels,
      size: pixels.length,
      minX,
      minY,
      maxX,
      maxY,
    });
  }

  if (components.length <= 1) return;

  components.sort((a, b) => b.size - a.size);
  const edgeX = Math.max(4, Math.round(width * edgeRatio));
  const edgeY = Math.max(4, Math.round(height * edgeRatio));
  const maxFragmentSize = Math.max(
    10,
    Math.round(visibleCount * maxFragmentRatio),
  );

  let changed = false;
  for (const component of components.slice(1)) {
    const nearEdge =
      component.minX < edgeX ||
      component.minY < edgeY ||
      component.maxX >= width - edgeX ||
      component.maxY >= height - edgeY;
    if (!nearEdge || component.size > maxFragmentSize) continue;

    for (const index of component.pixels) {
      data[index * 4 + 3] = 0;
    }
    changed = true;
  }

  if (changed) ctx.putImageData(imageData, 0, 0);
}

async function sanitizeStaticHandoffStickerFile(
  file: File,
  t: Translate,
): Promise<File> {
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () =>
        reject(
          new Error(
            t("animated_line_sticker.error_read_image", { name: file.name }),
          ),
        );
      img.src = sourceUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return file;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
    removeSmallTransparentEdgeFragments(canvas);

    const blob = await canvasToPngBlob(canvas);
    return new File([blob], file.name, { type: "image/png" });
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 800);
}

function getCrc32Table() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = getCrc32Table();

function crc32(data: ByteArray) {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function concatBytes(parts: ByteArray[]): Uint8Array<ArrayBuffer> {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function toArrayBuffer(data: ByteArray): ArrayBuffer {
  const copy = new Uint8Array(data.byteLength);
  copy.set(data);
  return copy.buffer;
}

function u32(value: number) {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value >>> 0, false);
  return out;
}

function u16(value: number) {
  const out = new Uint8Array(2);
  new DataView(out.buffer).setUint16(0, value, false);
  return out;
}

function pngChunk(type: string, data = new Uint8Array()) {
  const typeBytes = new TextEncoder().encode(type);
  return concatBytes([u32(data.length), typeBytes, data, u32(crc32(concatBytes([typeBytes, data])))]);
}

async function deflateBytes(input: ByteArray, t: Translate): Promise<Uint8Array<ArrayBuffer>> {
  const CompressionStreamCtor = (window as any).CompressionStream;
  if (!CompressionStreamCtor || typeof Blob === "undefined") {
    throw new Error(t("animated_line_sticker.error_apng_compression_unsupported"));
  }

  // 避免 writable 寫入後再讀取 readable 造成部分瀏覽器卡住：
  // 直接用 Blob stream pipeThrough，Chrome / Edge 較穩。
  const compressedStream = new Blob([toArrayBuffer(input)]).stream().pipeThrough(new CompressionStreamCtor("deflate"));
  const compressed = await new Response(compressedStream).arrayBuffer();
  return new Uint8Array(compressed);
}

async function loadCanvasFrame(
  frame: FrameItem,
  t: Translate,
  options: { contentScale?: number; quantizeBits?: number } = {}
): Promise<ImageData> {
  const renderData = await prepareLineRenderData([frame], t);
  return getPreparedFrameImageData(renderData.images[0], renderData.plans[0], options);
}

function toPngScanlines(imageData: ImageData) {
  const { width, height, data } = imageData;
  const raw = new Uint8Array((width * 4 + 1) * height);
  let source = 0;
  let target = 0;
  for (let y = 0; y < height; y += 1) {
    raw[target] = 0;
    target += 1;
    raw.set(data.subarray(source, source + width * 4), target);
    source += width * 4;
    target += width * 4;
  }
  return raw;
}

function makeBounds(left: number, top: number, right: number, bottom: number): AlphaBounds {
  return normalizeBounds({ left, top, right, bottom, width: right - left, height: bottom - top });
}

function fullImageDataBounds(imageData: ImageData): AlphaBounds {
  return makeBounds(0, 0, imageData.width, imageData.height);
}

function detectChangedBounds(previous: ImageData | null, current: ImageData): AlphaBounds {
  if (!previous || previous.width !== current.width || previous.height !== current.height) {
    return fullImageDataBounds(current);
  }

  const prev = previous.data;
  const next = current.data;
  const { width, height } = current;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      if (
        prev[index] !== next[index] ||
        prev[index + 1] !== next[index + 1] ||
        prev[index + 2] !== next[index + 2] ||
        prev[index + 3] !== next[index + 3]
      ) {
        if (x < left) left = x;
        if (y < top) top = y;
        if (x > right) right = x;
        if (y > bottom) bottom = y;
      }
    }
  }

  if (right < left || bottom < top) return makeBounds(0, 0, 1, 1);
  return makeBounds(left, top, right + 1, bottom + 1);
}

function cropImageData(imageData: ImageData, bounds: AlphaBounds): ImageData {
  const safe = makeBounds(
    Math.max(0, Math.min(imageData.width - 1, bounds.left)),
    Math.max(0, Math.min(imageData.height - 1, bounds.top)),
    Math.max(1, Math.min(imageData.width, bounds.right)),
    Math.max(1, Math.min(imageData.height, bounds.bottom))
  );
  const cropped = new ImageData(safe.width, safe.height);
  for (let y = 0; y < safe.height; y += 1) {
    const sourceStart = ((safe.top + y) * imageData.width + safe.left) * 4;
    const sourceEnd = sourceStart + safe.width * 4;
    cropped.data.set(imageData.data.subarray(sourceStart, sourceEnd), y * safe.width * 4);
  }
  return cropped;
}

async function createApngBlob(
  frames: FrameItem[],
  durationSec: number,
  loopCount: number,
  t: Translate,
  options: { contentScale?: number; quantizeBits?: number } = {}
) {
  if (frames.length < 5) throw new Error(t("animated_line_sticker.error_min_frames_apng"));

  // LINE Creators Market 對動畫貼圖的「單次播放時間」檢查很嚴格：
  // 只能是 1 / 2 / 3 / 4 秒，不能出現 1.998 秒、2.004 秒這種四捨五入誤差。
  // 例如 6 張禎設定 2 秒時，不能每禎都用 333ms（總長會變 1998ms）。
  // 這裡改成把毫秒誤差平均分配，確保每一輪總和剛好等於 durationSec * 1000。
  const safeDurationSec = [1, 2, 3, 4].includes(durationSec) ? durationSec : 2;
  const totalDurationMs = safeDurationSec * 1000;
  const baseDelayMs = Math.floor(totalDurationMs / frames.length);
  const remainderMs = totalDurationMs - baseDelayMs * frames.length;
  const frameDelaysMs = frames.map((_, index) => baseDelayMs + (index < remainderMs ? 1 : 0));
  const renderData = await prepareLineRenderData(frames, t);

  const pngSignature = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = concatBytes([
    u32(OUTPUT_WIDTH),
    u32(OUTPUT_HEIGHT),
    new Uint8Array([8, 6, 0, 0, 0]),
  ]);

  const chunks: Uint8Array[] = [
    pngSignature,
    pngChunk("IHDR", ihdrData),
    pngChunk("acTL", concatBytes([u32(frames.length), u32(loopCount)])),
  ];

  let sequence = 0;
  let previousImageData: ImageData | null = null;
  for (let i = 0; i < frames.length; i += 1) {
    const imageData = getPreparedFrameImageData(renderData.images[i], renderData.plans[i], options);

    // APNG 若每一禎都用完整 320×270 RGBA 打包，12～20 禎很容易超過 1MB，
    // 甚至讓瀏覽器壓縮卡住。第 2 禎之後改用「差異矩形」：只寫入和上一禎不同的區域。
    // APNG 播放器會把這個小矩形蓋到上一禎上，畫面等同完整禎，但檔案小很多。
    const bounds = i === 0 ? fullImageDataBounds(imageData) : detectChangedBounds(previousImageData, imageData);
    const encodedImageData = i === 0 ? imageData : cropImageData(imageData, bounds);
    const compressed = await deflateBytes(toPngScanlines(encodedImageData), t);
    const frameControl = concatBytes([
      u32(sequence++),
      u32(encodedImageData.width),
      u32(encodedImageData.height),
      u32(bounds.left),
      u32(bounds.top),
      u16(frameDelaysMs[i]),
      u16(1000),
      new Uint8Array([0, 0]),
    ]);
    chunks.push(pngChunk("fcTL", frameControl));
    if (i === 0) {
      chunks.push(pngChunk("IDAT", compressed));
    } else {
      chunks.push(pngChunk("fdAT", concatBytes([u32(sequence++), compressed])));
    }
    previousImageData = imageData;
  }

  chunks.push(pngChunk("IEND"));
  return new Blob([concatBytes(chunks)], { type: "image/png" });
}


async function createLineSafeApngBlob(
  frames: FrameItem[],
  durationSec: number,
  loopCount: number,
  t: Translate,
  onProgress?: (message: string) => void
) {
  // 10 禎以上若連續跑多組壓縮 preset，瀏覽器容易看起來像「沒反應」。
  // 快速模式只降低色階，不再縮小角色。LINE 動態貼圖的單檔上限是 1MB，
  // 角色尺寸應保持一致，避免同一組貼圖大小忽大忽小。
  if (frames.length >= 10) {
    const fastPreset = frames.length >= 16
      ? { contentScale: 1, quantizeBits: 5 }
      : { contentScale: 1, quantizeBits: 6 };
    onProgress?.(`正在產生 APNG（${frames.length} 禎快速模式，可能需要 10～30 秒）...`);
    await waitMs(80);
    let best = await createApngBlob(frames, durationSec, loopCount, t, fastPreset);
    if (best.size <= LINE_APNG_MAX_BYTES) return best;
    // 大圖／花束複雜細節容易超標：先嘗試降低色階，保留原人物比例。
    for (const quantizeBits of [4, 3]) {
      onProgress?.(`正在進一步壓縮 APNG（${quantizeBits} bit 色階）…`);
      await waitMs(40);
      const next = await createApngBlob(frames, durationSec, loopCount, t, { contentScale: 1, quantizeBits });
      if (next.size < best.size) best = next;
      if (best.size <= LINE_APNG_MAX_BYTES) return best;
    }
    return best;
  }

  // 5～9 禎通常可在保留角色大小的前提下壓到 LINE 1MB 內。
  // 不再自動縮小 contentScale，避免上傳 LINE 後某一張動畫人物看起來比其他張小。
  // 若檔案仍超過 1MB，只降低色階，不縮人物尺寸；由使用者決定是否重畫或簡化裝飾。
  const presets = [
    { contentScale: 1, quantizeBits: 8 },
    { contentScale: 1, quantizeBits: 7 },
    { contentScale: 1, quantizeBits: 6 },
    { contentScale: 1, quantizeBits: 5 },
    { contentScale: 1, quantizeBits: 4 },
    { contentScale: 1, quantizeBits: 3 },
  ];

  let smallest: Blob | null = null;
  for (let index = 0; index < presets.length; index += 1) {
    const preset = presets[index];
    onProgress?.(`正在壓縮 APNG：第 ${index + 1}/${presets.length} 組...`);
    await waitMs(40);
    const blob = await createApngBlob(frames, durationSec, loopCount, t, preset);
    if (!smallest || blob.size < smallest.size) smallest = blob;
    if (blob.size <= LINE_APNG_MAX_BYTES) return blob;
    await waitMs(20);
  }

  // 即使超過 1MB，也仍回傳最小檔讓使用者可下載檢查，不要讓畫面看起來沒有反應。
  if (smallest) return smallest;

  throw new Error("APNG 產生失敗，請減少禎數或重新整理後再試一次。");
}

function toDosDateTime(date = new Date()) {
  const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { dosTime, dosDate };
}


/** ZIP 打包前以位元組檢查真實 PNG / APNG，而非只信任副檔名。 */
function verifyLineOutputPng(data: Uint8Array, name: string, width: number, height: number, animated: boolean) {
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (data.length < 33 || !signature.every((byte, index) => data[index] === byte)) {
    throw new Error(`${name} 不是有效 PNG，請重新產生。`);
  }
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  if (view.getUint32(16) !== width || view.getUint32(20) !== height) {
    throw new Error(`${name} 尺寸不正確：LINE 要求 ${width}×${height}px。`);
  }
  let offset = 8;
  let frameCount = 0;
  let hasAnimationControl = false;
  let hasEnd = false;
  while (offset + 12 <= data.length) {
    const length = view.getUint32(offset);
    const end = offset + 12 + length;
    if (end > data.length) throw new Error(`${name} PNG 資料不完整。`);
    const type = String.fromCharCode(data[offset + 4], data[offset + 5], data[offset + 6], data[offset + 7]);
    if (type === "acTL") hasAnimationControl = true;
    if (type === "fcTL") frameCount++;
    if (type === "IEND") { hasEnd = true; break; }
    offset = end;
  }
  if (!hasEnd) throw new Error(`${name} PNG 缺少結束標記，請重新輸出。`);
  if (animated && (!hasAnimationControl || frameCount < 5 || frameCount > 20)) {
    throw new Error(`${name} 必須是 5～20 畫格的 APNG，不能只用靜態 PNG 改檔名。`);
  }
  if (!animated && hasAnimationControl) {
    throw new Error(`${name} 必須是靜態 PNG。`);
  }
}

function makeZip(files: { name: string; data: Uint8Array }[]) {
  const localParts: ByteArray[] = [];
  const centralParts: ByteArray[] = [];
  let offset = 0;
  const encoder = new TextEncoder();
  const { dosTime, dosDate } = toDosDateTime();

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.data);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true);
    lv.setUint16(4, 20, true);
    lv.setUint16(6, 0x0800, true);
    lv.setUint16(8, 0, true);
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, file.data.length, true);
    lv.setUint32(22, file.data.length, true);
    lv.setUint16(26, nameBytes.length, true);
    localHeader.set(nameBytes, 30);
    localParts.push(localHeader, file.data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(10, 0, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, file.data.length, true);
    cv.setUint32(24, file.data.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint32(42, offset, true);
    centralHeader.set(nameBytes, 46);
    centralParts.push(centralHeader);

    offset += localHeader.length + file.data.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  return new Blob([...localParts, ...centralParts, end].map(toArrayBuffer), { type: "application/zip" });
}

async function createFramesZip(frames: FrameItem[], durationSec: number, loopCount: number, t: Translate) {
  const ready = await createLineReadyFrameFiles(frames, t);
  const files: { name: string; data: Uint8Array }[] = [...ready.files];
  const checklist = [
    t("animated_line_sticker.checklist_title"),
    t("animated_line_sticker.checklist_output_size", { width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT }),
    `正式輸出尺寸：${ready.summary.outputSizeText}`,
    `原始尺寸：${ready.summary.originalSizeText}`,
    `共同裁切範圍：約 ${ready.summary.cropSizeText}`,
    `主體佔比：約 ${ready.summary.fillPercent}%`,
    "已先裁掉多餘透明邊，再放入 320×270 透明畫布，避免 LINE 後台人物顯得太小。",
    "LINE 動態貼圖 APNG 單檔必須小於 1MB；本工具會自動壓縮，若仍超過會提醒重做。",
    t("animated_line_sticker.checklist_frame_count", { count: frames.length }),
    t("animated_line_sticker.checklist_duration", { seconds: durationSec }),
    t("animated_line_sticker.checklist_loop_count", { count: loopCount }),
    t("animated_line_sticker.checklist_total_duration", { seconds: durationSec * loopCount }),
    t("animated_line_sticker.checklist_recommendation"),
    t("animated_line_sticker.checklist_publish_reminder"),
  ].join("\n");
  files.push({ name: "LINE_dynamic_sticker_checklist.txt", data: new TextEncoder().encode(checklist) });
  return makeZip(files);
}



async function loadHtmlImage(frame: FrameItem, t: Translate): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(t("animated_line_sticker.error_load_image", { name: frame.name })));
    image.src = frame.url;
  });
}

function drawImageToCanvas(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
  fillWhite = false,
  allowScaleUp = false
) {
  ctx.clearRect(0, 0, targetWidth, targetHeight);
  if (fillWhite) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }
  const imageWidth = image instanceof HTMLImageElement ? image.naturalWidth || image.width : image.width;
  const imageHeight = image instanceof HTMLImageElement ? image.naturalHeight || image.height : image.height;
  const maxRatio = allowScaleUp ? Number.POSITIVE_INFINITY : 1;
  const ratio = Math.min(targetWidth / imageWidth, targetHeight / imageHeight, maxRatio);
  const w = Math.round(imageWidth * ratio);
  const h = Math.round(imageHeight * ratio);
  const x = Math.round((targetWidth - w) / 2);
  const y = Math.round((targetHeight - h) / 2);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, x, y, w, h);
}

function drawImageToOutputCanvas(ctx: CanvasRenderingContext2D, image: HTMLImageElement, fillWhite = false) {
  drawImageToCanvas(ctx, image, OUTPUT_WIDTH, OUTPUT_HEIGHT, fillWhite, false);
}

function quantizeRgbaToGifIndex(r: number, g: number, b: number, a: number) {
  if (a < 16) return 255;
  const r3 = r >> 5;
  const g3 = g >> 5;
  const b2 = b >> 6;
  const index = (r3 << 5) | (g3 << 2) | b2;
  return index === 255 ? 254 : index;
}

function createGifPalette() {
  const palette = new Uint8Array(256 * 3);
  for (let i = 0; i < 255; i += 1) {
    const r3 = (i >> 5) & 7;
    const g3 = (i >> 2) & 7;
    const b2 = i & 3;
    palette[i * 3] = Math.round((r3 / 7) * 255);
    palette[i * 3 + 1] = Math.round((g3 / 7) * 255);
    palette[i * 3 + 2] = Math.round((b2 / 3) * 255);
  }
  return palette;
}

function lzwEncodeGifIndices(indices: Uint8Array, minCodeSize = 8) {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let nextCode = endCode + 1;
  let codeSize = minCodeSize + 1;
  const dict = new Map<string, number>();

  const resetDict = () => {
    dict.clear();
    for (let i = 0; i < clearCode; i += 1) dict.set(String.fromCharCode(i), i);
    nextCode = endCode + 1;
    codeSize = minCodeSize + 1;
  };

  const bytes: number[] = [];
  let bitBuffer = 0;
  let bitCount = 0;

  const writeCode = (code: number) => {
    bitBuffer |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      bytes.push(bitBuffer & 0xff);
      bitBuffer >>= 8;
      bitCount -= 8;
    }
  };

  resetDict();
  writeCode(clearCode);

  let phrase = String.fromCharCode(indices[0] ?? 0);
  for (let i = 1; i < indices.length; i += 1) {
    const char = String.fromCharCode(indices[i]);
    const phrasePlusChar = phrase + char;
    if (dict.has(phrasePlusChar)) {
      phrase = phrasePlusChar;
    } else {
      writeCode(dict.get(phrase) ?? 0);
      if (nextCode < 4096) {
        dict.set(phrasePlusChar, nextCode);
        nextCode += 1;
        if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
      } else {
        writeCode(clearCode);
        resetDict();
      }
      phrase = char;
    }
  }

  if (phrase) writeCode(dict.get(phrase) ?? 0);
  writeCode(endCode);
  if (bitCount > 0) bytes.push(bitBuffer & 0xff);
  return new Uint8Array(bytes);
}

function splitGifBlocks(data: Uint8Array) {
  const blocks: Uint8Array[] = [];
  for (let i = 0; i < data.length; i += 255) {
    const chunk = data.slice(i, i + 255);
    blocks.push(new Uint8Array([chunk.length]), chunk);
  }
  blocks.push(new Uint8Array([0]));
  return concatBytes(blocks);
}

async function createGifBlob(frames: FrameItem[], durationSec: number, loopCount: number, t: Translate) {
  if (frames.length < 2) throw new Error(t("animated_line_sticker.error_min_frames_gif"));
  const renderData = await prepareLineRenderData(frames, t);
  const canvas = document.createElement("canvas");
  canvas.width = OUTPUT_WIDTH;
  canvas.height = OUTPUT_HEIGHT;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error(t("animated_line_sticker.error_canvas_create"));

  const encoder = new TextEncoder();
  const header = encoder.encode("GIF89a");
  const logicalScreen = new Uint8Array(7);
  const view = new DataView(logicalScreen.buffer);
  view.setUint16(0, OUTPUT_WIDTH, true);
  view.setUint16(2, OUTPUT_HEIGHT, true);
  logicalScreen[4] = 0xf7;
  logicalScreen[5] = 255;
  logicalScreen[6] = 0;

  const loopExtension = new Uint8Array([
    0x21, 0xff, 0x0b, 0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30,
    0x03, 0x01, loopCount & 0xff, (loopCount >> 8) & 0xff, 0x00,
  ]);
  const delayCs = Math.max(2, Math.round((durationSec * 100) / frames.length));
  const parts: Uint8Array[] = [header, logicalScreen, createGifPalette(), loopExtension];

  renderData.images.forEach((image, index) => {
    drawPreparedFrame(ctx, image, renderData.plans[index]);
    const data = ctx.getImageData(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT).data;
    const indices = new Uint8Array(OUTPUT_WIDTH * OUTPUT_HEIGHT);
    for (let i = 0, p = 0; i < data.length; i += 4, p += 1) {
      indices[p] = quantizeRgbaToGifIndex(data[i], data[i + 1], data[i + 2], data[i + 3]);
    }
    const compressed = lzwEncodeGifIndices(indices, 8);
    const gce = new Uint8Array([0x21, 0xf9, 0x04, 0x09, delayCs & 0xff, (delayCs >> 8) & 0xff, 255, 0x00]);
    const descriptor = new Uint8Array(10);
    descriptor[0] = 0x2c;
    const dv = new DataView(descriptor.buffer);
    dv.setUint16(5, OUTPUT_WIDTH, true);
    dv.setUint16(7, OUTPUT_HEIGHT, true);
    descriptor[9] = 0;
    parts.push(gce, descriptor, new Uint8Array([8]), splitGifBlocks(compressed));
  });

  parts.push(new Uint8Array([0x3b]));
  return new Blob([concatBytes(parts)], { type: "image/gif" });
}

async function waitMs(ms: number) {
  await new Promise((resolve) => window.setTimeout(resolve, ms));
}

type VideoExportOptions = {
  width?: number;
  height?: number;
  frameRate?: number;
  videoBitsPerSecond?: number;
  fillWhite?: boolean;
  allowScaleUp?: boolean;
};

async function createVideoBlob(
  frames: FrameItem[],
  durationSec: number,
  loopCount: number,
  t: Translate,
  options: VideoExportOptions = {}
) {
  const MediaRecorderCtor = (window as any).MediaRecorder;
  if (!MediaRecorderCtor) throw new Error(t("animated_line_sticker.error_video_record_unsupported"));

  const width = options.width ?? OUTPUT_WIDTH;
  const height = options.height ?? OUTPUT_HEIGHT;
  const frameRate = options.frameRate ?? 30;
  const fillWhite = options.fillWhite ?? true;
  const allowScaleUp = options.allowScaleUp ?? false;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: !fillWhite });
  if (!ctx) throw new Error(t("animated_line_sticker.error_canvas_create"));

  const renderData = await prepareLineRenderData(frames, t);
  // 單張 HD MP4 直接以來源禎繪製到 2 倍暫存畫布，不先降到 320x270 再放大。
  const sourceScale = allowScaleUp && width >= 1000 ? 2 : 1;
  const preparedCanvas = document.createElement("canvas");
  preparedCanvas.width = OUTPUT_WIDTH * sourceScale;
  preparedCanvas.height = OUTPUT_HEIGHT * sourceScale;
  const preparedCtx = preparedCanvas.getContext("2d", { willReadFrequently: true });
  if (!preparedCtx) throw new Error(t("animated_line_sticker.error_canvas_create"));
  preparedCtx.setTransform(sourceScale, 0, 0, sourceScale, 0, 0);
  const stream = (canvas as any).captureStream?.(frameRate);
  if (!stream) throw new Error(t("animated_line_sticker.error_canvas_video_unsupported"));

  const mimeCandidates = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  const mimeType = mimeCandidates.find((type) => MediaRecorderCtor.isTypeSupported?.(type)) || "";
  const isMp4 = mimeType.includes("mp4");
  const recorderOptions: MediaRecorderOptions = mimeType
    ? { mimeType, videoBitsPerSecond: options.videoBitsPerSecond ?? 2500000 }
    : { videoBitsPerSecond: options.videoBitsPerSecond ?? 2500000 };
  const recorder = new MediaRecorderCtor(stream, recorderOptions);
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (event: BlobEvent) => {
    if (event.data && event.data.size > 0) chunks.push(event.data);
  };

  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error(t("animated_line_sticker.error_video_record_failed")));
  });

  recorder.start(100);
  const frameDelay = Math.max(80, Math.round((durationSec * 1000) / Math.max(frames.length, 1)));
  for (let loop = 0; loop < loopCount; loop += 1) {
    for (let i = 0; i < renderData.images.length; i += 1) {
      drawPreparedFrame(preparedCtx, renderData.images[i], renderData.plans[i], { fillWhite: false });
      drawImageToCanvas(ctx, preparedCanvas, width, height, fillWhite, allowScaleUp);
      await waitMs(frameDelay);
    }
  }

  if (recorder.state === "recording" && typeof recorder.requestData === "function") {
    recorder.requestData();
    await waitMs(120);
  }
  if (recorder.state !== "inactive") recorder.stop();
  await stopped;
  stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());

  const blob = new Blob(chunks, { type: mimeType || "video/webm" });
  if (blob.size === 0) {
    throw new Error("影片匯出失敗：瀏覽器產生 0KB 檔案，請重新整理後再試一次，或先下載 GIF 預覽。");
  }

  return {
    blob,
    extension: isMp4 ? "mp4" : "webm",
    isMp4,
  };
}


/**
 * 本機展示影片：依 ZIP 已選的各張動態效果重畫影格，以 1080x1920 直式畫布錄影。
 * 影片僅供社群展示，不能取代 LINE 上架所需 APNG ZIP。
 * MP4 是否可用取決於瀏覽器的 MediaRecorder 編碼能力，不會把 WebM 偽裝成 MP4。
 */
async function createBatchShowcaseVideo(
  sources: FrameItem[],
  presets: AutoMotionPreset[],
  onProgress: (finished: number, total: number) => void,
  platform: "line" | "whatsapp" = "line",
): Promise<{ blob: Blob; extension: "mp4" | "webm"; isMp4: boolean }> {
  if (![8, 16, 24].includes(sources.length) || sources.length !== presets.length) {
    throw new Error("展示影片來源與貼圖數量不一致，請先重新產生整套上架 ZIP。");
  }
  const MediaRecorderCtor = window.MediaRecorder;
  if (!MediaRecorderCtor) {
    throw new Error("目前瀏覽器不支援錄製影片，請使用新版 Chrome 或 Edge。");
  }
  const mimeCandidates = [
    "video/mp4;codecs=avc1.42E01E",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  const mimeType = mimeCandidates.find((mime) => MediaRecorderCtor.isTypeSupported(mime));
  if (!mimeType) throw new Error("目前瀏覽器不支援 MP4 或 WebM 錄影。");

  const width = 1080;
  const height = 1920;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("無法建立高清影片畫布。");
  const stream = canvas.captureStream?.(30);
  if (!stream) throw new Error("瀏覽器不支援影片畫布擷取。");

  // 高清展示影片來源直接在 640×540 繪製各動畫層，
  // 避免先壓成 320×270 再放大到直式 1080p 造成二次模糊。
  const drawShowcaseFrame = (bitmap: ImageBitmap, index: number) => {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    const bg = ctx.createLinearGradient(0, 0, 0, height);
    bg.addColorStop(0, "#fff6f8");
    bg.addColorStop(1, "#f7fbff");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#744e61";
    ctx.font = 'bold 58px "Microsoft JhengHei", sans-serif';
    ctx.fillText(platform === "whatsapp" ? "WhatsApp 動態貼圖展示" : "LINE 動態貼圖展示", width / 2, 355);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "rgba(93, 72, 84, 0.14)";
    ctx.shadowBlur = 32;
    ctx.beginPath();
    ctx.roundRect(52, 490, 976, 830, 46);
    ctx.fill();
    ctx.shadowBlur = 0;
    const ratio = Math.min(900 / bitmap.width, 752 / bitmap.height);
    const w = Math.round(bitmap.width * ratio);
    const h = Math.round(bitmap.height * ratio);
    ctx.drawImage(bitmap, (width - w) / 2, 905 - h / 2, w, h);
    ctx.fillStyle = "#886c7a";
    ctx.font = 'bold 46px "Microsoft JhengHei", sans-serif';
    ctx.fillText(`${String(index + 1).padStart(2, "0")} / ${String(sources.length).padStart(2, "0")}`, width / 2, 1480);
  };

  const recorder = new MediaRecorderCtor(stream, {
    mimeType,
    videoBitsPerSecond: 12_000_000,
  });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) chunks.push(event.data);
  };
  const stopped = new Promise<void>((resolve, reject) => {
    recorder.onstop = () => resolve();
    recorder.onerror = () => reject(new Error("高清影片錄製失敗，請重新嘗試。"));
  });

  try {
    // 先產生整批動畫 PNG，再開始錄影；避免等待下一張動畫生成時影片停頓。
    // 儲存壓縮 PNG 而非一次保存全部 ImageBitmap，控制 16/24 張記憶體。
    const prepared: File[][] = [];
    for (let i = 0; i < sources.length; i += 1) {
      prepared.push(await generateAutoAnimationFrameFiles(sources[i].file, presets[i], 2));
    }
    let current = await Promise.all(prepared[0].map((file) => createImageBitmap(file)));
    let next: Promise<ImageBitmap[]> | null = prepared[1]
      ? Promise.all(prepared[1].map((file) => createImageBitmap(file)))
      : null;
    drawShowcaseFrame(current[0], 0);
    recorder.start(500);
    // 一張貼圖 60 禎（2 秒 × 30FPS），動畫原始 8 禎每禎約停留 7~8 畫格。
    for (let index = 0; index < sources.length; index += 1) {
      const startedAt = performance.now();
      for (let frame = 0; frame < 60; frame += 1) {
        const bitmap = current[Math.min(7, Math.floor(frame * current.length / 60))];
        drawShowcaseFrame(bitmap, index);
        const remaining = startedAt + ((frame + 1) * 1000) / 30 - performance.now();
        if (remaining > 0) await waitMs(remaining);
        else await waitMs(0);
      }
      current.forEach((bitmap) => bitmap.close());
      onProgress(index + 1, sources.length);
      if (index + 1 < sources.length) {
        // 提前在上一張播放時解碼下一組影格，降低張與張間的錄影停頓。
        if (!next) throw new Error("下一組動畫影格預載失敗。");
        current = await next;
        next = prepared[index + 2]
          ? Promise.all(prepared[index + 2].map((file) => createImageBitmap(file)))
          : null;
      }
    }
    if (recorder.state === "recording") {
      recorder.requestData();
      await waitMs(150);
      recorder.stop();
    }
    await stopped;
  } catch (error) {
    if (recorder.state !== "inactive") recorder.stop();
    // 停止後的非同步 rejected Promise 一律有接收端，不會留下瀏覽器未處理拒絕。
    await stopped.catch(() => undefined);
    throw error;
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }

  const blob = new Blob(chunks, { type: mimeType });
  if (!blob.size) throw new Error("影片為 0KB，請保持此分頁開啟並重新產生。");
  const isMp4 = mimeType.includes("mp4");
  return { blob, extension: isMp4 ? "mp4" : "webm", isMp4 };
}

const AnimatedLineStickerTool: React.FC = () => {
  const { t } = useTranslation();
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [durationSec, setDurationSec] = useState(2);
  const [loopCount, setLoopCount] = useState(2);
  const [autoMotionPreset, setAutoMotionPreset] = useState<AutoMotionPreset>("auto");
  const [autoGenerating, setAutoGenerating] = useState(false);
  const [autoPreviewGenerating, setAutoPreviewGenerating] = useState(false);
  const [autoSourceFile, setAutoSourceFile] = useState<File | null>(null);
  const [autoSourceName, setAutoSourceName] = useState("");
  const [autoPreviewFrames, setAutoPreviewFrames] = useState<FrameItem[]>([]);
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>("single");
  const [batchSources, setBatchSources] = useState<FrameItem[]>([]);
  const [batchMotionMode, setBatchMotionMode] =
    useState<BatchMotionMode>("mixed");
  const [batchMotionPreset, setBatchMotionPreset] =
    useState<AutoMotionPreset>("auto");
  const [batchCustomMotionPresets, setBatchCustomMotionPresets] = useState<
    Record<number, AutoMotionPreset>
  >({});
  const [exportPlatform, setExportPlatform] = useState<"line" | "whatsapp">(() =>
    readLineStickerProject()?.platform === "whatsapp" ? "whatsapp" : "line"
  );
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState("");
  const [batchMessage, setBatchMessage] = useState("");
  const [batchVideoBusy, setBatchVideoBusy] = useState(false);
  const [batchVideoProgress, setBatchVideoProgress] = useState(0);
  const [batchVideoMessage, setBatchVideoMessage] = useState("");
  const [batchAnimatedPreviews, setBatchAnimatedPreviews] =
    useState<BatchAnimatedPreview[]>([]);
  const [batchEffectGallery, setBatchEffectGallery] =
    useState<MotionPresetGalleryItem[]>([]);
  const [batchEffectGalleryLoading, setBatchEffectGalleryLoading] =
    useState(false);
  const [batchEffectGalleryProgress, setBatchEffectGalleryProgress] =
    useState(0);
  const [batchEffectGalleryFrame, setBatchEffectGalleryFrame] = useState(0);
  const [handoffLoaded, setHandoffLoaded] = useState(false);
  const [handoffTheme, setHandoffTheme] = useState("");
  const [sourceCaptions, setSourceCaptions] = useState<string[]>([]);
  const saleTextRisks = useMemo(
    () => stickerSaleTextRisks(sourceCaptions),
    [sourceCaptions],
  );
  const [previewIndex, setPreviewIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const [linePreviewFrames, setLinePreviewFrames] = useState<LinePreviewFrame[]>([]);
  const [lineOutputSummary, setLineOutputSummary] = useState<LineOutputSummary | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autoInputRef = useRef<HTMLInputElement | null>(null);
  const batchInputRef = useRef<HTMLInputElement | null>(null);
  const framesRef = useRef<FrameItem[]>([]);
  const linePreviewUrlsRef = useRef<string[]>([]);
  const autoPreviewFramesRef = useRef<FrameItem[]>([]);
  const batchSourcesRef = useRef<FrameItem[]>([]);
  const batchAnimatedPreviewsRef = useRef<BatchAnimatedPreview[]>([]);
  const batchEffectGalleryUrlsRef = useRef<string[]>([]);
  const batchPreviewSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    framesRef.current = frames;
  }, [frames]);

  useEffect(() => {
    autoPreviewFramesRef.current = autoPreviewFrames;
  }, [autoPreviewFrames]);

  useEffect(() => {
    batchSourcesRef.current = batchSources;
  }, [batchSources]);

  useEffect(() => {
    batchAnimatedPreviewsRef.current = batchAnimatedPreviews;
  }, [batchAnimatedPreviews]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromPreviousStep =
      new URLSearchParams(window.location.search).get("from") === "line-sticker";
    if (!fromPreviousStep) return;

    let cancelled = false;
    (async () => {
      try {
        const handoff = await loadAnimatedStickerHandoffBundle();
        const storedFiles = handoff.files;
        if (cancelled || ![8, 16, 24].includes(storedFiles.length)) {
          if (!cancelled) {
            setBatchMessage(
              storedFiles.length
                ? `已收到 ${storedFiles.length} 張；動態整套需 8、16 或 24 張，請回上一步確認。`
                : "沒有讀到上一步的貼圖，請回到貼圖整理頁重新按「下一步」。",
            );
          }
          return;
        }
        const cleanedFiles = await Promise.all(
          storedFiles.map((file) => sanitizeStaticHandoffStickerFile(file, t)),
        );
        const loaded = await Promise.all(
          cleanedFiles.map((file) => readImageFile(file, t)),
        );
        if (cancelled) {
          loaded.forEach((item) => URL.revokeObjectURL(item.url));
          return;
        }
        setBatchSources((previous) => {
          previous.forEach((item) => URL.revokeObjectURL(item.url));
          return loaded;
        });
        setBatchCustomMotionPresets({});
        setHandoffTheme(handoff.project?.theme ?? "");
        // 舊版暫存沒有綁定該批圖片的文字：不顯示誤導的「應有文字」。
        setSourceCaptions(handoff.project?.texts ?? []);
        setWorkflowMode("batch");
        setHandoffLoaded(true);
        setBatchMessage(
          `已從上一步自動帶入 ${loaded.length} 張貼圖，不需要重新上傳。確認動畫效果後，直接按「一鍵產生整套上架 ZIP」。`,
        );
        updateLineStickerProject({ stage: 5 });
      } catch (error: any) {
        if (!cancelled) {
          setBatchMessage(
            error?.message || "讀取上一步貼圖失敗，請回上一步重新操作。",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [t]);

  useEffect(() => {
    return () => {
      framesRef.current.forEach((frame) => URL.revokeObjectURL(frame.url));
      autoPreviewFramesRef.current.forEach((frame) => URL.revokeObjectURL(frame.url));
      batchSourcesRef.current.forEach((frame) => URL.revokeObjectURL(frame.url));
      batchAnimatedPreviewsRef.current.forEach((item) =>
        URL.revokeObjectURL(item.url),
      );
      batchEffectGalleryUrlsRef.current.forEach((url) =>
        URL.revokeObjectURL(url),
      );
      linePreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    linePreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    linePreviewUrlsRef.current = [];

    if (frames.length === 0) {
      setLinePreviewFrames([]);
      setLineOutputSummary(null);
      return undefined;
    }

    (async () => {
      try {
        const result = await createLineReadyPreviewFrames(frames, t);
        if (cancelled) {
          result.frames.forEach((frame) => URL.revokeObjectURL(frame.url));
          return;
        }
        linePreviewUrlsRef.current = result.frames.map((frame) => frame.url);
        setLinePreviewFrames(result.frames);
        setLineOutputSummary(result.summary);
      } catch {
        if (!cancelled) {
          setLinePreviewFrames([]);
          setLineOutputSummary(null);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [frames, t]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      autoPreviewFramesRef.current.forEach((frame) => URL.revokeObjectURL(frame.url));
      autoPreviewFramesRef.current = [];
      setAutoPreviewFrames([]);

      if (!autoSourceFile) {
        setAutoPreviewGenerating(false);
        return;
      }

      setAutoPreviewGenerating(true);
      try {
        const generatedFiles = await generateAutoAnimationFrameFiles(autoSourceFile, autoMotionPreset);
        const loaded = await Promise.all(generatedFiles.map((file) => readImageFile(file, t)));
        if (cancelled) {
          loaded.forEach((frame) => URL.revokeObjectURL(frame.url));
          return;
        }
        autoPreviewFramesRef.current = loaded;
        setAutoPreviewFrames(loaded);
        setPreviewIndex(0);
      } catch {
        if (!cancelled) setAutoPreviewFrames([]);
      } finally {
        if (!cancelled) setAutoPreviewGenerating(false);
      }
    }, 120);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [autoSourceFile, autoMotionPreset, t]);

  useEffect(() => {
    let cancelled = false;

    batchEffectGalleryUrlsRef.current.forEach((url) =>
      URL.revokeObjectURL(url),
    );
    batchEffectGalleryUrlsRef.current = [];
    setBatchEffectGallery([]);
    setBatchEffectGalleryProgress(0);
    setBatchEffectGalleryFrame(0);

    const source = batchSources[0]?.file;
    if (workflowMode !== "batch" || !source) {
      setBatchEffectGalleryLoading(false);
      return undefined;
    }

    setBatchEffectGalleryLoading(true);

    (async () => {
      const items: MotionPresetGalleryItem[] = [];
      const createdUrls: string[] = [];

      try {
        for (let index = 0; index < AUTO_MOTION_PRESETS.length; index += 1) {
          const preset = AUTO_MOTION_PRESETS[index];
          const generated = await generateAutoAnimationFrameFiles(
            source,
            preset.value,
          );

          if (cancelled) break;

          const urls = generated.map((file) => {
            const url = URL.createObjectURL(file);
            createdUrls.push(url);
            return url;
          });

          items.push({ preset: preset.value, urls });
          setBatchEffectGallery([...items]);
          setBatchEffectGalleryProgress(
            Math.round(((index + 1) / AUTO_MOTION_PRESETS.length) * 100),
          );
          await waitMs(10);
        }

        if (cancelled) {
          createdUrls.forEach((url) => URL.revokeObjectURL(url));
          return;
        }

        batchEffectGalleryUrlsRef.current = createdUrls;
        setBatchEffectGallery(items);
      } catch {
        createdUrls.forEach((url) => URL.revokeObjectURL(url));
        if (!cancelled) {
          setBatchEffectGallery([]);
        }
      } finally {
        if (!cancelled) setBatchEffectGalleryLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [batchSources, workflowMode]);

  useEffect(() => {
    if (!batchEffectGallery.length) return undefined;
    const timer = window.setInterval(() => {
      setBatchEffectGalleryFrame((current) => (current + 1) % 8);
    }, 230);
    return () => window.clearInterval(timer);
  }, [batchEffectGallery.length]);

  const activePreviewCount = autoPreviewFrames.length || frames.length;

  useEffect(() => {
    if (activePreviewCount === 0) return undefined;
    const delay = Math.max(80, Math.round((durationSec * 1000) / Math.max(activePreviewCount, 1)));
    const timer = window.setInterval(() => {
      setPreviewIndex((current) => (current + 1) % activePreviewCount);
    }, delay);
    return () => window.clearInterval(timer);
  }, [activePreviewCount, durationSec]);

  const totalFileSize = useMemo(() => frames.reduce((sum, frame) => sum + frame.file.size, 0), [frames]);
  const linePreviewMap = useMemo(() => new Map(linePreviewFrames.map((frame) => [frame.id, frame.url])), [linePreviewFrames]);

  const checks: CheckItem[] = useMemo(() => {
    const allPng = frames.every((frame) => frame.file.type === "image/png" || frame.name.toLowerCase().endsWith(".png"));
    const sameSize = frames.length === 0 || frames.every((frame) => frame.width === frames[0].width && frame.height === frames[0].height);
    const frameCountOk = frames.length >= 5 && frames.length <= 20;
    const durationOk = durationSec * loopCount <= 4;
    const transparentOk = frames.every((frame) => frame.transparent !== false);
    const zipSizeOk = totalFileSize / 1024 / 1024 < MAX_LINE_ZIP_MB;
    const outputFillOk = !lineOutputSummary || !lineOutputSummary.hasLargeTransparentMargin;
    return [
      { label: t("animated_line_sticker.check_frame_count_label"), ok: frameCountOk, message: frames.length ? t("animated_line_sticker.check_frame_count_current", { count: frames.length }) : t("animated_line_sticker.check_frame_count_empty") },
      { label: t("animated_line_sticker.check_png_label"), ok: allPng, message: allPng ? t("animated_line_sticker.check_png_ok") : t("animated_line_sticker.check_png_warn") },
      { label: "正式輸出尺寸", ok: true, message: frames.length ? `匯出 APNG / GIF / ZIP 前會自動整理為 ${OUTPUT_WIDTH}×${OUTPUT_HEIGHT}px。` : "尚未上傳圖片。" },
      { label: "原始每禎尺寸", ok: sameSize, message: sameSize ? "原始尺寸一致；正式輸出也會固定 320×270px。" : "原始尺寸不一致；工具會強制輸出 320×270px，但仍建議先用同尺寸原圖。" },
      { label: "主體佔比", ok: outputFillOk, message: lineOutputSummary ? `正式輸出主體約佔 ${lineOutputSummary.fillPercent}%，裁切範圍約 ${lineOutputSummary.cropSizeText}。` : "上傳後會自動檢查透明留白。" },
      { label: t("animated_line_sticker.check_transparent_label"), ok: transparentOk, message: transparentOk ? t("animated_line_sticker.check_transparent_ok") : t("animated_line_sticker.check_transparent_warn") },
      { label: t("animated_line_sticker.check_duration_label"), ok: durationOk, message: t("animated_line_sticker.check_duration_message", { duration: durationSec, loops: loopCount, total: durationSec * loopCount }) },
      { label: t("animated_line_sticker.check_zip_label"), ok: zipSizeOk, message: t("animated_line_sticker.check_zip_message", { size: (totalFileSize / 1024 / 1024).toFixed(2) }) },
      {
        label: "APNG 檔案大小風險",
        ok: frames.length <= 8,
        message: frames.length <= 8
          ? "5～8 禎通常較容易保持畫質並符合 LINE 單張小於 1MB 的限制。"
          : "工具可排序與輸出最多 20 禎；若輸出超過 LINE 單張 1MB 限制，請簡化細線、光效或改用 8 禎。",
      },
    ];
  }, [durationSec, frames, lineOutputSummary, loopCount, t, totalFileSize]);

  const canExport = frames.length > 0;
  const canExportApng = frames.length >= 5 && frames.length <= 20 && durationSec * loopCount <= 4;

  const resetFileInput = () => {
    if (inputRef.current) inputRef.current.value = "";
  };

  const clearFrames = () => {
    setFrames((prev) => {
      prev.forEach((frame) => URL.revokeObjectURL(frame.url));
      return [];
    });
    linePreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    linePreviewUrlsRef.current = [];
    setLinePreviewFrames([]);
    setLineOutputSummary(null);
    setPreviewIndex(0);
    setAutoSourceName("");
    setMessage("");
    setExportStatus("");
    resetFileInput();
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      resetFileInput();
      return;
    }
    setMessage("");
    const imageFiles = Array.from(fileList).filter((file) => file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".png"));
    try {
      const loaded = await Promise.all(imageFiles.map((file) => readImageFile(file, t)));
      setFrames((prev) => [...prev, ...loaded].slice(0, 20));
    } catch (error: any) {
      setMessage(error?.message || t("animated_line_sticker.error_read_images_failed"));
    } finally {
      // 讓使用者清空後，或想再次上傳同一批檔案時，瀏覽器也會觸發 onChange。
      resetFileInput();
    }
  };

  const handleAutoSource = (fileList: FileList | null) => {
    const sourceFile = fileList?.[0];
    if (!sourceFile || autoGenerating) {
      if (autoInputRef.current) autoInputRef.current.value = "";
      return;
    }
    if (!(sourceFile.type.startsWith("image/") || sourceFile.name.toLowerCase().endsWith(".png"))) {
      setMessage(t("animated_line_sticker.auto_error_image_only"));
      if (autoInputRef.current) autoInputRef.current.value = "";
      return;
    }

    setMessage("");
    setAutoSourceFile(sourceFile);
    setAutoSourceName(sourceFile.name);
    setPreviewIndex(0);
    if (autoInputRef.current) autoInputRef.current.value = "";
  };

  const applyAutoMotion = async () => {
    if (!autoSourceFile || autoGenerating) return;
    setAutoGenerating(true);
    setMessage("");
    setExportStatus(t("animated_line_sticker.auto_status_generating"));
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 30));
      const generatedFiles = await generateAutoAnimationFrameFiles(autoSourceFile, autoMotionPreset);
      const loaded = await Promise.all(generatedFiles.map((file) => readImageFile(file, t)));
      setFrames((previous) => {
        previous.forEach((frame) => URL.revokeObjectURL(frame.url));
        return loaded;
      });
      setDurationSec(2);
      setLoopCount(2);
      setPreviewIndex(0);
      setMessage(t("animated_line_sticker.auto_success"));
    } catch (error: any) {
      setMessage(error?.message || t("animated_line_sticker.auto_error_failed"));
    } finally {
      setAutoGenerating(false);
      setExportStatus("");
    }
  };

  const replaceBatchAnimatedPreviews = (
    items: Array<Omit<BatchAnimatedPreview, "url">>,
  ) => {
    batchAnimatedPreviewsRef.current.forEach((item) =>
      URL.revokeObjectURL(item.url),
    );
    const next = items.map((item) => ({
      ...item,
      url: URL.createObjectURL(item.blob),
    }));
    batchAnimatedPreviewsRef.current = next;
    setBatchAnimatedPreviews(next);
  };

  const clearBatchAnimatedPreviews = () => {
    batchAnimatedPreviewsRef.current.forEach((item) =>
      URL.revokeObjectURL(item.url),
    );
    batchAnimatedPreviewsRef.current = [];
    setBatchAnimatedPreviews([]);
  };

  const replayBatchPreview = (id?: string) => {
    const current = batchAnimatedPreviewsRef.current;
    if (!current.length) return;

    const next = current.map((item) => {
      if (id && item.id !== id) return item;
      const nextUrl = URL.createObjectURL(item.blob);
      URL.revokeObjectURL(item.url);
      return { ...item, url: nextUrl };
    });
    batchAnimatedPreviewsRef.current = next;
    setBatchAnimatedPreviews(next);
  };

  const handleBatchSources = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || batchBusy || batchVideoBusy) {
      if (batchInputRef.current) batchInputRef.current.value = "";
      return;
    }

    const imageFiles = Array.from(fileList)
      .filter((file) => file.type.startsWith("image/") || file.name.toLowerCase().endsWith(".png"))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }))
      .slice(0, 24);

    setBatchMessage("");
    setBatchStatus("");
    setBatchProgress(0);
    setSourceCaptions([]);
    setHandoffLoaded(false);
    setHandoffTheme("");
    clearBatchAnimatedPreviews();

    try {
      const loaded = await Promise.all(imageFiles.map((file) => readImageFile(file, t)));
      setBatchSources((previous) => {
        previous.forEach((frame) => URL.revokeObjectURL(frame.url));
        return loaded;
      });
      setBatchCustomMotionPresets({});
      if (![8, 16, 24].includes(loaded.length)) {
        setBatchMessage(t("animated_line_sticker.batch_count_warning", { count: loaded.length }));
      }
    } catch (error: any) {
      setBatchMessage(error?.message || t("animated_line_sticker.error_read_images_failed"));
    } finally {
      if (batchInputRef.current) batchInputRef.current.value = "";
    }
  };

  const clearBatchSources = () => {
    if (batchBusy || batchVideoBusy) return;
    setSourceCaptions([]);
    setHandoffLoaded(false);
    setHandoffTheme("");
    setBatchSources((previous) => {
      previous.forEach((frame) => URL.revokeObjectURL(frame.url));
      return [];
    });
    setBatchProgress(0);
    setBatchStatus("");
    setBatchMessage("");
    clearBatchAnimatedPreviews();
    batchEffectGalleryUrlsRef.current.forEach((url) =>
      URL.revokeObjectURL(url),
    );
    batchEffectGalleryUrlsRef.current = [];
    setBatchEffectGallery([]);
    setBatchEffectGalleryProgress(0);
    setBatchCustomMotionPresets({});
    if (batchInputRef.current) batchInputRef.current.value = "";
  };


  const exportWhatsAppAnimatedPack = async () => {
    if (batchBusy || batchVideoBusy || ![8, 16, 24].includes(batchSources.length)) return;
    setBatchBusy(true);
    setBatchProgress(0);
    setBatchMessage("");
    setBatchStatus("準備 WhatsApp 動畫 WebP…");
    const zipFiles: { name: string; data: Uint8Array }[] = [];
    const previews: Array<Omit<BatchAnimatedPreview, "url">> = [];
    clearBatchAnimatedPreviews();
    try {
      const packCounts = partitionWhatsAppPacks(batchSources.length);
      const traySource = await createImageBitmap(batchSources[0].file);
      const trayCanvas = document.createElement("canvas");
      trayCanvas.width = traySource.width;
      trayCanvas.height = traySource.height;
      const trayCtx = trayCanvas.getContext("2d");
      if (!trayCtx) throw new Error("無法建立 WhatsApp 封面畫布");
      trayCtx.drawImage(traySource, 0, 0);
      traySource.close();
      const tray = new Uint8Array(await (await createWhatsAppTrayPng(trayCanvas)).arrayBuffer());
      let globalIndex = 0;
      for (let packIndex = 0; packIndex < packCounts.length; packIndex++) {
        const folder = `WhatsApp_Animated_Pack_${String(packIndex + 1).padStart(2, "0")}`;
        zipFiles.push({ name: `${folder}/tray.png`, data: tray });
        for (let localIndex = 0; localIndex < packCounts[packIndex]; localIndex++, globalIndex++) {
          const i = globalIndex;
          setBatchStatus(`正在壓縮 WhatsApp 動畫 ${i + 1}/${batchSources.length}（500KB 上限）…`);
          const preset = batchMotionMode === "mixed"
            ? MIXED_BATCH_MOTION_PRESETS[i % MIXED_BATCH_MOTION_PRESETS.length]
            : batchMotionMode === "custom"
              ? batchCustomMotionPresets[i] ?? MIXED_BATCH_MOTION_PRESETS[i % MIXED_BATCH_MOTION_PRESETS.length]
              : batchMotionPreset;
          const pngs = await generateAutoAnimationFrameFiles(batchSources[i].file, preset);
          const webp = await createWhatsAppAnimatedSticker(pngs);
          const filename = `${String(localIndex + 1).padStart(2, "0")}.webp`;
          zipFiles.push({
            name: `${folder}/${filename}`,
            data: new Uint8Array(await webp.arrayBuffer()),
          });
          previews.push({
            id: `whatsapp-preview-${i}`,
            index: i,
            motionPreset: preset,
            name: filename,
            blob: webp,
            sizeKb: Math.round(webp.size / 1024),
            overLimit: webp.size > 500_000,
          });
          setBatchProgress(Math.round(((i + 1) / batchSources.length) * 100));
          await waitMs(10);
        }
      }
      const zip = makeZip(zipFiles);
      replaceBatchAnimatedPreviews(previews);
      downloadBlob(zip, `rxv-whatsapp-animated-${batchSources.length}-webp.zip`);
      setBatchStatus("WhatsApp 動畫 ZIP 製作完成");
      setBatchMessage(`完成 ${batchSources.length} 張 512×512 動態 WebP（每張≤500KB，共 ${packCounts.length} 組）。此 ZIP 是供相容貼圖 APP 匯入的素材包，不能直接當作 WhatsApp 一鍵安裝檔案。`);
      window.setTimeout(() => batchPreviewSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
      updateLineStickerProject({ stage: 5 });
    } catch (error) {
      setBatchStatus("WhatsApp 動畫輸出尚未完成");
      setBatchMessage(error instanceof Error ? error.message : "產生 WhatsApp 動態貼圖失敗，請重新試一次。");
    } finally {
      setBatchBusy(false);
    }
  };

  const exportBatchUploadPack = async () => {
    if (batchBusy || batchVideoBusy || ![8, 16, 24].includes(batchSources.length)) return;

    setBatchBusy(true);
    setBatchProgress(0);
    setBatchMessage("");
    clearBatchAnimatedPreviews();
    const files: { name: string; data: Uint8Array }[] = [];
    const completedPreviews: Array<Omit<BatchAnimatedPreview, "url">> = [];
    let mainData: Uint8Array | null = null;
    let tabData: Uint8Array | null = null;

    try {
      for (let i = 0; i < batchSources.length; i += 1) {
        const item = batchSources[i];
        setBatchStatus(
          t("animated_line_sticker.batch_status_item", {
            current: i + 1,
            total: batchSources.length,
            name: item.name,
          }),
        );
        setBatchProgress(Math.round((i / batchSources.length) * 90));
        await waitMs(40);

        const motionPreset =
          batchMotionMode === "mixed"
            ? MIXED_BATCH_MOTION_PRESETS[
                i % MIXED_BATCH_MOTION_PRESETS.length
              ]
            : batchMotionMode === "custom"
              ? batchCustomMotionPresets[i] ??
                MIXED_BATCH_MOTION_PRESETS[
                  i % MIXED_BATCH_MOTION_PRESETS.length
                ]
              : batchMotionPreset;
        const generatedFiles = await generateAutoAnimationFrameFiles(
          item.file,
          motionPreset,
        );
        const generatedFrames = await Promise.all(
          generatedFiles.map((file) => readImageFile(file, t)),
        );

        try {
          const apng = await createLineSafeApngBlob(
            generatedFrames,
            2,
            2,
            t,
            (status) =>
              setBatchStatus(
                `[${i + 1}/${batchSources.length}] ${status}`,
              ),
          );
          const stickerName = `${String(i + 1).padStart(2, "0")}.png`;
          const stickerData = new Uint8Array(await apng.arrayBuffer());
          verifyLineOutputPng(stickerData, stickerName, OUTPUT_WIDTH, OUTPUT_HEIGHT, true);
          files.push({ name: stickerName, data: stickerData });
          completedPreviews.push({
            id: "batch-preview-" + String(i + 1),
            index: i,
            motionPreset,
            name: stickerName,
            blob: apng,
            sizeKb: Math.round(apng.size / 1024),
            overLimit: apng.size > LINE_APNG_MAX_BYTES,
          });
          if (i === 0) {
            const mainBlob = await createLineMainImageApngBlob(
              generatedFrames,
              2,
              2,
              t,
            );
            const tabBlob = await createLineStaticSmallImageBlob(
              generatedFrames,
              t,
              LINE_TAB_ICON_WIDTH,
              LINE_TAB_ICON_HEIGHT,
              2,
            );
            mainData = new Uint8Array(await mainBlob.arrayBuffer());
            tabData = new Uint8Array(await tabBlob.arrayBuffer());
            verifyLineOutputPng(mainData, "main.png", LINE_MAIN_IMAGE_WIDTH, LINE_MAIN_IMAGE_HEIGHT, true);
            verifyLineOutputPng(tabData, "tab.png", LINE_TAB_ICON_WIDTH, LINE_TAB_ICON_HEIGHT, false);
          }
        } finally {
          generatedFrames.forEach((frame) => URL.revokeObjectURL(frame.url));
        }
      }

      if (mainData) files.push({ name: "main.png", data: mainData });
      if (tabData) files.push({ name: "tab.png", data: tabData });

      // 上架 ZIP 僅包含貼圖、main、tab；不再混入 README 與報告文字檔。
      // 每張 APNG 的檔案大小留在畫面預覽區，避免使用者誤傳報告到 LINE。
      const oversized = files.filter((file) => file.data.byteLength > LINE_APNG_MAX_BYTES);
      if (oversized.length > 0) {
        replaceBatchAnimatedPreviews(completedPreviews);
        setBatchProgress(92);
        setBatchStatus("已完成預覽，但尚未產生上架 ZIP");
        setBatchMessage(
          `有 ${oversized.length} 個圖片超過 1MB：${oversized.map((file) => `${file.name} (${Math.round(file.data.byteLength / 1024)}KB)`).join("、")}。請改用較簡單的動態效果或減少複雜裝飾後再產生，避免下載不可上架的檔案。`,
        );
        return;
      }

      setBatchStatus(t("animated_line_sticker.batch_status_zip"));
      setBatchProgress(96);
      await waitMs(40);

      const zip = makeZip(files);
      if (zip.size > MAX_LINE_ZIP_MB * 1024 * 1024) {
        throw new Error(`ZIP 為 ${(zip.size / 1024 / 1024).toFixed(1)}MB，超過 LINE 60MB 上限，請簡化圖片再試。`);
      }
      downloadBlob(
        zip,
        `rxv-line-animated-sticker-upload-pack-${batchSources.length}.zip`,
      );

      setBatchProgress(100);
      setBatchStatus(t("animated_line_sticker.batch_status_done"));
      replaceBatchAnimatedPreviews(completedPreviews);
      window.setTimeout(() => {
        batchPreviewSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
      setBatchMessage(
        `上架 ZIP 已下載，包含 ${batchSources.length} 張 APNG、main.png（APNG）、tab.png（靜態 PNG），共 ${files.length} 個圖片檔。已通過格式、尺寸及單檔 1MB／ZIP 60MB 檢查。仍請逐張確認文字與動畫內容，LINE 最終以官方審核為準。`,
      );
    } catch (error: any) {
      setBatchProgress(0);
      setBatchStatus("");
      setBatchMessage(
        error?.message || t("animated_line_sticker.batch_error_failed"),
      );
    } finally {
      setBatchBusy(false);
    }
  };


  const exportBatchHdVideo = async () => {
    if (batchBusy || batchVideoBusy || batchAnimatedPreviews.length !== batchSources.length) return;
    setBatchVideoBusy(true);
    setBatchVideoProgress(0);
    setBatchVideoMessage("");
    try {
      const sorted = [...batchAnimatedPreviews].sort((left, right) => left.index - right.index);
      const result = await createBatchShowcaseVideo(
        batchSources,
        sorted.map((item) => item.motionPreset),
        (finished, total) => setBatchVideoProgress(Math.round((finished / total) * 100)),
        exportPlatform,
      );
      downloadBlob(result.blob, `rxv-${exportPlatform}-animated-${batchSources.length}-hd-1080x1920.${result.extension}`);
      setBatchVideoMessage(
        result.isMp4
          ? "高清 MP4 已下載！1080×1920 直式展示影片，可用於社群推廣。"
          : "瀏覽器不支援直接錄製 MP4，已下載高清 WebM（不是 MP4）。可在本機影片編輯器轉成 MP4；沒有更改 LINE 上架 ZIP。",
      );
    } catch (error) {
      setBatchVideoMessage(error instanceof Error ? error.message : "高清影片產生失敗，請重新試一次。");
    } finally {
      setBatchVideoBusy(false);
    }
  };

  const moveFrame = (index: number, direction: -1 | 1) => {
    setFrames((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeFrame = (id: string) => {
    setFrames((prev) => {
      const found = prev.find((frame) => frame.id === id);
      if (found) URL.revokeObjectURL(found.url);
      return prev.filter((frame) => frame.id !== id);
    });
  };

  const exportManualStoryboardPack = async () => {
    if (workflowMode !== "manual" || !canExportApng || busy) return;

    setBusy(true);
    setMessage("");
    setExportStatus("正在整理自備分鏡動態貼圖包…");

    try {
      await waitMs(30);
      const apng = await createLineSafeApngBlob(
        frames,
        durationSec,
        loopCount,
        t,
        setExportStatus,
      );
      const mainBlob = await createLineMainImageApngBlob(
        frames,
        durationSec,
        loopCount,
        t,
      );
      const tabBlob = await createLineStaticSmallImageBlob(
        frames,
        t,
        LINE_TAB_ICON_WIDTH,
        LINE_TAB_ICON_HEIGHT,
        2,
      );
      const ready = await createLineReadyFrameFiles(frames, t);

      const files: { name: string; data: Uint8Array }[] = [
        {
          name: "animated-sticker.png",
          data: new Uint8Array(await apng.arrayBuffer()),
        },
        {
          name: "main.png",
          data: new Uint8Array(await mainBlob.arrayBuffer()),
        },
        {
          name: "tab.png",
          data: new Uint8Array(await tabBlob.arrayBuffer()),
        },
        ...ready.files.map((item) => ({
          name: `frames/${item.name}`,
          data: item.data,
        })),
      ];

      const readme = [
        "RxV 自備分鏡動態貼圖打包",
        `分鏡張數：${frames.length}`,
        `單次播放：${durationSec} 秒`,
        `循環次數：${loopCount}`,
        `APNG 大小：約 ${Math.round(apng.size / 1024)}KB`,
        "",
        "animated-sticker.png：正式 APNG 動態貼圖",
        "main.png：主要圖片",
        "tab.png：聊天室標籤圖片",
        "frames/：整理後的分鏡 PNG",
        "",
        apng.size <= LINE_APNG_MAX_BYTES
          ? "APNG 小於 1MB：OK"
          : "APNG 超過 1MB：請調整分鏡數或畫面複雜度後重新匯出",
      ].join("\n");

      files.push({
        name: "README.txt",
        data: new TextEncoder().encode(readme),
      });

      const zip = makeZip(files);
      downloadBlob(zip, "rxv-manual-storyboard-dynamic-pack.zip");
      setMessage(
        apng.size <= LINE_APNG_MAX_BYTES
          ? "自備分鏡動態貼圖包已下載：APNG、main、tab、整理後分鏡都已放進 ZIP。"
          : `ZIP 已下載，但 APNG 約 ${Math.round(apng.size / 1024)}KB，超過 LINE 1MB 限制，請先調整後再送審。`,
      );
    } catch (error: any) {
      setMessage(
        error?.message || "自備分鏡打包失敗，請重新整理後再試一次。",
      );
    } finally {
      setBusy(false);
      setExportStatus("");
    }
  };

  const exportZip = async () => {
    if (!canExport || busy) return;
    setBusy(true);
    setMessage("");
    setExportStatus(t("animated_line_sticker.status_zip"));
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 30));
      const zip = await createFramesZip(frames, durationSec, loopCount, t);
      downloadBlob(zip, "rxv-line-dynamic-sticker-frames.zip");
      setMessage(t("animated_line_sticker.message_zip_success"));
    } catch (error: any) {
      setMessage(error?.message || t("animated_line_sticker.error_zip_failed"));
    } finally {
      setBusy(false);
      setExportStatus("");
    }
  };

  const exportSmallImages = async () => {
    if (!canExport || busy) return;
    setBusy(true);
    setMessage("");
    setExportStatus("正在產生 LINE 小圖（main 240×240、tab 96×74）...");
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 30));
      const zip = await createLineSmallImagesZip(frames, durationSec, loopCount, t);
      downloadBlob(zip, "line-small-images.zip");
      setMessage("LINE 小圖 ZIP 已下載：main_240x240.png（APNG）、tab_96x74.png（PNG）。請分別上傳到 LINE 後台 main 與 tab 欄位。");
    } catch (error: any) {
      setMessage(error?.message || "LINE 小圖匯出失敗，請重新整理後再試一次。");
    } finally {
      setBusy(false);
      setExportStatus("");
    }
  };

  const exportApng = async () => {
    if (!canExportApng || busy) return;
    setBusy(true);
    setMessage("");
    setExportStatus(`正在準備 APNG 匯出（${frames.length} 禎）...`);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 30));
      const apng = await createLineSafeApngBlob(frames, durationSec, loopCount, t, setExportStatus);
      const sizeKb = Math.round(apng.size / 1024);
      downloadBlob(apng, "rxv-line-dynamic-sticker-apng.png");
      setMessage(
        apng.size <= LINE_APNG_MAX_BYTES
          ? `${t("animated_line_sticker.message_apng_success")}（約 ${sizeKb}KB）`
          : `APNG 已下載，但目前約 ${sizeKb}KB，超過 LINE 單張 1MB 限制。可先用來預覽；正式上架前請減少禎數或簡化裝飾後再匯出。`
      );
    } catch (error: any) {
      setMessage(error?.message || t("animated_line_sticker.error_apng_failed"));
    } finally {
      setBusy(false);
      setExportStatus("");
    }
  };


  const exportGif = async () => {
    if (!canExport || busy) return;
    setBusy(true);
    setMessage("");
    setExportStatus(t("animated_line_sticker.status_gif"));
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 30));
      const gif = await createGifBlob(frames, durationSec, loopCount, t);
      downloadBlob(gif, "rxv-line-dynamic-sticker-preview.gif");
      setMessage(t("animated_line_sticker.message_gif_success"));
    } catch (error: any) {
      setMessage(error?.message || t("animated_line_sticker.error_gif_failed"));
    } finally {
      setBusy(false);
      setExportStatus("");
    }
  };

  const exportVideo = async (quality: "normal" | "hd" = "normal") => {
    if (!canExport || busy) return;
    setBusy(true);
    setMessage("");
    setExportStatus(quality === "hd" ? "正在產生高清 MP4 預覽…" : t("animated_line_sticker.status_video"));
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 30));
      const result = await createVideoBlob(
        frames,
        durationSec,
        loopCount,
        t,
        quality === "hd"
          ? { width: 1080, height: 1080, frameRate: 30, videoBitsPerSecond: 12000000, fillWhite: true, allowScaleUp: true }
          : { width: 500, height: 500, frameRate: 30, videoBitsPerSecond: 3500000, fillWhite: true, allowScaleUp: false }
      );
      downloadBlob(
        result.blob,
        quality === "hd"
          ? `rxv-line-dynamic-sticker-preview-hd.${result.extension}`
          : `rxv-line-dynamic-sticker-preview.${result.extension}`
      );
      setMessage(
        quality === "hd"
          ? (result.isMp4 ? "高清 MP4 已下載，可用於傳給客戶預覽及社群展示。" : "瀏覽器不支援 MP4，已輸出高清 WebM（不是 MP4），可本機轉檔。")
          : result.isMp4
          ? t("animated_line_sticker.message_mp4_success")
          : t("animated_line_sticker.message_webm_success")
      );
    } catch (error: any) {
      setMessage(error?.message || t("animated_line_sticker.error_video_failed"));
    } finally {
      setBusy(false);
      setExportStatus("");
    }
  };

  const baseUrl = getBaseUrl().replace(/\/$/, "");
  const pageUrl = `${baseUrl}/tools/animated-line-sticker`;

  return (
    <>
      <SEO
        title={t("animated_line_sticker.seo_title")}
        description={t("animated_line_sticker.seo_description")}
        keywords={t("animated_line_sticker.seo_keywords")}
        path="/tools/animated-line-sticker"
      />
      <Helmet>
        <link rel="canonical" href={pageUrl} />
      </Helmet>

      <main className="relative left-1/2 w-screen -translate-x-1/2 px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto w-full max-w-[1480px]">
        <LineStickerFlowSteps activeStep={5} mode="animated" />
        <section className="mb-5 rounded-2xl border border-emerald-200 bg-white p-4">
          <p className="text-sm font-black text-slate-900">輸出平台｜動態貼圖</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["line", "whatsapp"] as const).map((platform) => (
              <button key={platform} type="button" aria-pressed={exportPlatform === platform}
                disabled={batchBusy || batchVideoBusy}
                onClick={() => {
                  setExportPlatform(platform);
                  updateLineStickerProject({ platform });
                  setBatchMessage("");
                }}
                className={`min-h-12 rounded-xl border-2 px-3 py-2 text-sm font-black ${exportPlatform === platform ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-700"}`}>
                {exportPlatform === platform ? "✓ " : ""}{platform === "line" ? "LINE 動態 APNG" : "WhatsApp 動態 WebP"}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-5 text-slate-600">
            {exportPlatform === "whatsapp"
              ? "真正的動畫 WebP（512×512，每張≤500KB、最多 10 秒），不混入靜態貼圖。ZIP 仍需透過相容貼圖 APP 建立並匯入 WhatsApp。"
              : "輸出 LINE 官方尺寸的 APNG 動態貼圖 ZIP。"}
          </p>
        </section>
        <section className="rounded-3xl border border-fuchsia-100 bg-gradient-to-br from-fuchsia-50 via-white to-sky-50 p-5 shadow-sm md:p-8">
          <p className="text-sm font-bold text-fuchsia-700">{t("animated_line_sticker.eyebrow")}</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-4xl">
            {t("animated_line_sticker.title")}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-700 md:text-base">
            {t("animated_line_sticker.intro_line_1")}
            {t("animated_line_sticker.intro_line_2")}
          </p>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            <span className="font-black">{t("animated_line_sticker.recommended_timing_label")}</span>
            {t("animated_line_sticker.recommended_timing_before")}
            <span className="font-black">{t("animated_line_sticker.recommended_timing_value")}</span>
            {t("animated_line_sticker.recommended_timing_after")}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href="/tools/sticker-prompt?mode=animated"
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-sky-600 px-5 py-3 text-sm font-black leading-none !text-white shadow-md transition hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-lg"
            >
              從第 1 步重新製作
            </a>
            <span className="text-xs font-bold text-slate-500">
              {t("animated_line_sticker.choose_mode_hint")}
            </span>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/*"
            multiple
            className="hidden"
            onChange={(event) => handleFiles(event.target.files)}
          />
        </section>

        {handoffLoaded && saleTextRisks.length > 0 ? (
          <section className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-4">
            <p className="font-black text-amber-900">LINE 公開販售內容提醒：來源文案含 {saleTextRisks.length} 句可能被視為促銷／導流。</p>
            <p className="mt-2 text-xs leading-6 text-amber-900">
              {saleTextRisks.slice(0, 6).map((risk) => `${risk.text} → ${risk.replacement}`).join("；")}。
              工具無法從 APNG 自動刪掉圖片上的字；建議返回提示詞修改後重畫，以降低退件風險。
            </p>
          </section>
        ) : null}

        {handoffLoaded ? (
          <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
              已自動接續第 4 步
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-900">
              {handoffTheme ? `${handoffTheme}｜` : ""}{batchSources.length} 張貼圖已準備完成
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              不需要重新上傳圖片。下面確認動畫效果後，按一次按鈕就會逐張產生動態貼圖並整理成 ZIP。
            </p>
          </section>
        ) : null}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-900">
                選擇動態貼圖製作方式
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                三種方式都會保留；有自己設計好的動作 PNG，請使用「自備動作 PNG 影格」。
              </p>
            </div>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
              可隨時切換，不會刪掉已選圖片
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {([
              [
                "single",
                "✨",
                "單張 PNG 自動做動態",
                "上傳 1 張靜態貼圖，選動作效果後自動產生動畫影格。",
              ],
              [
                "manual",
                "🧩",
                "自備動作 PNG 影格",
                "你已自己畫好每個動作影格時使用；可排序、預覽，再輸出 APNG／GIF／ZIP。",
              ],
              [
                "batch",
                "📦",
                "8／16／24 張整套自動",
                "一批貼圖可選多效果輪用、全部同一效果，或每張自己指定，最後一次整理成 LINE 上架 ZIP。",
              ],
            ] as const).map(([mode, icon, title, desc]) => {
              const active = workflowMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWorkflowMode(mode)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    active
                      ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                      : "border-slate-200 bg-slate-50 hover:border-violet-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-black leading-5 text-slate-900">
                      {title}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{desc}</p>
                </button>
              );
            })}
          </div>
        </section>

        {workflowMode === "single" ? (
        <section className="mt-6 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5 shadow-sm md:p-7">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.72fr)] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-black !text-white">
                  {t("animated_line_sticker.auto_badge")}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                  {t("animated_line_sticker.auto_timing_badge")}
                </span>
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-wide text-violet-600">
                {t("animated_line_sticker.step_1")}
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900 md:text-2xl">
                {t("animated_line_sticker.auto_title")}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-700">
                {t("animated_line_sticker.auto_description")}
              </p>
              <p className="mt-2 text-xs font-bold leading-6 text-violet-700">
                {t("animated_line_sticker.auto_transparency_hint")}
              </p>
              {autoSourceName ? (
                <p className="mt-2 rounded-xl bg-white/80 px-3 py-2 text-xs font-bold text-slate-600">
                  {t("animated_line_sticker.auto_current_source", { name: autoSourceName })}
                </p>
              ) : null}
              <button
                type="button"
                disabled={autoGenerating}
                onClick={() => autoInputRef.current?.click()}
                className="mt-3 inline-flex min-h-11 items-center justify-center rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-black text-violet-700 shadow-sm transition hover:bg-violet-50 disabled:bg-slate-100"
              >
                {t("animated_line_sticker.auto_choose_source_button")}
              </button>
              <input
                ref={autoInputRef}
                type="file"
                accept="image/png,image/*"
                className="hidden"
                onChange={(event) => handleAutoSource(event.target.files)}
              />
            </div>

            <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
              <p className="text-xs font-black uppercase tracking-wide text-violet-600">
                {t("animated_line_sticker.step_2")}
              </p>
              <label className="mt-1 block">
                <span className="text-sm font-black text-slate-800">
                  {t("animated_line_sticker.auto_motion_label")}
                </span>
                <select
                  value={autoMotionPreset}
                  onChange={(event) => setAutoMotionPreset(event.target.value as AutoMotionPreset)}
                  disabled={autoGenerating}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-800 disabled:bg-slate-100"
                >
                  {AUTO_MOTION_PRESETS.map((preset) => (
                    <option key={preset.value} value={preset.value}>
                      {t(preset.labelKey)}
                    </option>
                  ))}
                </select>
              </label>

              <div className="mt-3">
                <p className="mb-2 text-xs font-black text-slate-700">
                  {t("animated_line_sticker.auto_live_preview_badge")}
                </p>
                <div className="flex h-[190px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0]">
                  {autoPreviewFrames.length ? (
                    <img
                      src={autoPreviewFrames[previewIndex % autoPreviewFrames.length]?.url}
                      alt={t("animated_line_sticker.preview_alt")}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : autoPreviewGenerating ? (
                    <p className="px-4 text-center text-xs font-bold text-violet-600">
                      {t("animated_line_sticker.auto_preview_generating")}
                    </p>
                  ) : (
                    <p className="px-4 text-center text-xs font-bold text-slate-500">
                      {t("animated_line_sticker.auto_preview_empty")}
                    </p>
                  )}
                </div>
              </div>

              <p className="mt-4 text-xs font-black uppercase tracking-wide text-violet-600">
                {t("animated_line_sticker.step_3")}
              </p>
              <button
                type="button"
                disabled={!autoSourceFile || autoGenerating || autoPreviewGenerating}
                onClick={applyAutoMotion}
                className="mt-2 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black !text-white shadow-md transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {autoGenerating
                  ? t("animated_line_sticker.auto_generating_button")
                  : autoPreviewGenerating
                    ? t("animated_line_sticker.auto_preview_generating")
                    : t("animated_line_sticker.auto_apply_button")}
              </button>
              <p className="mt-2 text-center text-xs leading-5 text-slate-500">
                {t("animated_line_sticker.auto_preview_notice")}
              </p>
            </div>
          </div>
        </section>
        ) : null}

        {workflowMode === "batch" ? (
          <section className="mt-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm md:p-7">
            <div className="flex flex-col gap-2">
              <span className="w-fit rounded-full bg-emerald-600 px-3 py-1 text-xs font-black !text-white">
                步驟 5｜{t("animated_line_sticker.batch_badge")}
              </span>
              <h2 className="text-2xl font-black text-slate-900">
                {t("animated_line_sticker.batch_title")}
              </h2>
              <p className="max-w-4xl text-sm leading-7 text-slate-600">
                {t("animated_line_sticker.batch_desc")}
              </p>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                [t("animated_line_sticker.step_1"), t("animated_line_sticker.batch_step1")],
                [t("animated_line_sticker.step_2"), t("animated_line_sticker.batch_step2")],
                [t("animated_line_sticker.step_3"), t("animated_line_sticker.batch_step3")],
              ].map(([label, desc]) => (
                <div key={label} className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-wide text-emerald-600">{label}</p>
                  <p className="mt-2 text-sm font-bold leading-6 text-slate-800">{desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      {t("animated_line_sticker.batch_selected", { count: batchSources.length })}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {t("animated_line_sticker.batch_count_hint")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={batchBusy || batchVideoBusy}
                      onClick={() => batchInputRef.current?.click()}
                      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-black !text-white shadow disabled:bg-slate-300"
                    >
                      {handoffLoaded ? "重新選擇圖片" : t("animated_line_sticker.batch_choose_button")}
                    </button>
                    {batchSources.length ? (
                      <button
                        type="button"
                        disabled={batchBusy || batchVideoBusy}
                        onClick={clearBatchSources}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-600"
                      >
                        {t("animated_line_sticker.clear_button")}
                      </button>
                    ) : null}
                  </div>
                </div>
                <input
                  ref={batchInputRef}
                  type="file"
                  accept="image/png,image/*"
                  multiple
                  className="hidden"
                  onChange={(event) => handleBatchSources(event.target.files)}
                />

                {batchSources.length ? (
                  <div className="mt-4">
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-black text-slate-700">
                        來源貼圖預覽｜先確認每張文字與角色都正常
                      </p>
                      <span className="text-[11px] font-bold text-slate-400">
                        {batchSources.length} 張
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {batchSources.map((item, index) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-2.5 shadow-sm"
                        >
                          <div className="aspect-[320/270] overflow-hidden rounded-xl border border-slate-100 bg-white p-2">
                            <img
                              src={item.url}
                              alt={item.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <p className="text-sm font-black text-slate-700">
                              {String(index + 1).padStart(2, "0")}
                            </p>
                            <p
                              className="max-w-[75%] truncate text-right text-[10px] font-bold text-slate-400"
                              title={item.name}
                            >
                              {item.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => batchInputRef.current?.click()}
                    className="mt-4 flex min-h-[180px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 p-5 text-center"
                  >
                    <span className="text-3xl">📁</span>
                    <span className="mt-2 text-sm font-black text-slate-800">
                      {t("animated_line_sticker.batch_dropzone")}
                    </span>
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div>
                  <span className="text-sm font-black text-slate-800">
                    動畫套用方式
                  </span>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    可選「多效果輪用」、「全部同一效果」，或「每張自己選效果」。一般使用建議直接用多效果輪用；想統一品牌節奏則選同一效果。
                  </p>
                  <div className="mt-3 grid gap-2">
                    <button
                      type="button"
                      disabled={batchBusy}
                      onClick={() => setBatchMotionMode("mixed")}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        batchMotionMode === "mixed"
                          ? "border-violet-500 bg-violet-50 ring-2 ring-violet-100"
                          : "border-slate-200 bg-white hover:border-violet-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black text-slate-900">
                          ✨ 多效果輪用（推薦）
                        </span>
                        {batchMotionMode === "mixed" ? (
                          <span className="rounded-full bg-violet-600 px-2 py-1 text-[10px] font-black text-white">
                            已選
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        每張貼圖自動換一種動畫，整套不會全部動得一樣。
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={batchBusy}
                      onClick={() => setBatchMotionMode("single")}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        batchMotionMode === "single"
                          ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100"
                          : "border-slate-200 bg-white hover:border-emerald-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black text-slate-900">
                          🎬 全部使用同一效果
                        </span>
                        {batchMotionMode === "single" ? (
                          <span className="rounded-full bg-emerald-600 px-2 py-1 text-[10px] font-black text-white">
                            已選
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        適合品牌想維持同一節奏，或指定全部使用某一種動畫。
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={batchBusy}
                      onClick={() => setBatchMotionMode("custom")}
                      className={`rounded-xl border px-3 py-3 text-left transition ${
                        batchMotionMode === "custom"
                          ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100"
                          : "border-slate-200 bg-white hover:border-sky-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-black text-slate-900">
                          🎛️ 每張自己選效果
                        </span>
                        {batchMotionMode === "custom" ? (
                          <span className="rounded-full bg-sky-600 px-2 py-1 text-[10px] font-black text-white">
                            已選
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-600">
                        進階模式：每一張貼圖都可指定不同動畫，適合客戶已經知道每句話想怎麼動。
                      </p>
                    </button>
                  </div>

                  {batchMotionMode === "single" ? (
                    <label className="mt-3 block">
                      <span className="text-xs font-black text-slate-700">
                        選擇整套效果
                      </span>
                      <select
                        value={batchMotionPreset}
                        onChange={(event) =>
                          setBatchMotionPreset(
                            event.target.value as AutoMotionPreset,
                          )
                        }
                        disabled={batchBusy}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold"
                      >
                        {AUTO_MOTION_PRESETS.map((preset) => (
                          <option key={preset.value} value={preset.value}>
                            {t(preset.labelKey)}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : batchMotionMode === "custom" ? (
                    <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50 p-3">
                      <p className="text-xs font-black text-sky-900">
                        每張自選效果
                      </p>
                      <p className="mt-1 text-[11px] leading-5 text-sky-700">
                        未特別指定的貼圖會先沿用「多效果輪用」的預設效果，你只要改想調整的幾張即可。
                      </p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {batchSources.map((item, index) => {
                          const fallbackPreset =
                            MIXED_BATCH_MOTION_PRESETS[
                              index % MIXED_BATCH_MOTION_PRESETS.length
                            ];
                          const selectedPreset =
                            batchCustomMotionPresets[index] ?? fallbackPreset;
                          return (
                            <div
                              key={item.id}
                              className="flex min-w-0 items-center gap-2 rounded-xl border border-sky-100 bg-white p-2"
                            >
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                                <img
                                  src={item.url}
                                  alt={item.name}
                                  className="h-full w-full object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-black text-slate-700">
                                  第 {String(index + 1).padStart(2, "0")} 張
                                </p>
                                <select
                                  value={selectedPreset}
                                  onChange={(event) =>
                                    setBatchCustomMotionPresets((previous) => ({
                                      ...previous,
                                      [index]:
                                        event.target.value as AutoMotionPreset,
                                    }))
                                  }
                                  disabled={batchBusy}
                                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold"
                                >
                                  {AUTO_MOTION_PRESETS.map((preset) => (
                                    <option
                                      key={preset.value}
                                      value={preset.value}
                                    >
                                      {t(preset.labelKey)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl bg-violet-50 px-3 py-2">
                      <p className="text-xs font-black text-violet-800">
                        目前會依序輪用：
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {MIXED_BATCH_MOTION_PRESETS.slice(
                          0,
                          Math.min(
                            batchSources.length || 8,
                            MIXED_BATCH_MOTION_PRESETS.length,
                          ),
                        ).map((preset, index) => {
                          const labelKey =
                            AUTO_MOTION_PRESETS.find(
                              (item) => item.value === preset,
                            )?.labelKey ??
                            "animated_line_sticker.auto_motion_auto";
                          return (
                            <span
                              key={`${preset}-${index}`}
                              className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-violet-700"
                            >
                              {String(index + 1).padStart(2, "0")} {t(labelKey)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-2xl bg-sky-50 p-3 text-xs leading-6 text-sky-900">
                  {exportPlatform === "whatsapp"
                    ? "輸出 WhatsApp 512×512 動畫 WebP 素材包，每張 500KB 上限；不會改成靜態圖片。"
                    : t("animated_line_sticker.batch_output_summary")}
                  <p className="mt-2 font-bold">
                    {exportPlatform === "whatsapp"
                      ? "下載後需使用支援動態貼圖的 WhatsApp 相容貼圖 APP 匯入；無法直接將 ZIP 安裝到 WhatsApp。"
                      : "LINE ZIP 僅包含貼圖 APNG、main.png、tab.png，逐張自動核對尺寸與容量。"}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={batchBusy || ![8, 16, 24].includes(batchSources.length)}
                  onClick={exportPlatform === "whatsapp" ? exportWhatsAppAnimatedPack : exportBatchUploadPack}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black !text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {batchBusy
                    ? (exportPlatform === "whatsapp" ? "正在壓縮 WhatsApp 動畫 WebP…" : t("animated_line_sticker.batch_generating_button"))
                    : (exportPlatform === "whatsapp" ? "產生 WhatsApp 動態 WebP ZIP（真動畫）" : t("animated_line_sticker.batch_generate_button"))}
                </button>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${batchProgress}%` }}
                  />
                </div>
                {batchStatus ? (
                  <p className="mt-2 text-xs font-bold leading-5 text-emerald-800">{batchStatus}</p>
                ) : null}
                {batchMessage ? (
                  <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold leading-5 text-amber-800">
                    {batchMessage}
                  </p>
                ) : null}
              </div>
            </div>

            {batchSources.length ? (
              <div className="mt-6 rounded-3xl border border-violet-200 bg-violet-50/60 p-4 md:p-5">
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-wide text-violet-700">
                      第一張試播
                    </p>
                    <h3 className="mt-1 text-lg font-black text-slate-900">
                      先看全部動畫效果，也可以直接選「多效果輪用」
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      系統只用第 01 張產生所有效果預覽。點單一效果卡會自動切到「全部同一效果」；若想每張不同，就保留「多效果輪用」。
                    </p>
                  </div>
                  <div className="shrink-0 text-xs font-black text-violet-700">
                    {batchEffectGalleryLoading
                      ? `正在建立預覽 ${batchEffectGalleryProgress}%`
                      : `已建立 ${batchEffectGallery.length} 種效果`}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                  <button
                    type="button"
                    disabled={batchBusy}
                    onClick={() => setBatchMotionMode("mixed")}
                    className={`min-w-0 rounded-2xl border p-2.5 text-left transition ${
                      batchMotionMode === "mixed"
                        ? "border-fuchsia-500 bg-fuchsia-50 ring-2 ring-fuchsia-200 shadow-md"
                        : "border-fuchsia-100 bg-white/80 hover:border-fuchsia-300 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex aspect-[320/270] items-center justify-center rounded-xl border border-fuchsia-100 bg-gradient-to-br from-violet-100 via-white to-amber-50 p-3">
                      <div className="grid grid-cols-2 gap-2 text-center text-2xl">
                        <span>↕️</span>
                        <span>↔️</span>
                        <span>✨</span>
                        <span>💥</span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="min-w-0 flex-1 text-xs font-black leading-5 text-fuchsia-800">
                        多效果輪用
                      </span>
                      {batchMotionMode === "mixed" ? (
                        <span className="shrink-0 rounded-full bg-fuchsia-600 px-2 py-1 text-[9px] font-black text-white">
                          已選
                        </span>
                      ) : null}
                    </div>
                  </button>

                  {AUTO_MOTION_PRESETS.map((preset) => {
                    const preview = batchEffectGallery.find(
                      (item) => item.preset === preset.value,
                    );
                    const selected =
                      batchMotionMode === "single" &&
                      batchMotionPreset === preset.value;
                    const previewUrl = preview?.urls[
                      batchEffectGalleryFrame % Math.max(preview.urls.length, 1)
                    ];

                    return (
                      <button
                        key={preset.value}
                        type="button"
                        disabled={!previewUrl || batchBusy}
                        onClick={() => {
                          setBatchMotionMode("single");
                          setBatchMotionPreset(preset.value);
                        }}
                        className={`min-w-0 rounded-2xl border p-2.5 text-left transition ${
                          selected
                            ? "border-violet-500 bg-white ring-2 ring-violet-200 shadow-md"
                            : "border-violet-100 bg-white/80 hover:border-violet-300 hover:shadow-sm"
                        } disabled:cursor-wait disabled:opacity-60`}
                      >
                        <div className="aspect-[320/270] overflow-hidden rounded-xl border border-slate-100 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[length:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0]">
                          {previewUrl ? (
                            <img
                              src={previewUrl}
                              alt={t(preset.labelKey)}
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-bold text-slate-400">
                              建立中…
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="min-w-0 flex-1 break-words text-xs font-black leading-5 text-slate-800">
                            {t(preset.labelKey)}
                          </span>
                          {selected ? (
                            <span className="shrink-0 rounded-full bg-violet-600 px-2 py-1 text-[9px] font-black text-white">
                              已選
                            </span>
                          ) : null}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-xl bg-white px-3 py-2 text-xs font-bold text-violet-800">
                  {batchMotionMode === "mixed" ? (
                    <>
                      目前：✨ 多效果輪用。第 01 張開始依序套用不同效果，超過效果數後再從第一種循環。
                    </>
                  ) : batchMotionMode === "custom" ? (
                    <>
                      目前：🎛️ 每張自己選效果。未指定的貼圖會沿用多效果輪用預設。
                    </>
                  ) : (
                    <>
                      目前整套效果：
                      {t(
                        AUTO_MOTION_PRESETS.find(
                          (item) => item.value === batchMotionPreset,
                        )?.labelKey ??
                          "animated_line_sticker.auto_motion_auto",
                      )}
                    </>
                  )}
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {workflowMode === "batch" && batchAnimatedPreviews.length ? (
          <section
            ref={batchPreviewSectionRef}
            className="mt-6 scroll-mt-24 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-sky-50 p-5 shadow-sm md:p-7"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black uppercase tracking-wide text-violet-700">
                  動態成品檢查
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 md:text-2xl">
                  {batchAnimatedPreviews.length} 張動態貼圖預覽
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  這裡顯示實際完成的 {exportPlatform === "whatsapp" ? "動畫 WebP" : "APNG"} 成品，請逐張檢查人物、文字與去背。預覽不帶入舊提示詞文字。
                </p>

              </div>
              <button
                type="button"
                onClick={() => replayBatchPreview()}
                className="inline-flex min-h-11 w-auto shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-black text-violet-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-100 hover:shadow-md"
              >
                ▶ 重播全部
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {batchAnimatedPreviews.map((item) => (
                <article
                  key={item.url}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => replayBatchPreview(item.id)}
                    className="group block w-full rounded-xl border border-slate-200 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0] p-2 transition hover:border-violet-300 hover:ring-2 hover:ring-violet-100"
                    title="點一下重新播放這張動畫"
                  >
                    <div className="aspect-[320/270] overflow-hidden rounded-lg">
                      <img
                        src={item.url}
                        alt={"第 " + String(item.index + 1) + " 張動態貼圖預覽"}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </button>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-700">
                      {String(item.index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={
                        "rounded-full px-2 py-1 text-[10px] font-black " +
                        (item.overLimit
                          ? "bg-rose-100 text-rose-700"
                          : "bg-emerald-100 text-emerald-700")
                      }
                    >
                      {item.sizeKb} KB
                    </span>
                  </div>

                  <p className="mt-1 text-[10px] leading-4 text-slate-400">
                    點圖片可重播
                  </p>
                </article>
              ))}
            </div>

            <section className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
              <h3 className="text-base font-black text-rose-900">完成後另存高清影片｜整套動態展示</h3>
              <p className="mt-1 text-xs leading-6 text-rose-800">
                將 {batchAnimatedPreviews.length} 張依序播放，每張約 2 秒；先產生 640×540 動畫影格，再以固定約 30FPS 重畫至 1080×1920 直式影片，避免舊版約 3FPS 的跳格現象。MP4 僅供展示，貼圖上架請用對應的 ZIP。
              </p>
              <button type="button" disabled={batchVideoBusy || batchBusy}
                onClick={exportBatchHdVideo}
                className="mt-3 min-h-12 rounded-2xl bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-md hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                {batchVideoBusy ? `正在製作高清影片 ${batchVideoProgress}%…` : "下載整套高清影片（MP4 優先）"}
              </button>
              {batchVideoBusy ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-rose-200"><div className="h-full bg-rose-600 transition-all" style={{ width: `${batchVideoProgress}%` }} /></div> : null}
              {batchVideoMessage ? <p role="status" className="mt-3 text-xs font-bold leading-6 text-rose-900">{batchVideoMessage}</p> : null}
              <p className="mt-2 text-[11px] leading-5 text-rose-700">全程在本機瀏覽器製作，無需上傳雲端。原始低解析度素材的細節無法憑空還原；影片錄製時間約為貼圖數量×2秒，且會先準備動畫影格。瀏覽器不支援 MP4 時會輸出真正 WebM。</p>
            </section>
            <div className="mt-4 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-xs font-bold leading-5 text-sky-900">
              瀏覽器顯示的是實際 APNG 動畫；若動畫已播放完，可按「重播全部」或點單張圖片重新播放。
            </div>
          </section>
        ) : null}

        {workflowMode !== "batch" ? (
        <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.25fr)_minmax(330px,0.85fr)]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            {workflowMode === "manual" ? (
              <div className="mb-5 rounded-2xl border border-sky-200 bg-sky-50 p-4">
                <p className="text-sm font-black text-sky-950">
                  🧩 客戶自備分鏡 PNG｜手動動態製作
                </p>
                <p className="mt-2 text-xs font-bold leading-6 text-sky-900">
                  1 上傳 5～20 張分鏡 PNG → 2 調整播放順序 → 3 看動態預覽 → 4 一鍵產生 APNG 並打包。
                </p>
                <p className="mt-1 text-xs leading-5 text-sky-700">
                  這個模式不會套用自動動作，會照客戶自己畫好的每一格分鏡播放。
                </p>
              </div>
            ) : null}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900">{t("animated_line_sticker.frame_order_title")}</h2>
                <p className="mt-1 text-sm text-slate-600">{t("animated_line_sticker.frame_order_desc")}</p>
              </div>
              <button
                type="button"
                onClick={clearFrames}
                className="inline-flex min-h-11 w-full items-center justify-center whitespace-nowrap rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-bold leading-none text-rose-700 hover:bg-rose-50 sm:w-auto"
              >
                {t("animated_line_sticker.clear_button")}
              </button>
            </div>

            {frames.length === 0 ? (
              workflowMode === "manual" ? (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDrop={(event) => {
                  event.preventDefault();
                  handleFiles(event.dataTransfer.files);
                }}
                onDragOver={(event) => event.preventDefault()}
                className="mt-5 flex min-h-[230px] w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-fuchsia-200 bg-fuchsia-50/60 p-6 text-center hover:bg-fuchsia-50"
              >
                <span className="text-4xl">📁</span>
                <span className="mt-3 text-base font-black text-slate-900">{t("animated_line_sticker.dropzone_title")}</span>
                <span className="mt-2 text-sm text-slate-600">{t("animated_line_sticker.dropzone_desc")}</span>
              </button>
              ) : (
                <div className="mt-5 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-violet-100 bg-violet-50/60 p-5 text-center">
                  <span className="text-3xl">✨</span>
                  <p className="mt-2 text-sm font-black text-slate-800">{t("animated_line_sticker.single_wait_title")}</p>
                  <p className="mt-1 max-w-md text-xs leading-5 text-slate-600">{t("animated_line_sticker.single_wait_desc")}</p>
                </div>
              )
            ) : (
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {frames.map((frame, index) => (
                  <div key={frame.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <span className="rounded-full bg-fuchsia-100 px-3 py-1 text-xs font-black text-fuchsia-700">
                        {t("animated_line_sticker.frame_number", { number: index + 1 })}
                      </span>
                      <div className="grid grid-cols-2 gap-1">
                        <button type="button" onClick={() => moveFrame(index, -1)} className="inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-lg bg-white px-3 py-2 text-xs font-bold leading-none text-slate-700 shadow-sm">{t("animated_line_sticker.move_up_button")}</button>
                        <button type="button" onClick={() => moveFrame(index, 1)} className="inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-lg bg-white px-3 py-2 text-xs font-bold leading-none text-slate-700 shadow-sm">{t("animated_line_sticker.move_down_button")}</button>
                      </div>
                    </div>
                    <div className="mt-3 flex h-36 items-center justify-center rounded-xl bg-[linear-gradient(45deg,#f1f5f9_25%,transparent_25%),linear-gradient(-45deg,#f1f5f9_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f1f5f9_75%),linear-gradient(-45deg,transparent_75%,#f1f5f9_75%)] bg-[length:18px_18px] bg-[position:0_0,0_9px,9px_-9px,-9px_0]">
                      <img src={linePreviewMap.get(frame.id) ?? frame.url} alt={frame.name} className="max-h-full max-w-full object-contain" />
                    </div>
                    <p className="mt-3 truncate text-xs font-bold text-slate-700" title={frame.name}>{frame.name}</p>
                    <p className="mt-1 text-xs text-slate-500">原始 {frame.width}×{frame.height}px｜{(frame.file.size / 1024).toFixed(0)}KB</p>
                    <p className="mt-1 text-xs font-bold text-sky-700">正式輸出 {OUTPUT_WIDTH}×{OUTPUT_HEIGHT}px</p>
                    <p className={`mt-1 text-xs font-semibold ${frame.transparent === false ? "text-amber-700" : "text-emerald-700"}`}>
                      {frame.transparent === false ? t("animated_line_sticker.frame_transparent_warn") : t("animated_line_sticker.frame_transparent_ok")}
                    </p>
                    <button type="button" onClick={() => removeFrame(frame.id)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center whitespace-nowrap rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-bold leading-none text-rose-700 hover:bg-rose-50">
                      {t("animated_line_sticker.delete_frame_button")}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{t("animated_line_sticker.preview_title")}</h2>
                {autoSourceFile ? (
                  <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-black text-violet-700">
                    {t("animated_line_sticker.auto_live_preview_badge")}
                  </span>
                ) : null}
              </div>
              <div className="mt-4 flex h-[270px] items-center justify-center rounded-2xl border border-slate-200 bg-[linear-gradient(45deg,#f8fafc_25%,transparent_25%),linear-gradient(-45deg,#f8fafc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f8fafc_75%),linear-gradient(-45deg,transparent_75%,#f8fafc_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0]">
                {frames.length ? (
                  <img
                    src={linePreviewFrames[previewIndex % Math.max(linePreviewFrames.length, 1)]?.url ?? frames[previewIndex % frames.length]?.url}
                    alt={t("animated_line_sticker.preview_alt")}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <p className="text-sm font-bold text-slate-500">{t("animated_line_sticker.preview_empty")}</p>
                )}
              </div>
              <div className="mt-3 rounded-2xl bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-900">
                {t("animated_line_sticker.timing_principle")}
              </div>
              {lineOutputSummary ? (
                <div className="mt-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-900">
                  <p className="font-black">正式輸出預覽：{lineOutputSummary.outputSizeText}</p>
                  <p>原始尺寸：{lineOutputSummary.originalSizeText}｜共同裁切：約 {lineOutputSummary.cropSizeText}｜主體佔比：約 {lineOutputSummary.fillPercent}%</p>
                  <p>APNG、GIF、ZIP 會使用這個正式輸出版，不會直接使用原始 500×500 留白圖。</p>
                </div>
              ) : null}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">{t("animated_line_sticker.duration_label")}</span>
                  <select value={durationSec} onChange={(e) => setDurationSec(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900">
                    <option value={1}>{t("animated_line_sticker.duration_option_1")}</option>
                    <option value={2}>{t("animated_line_sticker.duration_option_2")}</option>
                    <option value={3}>{t("animated_line_sticker.duration_option_3")}</option>
                    <option value={4}>{t("animated_line_sticker.duration_option_4")}</option>
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">{t("animated_line_sticker.loop_label")}</span>
                  <select value={loopCount} onChange={(e) => setLoopCount(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900">
                    <option value={1}>{t("animated_line_sticker.loop_option_1")}</option>
                    <option value={2}>{t("animated_line_sticker.loop_option_2")}</option>
                    <option value={3}>{t("animated_line_sticker.loop_option_3")}</option>
                    <option value={4}>{t("animated_line_sticker.loop_option_4")}</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">{t("animated_line_sticker.spec_check_title")}</h2>
              <div className="mt-4 space-y-2">
                {checks.map((check) => (
                  <div key={check.label} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <span className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-black !text-white ${check.ok ? "bg-emerald-500" : "bg-amber-500"}`}>
                      {check.ok ? "✓" : "!"}
                    </span>
                    <div>
                      <p className="text-sm font-black text-slate-900">{check.label}</p>
                      <p className="text-xs leading-5 text-slate-600">{check.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-slate-900">{t("animated_line_sticker.export_title")}</h2>
              {workflowMode === "manual" ? (
                <button
                  type="button"
                  disabled={!canExportApng || busy}
                  onClick={exportManualStoryboardPack}
                  className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black !text-white shadow-md transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {busy ? "處理中…" : "📦 一鍵製作＋打包自備分鏡"}
                </button>
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={!canExportApng || busy}
                  onClick={exportApng}
                  className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-2xl bg-fuchsia-600 px-4 py-3 text-sm font-black leading-none !text-white shadow-md transition hover:bg-fuchsia-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {busy ? t("animated_line_sticker.processing") : t("animated_line_sticker.download_apng_button")}
                </button>
                <button
                  type="button"
                  disabled={!canExport || busy}
                  onClick={exportGif}
                  className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black leading-none !text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {busy ? t("animated_line_sticker.processing") : t("animated_line_sticker.download_gif_button")}
                </button>
                <button
                  type="button"
                  disabled={!canExport || busy}
                  onClick={() => exportVideo("normal")}
                  className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-2xl bg-orange-500 px-4 py-3 text-sm font-black leading-none !text-white shadow-md transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {busy ? t("animated_line_sticker.processing") : t("animated_line_sticker.download_mp4_button")}
                </button>
                <button
                  type="button"
                  disabled={!canExport || busy}
                  onClick={() => exportVideo("hd")}
                  className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-2xl bg-rose-600 px-4 py-3 text-sm font-black leading-none !text-white shadow-md transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {busy ? t("animated_line_sticker.processing") : "下載高清 MP4"}
                </button>
                <button
                  type="button"
                  disabled={!canExport || busy}
                  onClick={exportZip}
                  className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-2xl bg-sky-600 px-4 py-3 text-sm font-black leading-none !text-white shadow-md transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {busy ? t("animated_line_sticker.processing") : t("animated_line_sticker.download_zip_button")}
                </button>
                <button
                  type="button"
                  disabled={!canExport || busy}
                  onClick={exportSmallImages}
                  className="inline-flex min-h-12 items-center justify-center whitespace-nowrap rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-black leading-none !text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:col-span-2"
                >
                  {busy ? t("animated_line_sticker.processing") : "下載小圖 ZIP（main＋tab）"}
                </button>
              </div>
              <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-600">
                <p><span className="font-black text-slate-800">{t("animated_line_sticker.apng_label")}</span>{t("animated_line_sticker.apng_desc")}</p>
                <p className="mt-1 font-bold text-amber-700">提示：工具可上傳最多 20 禎；LINE 動態貼圖每張 APNG 必須小於 1MB。10 禎以上會啟用快速匯出模式，但不會自動縮小角色。</p>
                <p><span className="font-black text-slate-800">{t("animated_line_sticker.gif_label")}</span>{t("animated_line_sticker.gif_desc")}</p>
                <p><span className="font-black text-slate-800">{t("animated_line_sticker.mp4_label")}</span>{t("animated_line_sticker.mp4_desc")}</p>
                <p><span className="font-black text-slate-800">小圖 ZIP：</span>自動匯出 LINE 後台需要的 main_240x240.png（APNG）與 tab_96x74.png（PNG）；tab 會用第 1 禎裁掉透明留白後置中。</p>
              </div>
              {exportStatus ? (
                <p className="mt-3 rounded-xl bg-sky-50 px-3 py-2 text-sm font-bold text-sky-800">
                  {exportStatus}
                </p>
              ) : null}
              {message ? <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">{message}</p> : null}
            </div>
          </div>
        </section>
        ) : null}
        </div>
      </main>
    </>
  );
};

export default AnimatedLineStickerTool;
