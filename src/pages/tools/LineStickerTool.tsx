import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SEO from "@/components/SEO";
import LineStickerAuthorCard from "@/components/LineStickerAuthorCard";
import LineStickerFlowSteps from "@/components/LineStickerFlowSteps";
import {
  analyzeMotherSheetSafety,
  type MotherSheetSafetyReview,
} from "@/lib/lineMotherSheetSafety";
import CoupangDynamicAd from "@/components/CoupangDynamicAd";
import {
  clearAnimatedStickerHandoff,
  clearLineStickerProject,
  getMotherSheetPlan,
  readLineStickerProject,
  saveAnimatedStickerHandoff,
  updateLineStickerProject,
  type LineStickerProject,
  type MotherSheetGrid,
} from "@/lib/lineStickerFlow";
import { RelatedTools } from "@/components/seo/RelatedTools";
import { RelatedGuides } from "@/components/seo/RelatedGuides";
import {
  getRelatedGuideItems,
  getRelatedToolsItems,
} from "@/data/internalLinks";
import JSZip from "jszip";
import { stickerSaleTextRisks } from "@/lib/stickerCommercialSafety";
import { saveAs } from "file-saver";
import { removeStickerWhiteBackground, type StickerWhiteRemovalMode } from "@/lib/stickerWhiteBackground";

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
  sourceTouchesHardEdge: boolean;
  sourceNearEdge: boolean;
};

type ItemOffset = { x: number; y: number };

const SAFE_PADDING_RATIO = 0.11;
const SMART_SAFE_PADDING_RATIO = 0.08;
const MOTHER_SHEET_OVERLAP_RATIO = 0.06;
const ALPHA_THRESHOLD = 12;

type ContentBox = { x: number; y: number; width: number; height: number };

type QualitySeverity = "error" | "warning" | "ok";

type StickerQualityIssue = {
  code:
    | "no_transparency"
    | "empty"
    | "touches_edge"
    | "small"
    | "fragment"
    | "source_cut"
    | "source_near_edge";
  severity: Exclude<QualitySeverity, "ok">;
  message: string;
};

type StickerQualityReport = {
  index: number;
  severity: QualitySeverity;
  issues: StickerQualityIssue[];
};

const QUALITY_ALPHA_THRESHOLD = 12;
const QUALITY_EDGE_MARGIN = 14;
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

function getImageSourceEdgeRisk(img: HTMLImageElement): {
  touchesHardEdge: boolean;
  nearEdge: boolean;
} {
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  if (!width || !height) {
    return { touchesHardEdge: false, nearEdge: false };
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    return { touchesHardEdge: false, nearEdge: false };
  }

  context.clearRect(0, 0, width, height);
  context.drawImage(img, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;

  const hardMargin = Math.max(
    2,
    Math.round(Math.min(width, height) * 0.006),
  );
  const nearMargin = Math.max(
    hardMargin + 2,
    Math.round(Math.min(width, height) * 0.025),
  );

  let visible = 0;
  let hardPixels = 0;
  let nearPixels = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha <= ALPHA_THRESHOLD) continue;
      visible += 1;

      const hard =
        x < hardMargin ||
        y < hardMargin ||
        x >= width - hardMargin ||
        y >= height - hardMargin;
      const near =
        x < nearMargin ||
        y < nearMargin ||
        x >= width - nearMargin ||
        y >= height - nearMargin;

      if (hard) hardPixels += 1;
      if (near) nearPixels += 1;
    }
  }

  if (!visible) {
    return { touchesHardEdge: false, nearEdge: false };
  }

  const hardBorderArea =
    width * hardMargin * 2 +
    Math.max(0, height - hardMargin * 2) * hardMargin * 2;
  const nearBorderArea =
    width * nearMargin * 2 +
    Math.max(0, height - nearMargin * 2) * nearMargin * 2;

  const hardCoverage = hardBorderArea ? hardPixels / hardBorderArea : 0;
  const nearCoverage = nearBorderArea ? nearPixels / nearBorderArea : 0;
  const hardRatio = hardPixels / visible;
  const nearRatio = nearPixels / visible;

  // 少量抗鋸齒、花瓣或擴張切格留下的 1~2px 像素不再誤判為「內容被切到」。
  // 只有邊界有一段明顯、連續的內容時才提示。
  const touchesHardEdge =
    hardPixels >= 36 &&
    hardCoverage >= 0.025 &&
    hardRatio >= 0.0015;
  const nearEdge =
    !touchesHardEdge &&
    nearPixels >= 90 &&
    nearCoverage >= 0.035 &&
    nearRatio >= 0.004;

  return { touchesHardEdge, nearEdge };
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

  const requestedScale = Math.max(0.65, Math.min(1.3, scalePercent / 100));

  if (mode === "crop") {
    const safeScale = requestedScale;
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

  const paddingRatio =
    mode === "smart-safe" ? SMART_SAFE_PADDING_RATIO : SAFE_PADDING_RATIO;
  const padding = Math.max(
    6,
    Math.round(Math.min(targetW, targetH) * paddingRatio),
  );
  const maxW = Math.max(1, targetW - padding * 2);
  const maxH = Math.max(1, targetH - padding * 2);

  // 安全模式永遠不允許把內容放大到安全框之外。
  // 想故意滿版裁切時才使用「滿版」模式。
  const safeScale = Math.min(1, requestedScale);
  const scale =
    Math.min(maxW / sourceBox.width, maxH / sourceBox.height) * safeScale;
  const drawW = Math.max(1, Math.round(sourceBox.width * scale));
  const drawH = Math.max(1, Math.round(sourceBox.height * scale));
  const centeredX = Math.round((targetW - drawW) / 2);
  const centeredY = Math.round((targetH - drawH) / 2);
  const minX = padding;
  const maxX = Math.max(padding, targetW - padding - drawW);
  const minY = padding;
  const maxY = Math.max(padding, targetH - padding - drawH);
  const dx = Math.max(minX, Math.min(maxX, centeredX + Math.round(offset.x)));
  const dy = Math.max(minY, Math.min(maxY, centeredY + Math.round(offset.y)));

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

function detectMotherSheetGrid(
  width: number,
  height: number,
): MotherSheetGrid {
  const ratio = width / Math.max(1, height);
  if (ratio >= 1.35) return "4x2";
  if (ratio <= 0.9) return "4x5";
  return "4x4";
}

function percentile(values: number[], q: number) {
  if (!values.length) return 1;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor((sorted.length - 1) * q)),
  );
  return sorted[index];
}

function detectMotherSheetGridFromImage(
  image: HTMLImageElement,
): MotherSheetGrid {
  const sourceWidth = Math.max(1, image.naturalWidth || image.width);
  const sourceHeight = Math.max(1, image.naturalHeight || image.height);
  const ratioFallback = detectMotherSheetGrid(sourceWidth, sourceHeight);

  const maxSide = 360;
  const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(48, Math.round(sourceWidth * scale));
  const height = Math.max(48, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return ratioFallback;

  context.drawImage(image, 0, 0, width, height);
  const pixels = context.getImageData(0, 0, width, height).data;
  const cornerIndexes = [
    0,
    (width - 1) * 4,
    (height - 1) * width * 4,
    (height * width - 1) * 4,
  ];
  const background = [0, 1, 2, 3].map((channel) =>
    Math.round(
      cornerIndexes.reduce(
        (sum, index) => sum + pixels[index + channel],
        0,
      ) / cornerIndexes.length,
    ),
  );

  const rowInk = new Array<number>(height).fill(0);
  let totalInk = 0;

  for (let y = 0; y < height; y += 1) {
    let ink = 0;
    for (let x = 0; x < width; x += 1) {
      const p = (y * width + x) * 4;
      const alpha = pixels[p + 3];
      const alphaDiff = Math.abs(alpha - background[3]);
      const colorDiff =
        Math.abs(pixels[p] - background[0]) +
        Math.abs(pixels[p + 1] - background[1]) +
        Math.abs(pixels[p + 2] - background[2]);
      const visibleAgainstTransparent =
        background[3] < 40 && alpha > 40;

      if (
        visibleAgainstTransparent ||
        alphaDiff > 45 ||
        (alpha > 24 && colorDiff > 54)
      ) {
        ink += 1;
      }
    }
    rowInk[y] = ink / width;
    totalInk += ink;
  }

  const overallInk = totalInk / (width * height);
  if (overallInk < 0.02) return ratioFallback;

  const separatorScore = (fraction: number) => {
    const center = Math.round(height * fraction);
    const radius = Math.max(2, Math.round(height * 0.018));
    const values: number[] = [];
    for (
      let y = Math.max(0, center - radius);
      y <= Math.min(height - 1, center + radius);
      y += 1
    ) {
      values.push(rowInk[y]);
    }
    return percentile(values, 0.2);
  };

  const threshold = Math.max(
    0.12,
    Math.min(0.32, overallInk * 0.45),
  );
  const fifths = [0.2, 0.4, 0.6, 0.8].map(separatorScore);
  const quarters = [0.25, 0.5, 0.75].map(separatorScore);
  const center = separatorScore(0.5);

  if (fifths.every((score) => score < threshold)) return "4x5";
  if (quarters.every((score) => score < threshold)) return "4x4";
  if (center < threshold) return "4x2";

  return ratioFallback;
}

type MotherSheetDetection = {
  safetyByGrid: Record<MotherSheetGrid, MotherSheetSafetyReview>;
  id: string;
  file: File;
  sourceIndex: number;
  width: number;
  height: number;
  grid: MotherSheetGrid;
  stickerCount: number;
};

type MotherSheetPlanCheck = {
  valid: boolean;
  expectedCount: number;
  actualCount: number;
  expectedLabel: string;
  actualLabel: string;
  message: string;
};

function getMotherSheetGridStickerCount(grid: MotherSheetGrid) {
  if (grid === "4x2") return 8;
  if (grid === "4x5") return 20;
  return 16;
}

function formatMotherSheetGrid(grid: MotherSheetGrid) {
  return grid.replace("x", "×");
}

function formatMotherSheetPlan(
  plan: ReturnType<typeof getMotherSheetPlan>,
) {
  return plan
    .map((item) => `${formatMotherSheetGrid(item.grid)}（${item.count} 張）`)
    .join(" ＋ ");
}

async function inspectMotherSheetFile(
  file: File,
  sourceIndex: number,
  t: (key: string) => string,
): Promise<MotherSheetDetection> {
  const image = await loadImage(file, t);
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const grid = detectMotherSheetGridFromImage(image);
  // 大圖僅縮小用於「分析」；最後的切圖仍使用高解析原檔。
  const analysisScale = Math.min(1, 1400 / Math.max(width, height));
  const analysisWidth = Math.max(1, Math.round(width * analysisScale));
  const analysisHeight = Math.max(1, Math.round(height * analysisScale));
  const canvas = document.createElement("canvas");
  canvas.width = analysisWidth;
  canvas.height = analysisHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("無法建立母圖安全分析畫布");
  context.drawImage(image, 0, 0, analysisWidth, analysisHeight);
  const rgba = context.getImageData(0, 0, analysisWidth, analysisHeight).data;
  const safetyByGrid = {
    "4x2": analyzeMotherSheetSafety(rgba, analysisWidth, analysisHeight, "4x2"),
    "4x4": analyzeMotherSheetSafety(rgba, analysisWidth, analysisHeight, "4x4"),
    "4x5": analyzeMotherSheetSafety(rgba, analysisWidth, analysisHeight, "4x5"),
  };

  return {
    safetyByGrid,
    id: `${sourceIndex}-${file.name}-${file.size}`,
    file,
    sourceIndex,
    width,
    height,
    grid,
    stickerCount: getMotherSheetGridStickerCount(grid),
  };
}

function checkMotherSheetPlan(
  detections: MotherSheetDetection[],
  plan: ReturnType<typeof getMotherSheetPlan>,
): MotherSheetPlanCheck {
  const expectedCount = plan.reduce((sum, item) => sum + item.count, 0);
  const actualCount = detections.reduce(
    (sum, item) => sum + item.stickerCount,
    0,
  );
  const expectedLabel = formatMotherSheetPlan(plan);
  const actualLabel = detections.length
    ? detections
        .map(
          (item) =>
            `${formatMotherSheetGrid(item.grid)}（${item.stickerCount} 張）`,
        )
        .join(" ＋ ")
    : "尚未選擇母圖";

  if (detections.length !== plan.length) {
    return {
      valid: false,
      expectedCount,
      actualCount,
      expectedLabel,
      actualLabel,
      message: `需要 ${plan.length} 張母圖，目前選了 ${detections.length} 張。`,
    };
  }

  const expectedGrids = plan.map((item) => item.grid).sort();
  const actualGrids = detections.map((item) => item.grid).sort();
  const sameGridCombination =
    expectedGrids.length === actualGrids.length &&
    expectedGrids.every((grid, index) => grid === actualGrids[index]);

  if (!sameGridCombination || expectedCount !== actualCount) {
    return {
      valid: false,
      expectedCount,
      actualCount,
      expectedLabel,
      actualLabel,
      message: `母圖組合不符合。目前方案需要 ${expectedLabel}，實際偵測為 ${actualLabel}。`,
    };
  }

  return {
    valid: true,
    expectedCount,
    actualCount,
    expectedLabel,
    actualLabel,
    message: `辨識正確，共 ${actualCount} 張，可以開始切圖。`,
  };
}

function orderDetectedMotherSheetsForPlan(
  detections: MotherSheetDetection[],
  plan: ReturnType<typeof getMotherSheetPlan>,
) {
  const used = new Set<number>();
  const ordered: Array<{ detection: MotherSheetDetection; grid: MotherSheetGrid }> = [];

  plan.forEach((planned) => {
    const matchIndex = detections.findIndex(
      (item, index) => !used.has(index) && item.grid === planned.grid,
    );
    if (matchIndex < 0) return;
    used.add(matchIndex);
    ordered.push({
      detection: detections[matchIndex],
      grid: planned.grid,
    });
  });

  return ordered;
}


async function detectMotherSheetGridFromFile(
  file: File,
  t: (key: string) => string,
): Promise<MotherSheetGrid> {
  const image = await loadImage(file, t);
  return detectMotherSheetGridFromImage(image);
}

async function orderMotherSheetsForPlan(
  files: File[],
  plan: ReturnType<typeof getMotherSheetPlan>,
  t: (key: string) => string,
): Promise<Array<{ file: File; grid: MotherSheetGrid }>> {
  if (!plan.length) return [];

  const detected = await Promise.all(
    files.map(async (file, index) => ({
      file,
      index,
      grid: await detectMotherSheetGridFromFile(file, t),
    })),
  );

  const used = new Set<number>();
  const ordered: Array<{ file: File; grid: MotherSheetGrid }> = [];

  for (const planned of plan) {
    let match = detected.find(
      (item) => !used.has(item.index) && item.grid === planned.grid,
    );

    // 32 / 40 張的兩張母圖格數相同時，保留瀏覽器提供的檔案順序。
    if (!match) {
      match = detected.find((item) => !used.has(item.index));
    }
    if (!match) break;

    used.add(match.index);
    ordered.push({
      file: match.file,
      grid: match.grid === planned.grid ? planned.grid : match.grid,
    });
  }

  detected
    .filter((item) => !used.has(item.index))
    .forEach((item) => ordered.push({ file: item.file, grid: item.grid }));

  return ordered;
}

function removeConnectedWhiteBackground(
  canvas: HTMLCanvasElement,
  mode: StickerWhiteRemovalMode = "protect",
) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context || mode === "off") return;
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  const result = removeStickerWhiteBackground(imageData.data, canvas.width, canvas.height, mode);
  // 已經有透明背景的 PNG 不重覆去白，保住白衣、文字白邊與皮膚高光。
  if (result.removedPixels > 0) context.putImageData(imageData, 0, 0);
}

function cleanPaleEdgeHalo(canvas: HTMLCanvasElement, passes = 1) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  for (let pass = 0; pass < passes; pass += 1) {
    const { width, height } = canvas;
    const imageData = context.getImageData(0, 0, width, height);
    const src = imageData.data;
    const next = new Uint8ClampedArray(src);

    const isTransparentNeighbor = (x: number, y: number) => {
      if (x < 0 || y < 0 || x >= width || y >= height) return true;
      return src[(y * width + x) * 4 + 3] <= 24;
    };

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const p = (y * width + x) * 4;
        const a = src[p + 3];
        if (a <= 24) continue;

        const r = src[p];
        const g = src[p + 1];
        const b = src[p + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const paleNeutral = min >= 226 && max - min <= 34;
        if (!paleNeutral) continue;

        const touchesTransparent =
          isTransparentNeighbor(x - 1, y) ||
          isTransparentNeighbor(x + 1, y) ||
          isTransparentNeighbor(x, y - 1) ||
          isTransparentNeighbor(x, y + 1);
        if (!touchesTransparent) continue;

        if (min >= 246) next[p + 3] = 0;
        else if (min >= 238) next[p + 3] = Math.min(a, 70);
        else next[p + 3] = Math.min(a, 150);
      }
    }

    imageData.data.set(next);
    context.putImageData(imageData, 0, 0);
  }
}

function removeTinyEdgeFragments(
  canvas: HTMLCanvasElement,
  edgeRatio = 0.075,
  maxFragmentRatio = 0.018,
) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height);
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

  let removed = false;
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
    removed = true;
  }

  if (removed) context.putImageData(imageData, 0, 0);
}

function removeForeignCellComponents(
  canvas: HTMLCanvasElement,
  core: { x: number; y: number; width: number; height: number },
) {
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return;

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height);
  const data = imageData.data;
  const total = width * height;
  const mask = new Uint8Array(total);

  for (let i = 0; i < total; i += 1) {
    if (data[i * 4 + 3] > 20) mask[i] = 1;
  }

  const seen = new Uint8Array(total);
  const queue = new Int32Array(total);
  let changed = false;

  const coreRight = core.x + core.width;
  const coreBottom = core.y + core.height;
  const isInsideCore = (x: number, y: number) =>
    x >= core.x && x < coreRight && y >= core.y && y < coreBottom;

  for (let start = 0; start < total; start += 1) {
    if (!mask[start] || seen[start]) continue;

    let head = 0;
    let tail = 0;
    queue[tail++] = start;
    seen[start] = 1;

    const pixels: number[] = [];
    let insideCount = 0;
    let sumX = 0;
    let sumY = 0;

    while (head < tail) {
      const current = queue[head++];
      pixels.push(current);
      const x = current % width;
      const y = Math.floor(current / width);
      sumX += x;
      sumY += y;
      if (isInsideCore(x, y)) insideCount += 1;

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

    const size = pixels.length;
    const insideRatio = size ? insideCount / size : 0;
    const centerX = size ? sumX / size : 0;
    const centerY = size ? sumY / size : 0;
    const centerOwned = isInsideCore(centerX, centerY);

    // 擴張切格是為了救回靠近格線的文字；相鄰格內容若主要在 core 外就刪除。
    const belongsToThisCell =
      insideCount > 0 && (centerOwned || insideRatio >= 0.42);

    if (!belongsToThisCell) {
      for (const index of pixels) data[index * 4 + 3] = 0;
      changed = true;
    }
  }

  if (changed) context.putImageData(imageData, 0, 0);
}

/**
 * 已通過留白切割檢查後，重新置中縮放至透明安全框。
 * 避免直接剪去花瓣、文字，也不會因為原圖貼邊就截斷。
 */
function centerMotherSheetCellWithPadding(source: HTMLCanvasElement): HTMLCanvasElement {
  const context = source.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("無法讀取去背後圖片");
  const { width, height } = source;
  const pixels = context.getImageData(0, 0, width, height).data;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = pixels[(y * width + x) * 4 + 3];
      if (alpha <= ALPHA_THRESHOLD) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) {
    throw new Error("去背後出現空白貼圖，請重新選擇母圖。");
  }
  const boxWidth = maxX - minX + 1;
  const boxHeight = maxY - minY + 1;
  const padding = Math.max(5, Math.round(Math.min(width, height) * 0.13));
  const scale = Math.min(
    (width - padding * 2) / boxWidth,
    (height - padding * 2) / boxHeight,
  );
  const drawWidth = Math.max(1, Math.round(boxWidth * scale));
  const drawHeight = Math.max(1, Math.round(boxHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法建立安全留白畫布");
  ctx.clearRect(0, 0, width, height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    source, minX, minY, boxWidth, boxHeight,
    Math.round((width - drawWidth) / 2),
    Math.round((height - drawHeight) / 2),
    drawWidth, drawHeight,
  );
  return canvas;
}

async function splitMotherSheet(
  file: File,
  grid: "auto" | MotherSheetGrid,
  t: (key: string) => string,
  removeWhiteBackground: boolean,
  whiteRemovalMode: StickerWhiteRemovalMode,
  safety?: MotherSheetSafetyReview,
): Promise<File[]> {
  const image = await loadImage(file, t);
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  const actualGrid =
    grid === "auto" ? detectMotherSheetGridFromImage(image) : grid;
  const [columns, rows] = actualGrid.split("x").map(Number);
  const review = safety ?? (() => {
    const canvas = document.createElement("canvas");
    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("無法建立安全切割畫布");
    ctx.drawImage(image, 0, 0);
    return analyzeMotherSheetSafety(
      ctx.getImageData(0, 0, sourceWidth, sourceHeight).data,
      sourceWidth, sourceHeight, actualGrid,
    );
  })();

  if (review.grid !== actualGrid) throw new Error("安全切圖格數不一致，請重新辨識母圖。");
  if (review.blocked.length) {
    throw new Error(`母圖「${file.name}」無法安全切割：${review.blocked.slice(0, 3).join("；")}`);
  }
  const xCuts = review.xCuts.map((x) => Math.round((x * sourceWidth) / review.width));
  const yCuts = review.yCuts.map((y) => Math.round((y * sourceHeight) / review.height));
  const results: File[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const left = xCuts[column];
      const top = yCuts[row];
      const width = Math.max(1, xCuts[column + 1] - left);
      const height = Math.max(1, yCuts[row + 1] - top);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("無法建立母圖切割畫布");
      context.clearRect(0, 0, width, height);
      context.drawImage(image, left, top, width, height, 0, 0, width, height);

      // 不再向相鄰格擴張 6% 取像，也不推測連通區塊歸屬，避免誤刪花朵／文字。
      if (removeWhiteBackground) {
        removeConnectedWhiteBackground(canvas, whiteRemovalMode);
        // 明確選擇強力模式時才修整白邊：此步可能傷到白色衣服。
        if (whiteRemovalMode === "strong") cleanPaleEdgeHalo(canvas, 1);
      }
      const output = removeWhiteBackground
        ? centerMotherSheetCellWithPadding(canvas)
        : canvas;
      const blob = await canvasToBlob(output, t);
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
  darkStickerPreview,
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
  darkStickerPreview: boolean;
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
        className={`relative mx-auto aspect-[520/450] w-full cursor-grab touch-none overflow-hidden rounded-xl border-[3px] border-sky-500 active:cursor-grabbing ${darkStickerPreview ? "bg-slate-700" : "bg-white"}`}
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
        <div
          className="pointer-events-none absolute rounded-lg border border-dashed border-emerald-400/90"
          style={{ inset: "8%" }}
        />
        <span className="pointer-events-none absolute left-[8%] top-[8%] rounded-br-md bg-emerald-500/90 px-1.5 py-0.5 text-[9px] font-black text-white">
          安全框
        </span>
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
              max={cropMode === "crop" ? 130 : 100}
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
  const navigate = useNavigate();
  const [flowProject] = useState<LineStickerProject | null>(() => {
    if (typeof window === "undefined") return null;
    const enabled = new URLSearchParams(window.location.search).get("flow") === "1";
    return enabled ? readLineStickerProject() : null;
  });
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
  const saleTextRisks = useMemo(() => stickerSaleTextRisks(flowProject?.texts ?? []), [flowProject]);
  const [files, setFiles] = useState<ImagePreview[]>([]);
  const [stickerCount, setStickerCount] = useState<8 | 16 | 24 | 32 | 40>(
    () => flowProject?.count ?? 8,
  );
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [cropMode, setCropMode] = useState<LineStickerCropMode>("smart-safe");
  const [cropScale, setCropScale] = useState<number>(92);
  const [downloadCompleted, setDownloadCompleted] = useState(
    () => flowProject?.mode === "static" && flowProject?.stage === 5,
  );
  const [itemScales, setItemScales] = useState<Record<number, number>>({});
  const [itemOffsets, setItemOffsets] = useState<Record<number, ItemOffset>>({});
  const [reviewedWarnings, setReviewedWarnings] = useState<Record<number, boolean>>({});
  const [motherSheetGrid, setMotherSheetGrid] = useState<"auto" | MotherSheetGrid>("auto");
  const [autoRemoveWhiteBg, setAutoRemoveWhiteBg] = useState(true);
  const [whiteRemovalMode, setWhiteRemovalMode] = useState<StickerWhiteRemovalMode>("protect");
  const [darkStickerPreview, setDarkStickerPreview] = useState(false);
  const [mattingModeStale, setMattingModeStale] = useState(false);
  const [motherSheetSafetyResult, setMotherSheetSafetyResult] = useState<string | null>(null);
  const [motherSheetDetections, setMotherSheetDetections] = useState<
    MotherSheetDetection[]
  >([]);
  const [motherSheetDetectionStatus, setMotherSheetDetectionStatus] =
    useState<"idle" | "ready" | "invalid" | "cutting">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportCheckResult, setExportCheckResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const motherSheetInputRef = useRef<HTMLInputElement>(null);
  const getToolShareData = useCallback(() => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = "RxV LINE 貼圖整理工具";
    const text = "免費 LINE 貼圖五大步驟，自動分割母圖、去白底、整理主圖及 ZIP；PhotoRoom 是選用工具。";
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
          const edgeRisk = getImageSourceEdgeRisk(img);
          const sourceTouchesHardEdge = edgeRisk.touchesHardEdge;
          const sourceNearEdge = edgeRisk.nearEdge;

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
            sourceTouchesHardEdge,
            sourceNearEdge,
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

  const expectedMotherSheetPlan = useMemo(
    () => getMotherSheetPlan(flowProject?.count ?? stickerCount),
    [flowProject, stickerCount],
  );

  const motherSheetPlanCheck = useMemo(
    () => checkMotherSheetPlan(motherSheetDetections, expectedMotherSheetPlan),
    [motherSheetDetections, expectedMotherSheetPlan],
  );
  const unsafeMotherSheets = useMemo(
    () => motherSheetDetections.flatMap((item) => {
      const grid = !flowProject && motherSheetGrid !== "auto" ? motherSheetGrid : item.grid;
      return item.safetyByGrid[grid].blocked.map((message) => `${item.file.name}：${message}`);
    }),
    [motherSheetDetections, motherSheetGrid, flowProject],
  );

  const overrideMotherSheetGrid = useCallback(
    (id: string, grid: MotherSheetGrid) => {
      setMotherSheetDetections((previous) => {
        const next = previous.map((item) =>
          item.id === id
            ? {
                ...item,
                grid,
                stickerCount: getMotherSheetGridStickerCount(grid),
              }
            : item,
        );

        if (flowProject || motherSheetGrid === "auto") {
          const plan = getMotherSheetPlan(flowProject?.count ?? stickerCount);
          const check = checkMotherSheetPlan(next, plan);
          setMotherSheetDetectionStatus(check.valid ? "ready" : "invalid");
          setError(check.valid ? null : check.message);
        } else {
          setMotherSheetDetectionStatus("ready");
          setError(null);
        }

        return next;
      });
    },
    [flowProject, motherSheetGrid, stickerCount],
  );

  const handleMotherSheetChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(event.target.files || []);
      event.target.value = "";
      if (!selected.length) return;

      setLoading(true);
      setError(null);
      setMotherSheetSafetyResult(null);
      setMotherSheetDetectionStatus("idle");

      try {
        const validSelected = selected.filter((file) =>
          ACCEPT_TYPES.includes(file.type),
        );

        if (!validSelected.length) {
          throw new Error("請選擇 PNG、JPG 或 WebP 母圖。");
        }

        const detections = await Promise.all(
          validSelected.map((file, index) =>
            inspectMotherSheetFile(file, index, t),
          ),
        );

        setMotherSheetDetections(detections);

        if (!flowProject && motherSheetGrid !== "auto") {
          setMotherSheetDetectionStatus("ready");
          return;
        }

        const plan = getMotherSheetPlan(flowProject?.count ?? stickerCount);
        const check = checkMotherSheetPlan(detections, plan);
        setMotherSheetDetectionStatus(check.valid ? "ready" : "invalid");

        if (!check.valid) {
          setError(check.message);
        }
      } catch (cause) {
        setMotherSheetDetections([]);
        setMotherSheetDetectionStatus("invalid");
        setError(
          cause instanceof Error ? cause.message : "母圖格數辨識失敗",
        );
      } finally {
        setLoading(false);
      }
    },
    [flowProject, motherSheetGrid, stickerCount, t],
  );

  const confirmMotherSheetSplit = useCallback(async () => {
    if (!motherSheetDetections.length || loading) return;

    const useAutoPlan = Boolean(flowProject) || motherSheetGrid === "auto";
    const plan = getMotherSheetPlan(flowProject?.count ?? stickerCount);
    const check = checkMotherSheetPlan(motherSheetDetections, plan);

    if (useAutoPlan && !check.valid) {
      setMotherSheetDetectionStatus("invalid");
      setError(check.message);
      return;
    }
    if (unsafeMotherSheets.length) {
      setMotherSheetDetectionStatus("invalid");
      setError(`安全切割未通過：${unsafeMotherSheets.slice(0, 3).join("；")}`);
      return;
    }

    setLoading(true);
    setMotherSheetDetectionStatus("cutting");
    setError(null);

    try {
      const splitFiles: File[] = [];
      const safetyWarnings: string[] = [];

      if (useAutoPlan) {
        const orderedSheets = orderDetectedMotherSheetsForPlan(
          motherSheetDetections,
          plan,
        );

        if (orderedSheets.length !== plan.length) {
          throw new Error(
            `無法配對母圖。方案需要 ${formatMotherSheetPlan(plan)}，請重新選擇母圖。`,
          );
        }

        for (const item of orderedSheets) {
          const safety = item.detection.safetyByGrid[item.grid];
          const previousCount = splitFiles.length;
          splitFiles.push(
            ...(await splitMotherSheet(
              item.detection.file,
              item.grid,
              t,
              autoRemoveWhiteBg,
              whiteRemovalMode,
              safety,
            )),
          );
          safetyWarnings.push(...safety.warnings.map((warning) =>
            `第 ${previousCount + warning.index} 張原圖留白 ${warning.marginPercent}%`,
          ));
        }
      } else {
        for (const item of motherSheetDetections) {
          const grid = motherSheetGrid;
          const safety = item.safetyByGrid[grid];
          const previousCount = splitFiles.length;
          splitFiles.push(
            ...(await splitMotherSheet(
              item.file,
              grid,
              t,
              autoRemoveWhiteBg,
              whiteRemovalMode,
              safety,
            )),
          );
          safetyWarnings.push(...safety.warnings.map((warning) =>
            `第 ${previousCount + warning.index} 張原圖留白 ${warning.marginPercent}%`,
          ));
        }
      }

      const targetCount = flowProject?.count ?? stickerCount;
      if (splitFiles.length !== targetCount) {
        throw new Error(
          `切圖後得到 ${splitFiles.length} 張，但目前設定需要 ${targetCount} 張。請確認母圖格數與方案。`,
        );
      }

      // 新母圖確認後，直接取代上一批結果，避免重複累加。
      files.forEach((preview) => URL.revokeObjectURL(preview.url));
      setFiles([]);
      setItemScales({});
      setItemOffsets({});
      setReviewedWarnings({});
      setMainImageIndex(0);
      setDownloadCompleted(false);

      await validateAndAddFiles(splitFiles);
      setMattingModeStale(false);
      setMotherSheetSafetyResult(
        safetyWarnings.length
          ? `切割完成：已調整安全分隔線、置中補足約 13% 透明留白。偵測到原圖留白較小：${safetyWarnings.slice(0, 12).join("、")}${safetyWarnings.length > 12 ? `，另有 ${safetyWarnings.length - 12} 張` : ""}。請在下方逐張確認文字和花朵。`
          : "安全切割完成：已尋找各格之間的留白通道，並自動去背、置中與補足約 13% 透明留白。請逐張預覽後再打包。",
      );
      setMotherSheetDetectionStatus("ready");
      if (flowProject) updateLineStickerProject({ stage: 4 });
    } catch (cause) {
      setMotherSheetDetectionStatus("invalid");
      setError(
        cause instanceof Error ? cause.message : "母圖自動切割失敗",
      );
    } finally {
      setLoading(false);
    }
  }, [
    autoRemoveWhiteBg,
    whiteRemovalMode,
    files,
    flowProject,
    loading,
    motherSheetDetections,
    motherSheetGrid,
    unsafeMotherSheets,
    stickerCount,
    t,
    validateAndAddFiles,
  ]);

  const clearAll = useCallback(() => {
    files.forEach((p) => URL.revokeObjectURL(p.url));
    setFiles([]);
    setItemScales({});
    setItemOffsets({});
    setReviewedWarnings({});
    setMainImageIndex(0);
    setMotherSheetDetections([]);
    setMotherSheetDetectionStatus("idle");
    setDownloadCompleted(false);
    setMattingModeStale(false);
  }, [files]);

  const needMore = stickerCount - files.length;
  const canDownload = files.length >= stickerCount && !mattingModeStale;
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

  const autoSafetyFixAll = useCallback(() => {
    setCropMode("smart-safe");
    setCropScale(92);
    const nextScales: Record<number, number> = {};
    const nextOffsets: Record<number, ItemOffset> = {};
    files.forEach((_, index) => {
      nextScales[index] = 92;
      nextOffsets[index] = { x: 0, y: 0 };
    });
    setItemScales(nextScales);
    setItemOffsets(nextOffsets);
    setReviewedWarnings({});
    setError(null);
  }, [files]);

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
      const report = analyzeStickerCanvas(canvas, index);

      const offset = getOffsetForIndex(index);
      const scale = getScaleForIndex(index);
      const autoSafeLayout =
        cropMode === "smart-safe" &&
        scale <= 92 &&
        Math.abs(offset.x) <= 1 &&
        Math.abs(offset.y) <= 1;

      if (preview.sourceTouchesHardEdge) {
        report.issues.unshift({
          code: "source_cut",
          severity: "warning",
          message:
            "母圖內容貼近原始切格邊界；系統已保留重疊區並加安全留白，請用上方預覽目視確認文字／角色是否完整",
        });
        if (report.severity === "ok") report.severity = "warning";
      } else if (preview.sourceNearEdge && !autoSafeLayout) {
        report.issues.unshift({
          code: "source_near_edge",
          severity: "warning",
          message:
            "母圖內容靠近切格邊界；可按「全部自動安全修正」回到安全位置",
        });
        if (report.severity === "ok") report.severity = "warning";
      }

      return report;
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
    setExportCheckResult(null);
    setError(null);
    try {
      const zip = new JSZip();
      const addCheckedPng = async (name: string, canvas: HTMLCanvasElement) => {
        const blob = await canvasToBlob(canvas, t);
        if (blob.size > 1_000_000) {
          throw new Error(`${name} 為 ${Math.round(blob.size / 1024)}KB，超過保守的 LINE 單張 1MB 容量限制，請調整這張貼圖再輸出。`);
        }
        zip.file(name, blob);
      };
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
      await addCheckedPng("main.png", mainCanvas);
      await addCheckedPng("tab.png", tabCanvas);

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
        await addCheckedPng(`${String(i + 1).padStart(2, "0")}.png`, canvas);
      }
      const content = await zip.generateAsync({ type: "blob" });
      if (content.size > 60 * 1024 * 1024) {
        throw new Error("ZIP 超過 60MB，請減少圖片檔案大小再產生。");
      }
      saveAs(content, ZIP_FILENAME);
      setExportCheckResult(`已檢查 ${stickerCount} 張貼圖＋main＋tab：透明背景、尺寸、檔名與每張容量符合工具可驗證的 LINE 基本規格；下載後仍請人工檢查文字及著作權。`);
      if (flowProject?.mode !== "animated") {
        updateLineStickerProject({ stage: 5 });
        setDownloadCompleted(true);
      }
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
    flowProject,
    t,
  ]);

  const startNewStickerFlow = useCallback(async () => {
    clearAll();
    clearLineStickerProject();
    try {
      await clearAnimatedStickerHandoff();
    } catch {
      // IndexedDB 清除失敗不影響重新開始靜態貼圖流程。
    }
    setDownloadCompleted(false);
    navigate("/tools/sticker-prompt?new=1");
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
  }, [clearAll, navigate]);

  const continueToAnimated = useCallback(async () => {
    if (!canDownload || loading) return;
    if (qualityErrorCount > 0) {
      setError(`尚有 ${qualityErrorCount} 張需要修正，請先處理紅色提示的貼圖。`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const prepared: File[] = [];
      for (let i = 0; i < stickerCount; i += 1) {
        const canvas = resizeImageToCanvas(
          files[i].img,
          STICKER_BODY.width,
          STICKER_BODY.height,
          cropMode,
          getScaleForIndex(i),
          getOffsetForIndex(i),
        );
        if (!canvasHasTransparency(canvas)) {
          throw new Error(`第 ${i + 1} 張背景仍不是透明，請先確認去背結果。`);
        }
        const blob = await canvasToBlob(canvas, t);
        prepared.push(
          new File([blob], `${String(i + 1).padStart(2, "0")}.png`, {
            type: "image/png",
          }),
        );
      }
      await saveAnimatedStickerHandoff(prepared, flowProject?.mode === "animated" ? flowProject : null);
      updateLineStickerProject({ stage: 5 });
      navigate("/tools/animated-line-sticker?from=line-sticker");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "無法送到動態貼圖製作，請再試一次。",
      );
    } finally {
      setLoading(false);
    }
  }, [
    canDownload,
    loading,
    qualityErrorCount,
    stickerCount,
    files,
    cropMode,
    getScaleForIndex,
    getOffsetForIndex,
    navigate,
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
        <div className="mx-auto max-w-[1480px]">
          <LineStickerFlowSteps
            activeStep={
              downloadCompleted && flowProject?.mode !== "animated"
                ? 5
                : files.length >= stickerCount
                  ? 4
                  : 3
            }
            mode={flowProject?.mode ?? "static"}
          />

          <header className="mb-6">
            <div className="mb-3 inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-black text-sky-700">上架檢查強化版 · 2026.10.10</div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              第 3～4 步｜上傳母圖，自動整理貼圖
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              把剛才從 ChatGPT 下載的母圖直接傳上來。系統會自動切成單張、移除白色背景、整理尺寸並檢查。正常的圖片不用另外設定。
            </p>
            <p className="text-slate-500 text-sm mt-2">
              {t("line_sticker_hero_desc")}
            </p>
          </header>

          <section className="mb-5 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-black text-slate-900">一般客戶照著做就可以：5 個步驟</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">① 選靜態／動態與張數 → ② 複製提示詞到 ChatGPT 生圖 → ③ 上傳母圖自動分割、去白底 → ④ 預覽每張並選 MAIN／TAB → ⑤ 下載 ZIP，至 LINE Creators Market 上傳送審。</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">裁切、去白底與尺寸整理都由本站處理；若去背不理想，再選擇外部進階工具。完成 ZIP 不代表 LINE 必定審核通過。</p>
            <Link to="/tools/line-sticker-guide" className="mt-3 inline-flex items-center rounded-lg bg-indigo-50 px-3 py-2 text-xs font-black text-indigo-700 hover:bg-indigo-100">查看完整圖文教學</Link>
            {exportCheckResult ? <p role="status" className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold leading-6 text-emerald-800">{exportCheckResult}</p> : null}
          </section>

          {saleTextRisks.length > 0 ? (
            <section className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm font-black text-amber-900">LINE 公開販售提醒：前一步貼圖文字有 {saleTextRisks.length} 句可能屬於促銷或導流。</p>
              <p className="mt-1 text-xs leading-6 text-amber-800">
                {saleTextRisks.slice(0, 6).map((risk) => `${risk.text} → ${risk.replacement}`).join("；")}。
                若圖片已畫出這些字，修改文字清單不會自動改變圖片，請先重新產圖；否則仍可能被 LINE 退件。
              </p>
            </section>
          ) : null}

          {downloadCompleted && flowProject?.mode !== "animated" ? (
            <section className="mb-6 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-5 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                  ✓
                </span>
                <div>
                  <p className="text-xs font-black text-emerald-700">
                    第 5 步完成
                  </p>
                  <h2 className="text-lg font-black text-slate-900">
                    LINE 上架 ZIP 已下載
                  </h2>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                這一組已完成。要做下一組不用回首頁，直接按「再做一組新貼圖」會清除本次流程並回到第 1 步。
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={startNewStickerFlow}
                  className="min-h-12 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-violet-700 hover:shadow-lg"
                >
                  ✨ 再做一組新貼圖｜回到第 1 步
                </button>
                <button
                  type="button"
                  onClick={generateZip}
                  disabled={loading}
                  className="min-h-12 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-3 text-sm font-black text-blue-800 transition hover:bg-blue-100 disabled:opacity-50"
                >
                  ⬇ 再下載一次同一個 ZIP
                </button>
              </div>
            </section>
          ) : null}

          {flowProject ? (
            <section className="mb-6 rounded-3xl border border-blue-200 bg-blue-50 p-5">
              <p className="text-xs font-black text-blue-600">已接續第 1～2 步</p>
              <h2 className="mt-1 text-lg font-black text-slate-900">
                {flowProject.theme}｜{flowProject.mode === "animated" ? "動態" : "靜態"}貼圖｜{flowProject.count} 張
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                請上傳 {getMotherSheetPlan(flowProject.count).length} 張母圖：
                {getMotherSheetPlan(flowProject.count)
                  .map((item) => item.grid.replace("x", "×"))
                  .join(" ＋ ")}
                。可一起選取，順序不限；系統會先辨識每張母圖比例，再用正確格數裁切。
              </p>
            </section>
          ) : (
            <section className="mb-6 rounded-2xl border border-violet-100 bg-violet-50 p-4">
              <p className="text-sm font-black text-slate-900">還沒有貼圖母圖？</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                建議先從第 1 步開始，系統會幫你準備 ChatGPT 生圖指令。
              </p>
              <Link
                to="/tools/sticker-prompt"
                className="mt-3 inline-flex rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-black !text-white"
              >
                回到第 1 步
              </Link>
            </section>
          )}

          <details className="mb-6 rounded-2xl border border-slate-200 bg-white">
            <summary className="cursor-pointer px-4 py-3 text-sm font-black text-slate-700">
              需要教學或其他整理方式
            </summary>
            <div className="border-t border-slate-200 p-4">
              <LineStickerGuideEntry />
              <StickerWorkflowAssist />
              <LineStickerAuthorCard />
            </div>
          </details>

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
                若這些圖片是從下方「母圖上傳」進來，請確認已開啟自動去白底；單張直接上傳則仍需透明 PNG / WebP。
              </p>
            </div>
          )}

          <div className="space-y-4 mb-10">
            <section className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5">
              <div className="grid gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-600 px-3 py-1 text-[10px] font-black text-white">
                      一鍵母圖切割
                    </span>
                    <span className="text-xs font-bold text-violet-700">
                      自動判斷 4×2／4×4／4×5
                    </span>
                  </div>
                  <p className="mt-3 text-xs font-black uppercase tracking-wide text-violet-600">
                    步驟 3
                  </p>
                  <h2 className="mt-1 text-base font-black text-slate-900">
                    上傳母圖，後面交給系統自動整理
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    先辨識 4×2／4×4／4×5 與格數，再安全切割。去背預設保護白色衣服、白色文字描邊及淺色道具；處理後可切換深色背景逐張檢查。若原圖本來已有透明背景，不會重覆去白。
                  </p>
                </div>
                <div className="min-w-0 grid gap-2 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                  {flowProject ? (
                    <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-black leading-5 text-violet-800">
                      已依第 1 步設定自動辨識：
                      {getMotherSheetPlan(flowProject.count)
                        .map((item) => item.grid.replace("x", "×"))
                        .join(" ＋ ")}
                      。可一次多選，檔案順序不限，系統會依圖片比例自動配對。
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">

                      {(["auto", "4x2", "4x4", "4x5"] as const).map((grid) => (
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
                          {grid === "auto" ? "自動判斷" : grid.replace("x", "×")}
                        </button>
                      ))}
                    </div>
                  )}
                  </div>
                  <label className="flex min-w-0 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={autoRemoveWhiteBg}
                      onChange={(event) => {
                        setAutoRemoveWhiteBg(event.target.checked);
                        if (motherSheetDetections.length && files.length) setMattingModeStale(true);
                      }}
                      className="h-4 w-4 accent-emerald-600"
                    />
                    自動去白底（優先保護衣服與白色文字）
                  </label>
                  {autoRemoveWhiteBg ? (
                    <div className="rounded-xl border border-sky-200 bg-sky-50 px-3 py-3 sm:col-span-2">
                      <label className="block text-sm font-black text-sky-900" htmlFor="white-removal-mode">去背強度（人物衣服偏白時選保護模式）</label>
                      <select id="white-removal-mode" value={whiteRemovalMode}
                        onChange={(event) => {
                          setWhiteRemovalMode(event.target.value as StickerWhiteRemovalMode);
                          if (motherSheetDetections.length && files.length) setMattingModeStale(true);
                        }}
                        className="mt-2 w-full rounded-xl border border-sky-200 bg-white px-3 py-3 text-sm font-bold text-slate-800">
                        <option value="protect">保護白衣／白色字邊（預設推薦）</option>
                        <option value="balanced">均衡清理白底</option>
                        <option value="strong">加強去白底（可能傷到白衣與淺色花朵）</option>
                      </select>
                      <p className="mt-2 text-xs leading-6 text-sky-800">
                        預設只清除與畫布四周連接的極淺白色背景，避免把白衣、皮膚高光、藥片及白色文字描邊挖成透明。來源本身已有透明背景時會保留原圖。
                      </p>
                      {mattingModeStale ? (
                        <p className="mt-2 rounded-lg bg-amber-100 p-2 text-xs font-black text-amber-900">
                          去背模式已變更，舊預覽還沒更新。請重新按下方「確認切割」，才能產生新版圖片並繼續下載 ZIP。
                        </p>
                      ) : null}
                      {whiteRemovalMode === "strong" ? (
                        <p className="mt-2 rounded-lg bg-amber-100 p-2 text-xs font-black text-amber-900">加強模式可能誤刪白色制服或白色字邊。請先用深色底預覽檢查，再決定是否輸出。</p>
                      ) : null}
                    </div>
                  ) : null}
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
                    className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
                  >
                    {loading && motherSheetDetectionStatus !== "cutting"
                      ? "正在判斷母圖格數…"
                      : "選擇母圖 → 先判斷格數"}
                  </button>
                </div>
              </div>

              {motherSheetDetections.length > 0 ? (
                <div className="mt-5 rounded-2xl border border-violet-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        🔎 母圖辨識結果
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        系統會看實際內容排列，不只看圖片長寬；正方形畫布也可能是 4×2。若判錯，可在下方直接手動修正。
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => motherSheetInputRef.current?.click()}
                      disabled={loading}
                      className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-black text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                    >
                      重新選母圖
                    </button>
                  </div>

                  {(flowProject || motherSheetGrid === "auto") ? (
                    <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                      <div className="rounded-xl bg-blue-50 px-3 py-2 font-bold text-blue-800">
                        方案需要：{motherSheetPlanCheck.expectedLabel}
                        <span className="ml-1">
                          ＝ {motherSheetPlanCheck.expectedCount} 張
                        </span>
                      </div>
                      <div
                        className={`rounded-xl px-3 py-2 font-bold ${
                          motherSheetPlanCheck.valid
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        實際偵測：{motherSheetPlanCheck.actualLabel}
                        <span className="ml-1">
                          ＝ {motherSheetPlanCheck.actualCount} 張
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800">
                      目前是手動格數模式：每張母圖將強制使用
                      {formatMotherSheetGrid(motherSheetGrid)}。
                    </div>
                  )}

                  {unsafeMotherSheets.length ? (
                    <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold leading-6 text-rose-800">
                      <p className="font-black">無法保證安全切割：請修正以下母圖或格數，暫不允許硬切。</p>
                      {unsafeMotherSheets.slice(0, 6).map((reason, index) => <p key={index}>{reason}</p>)}
                    </div>
                  ) : null}
                  <div className="mt-4 grid gap-3 xl:grid-cols-2">
                    {motherSheetDetections.map((item, index) => {
                      const safetyGrid = !flowProject && motherSheetGrid !== "auto" ? motherSheetGrid : item.grid;
                      const plannedGrid =
                        expectedMotherSheetPlan[index]?.grid ?? null;
                      const matchesPlan =
                        !plannedGrid ||
                        item.grid === plannedGrid ||
                        expectedMotherSheetPlan.some(
                          (planItem) => planItem.grid === item.grid,
                        );

                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl border p-3 ${
                            matchesPlan
                              ? "border-emerald-200 bg-emerald-50/60"
                              : "border-rose-200 bg-rose-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p
                                className="truncate text-xs font-black text-slate-800"
                                title={item.file.name}
                              >
                                母圖 {index + 1}｜{item.file.name}
                              </p>
                              <p className="mt-1 text-[11px] text-slate-500">
                                {item.width} × {item.height}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-black ${
                                matchesPlan
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {matchesPlan ? "✓ 已辨識" : "需確認"}
                            </span>
                          </div>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-600">
                              判定格數
                            </span>
                            <strong className="text-sm text-violet-700">
                              {formatMotherSheetGrid(item.grid)} → {item.stickerCount} 張
                            </strong>
                          </div>
                          <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 px-3 py-2 text-xs font-bold leading-5 text-sky-900">
                            {item.safetyByGrid[safetyGrid].blocked.length
                              ? `需調整：${item.safetyByGrid[safetyGrid].blocked.slice(0, 2).join("；")}`
                              : `安全切線已分析（${formatMotherSheetGrid(safetyGrid)}）；原圖留白不足 8.5% 的貼圖有 ${item.safetyByGrid[safetyGrid].warnings.length} 張，切圖後會自動置中補白。`}
                          </div>
                          <div className="mt-3 rounded-xl border border-violet-100 bg-white/80 p-2">
                            <p className="text-[10px] font-bold leading-4 text-slate-500">
                              如果 AI 母圖留白很多、系統判錯，可直接手動指定這一張：
                            </p>
                            <div className="mt-2 grid grid-cols-3 gap-1.5">
                              {(["4x2", "4x4", "4x5"] as MotherSheetGrid[]).map(
                                (grid) => (
                                  <button
                                    key={grid}
                                    type="button"
                                    onClick={() =>
                                      overrideMotherSheetGrid(item.id, grid)
                                    }
                                    disabled={loading}
                                    className={`rounded-lg px-2 py-1.5 text-[10px] font-black transition ${
                                      item.grid === grid
                                        ? "bg-violet-600 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
                                    }`}
                                  >
                                    {formatMotherSheetGrid(grid)}
                                  </button>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={`mt-4 rounded-xl px-3 py-2 text-xs font-bold leading-5 ${
                      (flowProject || motherSheetGrid === "auto") &&
                      !motherSheetPlanCheck.valid
                        ? "bg-rose-50 text-rose-700"
                        : "bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    {(flowProject || motherSheetGrid === "auto")
                      ? motherSheetPlanCheck.message
                      : `已辨識 ${motherSheetDetections.length} 張母圖；確認後會依手動格數 ${formatMotherSheetGrid(
                          motherSheetGrid,
                        )} 切圖。`}
                  </div>

                  <button
                    type="button"
                    disabled={
                      loading ||
                      unsafeMotherSheets.length > 0 ||
                      ((flowProject || motherSheetGrid === "auto") &&
                        !motherSheetPlanCheck.valid)
                    }
                    onClick={confirmMotherSheetSplit}
                    className="mt-4 min-h-12 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-black text-white shadow-md transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loading && motherSheetDetectionStatus === "cutting"
                      ? "正在切圖、去背與安全整理…"
                      : "✓ 確認格數正確，開始切圖"}
                  </button>
                </div>
              ) : null}
            </section>

            {motherSheetSafetyResult ? (
              <div role="status" className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-bold leading-6 text-sky-900">
                {motherSheetSafetyResult}
              </div>
            ) : null}
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
                {flowProject ? (
                  <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-black text-blue-800">
                    已從第 1 步帶入：{stickerCount} 張，不需要再選一次
                  </div>
                ) : (
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
                )}
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

                <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-[11px] font-bold leading-5 text-emerald-800">
                  預設「智慧滿版」會保留約 8% 四邊安全空間，並自動限制拖曳／縮放不超出安全框，降低切到文字、頭髮與手勢的風險。
                </p>

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
                      min={75}
                      max={cropMode === "crop" ? 135 : 100}
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
                      安全模式最多 100%，不會讓內容超出安全框；有文字建議 88%～94%。只有選「滿版」才允許放大裁切。
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
                  <button
                    type="button"
                    onClick={autoSafetyFixAll}
                    className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800 shadow-sm transition hover:bg-emerald-100"
                  >
                    🛡️ 全部自動安全修正
                  </button>
                  <p className="mt-2 text-[11px] font-bold leading-5 text-emerald-700">
                    會統一改成智慧安全模式、縮放 92%、置中，並限制內容不可越過安全框。
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
                          <div className="flex min-w-0 flex-col gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-black text-slate-900">
                                第 {String(report.index + 1).padStart(2, "0")} 張
                              </p>
                              <ul className="mt-1 space-y-1 text-xs leading-6 text-slate-600">
                                {report.issues.map((issue) => (
                                  <li
                                    key={issue.code}
                                    className="whitespace-normal break-words"
                                  >
                                    • {issue.message}
                                  </li>
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
                                className={`w-fit self-start whitespace-nowrap rounded-xl px-3 py-2 text-[11px] font-black ${
                                  reviewed
                                    ? "bg-emerald-600 text-white"
                                    : "bg-amber-100 text-amber-800 shadow-sm"
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
              <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-sm font-black text-slate-700">透明去背檢查：</span>
                <button type="button" onClick={() => setDarkStickerPreview(false)}
                  className={`rounded-xl px-3 py-2 text-xs font-black ${!darkStickerPreview ? "bg-blue-600 text-white" : "bg-white text-slate-700"}`}>
                  白底
                </button>
                <button type="button" onClick={() => setDarkStickerPreview(true)}
                  className={`rounded-xl px-3 py-2 text-xs font-black ${darkStickerPreview ? "bg-slate-700 text-white" : "bg-white text-slate-700"}`}>
                  深色底（檢查白衣是否消失）
                </button>
                <span className="text-xs font-medium text-slate-500">背景切換只影響預覽，不會改變輸出 PNG。</span>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {files.map((p, i) => (
                  <div key={i} className="min-w-0">
                  <PreviewCard
                    preview={p}
                    index={i}
                    cropMode={cropMode}
                    itemScale={getScaleForIndex(i)}
                    darkStickerPreview={darkStickerPreview}
                    onScaleChange={(nextScale) => updateItemScale(i, nextScale)}
                    offset={getOffsetForIndex(i)}
                    onOffsetChange={(nextOffset) => updateItemOffset(i, nextOffset)}
                    isMain={mainImageIndex === i}
                    onSetMain={() => setMainImageIndex(i)}
                    isExcluded={i >= stickerCount}
                    onToggleExclude={() => {}}
                  />
                  {flowProject?.texts[i] ? (
                    <p className="mt-2 rounded-xl border border-sky-200 bg-sky-50 p-3 text-xs font-bold leading-5 text-sky-900">
                      來源提示詞（非圖片辨字）：「{flowProject.texts[i]}」。請以實際圖片為準，若文字不同，代表 AI 沒照提示詞生圖，須自行確認。
                    </p>
                  ) : null}
                  </div>
                ))}
              </div>
            </section>
          )}

          {files.length > 0 ? (
            <div className="mb-10">
              <CoupangDynamicAd subId="rxv_sticker_inline" desktopWidth={1100} desktopHeight={190} mobileWidth={320} mobileHeight={150} />
            </div>
          ) : null}

          {/* --- 修改開始：PhotoRoom 聯盟導流卡片 --- */}
          <section className="mt-10 mb-20 border-t border-slate-100 pt-10">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                AI Creator Tools
              </span>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                其他創作工具（選用，非必要）
              </h3>
            </div>
            <p className="mb-6 text-sm text-slate-500 leading-relaxed">
              一般流程只要用 ChatGPT 生圖，再回本站上傳母圖，即可自動分割、去背和輸出 ZIP。以下 PhotoRoom 是選用的外部進階工具，不需申請或付費才能完成本站貼圖製作。
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
          <div className="mx-auto flex max-w-[1480px] items-center gap-2 sm:gap-4">
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

            {flowProject?.mode === "animated" ? (
              <>
                <button
                  onClick={generateZip}
                  disabled={!canDownload || loading}
                  className={`hidden min-h-[52px] rounded-2xl px-4 py-3 text-xs font-black sm:inline-flex sm:items-center sm:justify-center ${
                    !canDownload || loading
                      ? "cursor-not-allowed bg-slate-100 text-slate-400"
                      : "border border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                  }`}
                >
                  下載靜態備份 ZIP
                </button>
                <button
                  onClick={continueToAnimated}
                  disabled={!canDownload || loading}
                  className={`h-12 min-h-12 flex-1 whitespace-nowrap rounded-2xl px-3 text-[15px] font-black shadow-lg transition active:scale-[0.97] sm:min-h-[52px] sm:text-sm ${
                    !canDownload || loading
                      ? "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none"
                      : "bg-violet-600 text-white hover:bg-violet-700"
                  }`}
                >
                  {loading
                    ? "正在準備下一步…"
                    : canDownload
                      ? "下一步：自動製作動態貼圖"
                      : `還差 ${needMore} 張`}
                </button>
              </>
            ) : (
              <button
                onClick={generateZip}
                disabled={!canDownload || loading}
                className={`h-12 min-h-12 flex-1 whitespace-nowrap rounded-2xl px-3 py-0 text-[15px] font-black leading-none tracking-tight shadow-lg transition-all active:scale-[0.97] sm:h-auto sm:min-h-[52px] sm:py-3.5 sm:text-sm ${!canDownload || loading ? "cursor-not-allowed bg-slate-200 text-slate-400 shadow-none" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg"}`}
              >
                {loading
                  ? t("line_sticker_processing")
                  : canDownload
                    ? downloadCompleted
                      ? "✓ 第 5 步完成｜再次下載 ZIP"
                      : `步驟 5｜下載 ${stickerCount} 張 LINE 上架 ZIP`
                    : t("line_sticker_need_more_to_pack", { count: needMore })}
              </button>
            )}
          </div>
        </footer>
      </div>
    </>
  );
}
