/**
 * LINE 貼圖專用裁切與縮放
 * - crop: 滿版（等比縮放 + 中央裁切，可能裁掉邊緣）
 * - contain-safe: 文字保護（分析 alpha 取得內容框，等比縮放 + padding，不裁切）
 */

export type LineStickerCropMode = 'contain-safe' | 'crop';

const SAFE_PADDING_PERCENT = 0.08; // 8% 安全邊距

export interface ContentBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * 分析圖片 alpha 取得非透明內容的外框
 * 若無 alpha 通道（如 JPEG）則回傳整張圖的範圍
 */
export function getContentBoundingBox(img: HTMLImageElement): ContentBoundingBox {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { x: 0, y: 0, width: w, height: h };

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;

  let minX = w;
  let minY = h;
  let maxX = 0;
  let maxY = 0;
  let hasAlpha = false;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const alpha = data[i + 3];
      if (alpha > 10) {
        hasAlpha = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!hasAlpha) return { x: 0, y: 0, width: w, height: h };

  return {
    x: minX,
    y: minY,
    width: maxX - minX + 1,
    height: maxY - minY + 1,
  };
}

/**
 * 將圖片繪製到目標 canvas
 * - crop: 等比縮放填滿，置中裁切（可能裁掉邊緣）
 * - contain-safe: 依內容框等比縮放到畫布內，四周留 padding，不裁切
 */
export function drawStickerToCanvas(
  img: HTMLImageElement,
  canvas: HTMLCanvasElement,
  targetW: number,
  targetH: number,
  mode: LineStickerCropMode,
  bgColor = '#ffffff'
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = targetW;
  canvas.height = targetH;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, targetW, targetH);

  const imgW = img.naturalWidth;
  const imgH = img.naturalHeight;

  if (mode === 'crop') {
    const targetRatio = targetW / targetH;
    const imgRatio = imgW / imgH;
    let sx = 0;
    let sy = 0;
    let sWidth = imgW;
    let sHeight = imgH;

    if (imgRatio > targetRatio) {
      sHeight = imgH;
      sWidth = imgH * targetRatio;
      sx = (imgW - sWidth) / 2;
    } else {
      sWidth = imgW;
      sHeight = imgW / targetRatio;
      sy = (imgH - sHeight) / 2;
    }
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
    return;
  }

  // contain-safe: 分析 alpha 取得內容框，等比縮放到 (target - padding) 內
  const bbox = getContentBoundingBox(img);
  const padding = Math.min(targetW, targetH) * SAFE_PADDING_PERCENT;
  const innerW = targetW - padding * 2;
  const innerH = targetH - padding * 2;

  if (bbox.width <= 0 || bbox.height <= 0) {
    ctx.drawImage(img, 0, 0, imgW, imgH, padding, padding, innerW, innerH);
    return;
  }

  const scale = Math.min(innerW / bbox.width, innerH / bbox.height);
  const drawW = bbox.width * scale;
  const drawH = bbox.height * scale;
  const dx = padding + (innerW - drawW) / 2;
  const dy = padding + (innerH - drawH) / 2;

  ctx.drawImage(
    img,
    bbox.x, bbox.y, bbox.width, bbox.height,
    dx, dy, drawW, drawH
  );
}
