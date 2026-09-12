/**
 * 將 QR Code canvas 與說明／內容文字合成為單一 PNG（固定 800×900）。
 * 有說明／內容文字時約 70% QR／30% 文字；兩者皆關閉時 QR 置中放大、不保留空白文字帶。
 */

export type LabelPosition = "top" | "bottom";
export type LabelStyle = "simple_white" | "black_white" | "rounded_sticker" | "merchant_card";

export interface QrCompositeOptions {
  labelPosition: LabelPosition;
  labelStyle: LabelStyle;
  showDescription: boolean;
  descriptionText: string;
  showPayload: boolean;
  payloadText: string;
}

/** 輸出畫布（下載與預覽縮放基準） */
export const COMPOSITE_OUT_W = 800;
export const COMPOSITE_OUT_H = 900;

const MARGIN = 40;
const INNER_W = COMPOSITE_OUT_W - MARGIN * 2;
const INNER_H = COMPOSITE_OUT_H - MARGIN * 2;

const FONT_FAMILY = 'system-ui, -apple-system, "Segoe UI", "Noto Sans TC", "PingFang TC", sans-serif';
/** 主標題（說明文字）約 36～40px */
const TITLE_SIZE_MAX = 40;
const TITLE_SIZE_MIN = 36;
/** 副文字／網址約 20～24px */
const BODY_SIZE_MAX = 24;
const BODY_SIZE_MIN = 20;

interface StyleColors {
  cardBg: string;
  cardBorder: string;
  titleColor: string;
  bodyColor: string;
  mutedColor: string;
  shadow: boolean;
  radius: number;
}

function getStyleColors(style: LabelStyle): StyleColors {
  switch (style) {
    case "black_white":
      return {
        cardBg: "#111827",
        cardBorder: "#1f2937",
        titleColor: "#f9fafb",
        bodyColor: "#e5e7eb",
        mutedColor: "#9ca3af",
        shadow: false,
        radius: 14,
      };
    case "rounded_sticker":
      return {
        cardBg: "#ffffff",
        cardBorder: "#e5e7eb",
        titleColor: "#111827",
        bodyColor: "#4b5563",
        mutedColor: "#9ca3af",
        shadow: true,
        radius: 24,
      };
    case "merchant_card":
      return {
        cardBg: "#ffffff",
        cardBorder: "#e5e7eb",
        titleColor: "#111827",
        bodyColor: "#6b7280",
        mutedColor: "#9ca3af",
        shadow: true,
        radius: 18,
      };
    case "simple_white":
    default:
      return {
        cardBg: "#ffffff",
        cardBorder: "#e5e7eb",
        titleColor: "#111827",
        bodyColor: "#374151",
        mutedColor: "#9ca3af",
        shadow: false,
        radius: 12,
      };
  }
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/** 單行過長：中間省略 */
function ellipsizeMiddle(s: string, maxDisplayChars: number): string {
  const t = s.trim();
  if (t.length <= maxDisplayChars) return t;
  const edge = Math.max(4, Math.floor((maxDisplayChars - 3) / 2));
  return `${t.slice(0, edge)}…${t.slice(t.length - edge)}`;
}

function wrapLinesChar(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const t = text.replace(/\r\n/g, "\n").trim();
  if (!t) return [];
  const lines: string[] = [];
  for (const para of t.split("\n")) {
    if (!para.trim()) continue;
    let line = "";
    for (let i = 0; i < para.length; i++) {
      const test = line + para[i];
      if (ctx.measureText(test).width > maxWidth && line.length > 0) {
        lines.push(line);
        line = para[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
  }
  return lines.length ? lines : [t];
}

/** 最多兩行；過長先縮字級再必要時省略 */
function layoutPayloadForCanvas(
  ctx: CanvasRenderingContext2D,
  raw: string,
  maxWidth: number,
  maxLines: number,
  sizeMax: number,
  sizeMin: number
): { lines: string[]; fontSize: number; lineHeight: number } {
  let fontSize = sizeMax;
  let lines: string[] = [];
  for (let attempt = 0; attempt < 12; attempt++) {
    ctx.font = `400 ${fontSize}px ${FONT_FAMILY}`;
    let text = raw.trim();
    const oneLineW = ctx.measureText(text).width;
    if (oneLineW <= maxWidth && !text.includes("\n")) {
      lines = [text];
      return { lines, fontSize, lineHeight: Math.round(fontSize * 1.35) };
    }
    lines = wrapLinesChar(ctx, text, maxWidth);
    if (lines.length <= maxLines) {
      const maxLineW = Math.max(...lines.map((l) => ctx.measureText(l).width));
      if (maxLineW <= maxWidth || fontSize <= sizeMin) {
        return { lines: lines.slice(0, maxLines), fontSize, lineHeight: Math.round(fontSize * 1.35) };
      }
    }
    if (lines.length > maxLines) {
      const merged = lines.slice(0, maxLines - 1);
      const rest = lines.slice(maxLines - 1).join("");
      const ell = ellipsizeMiddle(rest, Math.max(12, Math.floor(maxWidth / (fontSize * 0.6))));
      merged.push(ell);
      lines = merged;
      if (lines.every((l) => ctx.measureText(l).width <= maxWidth)) {
        return { lines, fontSize, lineHeight: Math.round(fontSize * 1.35) };
      }
    }
    fontSize = Math.max(sizeMin, fontSize - 1);
  }
  ctx.font = `400 ${sizeMin}px ${FONT_FAMILY}`;
  const short = ellipsizeMiddle(raw.trim(), 24);
  return { lines: [short], fontSize: sizeMin, lineHeight: Math.round(sizeMin * 1.35) };
}

function layoutTitleLines(
  ctx: CanvasRenderingContext2D,
  raw: string,
  maxWidth: number,
  maxLines: number
): { lines: string[]; fontSize: number; lineHeight: number } {
  let fontSize = TITLE_SIZE_MAX;
  for (let attempt = 0; attempt < 16; attempt++) {
    ctx.font = `700 ${fontSize}px ${FONT_FAMILY}`;
    const lines = wrapLinesChar(ctx, raw.trim(), maxWidth);
    if (lines.length <= maxLines) {
      const ok = lines.every((l) => ctx.measureText(l).width <= maxWidth);
      if (ok || fontSize <= TITLE_SIZE_MIN) {
        return {
          lines: lines.slice(0, maxLines),
          fontSize,
          lineHeight: Math.round(fontSize * 1.2),
        };
      }
    } else if (lines.length > maxLines) {
      const ell = ellipsizeMiddle(raw.trim(), 20);
      ctx.font = `700 ${fontSize}px ${FONT_FAMILY}`;
      return {
        lines: [ell],
        fontSize,
        lineHeight: Math.round(fontSize * 1.2),
      };
    }
    fontSize = Math.max(TITLE_SIZE_MIN, fontSize - 1);
  }
  ctx.font = `700 ${TITLE_SIZE_MIN}px ${FONT_FAMILY}`;
  return {
    lines: [ellipsizeMiddle(raw.trim(), 16)],
    fontSize: TITLE_SIZE_MIN,
    lineHeight: Math.round(TITLE_SIZE_MIN * 1.2),
  };
}

function drawCardBg(
  c: CanvasRenderingContext2D,
  style: StyleColors,
  w: number,
  h: number
) {
  c.fillStyle = "#f3f4f6";
  c.fillRect(0, 0, w, h);
  c.save();
  c.fillStyle = style.cardBg;
  if (style.shadow) {
    c.shadowColor = "rgba(0,0,0,0.12)";
    c.shadowBlur = 20;
    c.shadowOffsetY = 5;
  }
  roundRect(c, 0, 0, w, h, style.radius);
  c.fill();
  c.shadowColor = "transparent";
  c.strokeStyle = style.cardBorder;
  c.lineWidth = 2;
  roundRect(c, 0, 0, w, h, style.radius);
  c.stroke();
  c.restore();
}

/**
 * 建立固定 800×900 合成圖（QR 依來源比例縮放置入約 70% 區域）。
 */
export function compositeQrToCanvas(
  qrCanvas: HTMLCanvasElement,
  options: QrCompositeOptions
): HTMLCanvasElement {
  const showDesc =
    options.showDescription && options.descriptionText.trim().length > 0;
  const showPay = options.showPayload && options.payloadText.trim().length > 0;
  const descText = showDesc ? options.descriptionText.trim() : "";
  const payText = showPay ? options.payloadText.trim() : "";

  const out = document.createElement("canvas");
  out.width = COMPOSITE_OUT_W;
  out.height = COMPOSITE_OUT_H;
  const c = out.getContext("2d")!;
  const style = getStyleColors(options.labelStyle);
  drawCardBg(c, style, COMPOSITE_OUT_W, COMPOSITE_OUT_H);

  const innerX = MARGIN;
  const innerY = MARGIN;
  const maxTextW = INNER_W - 24;

  const measure = document.createElement("canvas").getContext("2d")!;

  /** 商家小卡：未勾選說明／內容時不保留佔位區，QR 盡量放大 */
  if (options.labelStyle === "merchant_card") {
    let y = innerY + 12;
    c.textAlign = "center";
    c.textBaseline = "top";

    let payLay: ReturnType<typeof layoutPayloadForCanvas> | null = null;
    if (showPay) {
      payLay = layoutPayloadForCanvas(measure, payText, maxTextW, 2, BODY_SIZE_MAX, BODY_SIZE_MIN);
    }

    let payloadBlockH = 0;
    if (payLay && payLay.lines.length > 0) {
      payloadBlockH = payLay.lines.length * payLay.lineHeight + 16;
    }

    if (showDesc) {
      const titleLay = layoutTitleLines(measure, descText, maxTextW, 2);
      c.fillStyle = style.titleColor;
      for (const line of titleLay.lines) {
        c.font = `700 ${titleLay.fontSize}px ${FONT_FAMILY}`;
        c.fillText(line, COMPOSITE_OUT_W / 2, y);
        y += titleLay.lineHeight;
      }
      y += 16;
    }

    const qrBoxW = INNER_W - 24;
    const maxQrBottom = innerY + INNER_H - 12 - payloadBlockH;
    const qrBoxH = Math.max(120, maxQrBottom - y);
    const srcW = qrCanvas.width;
    const scale = Math.min(qrBoxW / srcW, qrBoxH / srcW);
    const dw = Math.floor(srcW * scale);
    const dh = Math.floor(srcW * scale);
    const dx = innerX + (INNER_W - dw) / 2;
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = "high";
    c.drawImage(qrCanvas, dx, y, dw, dh);
    y += dh + (payLay && payLay.lines.length ? 16 : 0);

    if (payLay && payLay.lines.length) {
      c.fillStyle = style.bodyColor;
      for (const line of payLay.lines) {
        c.font = `400 ${payLay.fontSize}px ${FONT_FAMILY}`;
        c.fillText(line, COMPOSITE_OUT_W / 2, y);
        y += payLay.lineHeight;
      }
    }
    return out;
  }

  /** 一般樣式：有文字時上下配置；無文字時 QR 佔滿內層（不保留空白文字帶） */
  type Block = { lines: string[]; fontSize: number; lineHeight: number; color: string; bold: boolean };
  const labelBlocks: Block[] = [];
  if (showDesc) {
    const lay = layoutTitleLines(measure, descText, maxTextW, 2);
    labelBlocks.push({
      lines: lay.lines,
      fontSize: lay.fontSize,
      lineHeight: lay.lineHeight,
      color: style.titleColor,
      bold: true,
    });
  }
  if (showPay) {
    const lay = layoutPayloadForCanvas(measure, payText, maxTextW, 2, BODY_SIZE_MAX, BODY_SIZE_MIN);
    labelBlocks.push({
      lines: lay.lines,
      fontSize: lay.fontSize,
      lineHeight: lay.lineHeight,
      color: style.bodyColor,
      bold: false,
    });
  }

  const drawStack = (blocks: Block[], startY: number) => {
    let yy = startY;
    c.textAlign = "center";
    c.textBaseline = "top";
    blocks.forEach((b, bi) => {
      for (const line of b.lines) {
        c.font = `${b.bold ? "700" : "400"} ${b.fontSize}px ${FONT_FAMILY}`;
        c.fillStyle = b.color;
        c.fillText(line, COMPOSITE_OUT_W / 2, yy);
        yy += b.lineHeight;
      }
      if (bi < blocks.length - 1) yy += 10;
    });
    return yy;
  };

  const stackHeight = (blocks: Block[]) => {
    let h = 0;
    blocks.forEach((b, bi) => {
      h += b.lines.length * b.lineHeight;
      if (bi < blocks.length - 1) h += 10;
    });
    return h;
  };

  const gapLabel = 14;
  /** QR 模組左右留白（quiet zone 視覺） */
  const qrSidePad = 36;
  const qrBoxW = INNER_W - qrSidePad * 2;
  const srcW = qrCanvas.width;
  const innerBottom = innerY + INNER_H - 12;

  c.imageSmoothingEnabled = true;
  c.imageSmoothingQuality = "high";

  if (labelBlocks.length === 0) {
    const pad = 28;
    const availW = INNER_W - pad * 2;
    const availH = INNER_H - pad * 2;
    const scale = Math.min(availW / srcW, availH / srcW);
    const dw = Math.floor(srcW * scale);
    const dh = Math.floor(srcW * scale);
    const dx = innerX + (INNER_W - dw) / 2;
    const qrY = innerY + pad + Math.max(0, (availH - dh) / 2);
    c.drawImage(qrCanvas, dx, qrY, dw, dh);
    return out;
  }

  if (options.labelPosition === "top") {
    let y = innerY + 12;
    y = drawStack(labelBlocks, y);
    y += gapLabel;
    const qrMaxH = Math.max(64, innerBottom - y - 8);
    const scale = Math.min(qrBoxW / srcW, qrMaxH / srcW);
    const dw = Math.floor(srcW * scale);
    const dh = Math.floor(srcW * scale);
    const dx = innerX + (INNER_W - dw) / 2;
    const qrY = y + Math.max(0, (qrMaxH - dh) / 2);
    c.drawImage(qrCanvas, dx, qrY, dw, dh);
    return out;
  }

  const labelH = stackHeight(labelBlocks);
  const qrTop = innerY + 12;
  const qrMaxH = Math.max(64, innerBottom - qrTop - gapLabel - labelH - 8);
  const scale = Math.min(qrBoxW / srcW, qrMaxH / srcW);
  const dw = Math.floor(srcW * scale);
  const dh = Math.floor(srcW * scale);
  const dx = innerX + (INNER_W - dw) / 2;
  const qrY = qrTop + Math.max(0, (qrMaxH - dh) / 2);
  c.drawImage(qrCanvas, dx, qrY, dw, dh);
  const yBot = qrY + dh + gapLabel;
  drawStack(labelBlocks, yBot);

  return out;
}
