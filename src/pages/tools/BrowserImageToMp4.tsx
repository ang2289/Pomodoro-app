import { useEffect, useMemo, useRef, useState } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { QRCodeCanvas } from "qrcode.react";
import SEO from "@/components/SEO";

type Ratio = "9:16" | "16:9" | "1:1" | "4:5";
type Quality = "540p" | "720p" | "1080p";
type Effect =
  | "static"
  | "zoom_in"
  | "zoom_out"
  | "fade"
  | "pan_left"
  | "pan_right"
  | "pan_up"
  | "pan_down";
type FitMode = "contain" | "cover";
type QrPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type QrDisplayMode = "final" | "all";
type FinalQrPosition = "top" | "middle" | "bottom";
type CaptionPosition = "top" | "bottom";
type CaptionStyle = "bar" | "outline" | "plain";
type FrameRate = 15 | 18 | 24;

type WritableFileLike = {
  write(data: Blob): Promise<void>;
  close(): Promise<void>;
};

type FileHandleLike = {
  createWritable(): Promise<WritableFileLike>;
};

type DirectoryHandleLike = {
  name: string;
  getFileHandle(
    name: string,
    options: { create: boolean },
  ): Promise<FileHandleLike>;
};
type VisualEffect =
  | "none"
  | "sparkle"
  | "gold_rays"
  | "floating_lights"
  | "bokeh"
  | "petals";
type VisualEffectIntensity = "low" | "medium" | "high";
type VisualEffectPosition = "full" | "top" | "middle" | "bottom";
type VisualEffectTone = "auto" | "gold" | "white" | "pink" | "blue";

const RATIO_SIZE: Record<Ratio, Record<Quality, [number, number]>> = {
  "9:16": {
    "540p": [540, 960],
    "720p": [720, 1280],
    "1080p": [1080, 1920],
  },
  "16:9": {
    "540p": [960, 540],
    "720p": [1280, 720],
    "1080p": [1920, 1080],
  },
  "1:1": {
    "540p": [540, 540],
    "720p": [720, 720],
    "1080p": [1080, 1080],
  },
  "4:5": {
    "540p": [540, 675],
    "720p": [720, 900],
    "1080p": [1080, 1350],
  },
};

function getExtension(name: string) {
  const match = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] || "mp3";
}

function wrapCanvasText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const chars = Array.from(text.trim());
  const lines: string[] = [];
  let current = "";

  chars.forEach((char) => {
    const candidate = current + char;
    if (current && ctx.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = char;
    } else {
      current = candidate;
    }
  });

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

function drawCaption(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  position: CaptionPosition,
  fontSize: number,
  style: CaptionStyle,
) {
  if (!text.trim()) return;

  const scaledFont = Math.max(18, Math.round((fontSize / 1080) * width));
  const paddingX = Math.round(width * 0.05);
  const paddingY =
    style === "bar"
      ? Math.round(height * 0.015)
      : Math.round(height * 0.01);
  const lineHeight = Math.round(scaledFont * 1.28);

  ctx.save();
  ctx.font = `800 ${scaledFont}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = wrapCanvasText(ctx, text, width - paddingX * 2);
  const boxHeight = lines.length * lineHeight + paddingY * 2;
  const edge = Math.round(height * 0.04);
  const boxY =
    position === "top"
      ? edge
      : height - boxHeight - edge;

  if (style === "bar") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.46)";
    const left = Math.round(width * 0.045);
    const barWidth = Math.round(width * 0.91);
    const radius = Math.max(10, Math.round(width * 0.018));
    ctx.beginPath();
    ctx.roundRect(left, boxY, barWidth, boxHeight, radius);
    ctx.fill();
  }

  lines.forEach((line, index) => {
    const y =
      boxY + paddingY + lineHeight * index + lineHeight / 2;

    if (style === "outline") {
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.lineWidth = Math.max(3, scaledFont * 0.13);
      ctx.strokeStyle = "rgba(0,0,0,0.86)";
      ctx.strokeText(
        line,
        width / 2,
        y,
        width - paddingX * 2,
      );
      ctx.fillStyle = "#ffffff";
      ctx.fillText(
        line,
        width / 2,
        y,
        width - paddingX * 2,
      );
      return;
    }

    if (style === "plain") {
      ctx.shadowColor = "rgba(0,0,0,0.72)";
      ctx.shadowBlur = Math.max(4, scaledFont * 0.12);
      ctx.shadowOffsetY = Math.max(2, scaledFont * 0.04);
    }

    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      line,
      width / 2,
      y,
      width - paddingX * 2,
    );

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
  });

  ctx.restore();
}

function drawQrOverlay(
  ctx: CanvasRenderingContext2D,
  qrCanvas: HTMLCanvasElement | null,
  width: number,
  height: number,
  position: QrPosition,
  percent: number,
) {
  if (!qrCanvas) return;

  const size = Math.round(Math.min(width, height) * (percent / 100));
  const outerPadding = Math.max(10, Math.round(size * 0.08));
  const edge = Math.max(14, Math.round(Math.min(width, height) * 0.025));
  const boxSize = size + outerPadding * 2;

  const x =
    position.endsWith("right")
      ? width - boxSize - edge
      : edge;
  const y =
    position.startsWith("bottom")
      ? height - boxSize - edge
      : edge;

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.96)";
  ctx.fillRect(x, y, boxSize, boxSize);
  ctx.drawImage(
    qrCanvas,
    x + outerPadding,
    y + outerPadding,
    size,
    size,
  );
  ctx.restore();
}

function drawFinalQrPage(
  ctx: CanvasRenderingContext2D,
  qrCanvas: HTMLCanvasElement | null,
  width: number,
  height: number,
  position: FinalQrPosition,
  title: string,
  subtitle: string,
  ctaText: string,
  qrPercent: number,
) {
  ctx.save();
  ctx.globalAlpha = 1;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#f0fdf4");
  gradient.addColorStop(0.52, "#ffffff");
  gradient.addColorStop(1, "#eff6ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const safeX = Math.round(width * 0.08);
  const qrSize = Math.round(
    Math.min(width, height) * Math.max(0.22, Math.min(0.34, (qrPercent + 8) / 100)),
  );
  const qrPadding = Math.max(12, Math.round(qrSize * 0.08));
  const qrBox = qrSize + qrPadding * 2;

  const titleSize = Math.max(26, Math.round(width * 0.062));
  const subtitleSize = Math.max(18, Math.round(width * 0.038));
  const titleLineHeight = Math.round(titleSize * 1.25);
  const subtitleLineHeight = Math.round(subtitleSize * 1.35);
  const titleMaxWidth = width - safeX * 2;
  const subtitleMaxWidth = width - safeX * 2;

  ctx.font = `800 ${titleSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  const titleLines = wrapCanvasText(ctx, title, titleMaxWidth).slice(0, 2);
  ctx.font = `600 ${subtitleSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  const subtitleLines = wrapCanvasText(ctx, subtitle, subtitleMaxWidth).slice(0, 3);

  const titleHeight = Math.max(1, titleLines.length) * titleLineHeight;
  const subtitleHeight = Math.max(1, subtitleLines.length) * subtitleLineHeight;
  const ctaSize = Math.max(18, Math.round(width * 0.034));
  const ctaHeight = ctaText.trim()
    ? Math.max(44, Math.round(height * 0.06))
    : 0;
  const ctaGap = ctaText.trim() ? Math.round(height * 0.022) : 0;
  const groupHeight =
    titleHeight +
    Math.round(height * 0.025) +
    qrBox +
    Math.round(height * 0.025) +
    subtitleHeight +
    ctaGap +
    ctaHeight;

  const edge = Math.round(height * 0.07);
  let groupTop = edge;
  if (position === "middle") groupTop = Math.round((height - groupHeight) / 2);
  if (position === "bottom") groupTop = Math.max(edge, height - edge - groupHeight);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#0f172a";
  ctx.font = `800 ${titleSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  titleLines.forEach((line, index) => {
    ctx.fillText(
      line,
      width / 2,
      groupTop + titleLineHeight * index + titleLineHeight / 2,
      titleMaxWidth,
    );
  });

  const qrY =
    groupTop + titleHeight + Math.round(height * 0.025);
  const qrX = Math.round((width - qrBox) / 2);

  ctx.fillStyle = "rgba(255,255,255,0.98)";
  ctx.shadowColor = "rgba(15,23,42,0.16)";
  ctx.shadowBlur = Math.round(Math.min(width, height) * 0.02);
  ctx.fillRect(qrX, qrY, qrBox, qrBox);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  if (qrCanvas) {
    ctx.drawImage(
      qrCanvas,
      qrX + qrPadding,
      qrY + qrPadding,
      qrSize,
      qrSize,
    );
  }

  const subtitleTop =
    qrY + qrBox + Math.round(height * 0.025);
  ctx.fillStyle = "#475569";
  ctx.font = `600 ${subtitleSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  subtitleLines.forEach((line, index) => {
    ctx.fillText(
      line,
      width / 2,
      subtitleTop + subtitleLineHeight * index + subtitleLineHeight / 2,
      subtitleMaxWidth,
    );
  });

  if (ctaText.trim()) {
    const ctaTop =
      subtitleTop + subtitleHeight + ctaGap;
    const ctaWidth = Math.min(
      width - safeX * 2,
      Math.round(width * 0.62),
    );
    const ctaX = Math.round((width - ctaWidth) / 2);
    const radius = Math.round(ctaHeight / 2);

    ctx.fillStyle = "#059669";
    ctx.beginPath();
    ctx.roundRect(ctaX, ctaTop, ctaWidth, ctaHeight, radius);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${ctaSize}px system-ui, -apple-system, "Segoe UI", sans-serif`;
    ctx.fillText(
      ctaText.trim(),
      width / 2,
      ctaTop + ctaHeight / 2,
      ctaWidth - Math.round(width * 0.04),
    );
  }

  ctx.restore();
}

async function createFinalQrPageJpeg(
  width: number,
  height: number,
  qrCanvas: HTMLCanvasElement | null,
  position: FinalQrPosition,
  title: string,
  subtitle: string,
  ctaText: string,
  qrPercent: number,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("瀏覽器無法建立 QR Code 結尾頁");

  drawFinalQrPage(
    ctx,
    qrCanvas,
    width,
    height,
    position,
    title,
    subtitle,
    ctaText,
    qrPercent,
  );

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) =>
        value ? resolve(value) : reject(new Error("QRCode 結尾頁產生失敗")),
      "image/jpeg",
      0.94,
    ),
  );

  return new Uint8Array(await blob.arrayBuffer());
}

function seededUnit(seed: number) {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function getVisualEffectAlpha(
  position: VisualEffectPosition,
  y: number,
  height: number,
) {
  const ratio = y / Math.max(1, height);

  if (position === "top") {
    return Math.max(0, Math.min(1, 1.25 - ratio * 2.2));
  }
  if (position === "middle") {
    return Math.max(0, 1 - Math.abs(ratio - 0.5) * 2.8);
  }
  if (position === "bottom") {
    return Math.max(0, Math.min(1, (ratio - 0.42) * 2.2));
  }
  return 1;
}

function visualToneColor(
  tone: VisualEffectTone,
  fallback: VisualEffectTone,
) {
  const resolved = tone === "auto" ? fallback : tone;
  if (resolved === "gold") return [255, 206, 84] as const;
  if (resolved === "pink") return [255, 154, 196] as const;
  if (resolved === "blue") return [142, 208, 255] as const;
  return [255, 255, 255] as const;
}

function drawDecorativeEffect(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  effect: VisualEffect,
  intensity: VisualEffectIntensity,
  position: VisualEffectPosition,
  tone: VisualEffectTone,
  timeSec: number,
) {
  if (effect === "none") return;

  const density =
    intensity === "low" ? 0.65 : intensity === "high" ? 1.45 : 1;
  const strength =
    intensity === "low" ? 0.62 : intensity === "high" ? 1.25 : 0.9;
  const minSide = Math.min(width, height);

  ctx.save();

  if (effect === "gold_rays") {
    const [r, g, b] = visualToneColor(tone, "gold");
    const centerX = width * 0.5;
    const startY = -height * 0.04;
    const rayCount = Math.max(3, Math.round(5 * density));

    ctx.globalCompositeOperation = "screen";

    for (let i = 0; i < rayCount; i += 1) {
      const base = (i - (rayCount - 1) / 2) * width * 0.12;
      const sway = Math.sin(timeSec * 0.45 + i * 1.6) * width * 0.025;
      const endX = centerX + base + sway;
      const rayWidth = width * (0.10 + seededUnit(i + 31) * 0.08);
      const endY = height * (0.62 + seededUnit(i + 9) * 0.2);
      const gradient = ctx.createLinearGradient(centerX, startY, endX, endY);
      gradient.addColorStop(0, `rgba(${r},${g},${b},${0.24 * strength})`);
      gradient.addColorStop(0.55, `rgba(${r},${g},${b},${0.09 * strength})`);
      gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(centerX - rayWidth * 0.16, startY);
      ctx.lineTo(centerX + rayWidth * 0.16, startY);
      ctx.lineTo(endX + rayWidth, endY);
      ctx.lineTo(endX - rayWidth, endY);
      ctx.closePath();
      ctx.fill();
    }

    const glow = ctx.createRadialGradient(
      centerX,
      0,
      0,
      centerX,
      0,
      height * 0.55,
    );
    glow.addColorStop(0, `rgba(${r},${g},${b},${0.34 * strength})`);
    glow.addColorStop(1, `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height * 0.65);
    ctx.restore();
    return;
  }

  if (effect === "sparkle") {
    const [r, g, b] = visualToneColor(tone, "white");
    const count = Math.max(10, Math.round(28 * density));
    ctx.globalCompositeOperation = "screen";

    for (let i = 0; i < count; i += 1) {
      const x = seededUnit(i * 7 + 3) * width;
      const y = seededUnit(i * 13 + 8) * height;
      const positionAlpha = getVisualEffectAlpha(position, y, height);
      if (positionAlpha <= 0) continue;

      const phase = timeSec * (1.4 + seededUnit(i + 71) * 1.8) + i * 0.9;
      const twinkle = Math.max(0, Math.sin(phase));
      const radius =
        minSide * (0.004 + seededUnit(i + 44) * 0.008) * (0.7 + twinkle);
      const alpha = (0.15 + twinkle * 0.7) * strength * positionAlpha;

      ctx.strokeStyle = `rgba(${r},${g},${b},${Math.min(0.95, alpha)})`;
      ctx.lineWidth = Math.max(1, radius * 0.18);
      ctx.beginPath();
      ctx.moveTo(x - radius, y);
      ctx.lineTo(x + radius, y);
      ctx.moveTo(x, y - radius);
      ctx.lineTo(x, y + radius);
      ctx.stroke();

      ctx.fillStyle = `rgba(${r},${g},${b},${Math.min(0.8, alpha * 0.8)})`;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, radius * 0.24), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    return;
  }

  if (effect === "floating_lights" || effect === "bokeh") {
    const fallbackTone: VisualEffectTone =
      effect === "bokeh" ? "gold" : "white";
    const [r, g, b] = visualToneColor(tone, fallbackTone);
    const count =
      effect === "bokeh"
        ? Math.max(8, Math.round(16 * density))
        : Math.max(12, Math.round(24 * density));
    ctx.globalCompositeOperation = "screen";

    for (let i = 0; i < count; i += 1) {
      const baseX = seededUnit(i * 11 + 5) * width;
      const baseY = seededUnit(i * 17 + 2) * height;
      const speed = 0.018 + seededUnit(i + 92) * 0.035;
      const drift = Math.sin(timeSec * 0.55 + i) * width * 0.018;
      const y =
        ((baseY - timeSec * height * speed) % height + height) % height;
      const x = baseX + drift;
      const positionAlpha = getVisualEffectAlpha(position, y, height);
      if (positionAlpha <= 0) continue;

      const radius =
        effect === "bokeh"
          ? minSide * (0.025 + seededUnit(i + 24) * 0.055)
          : minSide * (0.007 + seededUnit(i + 24) * 0.018);
      const alpha =
        (effect === "bokeh" ? 0.12 : 0.24) * strength * positionAlpha;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(
        0,
        `rgba(${r},${g},${b},${Math.min(0.65, alpha * 1.6)})`,
      );
      gradient.addColorStop(0.45, `rgba(${r},${g},${b},${alpha})`);
      gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    return;
  }

  if (effect === "petals") {
    const [r, g, b] = visualToneColor(tone, "pink");
    const count = Math.max(8, Math.round(18 * density));

    for (let i = 0; i < count; i += 1) {
      const startX = seededUnit(i * 19 + 4) * width;
      const speed = height * (0.045 + seededUnit(i + 51) * 0.05);
      const y =
        ((seededUnit(i * 23 + 7) * height + timeSec * speed) %
          (height + minSide * 0.12)) -
        minSide * 0.06;
      const x =
        startX +
        Math.sin(timeSec * (0.8 + seededUnit(i + 64)) + i) *
          width *
          0.035;
      const positionAlpha = getVisualEffectAlpha(position, y, height);
      if (positionAlpha <= 0) continue;

      const size = minSide * (0.010 + seededUnit(i + 17) * 0.015);
      const rotation = timeSec * (0.8 + seededUnit(i + 73) * 1.5) + i;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.fillStyle = `rgba(${r},${g},${b},${0.44 * strength * positionAlpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.65, size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
    return;
  }

  ctx.restore();
}

async function imageToJpeg(
  file: File,
  width: number,
  height: number,
  fitMode: FitMode,
  background: "#000000" | "#ffffff",
  caption: string,
  captionPosition: CaptionPosition,
  captionFontSize: number,
  captionStyle: CaptionStyle,
  qrCanvas: HTMLCanvasElement | null,
  qrPosition: QrPosition,
  qrPercent: number,
  visualEffect: VisualEffect,
  visualEffectIntensity: VisualEffectIntensity,
  visualEffectPosition: VisualEffectPosition,
  visualEffectTone: VisualEffectTone,
) {
  const url = URL.createObjectURL(file);

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`圖片讀取失敗：${file.name}`));
      image.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("瀏覽器無法建立圖片畫布");

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    const scale =
      fitMode === "cover"
        ? Math.max(width / img.naturalWidth, height / img.naturalHeight)
        : Math.min(width / img.naturalWidth, height / img.naturalHeight);

    const drawWidth = Math.max(1, Math.round(img.naturalWidth * scale));
    const drawHeight = Math.max(1, Math.round(img.naturalHeight * scale));
    const x = Math.round((width - drawWidth) / 2);
    const y = Math.round((height - drawHeight) / 2);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, x, y, drawWidth, drawHeight);

    drawDecorativeEffect(
      ctx,
      width,
      height,
      visualEffect,
      visualEffectIntensity,
      visualEffectPosition,
      visualEffectTone,
      0.8,
    );

    drawCaption(
      ctx,
      caption,
      width,
      height,
      captionPosition,
      captionFontSize,
      captionStyle,
    );
    drawQrOverlay(
      ctx,
      qrCanvas,
      width,
      height,
      qrPosition,
      qrPercent,
    );

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (value) =>
          value ? resolve(value) : reject(new Error("圖片轉換失敗")),
        "image/jpeg",
        0.92,
      ),
    );

    return new Uint8Array(await blob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(url);
  }
}

function effectFilter(
  effect: Effect,
  width: number,
  height: number,
  seconds: number,
  fps: number,
) {
  const frames = Math.max(1, Math.round(seconds * fps));
  const denom = Math.max(1, frames - 1);
  const zoomStep = Math.max(0.0005, 0.14 / frames).toFixed(6);

  if (effect === "zoom_in") {
    return `zoompan=z='min(zoom+${zoomStep},1.14)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "zoom_out") {
    return `zoompan=z='if(lte(on,1),1.14,max(1.0,zoom-${zoomStep}))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "pan_left") {
    return `zoompan=z=1.10:x='(iw-iw/zoom)*(1-on/${denom})':y='(ih-ih/zoom)/2':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "pan_right") {
    return `zoompan=z=1.10:x='(iw-iw/zoom)*(on/${denom})':y='(ih-ih/zoom)/2':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "pan_up") {
    return `zoompan=z=1.10:x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*(1-on/${denom})':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "pan_down") {
    return `zoompan=z=1.10:x='(iw-iw/zoom)/2':y='(ih-ih/zoom)*(on/${denom})':d=${frames}:s=${width}x${height}:fps=${fps}`;
  }
  if (effect === "fade") {
    const outStart = Math.max(0, seconds - 0.45).toFixed(2);
    return `fps=${fps},fade=t=in:st=0:d=0.35,fade=t=out:st=${outStart}:d=0.35`;
  }
  return `fps=${fps}`;
}

function getNativeMp4MimeType() {
  if (typeof MediaRecorder === "undefined") return "";

  const candidates = [
    'video/mp4;codecs="avc1.42E01E,mp4a.40.2"',
    'video/mp4;codecs="avc1.42E01E"',
    "video/mp4",
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

async function loadImageElement(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error(`圖片讀取失敗：${file.name}`));
      element.src = url;
    });
    return image;
  } finally {
    // Delay revocation until the element has decoded the image data.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

function drawNativeVideoFrame(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
  fitMode: FitMode,
  background: "#000000" | "#ffffff",
  effect: Effect,
  progress: number,
  caption: string,
  captionPosition: CaptionPosition,
  captionFontSize: number,
  captionStyle: CaptionStyle,
  qrCanvas: HTMLCanvasElement | null,
  qrPosition: QrPosition,
  qrPercent: number,
  visualEffect: VisualEffect,
  visualEffectIntensity: VisualEffectIntensity,
  visualEffectPosition: VisualEffectPosition,
  visualEffectTone: VisualEffectTone,
  timeSec: number,
) {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const baseScale =
    fitMode === "cover"
      ? Math.max(width / image.naturalWidth, height / image.naturalHeight)
      : Math.min(width / image.naturalWidth, height / image.naturalHeight);

  let motionScale = 1;
  let offsetX = 0;
  let offsetY = 0;

  if (effect === "zoom_in") motionScale = 1 + progress * 0.12;
  if (effect === "zoom_out") motionScale = 1.12 - progress * 0.12;

  if (
    effect === "pan_left" ||
    effect === "pan_right" ||
    effect === "pan_up" ||
    effect === "pan_down"
  ) {
    motionScale = 1.08;
    const shiftX = width * 0.055;
    const shiftY = height * 0.04;

    if (effect === "pan_left") offsetX = shiftX - progress * shiftX * 2;
    if (effect === "pan_right") offsetX = -shiftX + progress * shiftX * 2;
    if (effect === "pan_up") offsetY = shiftY - progress * shiftY * 2;
    if (effect === "pan_down") offsetY = -shiftY + progress * shiftY * 2;
  }

  if (effect === "fade") {
    const fadePart = 0.16;
    if (progress < fadePart) ctx.globalAlpha = progress / fadePart;
    else if (progress > 1 - fadePart) {
      ctx.globalAlpha = (1 - progress) / fadePart;
    }
  }

  const drawWidth = image.naturalWidth * baseScale * motionScale;
  const drawHeight = image.naturalHeight * baseScale * motionScale;
  const x = (width - drawWidth) / 2 + offsetX;
  const y = (height - drawHeight) / 2 + offsetY;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, x, y, drawWidth, drawHeight);
  ctx.restore();

  drawDecorativeEffect(
    ctx,
    width,
    height,
    visualEffect,
    visualEffectIntensity,
    visualEffectPosition,
    visualEffectTone,
    timeSec,
  );

  drawCaption(
    ctx,
    caption,
    width,
    height,
    captionPosition,
    captionFontSize,
    captionStyle,
  );
  drawQrOverlay(
    ctx,
    qrCanvas,
    width,
    height,
    qrPosition,
    qrPercent,
  );
}

const TEXT_HISTORY_PREFIX = "rxv:image-to-mp4:text-history:";
const TEXT_HISTORY_LIMIT = 12;

function readTextHistory(key: string) {
  if (typeof window === "undefined") return [] as string[];

  try {
    const raw = window.localStorage.getItem(TEXT_HISTORY_PREFIX + key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, TEXT_HISTORY_LIMIT)
      : [];
  } catch {
    return [];
  }
}

function storeTextHistory(
  key: string,
  value: string,
  setter: (items: string[]) => void,
) {
  const normalized = value.trim();
  if (!normalized || typeof window === "undefined") return;

  const next = [
    normalized,
    ...readTextHistory(key).filter((item) => item !== normalized),
  ].slice(0, TEXT_HISTORY_LIMIT);

  try {
    window.localStorage.setItem(
      TEXT_HISTORY_PREFIX + key,
      JSON.stringify(next),
    );
  } catch {}

  setter(next);
}

const VIDEO_SETTINGS_KEY = "rxv:image-to-mp4:settings:v1";

function readVideoSettings() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(VIDEO_SETTINGS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function buildOutputFileName(ratio: Ratio) {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-` +
    `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `rxv-image-to-mp4-${ratio.replace(":", "x")}-${stamp}.mp4`;
}

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function BrowserImageToMp4() {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [audio, setAudio] = useState<File | null>(null);
  const [ratio, setRatio] = useState<Ratio>("9:16");
  const [quality, setQuality] = useState<Quality>("540p");
  const [fitMode, setFitMode] = useState<FitMode>("contain");
  const [background, setBackground] = useState<"#000000" | "#ffffff">("#000000");
  const [effect, setEffect] = useState<Effect>("zoom_in");
  const [visualEffect, setVisualEffect] = useState<VisualEffect>("none");
  const [visualEffectIntensity, setVisualEffectIntensity] =
    useState<VisualEffectIntensity>("medium");
  const [visualEffectPosition, setVisualEffectPosition] =
    useState<VisualEffectPosition>("full");
  const [visualEffectTone, setVisualEffectTone] =
    useState<VisualEffectTone>("auto");
  const [secondsPerImage, setSecondsPerImage] = useState(2.5);
  const [audioVolume, setAudioVolume] = useState(0.7);
  const [caption, setCaption] = useState("");
  const [captionPosition, setCaptionPosition] =
    useState<CaptionPosition>("bottom");
  const [captionFontSize, setCaptionFontSize] = useState(54);
  const [captionStyle, setCaptionStyle] = useState<CaptionStyle>("bar");
  const [frameRate, setFrameRate] = useState<FrameRate>(24);
  const [qrEnabled, setQrEnabled] = useState(false);
  const [qrText, setQrText] = useState("");
  const [qrDisplayMode, setQrDisplayMode] =
    useState<QrDisplayMode>("final");
  const [qrPosition, setQrPosition] =
    useState<QrPosition>("bottom-right");
  const [finalQrPosition, setFinalQrPosition] =
    useState<FinalQrPosition>("middle");
  const [finalPageDuration, setFinalPageDuration] = useState(3);
  const [finalPageTitle, setFinalPageTitle] =
    useState("喜歡這組圖片嗎？");
  const [finalPageSubtitle, setFinalPageSubtitle] =
    useState("掃描 QR Code，查看更多免費圖片");
  const [finalPageCta, setFinalPageCta] =
    useState("免費看更多 →");
  const [qrPercent, setQrPercent] = useState(18);
  const [busy, setBusy] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("尚未開始");
  const [error, setError] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [renderMode, setRenderMode] = useState<"native" | "ffmpeg" | "">("");
  const [captionHistory, setCaptionHistory] = useState<string[]>([]);
  const [qrTextHistory, setQrTextHistory] = useState<string[]>([]);
  const [finalTitleHistory, setFinalTitleHistory] = useState<string[]>([]);
  const [finalSubtitleHistory, setFinalSubtitleHistory] = useState<string[]>([]);
  const [finalCtaHistory, setFinalCtaHistory] = useState<string[]>([]);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [autoGenerateAfterSelect, setAutoGenerateAfterSelect] = useState(false);
  const [outputDirectoryName, setOutputDirectoryName] =
    useState("瀏覽器下載資料夾");
  const [saveStatus, setSaveStatus] = useState("");
  const [automationMessage, setAutomationMessage] = useState("");
  const [resultFileName, setResultFileName] = useState("");

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const loadedRef = useRef(false);
  const outputDirectoryHandleRef = useRef<DirectoryHandleLike | null>(null);
  const resultBlobRef = useRef<Blob | null>(null);
  const pendingAutoGenerateRef = useRef(false);

  const [width, height] = RATIO_SIZE[ratio][quality];
  const directoryPickerAvailable =
    typeof window !== "undefined" && "showDirectoryPicker" in window;
  const nativeMp4MimeType = getNativeMp4MimeType();
  const nativeMp4Available =
    Boolean(nativeMp4MimeType) &&
    typeof HTMLCanvasElement !== "undefined" &&
    "captureStream" in HTMLCanvasElement.prototype;
  const outputFps = frameRate;
  const encodeTimeoutMs =
    quality === "540p" ? 180_000 : quality === "720p" ? 240_000 : 300_000;

  const imageSequenceSeconds = useMemo(
    () => images.length * secondsPerImage,
    [images.length, secondsPerImage],
  );

  const totalSeconds = useMemo(
    () =>
      imageSequenceSeconds +
      (qrEnabled && qrDisplayMode === "final" ? finalPageDuration : 0),
    [
      imageSequenceSeconds,
      qrEnabled,
      qrDisplayMode,
      finalPageDuration,
    ],
  );

  useEffect(() => {
    const urls = images.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  useEffect(() => {
    setCaptionHistory(readTextHistory("caption"));
    setQrTextHistory(readTextHistory("qr-text"));
    setFinalTitleHistory(readTextHistory("final-title"));
    setFinalSubtitleHistory(readTextHistory("final-subtitle"));
    setFinalCtaHistory(readTextHistory("final-cta"));

    const saved = readVideoSettings();
    if (!saved) return;

    if (["9:16", "16:9", "1:1", "4:5"].includes(String(saved.ratio))) {
      setRatio(saved.ratio as Ratio);
    }
    if (["540p", "720p", "1080p"].includes(String(saved.quality))) {
      setQuality(saved.quality as Quality);
    }
    if (["contain", "cover"].includes(String(saved.fitMode))) {
      setFitMode(saved.fitMode as FitMode);
    }
    if (saved.background === "#000000" || saved.background === "#ffffff") {
      setBackground(saved.background);
    }
    if (
      ["static", "zoom_in", "zoom_out", "fade", "pan_left", "pan_right", "pan_up", "pan_down"].includes(
        String(saved.effect),
      )
    ) {
      setEffect(saved.effect as Effect);
    }
    if (
      ["none", "sparkle", "gold_rays", "floating_lights", "bokeh", "petals"].includes(
        String(saved.visualEffect),
      )
    ) {
      setVisualEffect(saved.visualEffect as VisualEffect);
    }
    if (["low", "medium", "high"].includes(String(saved.visualEffectIntensity))) {
      setVisualEffectIntensity(saved.visualEffectIntensity as VisualEffectIntensity);
    }
    if (["full", "top", "middle", "bottom"].includes(String(saved.visualEffectPosition))) {
      setVisualEffectPosition(saved.visualEffectPosition as VisualEffectPosition);
    }
    if (["auto", "gold", "white", "pink", "blue"].includes(String(saved.visualEffectTone))) {
      setVisualEffectTone(saved.visualEffectTone as VisualEffectTone);
    }
    if (typeof saved.secondsPerImage === "number") {
      setSecondsPerImage(saved.secondsPerImage);
    }
    if (typeof saved.audioVolume === "number") {
      setAudioVolume(saved.audioVolume);
    }
    if (typeof saved.caption === "string") setCaption(saved.caption);
    if (["top", "bottom"].includes(String(saved.captionPosition))) {
      setCaptionPosition(saved.captionPosition as CaptionPosition);
    }
    if (typeof saved.captionFontSize === "number") {
      setCaptionFontSize(saved.captionFontSize);
    }
    if (["bar", "outline", "plain"].includes(String(saved.captionStyle))) {
      setCaptionStyle(saved.captionStyle as CaptionStyle);
    }
    if ([15, 18, 24].includes(Number(saved.frameRate))) {
      setFrameRate(Number(saved.frameRate) as FrameRate);
    }
    if (typeof saved.qrEnabled === "boolean") setQrEnabled(saved.qrEnabled);
    if (typeof saved.qrText === "string") setQrText(saved.qrText);
    if (["final", "all"].includes(String(saved.qrDisplayMode))) {
      setQrDisplayMode(saved.qrDisplayMode as QrDisplayMode);
    }
    if (
      ["top-left", "top-right", "bottom-left", "bottom-right"].includes(
        String(saved.qrPosition),
      )
    ) {
      setQrPosition(saved.qrPosition as QrPosition);
    }
    if (["top", "middle", "bottom"].includes(String(saved.finalQrPosition))) {
      setFinalQrPosition(saved.finalQrPosition as FinalQrPosition);
    }
    if (typeof saved.finalPageDuration === "number") {
      setFinalPageDuration(saved.finalPageDuration);
    }
    if (typeof saved.finalPageTitle === "string") {
      setFinalPageTitle(saved.finalPageTitle);
    }
    if (typeof saved.finalPageSubtitle === "string") {
      setFinalPageSubtitle(saved.finalPageSubtitle);
    }
    if (typeof saved.finalPageCta === "string") {
      setFinalPageCta(saved.finalPageCta);
    }
    if (typeof saved.qrPercent === "number") setQrPercent(saved.qrPercent);
    if (typeof saved.autoSaveEnabled === "boolean") {
      setAutoSaveEnabled(saved.autoSaveEnabled);
    }
    if (typeof saved.autoGenerateAfterSelect === "boolean") {
      setAutoGenerateAfterSelect(saved.autoGenerateAfterSelect);
    }

    setAutomationMessage("已套用上次使用的影片設定，只要換圖片即可。");
  }, []);

  const loadFfmpeg = async () => {
    if (loadedRef.current && ffmpegRef.current) return ffmpegRef.current;

    const classWorkerURL = new URL(
      "/ffmpeg-worker/worker.js?v=0.12.15",
      window.location.origin,
    ).href;

    const localBase = new URL("/ffmpeg-core/", window.location.origin).href;
    const sources = [
      {
        label: "本站影片引擎",
        coreURL: `${localBase}ffmpeg-core.js?v=0.12.10`,
        wasmURL: `${localBase}ffmpeg-core.wasm?v=0.12.10`,
      },
      {
        label: "備援影片引擎 1",
        coreURL:
          "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js",
        wasmURL:
          "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm",
      },
      {
        label: "備援影片引擎 2",
        coreURL:
          "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.js",
        wasmURL:
          "https://unpkg.com/@ffmpeg/core@0.12.10/dist/esm/ffmpeg-core.wasm",
      },
    ];

    const fetchEngineAsset = async (
      url: string,
      kind: "core" | "wasm",
      label: string,
    ) => {
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`${label}下載失敗：HTTP ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      if (kind === "core") {
        const head = new TextDecoder()
          .decode(bytes.slice(0, Math.min(bytes.length, 160)))
          .trim()
          .toLowerCase();

        if (
          bytes.length < 100_000 ||
          head.startsWith("<!doctype") ||
          head.startsWith("<html")
        ) {
          throw new Error(
            `${label}不是有效的 FFmpeg JavaScript（可能被網站路由取代）`,
          );
        }

        return URL.createObjectURL(
          new Blob([buffer], { type: "text/javascript" }),
        );
      }

      const isWasm =
        bytes.length > 1_000_000 &&
        bytes[0] === 0x00 &&
        bytes[1] === 0x61 &&
        bytes[2] === 0x73 &&
        bytes[3] === 0x6d;

      if (!isWasm) {
        throw new Error(`${label}不是有效的 WebAssembly 檔案`);
      }

      return URL.createObjectURL(
        new Blob([buffer], { type: "application/wasm" }),
      );
    };

    setStatus("正在檢查影片引擎檔案…");
    setProgress(4);

    const errors: string[] = [];

    for (let index = 0; index < sources.length; index += 1) {
      const source = sources[index];
      const ffmpeg = new FFmpeg();
      let coreBlobURL = "";
      let wasmBlobURL = "";

      ffmpeg.on("progress", ({ progress: value }) => {
        const normalized = Number.isFinite(value)
          ? Math.max(0, Math.min(1, value))
          : 0;
        setProgress(Math.max(18, Math.min(90, Math.round(18 + normalized * 72))));
      });

      ffmpeg.on("log", ({ message }) => {
        if (message) console.debug("[RxV FFmpeg]", message);
      });

      try {
        setStatus(
          index === 0
            ? "正在載入本站影片引擎，第一次使用會比較久…"
            : `正在嘗試${source.label}…`,
        );
        setProgress(5 + index * 3);

        // The class worker must be a real same-origin module. Test it first so
        // failures are reported clearly instead of surfacing as "unknown error".
        const workerCheck = await fetch(classWorkerURL, {
          method: "GET",
          cache: "no-store",
        });
        if (!workerCheck.ok) {
          throw new Error(
            `FFmpeg Worker 不存在：HTTP ${workerCheck.status}`,
          );
        }
        const workerHead = (await workerCheck.clone().text())
          .slice(0, 100)
          .trim()
          .toLowerCase();
        if (
          workerHead.startsWith("<!doctype") ||
          workerHead.startsWith("<html")
        ) {
          throw new Error("FFmpeg Worker 被網站首頁取代，尚未正確部署");
        }

        coreBlobURL = await fetchEngineAsset(
          source.coreURL,
          "core",
          source.label,
        );
        wasmBlobURL = await fetchEngineAsset(
          source.wasmURL,
          "wasm",
          source.label,
        );

        const controller = new AbortController();
        const timeoutId = window.setTimeout(
          () => controller.abort(),
          45000,
        );

        try {
          await ffmpeg.load(
            {
              coreURL: coreBlobURL,
              wasmURL: wasmBlobURL,
              classWorkerURL,
            },
            { signal: controller.signal },
          );
        } finally {
          window.clearTimeout(timeoutId);
        }

        ffmpegRef.current = ffmpeg;
        loadedRef.current = true;
        setEngineReady(true);
        setStatus(
          index === 0
            ? "影片引擎已就緒（本站）"
            : `影片引擎已就緒（${source.label}）`,
        );
        setProgress(15);

        window.setTimeout(() => {
          if (coreBlobURL) URL.revokeObjectURL(coreBlobURL);
          if (wasmBlobURL) URL.revokeObjectURL(wasmBlobURL);
        }, 5000);

        return ffmpeg;
      } catch (err) {
        const message =
          err instanceof DOMException && err.name === "AbortError"
            ? `${source.label}初始化超過 45 秒`
            : err instanceof Error
              ? err.message
              : String(err || "未知錯誤");

        errors.push(`${source.label}：${message}`);

        if (coreBlobURL) URL.revokeObjectURL(coreBlobURL);
        if (wasmBlobURL) URL.revokeObjectURL(wasmBlobURL);

        try {
          ffmpeg.terminate();
        } catch {}
      }
    }

    ffmpegRef.current = null;
    loadedRef.current = false;
    setEngineReady(false);

    throw new Error(
      `影片引擎仍無法載入。診斷：${errors.join("｜")}。目前使用 ESM 版 FFmpeg Core；請把這段診斷文字截圖給我。`,
    );
  };

  const preloadEngine = async () => {
    if (busy || engineReady) return;

    setBusy(true);
    setError("");

    try {
      await loadFfmpeg();
    } catch (err) {
      setProgress(0);
      setStatus("影片引擎載入失敗");
      setError(
        err instanceof Error
          ? err.message
          : "無法載入影片引擎，請重新整理後再試。",
      );
    } finally {
      setBusy(false);
    }
  };

  const handleImageSelection = (fileList: FileList | null) => {
    const nextImages = Array.from(fileList || []).slice(0, 12);
    setImages(nextImages);
    setError("");
    setResultUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return "";
    });
    resultBlobRef.current = null;
    setResultFileName("");
    setSaveStatus("");

    if (autoGenerateAfterSelect && nextImages.length > 0) {
      pendingAutoGenerateRef.current = true;
      setAutomationMessage("已換新圖片，準備自動產生 MP4…");
    } else if (nextImages.length > 0) {
      setAutomationMessage("已換新圖片，其他設定全部保留。");
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const cancelGeneration = () => {
    try {
      ffmpegRef.current?.terminate();
    } catch {}
    ffmpegRef.current = null;
    loadedRef.current = false;
    setEngineReady(false);
    setBusy(false);
    setProgress(0);
    setRenderMode("");
    setStatus("已取消。下次可重新產生。");
  };

  const saveCurrentSettings = (showMessage = true) => {
    const settings = {
      ratio,
      quality,
      fitMode,
      background,
      effect,
      visualEffect,
      visualEffectIntensity,
      visualEffectPosition,
      visualEffectTone,
      secondsPerImage,
      audioVolume,
      caption,
      captionPosition,
      captionFontSize,
      captionStyle,
      frameRate,
      qrEnabled,
      qrText,
      qrDisplayMode,
      qrPosition,
      finalQrPosition,
      finalPageDuration,
      finalPageTitle,
      finalPageSubtitle,
      finalPageCta,
      qrPercent,
      autoSaveEnabled,
      autoGenerateAfterSelect,
    };

    try {
      window.localStorage.setItem(VIDEO_SETTINGS_KEY, JSON.stringify(settings));
      if (showMessage) {
        setAutomationMessage("✓ 已記住目前設定。下次開啟工具會自動套用。");
      }
    } catch {
      if (showMessage) {
        setAutomationMessage("瀏覽器目前無法儲存設定。");
      }
    }
  };

  const chooseOutputDirectory = async () => {
    if (!directoryPickerAvailable) {
      setSaveStatus(
        "此瀏覽器不支援固定輸出資料夾；完成後會改用瀏覽器自動下載。",
      );
      return;
    }

    try {
      const picker = (
        window as Window & {
          showDirectoryPicker?: () => Promise<DirectoryHandleLike>;
        }
      ).showDirectoryPicker;

      if (!picker) return;
      const handle = await picker();
      outputDirectoryHandleRef.current = handle;
      setOutputDirectoryName(handle.name || "已選擇資料夾");
      setSaveStatus(
        `已選擇「${handle.name || "輸出資料夾"}」。這個頁面開著期間，完成後會自動存入。`,
      );
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setSaveStatus("無法取得資料夾權限，將改用瀏覽器下載。");
    }
  };

  const saveCompletedVideo = async (blob: Blob) => {
    resultBlobRef.current = blob;
    const filename = buildOutputFileName(ratio);
    setResultFileName(filename);

    if (!autoSaveEnabled) {
      setSaveStatus("影片已完成；自動存檔目前關閉，可按「下載 MP4」。");
      return;
    }

    const directory = outputDirectoryHandleRef.current;
    if (directory) {
      try {
        const fileHandle = await directory.getFileHandle(filename, {
          create: true,
        });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
        setSaveStatus(
          `✓ 已自動存檔：${outputDirectoryName} / ${filename}`,
        );
        return;
      } catch {
        setSaveStatus("指定資料夾寫入失敗，已改用瀏覽器自動下載。");
      }
    }

    triggerBlobDownload(blob, filename);
    setSaveStatus(
      `✓ 已自動下載一次：${filename}`,
    );
  };

  const generateWithNativeRecorder = async () => {
    if (!nativeMp4Available || !nativeMp4MimeType) {
      throw new Error("此瀏覽器沒有原生 MP4 錄製能力");
    }

    setRenderMode("native");
    setStatus("⚡ 使用瀏覽器原生編碼器，正在準備圖片…");
    setProgress(6);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("瀏覽器無法建立影片畫布");

    const loadedImages = await Promise.all(images.map(loadImageElement));
    const videoStream = canvas.captureStream(outputFps);
    const combinedStream = new MediaStream(videoStream.getVideoTracks());

    let audioContext: AudioContext | null = null;
    let audioSource: AudioBufferSourceNode | null = null;

    if (audio) {
      setStatus("⚡ 正在準備背景音樂…");
      audioContext = new AudioContext();
      await audioContext.resume();

      const audioBuffer = await audioContext.decodeAudioData(
        await audio.arrayBuffer(),
      );
      const destination = audioContext.createMediaStreamDestination();
      const gain = audioContext.createGain();
      gain.gain.value = audioVolume;
      audioSource = audioContext.createBufferSource();
      audioSource.buffer = audioBuffer;
      audioSource.loop = true;
      audioSource.connect(gain);
      gain.connect(destination);

      destination.stream.getAudioTracks().forEach((track) => {
        combinedStream.addTrack(track);
      });
    }

    const chunks: BlobPart[] = [];
    const recorder = new MediaRecorder(combinedStream, {
      mimeType: nativeMp4MimeType,
      videoBitsPerSecond:
        quality === "1080p"
          ? 5_000_000
          : quality === "720p"
            ? 3_200_000
            : 2_000_000,
      audioBitsPerSecond: 128_000,
    });

    const stopped = new Promise<void>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onerror = () => {
        reject(new Error("瀏覽器原生影片編碼失敗"));
      };
      recorder.onstop = () => resolve();
    });

    try {
      recorder.start(1000);
      audioSource?.start();

      const frameInterval = 1000 / outputFps;
      const totalFrames = Math.max(1, Math.ceil(totalSeconds * outputFps));
      const startedAt = performance.now();

      for (let frameIndex = 0; frameIndex < totalFrames; frameIndex += 1) {
        const videoTimeSec = frameIndex / outputFps;
        const showingFinalQrPage =
          qrEnabled &&
          qrDisplayMode === "final" &&
          videoTimeSec >= imageSequenceSeconds;

        if (showingFinalQrPage) {
          drawFinalQrPage(
            ctx,
            qrCanvasRef.current,
            width,
            height,
            finalQrPosition,
            finalPageTitle,
            finalPageSubtitle,
            finalPageCta,
            qrPercent,
          );
        } else {
          const imageIndex = Math.min(
            images.length - 1,
            Math.floor(videoTimeSec / secondsPerImage),
          );
          const imageTime =
            videoTimeSec - imageIndex * secondsPerImage;
          const imageProgress = Math.max(
            0,
            Math.min(1, imageTime / secondsPerImage),
          );

          drawNativeVideoFrame(
            ctx,
            loadedImages[imageIndex],
            width,
            height,
            fitMode,
            background,
            effect,
            imageProgress,
            caption,
            captionPosition,
            captionFontSize,
            captionStyle,
            qrEnabled && qrDisplayMode === "all"
              ? qrCanvasRef.current
              : null,
            qrPosition,
            qrPercent,
            visualEffect,
            visualEffectIntensity,
            visualEffectPosition,
            visualEffectTone,
            videoTimeSec,
          );
        }

        const targetElapsed = (frameIndex + 1) * frameInterval;
        const actualElapsed = performance.now() - startedAt;
        const delay = targetElapsed - actualElapsed;
        if (delay > 0) await wait(delay);

        const pct = Math.min(
          92,
          10 + Math.round(((frameIndex + 1) / totalFrames) * 82),
        );
        setProgress(pct);
        setStatus(
          `⚡ 快速模式正在產生 MP4：${Math.min(
            totalSeconds,
            (frameIndex + 1) / outputFps,
          ).toFixed(1)} / ${totalSeconds.toFixed(1)} 秒${
            visualEffect !== "none" ? "・含畫面特效" : ""
          }`,
        );
      }

      setProgress(94);
      setStatus("⚡ 影片畫面完成，正在封裝 MP4…");
      await wait(250);
      recorder.stop();
      await stopped;

      const blob = new Blob(chunks, {
        type: recorder.mimeType || nativeMp4MimeType || "video/mp4",
      });
      if (!blob.size) throw new Error("瀏覽器產生的 MP4 是 0KB");

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      await saveCompletedVideo(blob);
      setProgress(100);
      setStatus(
        `完成！⚡ 原生快速模式，影片大小約 ${(
          blob.size /
          1024 /
          1024
        ).toFixed(1)} MB。`,
      );
      return true;
    } finally {
      try {
        if (recorder.state !== "inactive") recorder.stop();
      } catch {}
      try {
        audioSource?.stop();
      } catch {}
      try {
        await audioContext?.close();
      } catch {}
      combinedStream.getTracks().forEach((track) => track.stop());
      videoStream.getTracks().forEach((track) => track.stop());
    }
  };

  const rememberCaption = () =>
    storeTextHistory("caption", caption, setCaptionHistory);
  const rememberQrText = () =>
    storeTextHistory("qr-text", qrText, setQrTextHistory);
  const rememberFinalTitle = () =>
    storeTextHistory(
      "final-title",
      finalPageTitle,
      setFinalTitleHistory,
    );
  const rememberFinalSubtitle = () =>
    storeTextHistory(
      "final-subtitle",
      finalPageSubtitle,
      setFinalSubtitleHistory,
    );
  const rememberFinalCta = () =>
    storeTextHistory(
      "final-cta",
      finalPageCta,
      setFinalCtaHistory,
    );

  const generate = async () => {
    if (busy) return;

    if (!images.length) {
      setError("請先選擇至少 1 張圖片。");
      return;
    }
    if (images.length > 12) {
      setError("一次最多 12 張圖片，避免手機或瀏覽器記憶體不足。");
      return;
    }
    if (qrEnabled && !qrText.trim()) {
      setError("已開啟 QR Code，請輸入網址或文字。");
      return;
    }

    saveCurrentSettings(false);
    rememberCaption();
    if (qrEnabled) rememberQrText();
    if (qrEnabled && qrDisplayMode === "final") {
      rememberFinalTitle();
      rememberFinalSubtitle();
      rememberFinalCta();
    }

    setBusy(true);
    setError("");
    setStatus("準備開始…");
    setProgress(1);

    if (resultUrl) {
      URL.revokeObjectURL(resultUrl);
      setResultUrl("");
    }

    let ffmpeg: FFmpeg | null = null;
    const created: string[] = [];

    try {
      if (nativeMp4Available) {
        try {
          const completed = await generateWithNativeRecorder();
          if (completed) return;
        } catch (nativeError) {
          setStatus("⚠️ 原生快速模式失敗，改用 FFmpeg 相容模式…");
          setProgress(3);
          console.warn("[RxV native MP4 fallback]", nativeError);
        }
      }

      setRenderMode("ffmpeg");
      ffmpeg = await loadFfmpeg();

      for (let i = 0; i < images.length; i += 1) {
        setStatus(`處理圖片 ${i + 1} / ${images.length}…`);
        setProgress(
          Math.max(16, Math.round(16 + ((i + 1) / images.length) * 12)),
        );

        const data = await imageToJpeg(
          images[i],
          width,
          height,
          fitMode,
          background,
          caption,
          captionPosition,
          captionFontSize,
          captionStyle,
          qrEnabled && qrDisplayMode === "all"
            ? qrCanvasRef.current
            : null,
          qrPosition,
          qrPercent,
          visualEffect,
          visualEffectIntensity,
          visualEffectPosition,
          visualEffectTone,
        );
        const name = `rxv-img-${i}.jpg`;
        await ffmpeg.writeFile(name, data);
        created.push(name);
      }

      const includeFinalQrPage =
        qrEnabled && qrDisplayMode === "final";
      let visualInputCount = images.length;

      if (includeFinalQrPage) {
        setStatus("建立 QR Code 最後一頁…");
        const finalPageData = await createFinalQrPageJpeg(
          width,
          height,
          qrCanvasRef.current,
          finalQrPosition,
          finalPageTitle,
          finalPageSubtitle,
          finalPageCta,
          qrPercent,
        );
        await ffmpeg.writeFile("rxv-final-qr.jpg", finalPageData);
        created.push("rxv-final-qr.jpg");
        visualInputCount += 1;
      }

      let audioName = "";
      if (audio) {
        setStatus("加入背景音樂…");
        const ext = getExtension(audio.name);
        audioName = `rxv-bgm.${ext}`;
        await ffmpeg.writeFile(audioName, await fetchFile(audio));
        created.push(audioName);
      }

      const args: string[] = [];
      images.forEach((_, i) => {
        args.push(
          "-loop",
          "1",
          "-t",
          String(secondsPerImage),
          "-i",
          `rxv-img-${i}.jpg`,
        );
      });

      if (includeFinalQrPage) {
        args.push(
          "-loop",
          "1",
          "-t",
          String(finalPageDuration),
          "-i",
          "rxv-final-qr.jpg",
        );
      }

      if (audioName) {
        args.push("-stream_loop", "-1", "-i", audioName);
      }

      const filters: string[] = [];
      for (let i = 0; i < images.length; i += 1) {
        filters.push(
          `[${i}:v]setsar=1,${effectFilter(
            effect,
            width,
            height,
            secondsPerImage,
            outputFps,
          )},trim=duration=${secondsPerImage},setpts=PTS-STARTPTS[v${i}]`,
        );
      }

      if (includeFinalQrPage) {
        filters.push(
          `[${images.length}:v]fps=${outputFps},trim=duration=${finalPageDuration},setpts=PTS-STARTPTS[v${images.length}]`,
        );
      }

      filters.push(
        Array.from({ length: visualInputCount }, (_, i) => `[v${i}]`).join("") +
          `concat=n=${visualInputCount}:v=1:a=0[vout]`,
      );

      if (audioName) {
        filters.push(
          `[${visualInputCount}:a]volume=${audioVolume.toFixed(2)}[aout]`,
        );
      }

      args.push(
        "-filter_complex",
        filters.join(";"),
        "-map",
        "[vout]",
      );

      if (audioName) {
        args.push(
          "-map",
          "[aout]",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-shortest",
        );
      } else {
        args.push("-an");
      }

      args.push(
        "-c:v",
        "libx264",
        "-preset",
        "ultrafast",
        "-crf",
        quality === "1080p" ? "26" : quality === "720p" ? "27" : "28",
        "-pix_fmt",
        "yuv420p",
        "-r",
        String(outputFps),
        "-threads",
        "1",
        "-movflags",
        "+faststart",
        "rxv-output.mp4",
      );

      setStatus(
        `相容模式正在產生 MP4（${quality}・${outputFps}fps・約 ${totalSeconds.toFixed(1)} 秒），此模式會比較慢…`,
      );
      setProgress(Math.max(30, progress));

      const exitCode = await ffmpeg.exec(args, encodeTimeoutMs);
      if (exitCode !== 0) {
        const minutes = Math.round(encodeTimeoutMs / 60_000);
        throw new Error(
          `轉檔超過 ${minutes} 分鐘已自動停止。建議改用「540p 快速」或減少圖片張數後再試。`,
        );
      }

      setProgress(94);
      setStatus("影片已編碼完成，正在最後封裝 MP4…");
      await wait(30);

      const file = await ffmpeg.readFile("rxv-output.mp4");
      setProgress(98);
      const bytes = file as Uint8Array;
      const copy = new Uint8Array(bytes.length);
      copy.set(bytes);

      const blob = new Blob([copy], { type: "video/mp4" });
      if (blob.size === 0) throw new Error("產生的影片是 0KB，請重新再試。");

      const url = URL.createObjectURL(blob);
      setResultUrl(url);
      await saveCompletedVideo(blob);
      setProgress(100);
      setStatus(
        `完成！影片大小約 ${(blob.size / 1024 / 1024).toFixed(1)} MB。`,
      );

      try {
        await ffmpeg.deleteFile("rxv-output.mp4");
      } catch {}
    } catch (err) {
      setProgress(0);
      setStatus("產生失敗");
      setError(
        err instanceof Error
          ? err.message
          : "影片產生失敗。建議使用最新版 Chrome／Edge，或先改用 540p、減少圖片張數後再試。",
      );
    } finally {
      if (ffmpeg) {
        for (const name of created) {
          try {
            await ffmpeg.deleteFile(name);
          } catch {}
        }
      }
      setBusy(false);
    }
  };

  useEffect(() => {
    if (
      !pendingAutoGenerateRef.current ||
      images.length === 0 ||
      busy
    ) {
      return;
    }

    pendingAutoGenerateRef.current = false;
    const timer = window.setTimeout(() => {
      void generate();
    }, 180);

    return () => window.clearTimeout(timer);
  }, [images]);

  const download = () => {
    const blob = resultBlobRef.current;
    if (blob) {
      triggerBlobDownload(
        blob,
        resultFileName || buildOutputFileName(ratio),
      );
      return;
    }

    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = resultFileName || buildOutputFileName(ratio);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const pickerButtonClass =
    "inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300";

  return (
    <>
      <SEO
        title="免費圖片轉 MP4｜加音樂、字幕、QR Code｜RxV"
        description="圖片直接在你的瀏覽器轉成 MP4，可設定秒數、MP3/BGM、字幕、QR Code、星光、上方金光、散景、花瓣與縮放平移效果；不上傳伺服器。"
        keywords="圖片轉MP4, 圖片轉影片, JPG轉MP4, PNG轉MP4, QR Code影片, 免費影片工具"
        path="/tools/image-to-mp4"
      />

      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-sky-200 bg-white p-5 shadow-sm [overflow-wrap:anywhere] sm:p-7">
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                免費・本機處理・不用上傳
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${
                  nativeMp4Available
                    ? "bg-blue-100 text-blue-800"
                    : engineReady
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-600"
                }`}
              >
                {nativeMp4Available
                  ? "⚡ 原生快速 MP4 可用"
                  : engineReady
                    ? "✓ FFmpeg 相容引擎已載入"
                    : "FFmpeg 相容引擎尚未載入"}
              </span>
            </div>

            <h1 className="mt-3 break-words text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
              圖片轉 MP4｜音樂・字幕・QR Code・動畫／光效
            </h1>
            <p className="mt-2 max-w-4xl break-words leading-7 text-slate-600">
              圖片、音樂與影片都留在你的裝置。可用 24fps 社群模式、星光／金光特效、字幕樣式與 QR Code 結尾 CTA，快速做成可發布短影片。
            </p>
          </div>

          <div className="grid gap-6 2xl:grid-cols-[0.95fr_1.05fr]">
            <section className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-black text-white">
                    1
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-base font-black text-slate-900">
                      選擇圖片（最多 12 張）
                    </h2>
                    <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                      上傳順序就是播放順序；下面可以再調整。
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className={`${pickerButtonClass} mt-4`}
                >
                  🖼️ 選擇圖片
                </button>
                <input
                  ref={imageInputRef}
                  className="hidden"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    handleImageSelection(e.target.files);
                    e.currentTarget.value = "";
                  }}
                />

                <p className="mt-3 break-words text-sm font-bold text-slate-700">
                  已選 {images.length} 張
                  {images.length
                    ? `｜預估影片 ${totalSeconds.toFixed(1)} 秒｜${outputFps} fps`
                    : ""}
                </p>

                {images.length ? (
                  <div className="mt-3 space-y-2">
                    {images.map((file, index) => (
                      <div
                        key={`${file.name}-${file.lastModified}-${index}`}
                        className="grid min-w-0 grid-cols-[88px_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:grid-cols-[104px_minmax(0,1fr)]"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                          {imagePreviewUrls[index] ? (
                            <img
                              src={imagePreviewUrls[index]}
                              alt={`第 ${index + 1} 張預覽：${file.name}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                              載入中
                            </div>
                          )}
                          <span className="absolute left-1.5 top-1.5 flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-black text-white shadow">
                            {index + 1}
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p
                            className="line-clamp-2 break-all text-sm font-bold leading-5 text-slate-800"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => moveImage(index, -1)}
                              disabled={index === 0 || busy}
                              className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-30"
                            >
                              ↑ 上移
                            </button>
                            <button
                              type="button"
                              onClick={() => moveImage(index, 1)}
                              disabled={index === images.length - 1 || busy}
                              className="min-h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-black transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-30"
                            >
                              ↓ 下移
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              disabled={busy}
                              className="min-h-9 rounded-lg border border-rose-200 bg-white px-3 text-xs font-black text-rose-600 transition hover:bg-rose-50 disabled:opacity-30"
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600 text-sm font-black text-white">
                    2
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="break-words text-base font-black text-slate-900">
                      背景音樂（可不選）
                    </h2>
                    <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                      支援 MP3／WAV／M4A 等常見音訊，會依影片長度自動截斷。
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  className={`${pickerButtonClass} mt-4`}
                >
                  🎵 {audio ? "更換背景音樂" : "選擇 MP3 / 音樂檔"}
                </button>
                <input
                  ref={audioInputRef}
                  className="hidden"
                  type="file"
                  accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/mp4,audio/aac"
                  onChange={(e) => setAudio(e.target.files?.[0] || null)}
                />

                {audio ? (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3">
                    <p className="break-all text-xs font-bold text-slate-700">
                      {audio.name}
                    </p>
                    <label className="mt-3 block text-xs font-black text-slate-700">
                      音樂音量：{Math.round(audioVolume * 100)}%
                      <input
                        className="mt-2 w-full"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={audioVolume}
                        onChange={(e) =>
                          setAudioVolume(Number(e.target.value))
                        }
                      />
                    </label>
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white">
                  3
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-base font-black text-slate-900">
                    設定影片效果
                  </h2>
                  <p className="mt-1 break-words text-xs leading-5 text-slate-500">
                    秒數、畫質、24fps、動畫、字幕樣式與 QR Code 都在這裡設定。
                  </p>
                  <p className="mt-1 break-words text-xs leading-5 text-slate-400">
                    文字欄位會記住這台瀏覽器最近輸入過的內容，下次可直接從下拉選單選用。
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <label className="min-w-0 text-sm font-black text-slate-800">
                  影片比例
                  <select
                    value={ratio}
                    onChange={(e) => setRatio(e.target.value as Ratio)}
                    className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-base font-semibold text-slate-800"
                  >
                    <option value="9:16">9:16 直式</option>
                    <option value="16:9">16:9 橫式</option>
                    <option value="1:1">1:1 方形</option>
                    <option value="4:5">4:5 直式貼文</option>
                  </select>
                  <span className="mt-1 block break-words text-xs font-medium leading-5 text-slate-500">
                    9:16 適合 Shorts／Reels／TikTok；16:9 適合 YouTube。
                  </span>
                </label>

                <label className="min-w-0 text-sm font-black text-slate-800">
                  畫質
                  <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value as Quality)}
                    className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-base font-semibold text-slate-800"
                  >
                    <option value="540p">540p｜快速（建議）</option>
                    <option value="720p">720p｜標準</option>
                    <option value="1080p">1080p｜較慢</option>
                  </select>
                  <span className="mt-1 block break-words text-xs font-medium leading-5 text-slate-500">
                    540p 最適合瀏覽器快速產生；720p 較清晰；1080p 最吃效能、可能需要較久。
                  </span>
                </label>

                <label className="min-w-0 text-sm font-black text-slate-800">
                  影格率
                  <select
                    value={frameRate}
                    onChange={(e) =>
                      setFrameRate(Number(e.target.value) as FrameRate)
                    }
                    className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-base font-semibold text-slate-800"
                  >
                    <option value={15}>15 fps｜快速</option>
                    <option value={18}>18 fps｜平衡</option>
                    <option value={24}>24 fps｜社群推薦</option>
                  </select>
                  <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
                    24 fps 的慢推近與星光會更順；如果裝置較慢可改 18 或 15 fps。
                  </span>
                </label>

                <label className="min-w-0 text-sm font-black text-slate-800">
                  圖片動畫
                  <select
                    value={effect}
                    onChange={(e) => setEffect(e.target.value as Effect)}
                    className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-base font-semibold text-slate-800"
                  >
                    <option value="static">靜態</option>
                    <option value="zoom_in">慢慢放大</option>
                    <option value="zoom_out">慢慢縮小</option>
                    <option value="fade">淡入淡出</option>
                    <option value="pan_left">向左平移</option>
                    <option value="pan_right">向右平移</option>
                    <option value="pan_up">向上平移</option>
                    <option value="pan_down">向下平移</option>
                  </select>
                </label>

                <div className="min-w-0 lg:col-span-2 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-black text-amber-950">
                        ✨ 畫面特效（可不選）
                      </p>
                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        星光、金光、漂浮光點等會疊在圖片上方；字幕與 QR Code 仍會保持在最上層。
                      </p>
                    </div>
                    {visualEffect !== "none" ? (
                      <button
                        type="button"
                        onClick={() => setVisualEffect("none")}
                        className="rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-black text-amber-800 transition hover:bg-amber-100"
                      >
                        清除特效
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="text-xs font-black text-slate-700">
                      特效種類
                      <select
                        value={visualEffect}
                        onChange={(e) =>
                          setVisualEffect(e.target.value as VisualEffect)
                        }
                        className="mt-1 min-h-11 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-slate-800"
                      >
                        <option value="none">無特效</option>
                        <option value="sparkle">✨ 星光閃爍</option>
                        <option value="gold_rays">🌤 上方金光</option>
                        <option value="floating_lights">🫧 漂浮光點</option>
                        <option value="bokeh">🔆 柔光散景</option>
                        <option value="petals">🌸 花瓣飄落</option>
                      </select>
                    </label>

                    <label className="text-xs font-black text-slate-700">
                      特效強度
                      <select
                        value={visualEffectIntensity}
                        disabled={visualEffect === "none"}
                        onChange={(e) =>
                          setVisualEffectIntensity(
                            e.target.value as VisualEffectIntensity,
                          )
                        }
                        className="mt-1 min-h-11 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 disabled:bg-slate-100"
                      >
                        <option value="low">弱</option>
                        <option value="medium">中（建議）</option>
                        <option value="high">強</option>
                      </select>
                    </label>

                    <label className="text-xs font-black text-slate-700">
                      特效位置
                      <select
                        value={visualEffectPosition}
                        disabled={visualEffect === "none" || visualEffect === "gold_rays"}
                        onChange={(e) =>
                          setVisualEffectPosition(
                            e.target.value as VisualEffectPosition,
                          )
                        }
                        className="mt-1 min-h-11 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 disabled:bg-slate-100"
                      >
                        <option value="full">全畫面</option>
                        <option value="top">上半部</option>
                        <option value="middle">中間</option>
                        <option value="bottom">下半部</option>
                      </select>
                    </label>

                    <label className="text-xs font-black text-slate-700">
                      光效顏色
                      <select
                        value={visualEffectTone}
                        disabled={visualEffect === "none"}
                        onChange={(e) =>
                          setVisualEffectTone(
                            e.target.value as VisualEffectTone,
                          )
                        }
                        className="mt-1 min-h-11 w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 disabled:bg-slate-100"
                      >
                        <option value="auto">自動（推薦）</option>
                        <option value="gold">金色</option>
                        <option value="white">白色</option>
                        <option value="pink">粉色</option>
                        <option value="blue">藍色</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {([
                      ["sparkle", "✨ 星光"],
                      ["gold_rays", "🌤 金光"],
                      ["floating_lights", "🫧 光點"],
                      ["bokeh", "🔆 散景"],
                      ["petals", "🌸 花瓣"],
                    ] as const).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setVisualEffect(value)}
                        className={`rounded-full border px-3 py-2 text-xs font-black transition hover:-translate-y-0.5 ${
                          visualEffect === value
                            ? "border-amber-500 bg-amber-100 text-amber-900"
                            : "border-amber-200 bg-white text-slate-700 hover:bg-amber-50"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <p className="mt-3 text-xs leading-5 text-amber-800">
                    ⚡ 原生快速模式會呈現完整動態特效；若瀏覽器退回 FFmpeg 相容模式，特效會以靜態光效保留。
                  </p>
                </div>

                <label className="min-w-0 text-sm font-black text-slate-800">
                  圖片顯示
                  <select
                    value={fitMode}
                    onChange={(e) => setFitMode(e.target.value as FitMode)}
                    className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-base font-semibold text-slate-800"
                  >
                    <option value="contain">完整顯示</option>
                    <option value="cover">裁切填滿</option>
                  </select>
                </label>

                <label className="min-w-0 text-sm font-black text-slate-800">
                  留白背景
                  <select
                    value={background}
                    onChange={(e) =>
                      setBackground(
                        e.target.value as "#000000" | "#ffffff",
                      )
                    }
                    className="mt-2 min-h-12 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 pr-10 text-base font-semibold text-slate-800"
                  >
                    <option value="#000000">黑色</option>
                    <option value="#ffffff">白色</option>
                  </select>
                </label>

                <div className="min-w-0">
                  <p className="text-sm font-black text-slate-800">
                    每張圖片停留秒數
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[1, 2, 3, 5].map((seconds) => (
                      <button
                        key={seconds}
                        type="button"
                        onClick={() => setSecondsPerImage(seconds)}
                        className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-black transition hover:-translate-y-0.5 ${
                          secondsPerImage === seconds
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                        }`}
                      >
                        {seconds} 秒
                      </button>
                    ))}
                  </div>
                  <label className="mt-2 flex items-center gap-2 text-xs font-bold text-slate-600">
                    自訂
                    <input
                      type="number"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={secondsPerImage}
                      onChange={(e) =>
                        setSecondsPerImage(
                          Math.max(
                            0.5,
                            Math.min(10, Number(e.target.value) || 0.5),
                          ),
                        )
                      }
                      className="w-24 rounded-lg border border-slate-300 px-2 py-1.5"
                    />
                    秒
                  </label>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-4">
                <p className="text-sm font-black text-violet-900">
                  字幕／宣傳文字（可不填）
                </p>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  onBlur={rememberCaption}
                  rows={3}
                  maxLength={90}
                  placeholder="例如：更多免費圖片請到 RxV 圖片庫"
                  className="mt-2 w-full resize-y rounded-xl border border-violet-200 bg-white px-3 py-2.5 text-sm leading-6"
                />
                {captionHistory.length ? (
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) setCaption(e.target.value);
                    }}
                    className="mt-2 min-h-10 w-full rounded-lg border border-violet-200 bg-white px-2 py-2 text-sm font-semibold text-slate-700"
                    aria-label="曾輸入過的字幕"
                  >
                    <option value="">選擇以前輸入的字幕…</option>
                    {captionHistory.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                ) : null}
                <div className="mt-3 grid gap-3 lg:grid-cols-3">
                  <label className="text-xs font-black text-slate-700">
                    字幕樣式
                    <select
                      value={captionStyle}
                      onChange={(e) =>
                        setCaptionStyle(e.target.value as CaptionStyle)
                      }
                      className="mt-1 min-h-10 w-full rounded-lg border border-slate-300 bg-white px-2 py-2"
                    >
                      <option value="bar">半透明黑底（清楚）</option>
                      <option value="outline">白字黑描邊（推薦）</option>
                      <option value="plain">白字陰影（簡潔）</option>
                    </select>
                  </label>
                  <label className="text-xs font-black text-slate-700">
                    文字位置
                    <select
                      value={captionPosition}
                      onChange={(e) =>
                        setCaptionPosition(
                          e.target.value as CaptionPosition,
                        )
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2 py-2"
                    >
                      <option value="bottom">下方</option>
                      <option value="top">上方</option>
                    </select>
                  </label>
                  <label className="text-xs font-black text-slate-700">
                    字體大小：{captionFontSize}
                    <input
                      className="mt-2 w-full"
                      type="range"
                      min="36"
                      max="86"
                      step="2"
                      value={captionFontSize}
                      onChange={(e) =>
                        setCaptionFontSize(Number(e.target.value))
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={qrEnabled}
                    onChange={(e) => setQrEnabled(e.target.checked)}
                    className="h-5 w-5"
                  />
                  <span className="text-sm font-black text-emerald-900">
                    加入 QR Code 導流
                  </span>
                </label>

                <p className="mt-2 text-xs leading-5 text-emerald-800">
                  建議使用「只在最後一頁顯示」，前面圖片不會被 QR Code 擋住。
                </p>

                {qrEnabled ? (
                  <div className="mt-4 space-y-4">
                    <label className="block text-xs font-black text-slate-700">
                      QR Code 網址／文字
                      <input
                        value={qrText}
                        onChange={(e) => setQrText(e.target.value)}
                        onBlur={rememberQrText}
                        placeholder="https://..."
                        className="mt-1 w-full min-w-0 rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm"
                      />
                      {qrTextHistory.length ? (
                        <select
                          value=""
                          onChange={(e) => {
                            if (e.target.value) setQrText(e.target.value);
                          }}
                          className="mt-2 min-h-10 w-full rounded-lg border border-emerald-200 bg-white px-2 py-2 text-sm font-semibold text-slate-700"
                          aria-label="曾輸入過的 QR Code 網址或文字"
                        >
                          <option value="">選擇以前輸入的網址／文字…</option>
                          {qrTextHistory.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      ) : null}
                    </label>

                    <label className="block text-xs font-black text-slate-700">
                      QR Code 顯示方式
                      <select
                        value={qrDisplayMode}
                        onChange={(e) =>
                          setQrDisplayMode(e.target.value as QrDisplayMode)
                        }
                        className="mt-1 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold"
                      >
                        <option value="final">只在最後一頁顯示（推薦）</option>
                        <option value="all">每張圖片都顯示</option>
                      </select>
                    </label>

                    {qrDisplayMode === "all" ? (
                      <div className="grid gap-3 lg:grid-cols-2">
                        <label className="text-xs font-black text-slate-700">
                          每張圖片 QR 位置
                          <select
                            value={qrPosition}
                            onChange={(e) =>
                              setQrPosition(e.target.value as QrPosition)
                            }
                            className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 py-2"
                          >
                            <option value="bottom-right">右下</option>
                            <option value="bottom-left">左下</option>
                            <option value="top-right">右上</option>
                            <option value="top-left">左上</option>
                          </select>
                        </label>
                        <label className="text-xs font-black text-slate-700">
                          QR 大小：{qrPercent}%
                          <input
                            className="mt-2 w-full"
                            type="range"
                            min="12"
                            max="28"
                            step="1"
                            value={qrPercent}
                            onChange={(e) =>
                              setQrPercent(Number(e.target.value))
                            }
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <label className="text-xs font-black text-slate-700">
                            最後一頁 QR 位置
                            <select
                              value={finalQrPosition}
                              onChange={(e) =>
                                setFinalQrPosition(
                                  e.target.value as FinalQrPosition,
                                )
                              }
                              className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 py-2"
                            >
                              <option value="top">上</option>
                              <option value="middle">中</option>
                              <option value="bottom">下</option>
                            </select>
                          </label>

                          <label className="text-xs font-black text-slate-700">
                            最後一頁停留秒數
                            <select
                              value={finalPageDuration}
                              onChange={(e) =>
                                setFinalPageDuration(
                                  Number(e.target.value),
                                )
                              }
                              className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-2 py-2"
                            >
                              <option value={1}>1 秒</option>
                              <option value={2}>2 秒</option>
                              <option value={3}>3 秒（建議）</option>
                              <option value={5}>5 秒</option>
                            </select>
                          </label>
                        </div>

                        <label className="mt-3 block text-xs font-black text-slate-700">
                          最後一頁標題
                          <input
                            value={finalPageTitle}
                            onChange={(e) => setFinalPageTitle(e.target.value)}
                            onBlur={rememberFinalTitle}
                            maxLength={40}
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                          />
                          {finalTitleHistory.length ? (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  setFinalPageTitle(e.target.value);
                                }
                              }}
                              className="mt-2 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-semibold text-slate-700"
                            >
                              <option value="">選擇以前輸入的標題…</option>
                              {finalTitleHistory.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          ) : null}
                        </label>

                        <label className="mt-3 block text-xs font-black text-slate-700">
                          最後一頁說明
                          <textarea
                            value={finalPageSubtitle}
                            onChange={(e) =>
                              setFinalPageSubtitle(e.target.value)
                            }
                            onBlur={rememberFinalSubtitle}
                            maxLength={80}
                            rows={2}
                            className="mt-1 w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm leading-6"
                          />
                          {finalSubtitleHistory.length ? (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  setFinalPageSubtitle(e.target.value);
                                }
                              }}
                              className="mt-2 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-semibold text-slate-700"
                            >
                              <option value="">選擇以前輸入的說明…</option>
                              {finalSubtitleHistory.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          ) : null}
                        </label>

                        <label className="mt-3 block text-xs font-black text-slate-700">
                          行動按鈕文字（可不填）
                          <input
                            value={finalPageCta}
                            onChange={(e) => setFinalPageCta(e.target.value)}
                            onBlur={rememberFinalCta}
                            maxLength={28}
                            placeholder="例如：免費看更多 →"
                            className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
                          />
                          {finalCtaHistory.length ? (
                            <select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  setFinalPageCta(e.target.value);
                                }
                              }}
                              className="mt-2 min-h-10 w-full rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-semibold text-slate-700"
                            >
                              <option value="">選擇以前輸入的按鈕文字…</option>
                              {finalCtaHistory.map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          ) : null}
                        </label>

                        <label className="mt-3 block text-xs font-black text-slate-700">
                          QR 大小：{qrPercent}%
                          <input
                            className="mt-2 w-full"
                            type="range"
                            min="12"
                            max="28"
                            step="1"
                            value={qrPercent}
                            onChange={(e) =>
                              setQrPercent(Number(e.target.value))
                            }
                          />
                        </label>

                        <div className="mt-4">
                          <p className="mb-2 text-xs font-black text-slate-700">
                            最後一頁預覽
                          </p>
                          <div
                            className={`mx-auto flex w-full max-w-[260px] flex-col items-center rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 shadow-sm ${
                              finalQrPosition === "top"
                                ? "justify-start"
                                : finalQrPosition === "bottom"
                                  ? "justify-end"
                                  : "justify-center"
                            }`}
                            style={{
                              aspectRatio: `${width} / ${height}`,
                            }}
                          >
                            <p className="text-center text-sm font-black text-slate-900">
                              {finalPageTitle || "喜歡這組圖片嗎？"}
                            </p>
                            <div className="my-3 rounded-xl bg-white p-2 shadow">
                              <QRCodeCanvas
                                value={qrText.trim() || "https://example.com"}
                                size={112}
                                level="M"
                                marginSize={1}
                              />
                            </div>
                            <p className="text-center text-xs leading-5 text-slate-600">
                              {finalPageSubtitle ||
                                "掃描 QR Code，查看更多免費圖片"}
                            </p>
                            {finalPageCta.trim() ? (
                              <div className="mt-3 rounded-full bg-emerald-600 px-4 py-2 text-center text-xs font-black text-white shadow">
                                {finalPageCta}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    )}

                    <QRCodeCanvas
                      ref={qrCanvasRef}
                      value={qrText.trim() || "https://example.com"}
                      size={256}
                      level="M"
                      marginSize={1}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <QRCodeCanvas
                    ref={qrCanvasRef}
                    value="https://example.com"
                    size={256}
                    className="hidden"
                  />
                )}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-black text-white">
                4
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="break-words text-base font-black text-slate-900">
                  產生 MP4
                </h2>
                <p className="mt-1 break-words text-xs leading-5 text-slate-600">
                  如果你的瀏覽器支援原生 MP4，會優先使用「⚡ 快速模式」，10 秒影片通常接近影片實際秒數即可完成；只有不支援時才使用較慢的 FFmpeg 相容模式。
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-slate-900">
                    ⚙️ 自動化設定
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    如果每次只換圖片，可記住所有參數；影片完成後也可自動存檔。
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => saveCurrentSettings(true)}
                  className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-xs font-black text-sky-800 transition hover:-translate-y-0.5 hover:bg-sky-100"
                >
                  💾 記住目前設定
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="checkbox"
                    checked={autoSaveEnabled}
                    onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                    className="mt-0.5 h-5 w-5"
                  />
                  <span>
                    <span className="block text-sm font-black text-slate-800">
                      完成後自動存檔
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      有選輸出資料夾就直接存入；沒有則自動下載一次。
                    </span>
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="checkbox"
                    checked={autoGenerateAfterSelect}
                    onChange={(e) =>
                      setAutoGenerateAfterSelect(e.target.checked)
                    }
                    className="mt-0.5 h-5 w-5"
                  />
                  <span>
                    <span className="block text-sm font-black text-slate-800">
                      換圖後自動開始
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      適合所有設定固定，只一直換新圖片的使用方式。
                    </span>
                  </span>
                </label>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={chooseOutputDirectory}
                  disabled={!directoryPickerAvailable || busy}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-800 transition hover:-translate-y-0.5 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  📁 選擇輸出資料夾
                </button>
                <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2">
                  <p className="break-all text-xs font-black text-slate-700">
                    目前位置：{outputDirectoryName}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {directoryPickerAvailable
                      ? "Chrome / Edge 桌機可選資料夾；因瀏覽器安全限制，重新開啟頁面後需再授權一次。"
                      : "此瀏覽器不支援固定資料夾，完成後會使用瀏覽器下載。"}
                  </p>
                </div>
              </div>

              {automationMessage ? (
                <p className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold leading-5 text-blue-800">
                  {automationMessage}
                </p>
              ) : null}
              {saveStatus ? (
                <p className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold leading-5 text-emerald-800">
                  {saveStatus}
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {!nativeMp4Available && !engineReady ? (
                <button
                  type="button"
                  onClick={preloadEngine}
                  disabled={busy}
                  className="rounded-xl border border-blue-300 bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-md disabled:opacity-50"
                >
                  載入 FFmpeg 相容引擎
                </button>
              ) : null}

              <button
                type="button"
                onClick={generate}
                disabled={busy || images.length === 0}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy
                  ? renderMode === "native"
                    ? "⚡ 快速產生中…"
                    : "正在處理…"
                  : nativeMp4Available
                    ? "⚡ 快速產生 MP4"
                    : "開始產生 MP4"}
              </button>

              {busy ? (
                <button
                  type="button"
                  onClick={cancelGeneration}
                  className="rounded-xl border border-rose-300 bg-white px-4 py-3 text-sm font-black text-rose-600 transition hover:bg-rose-50"
                >
                  取消
                </button>
              ) : null}

              {resultUrl ? (
                <button
                  type="button"
                  onClick={download}
                  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
                >
                  下載 MP4
                </button>
              ) : null}
            </div>

            <div className="mt-4 rounded-xl bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="break-words text-sm font-bold text-slate-700">
                  {status}
                </span>
                <span className="text-xs font-black text-blue-700">
                  {progress}%
                </span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {error ? (
              <p className="mt-3 break-words rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold leading-6 text-rose-700">
                {error}
              </p>
            ) : null}

            {resultUrl ? (
              <video
                className="mt-5 max-h-[620px] w-full rounded-2xl bg-black"
                src={resultUrl}
                controls
                playsInline
              />
            ) : null}

            <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-4">
              <p className="text-sm font-black text-slate-900">
                下一批只要換圖片
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                比例、秒數、字幕、QR Code、特效等設定都會保留，不需要捲回最上面重新設定。
              </p>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                disabled={busy}
                className="mt-3 inline-flex min-h-12 w-full items-center justify-center rounded-2xl border border-blue-300 bg-blue-50 px-4 py-3 text-sm font-black text-blue-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                🖼️ 重新選圖（保留全部設定）
              </button>
              {autoGenerateAfterSelect ? (
                <p className="mt-2 text-center text-xs font-bold text-violet-700">
                  ⚡ 已開啟「換圖後自動開始」，選完新圖片就會直接產生。
                </p>
              ) : null}
            </div>
          </section>

          <div className="mt-6 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            <div className="break-words rounded-xl bg-emerald-50 p-3">
              <strong className="text-emerald-800">隱私：</strong>
              圖片、音樂與輸出影片留在你的裝置。
            </div>
            <div className="break-words rounded-xl bg-sky-50 p-3">
              <strong className="text-sky-800">成本：</strong>
              影片由使用者瀏覽器運算，不使用 RxV 轉檔伺服器。
            </div>
            <div className="break-words rounded-xl bg-violet-50 p-3">
              <strong className="text-violet-800">用途：</strong>
              適合 Shorts、Reels、TikTok、商品與社群宣傳影片。
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
