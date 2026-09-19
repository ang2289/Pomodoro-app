/**
 * 圖片尺寸轉換共用函式
 * 支援 IG／蝦皮／Shorts 等平台尺寸，僅在瀏覽器內處理，不變形（pad 或 crop）
 */

export type PresetKey = 'ig-post' | 'ig-portrait' | 'ig-story' | 'shopee-main';

export const PRESET_LABELS: Record<PresetKey, string> = {
  'ig-post': 'IG 貼文 1:1',
  'ig-portrait': 'IG 直式 4:5',
  'ig-story': 'IG 限動 / Reels / Shorts 9:16',
  'shopee-main': '蝦皮商品主圖 1:1',
} as const;

/** 各 preset 的寬高比：width / height */
const PRESET_RATIOS: Record<PresetKey, number> = {
  'ig-post': 1,
  'ig-portrait': 4 / 5,
  'ig-story': 9 / 16,
  'shopee-main': 1,
};

/**
 * 依 preset 與長邊解析度，計算目標寬高
 * longEdge 為較長邊的像素值（例如 1080）
 */
export function getTargetSize(
  presetKey: PresetKey,
  longEdge: number
): { width: number; height: number } {
  const ratio = PRESET_RATIOS[presetKey];
  let width: number;
  let height: number;

  if (ratio >= 1) {
    // 橫向或方形：寬 >= 高
    width = longEdge;
    height = Math.round(longEdge / ratio);
  } else {
    // 直向：高 > 寬
    height = longEdge;
    width = Math.round(longEdge * ratio);
  }

  return { width, height };
}

export type DrawMode = 'pad' | 'crop';

export interface DrawToCanvasOptions {
  image: HTMLImageElement;
  canvas: HTMLCanvasElement;
  mode: DrawMode;
  targetWidth: number;
  targetHeight: number;
  bgColor?: string;
}

/**
 * 將圖片繪製到 canvas，不拉伸變形
 * - pad：等比例完整放入，補白
 * - crop：等比例放大填滿，置中裁切
 */
export function drawToCanvas({
  image,
  canvas,
  mode,
  targetWidth,
  targetHeight,
  bgColor = '#ffffff',
}: DrawToCanvasOptions): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const imgW = image.naturalWidth;
  const imgH = image.naturalHeight;
  const targetRatio = targetWidth / targetHeight;
  const imgRatio = imgW / imgH;

  let sx = 0;
  let sy = 0;
  let sWidth = imgW;
  let sHeight = imgH;
  let dx = 0;
  let dy = 0;
  let dWidth = targetWidth;
  let dHeight = targetHeight;

  if (mode === 'pad') {
    // 完整顯示：等比例縮小放入，補白
    if (imgRatio > targetRatio) {
      // 圖較寬，以寬為準
      dWidth = targetWidth;
      dHeight = targetWidth / imgRatio;
    } else {
      // 圖較高，以高為準
      dHeight = targetHeight;
      dWidth = targetHeight * imgRatio;
    }
    dx = (targetWidth - dWidth) / 2;
    dy = (targetHeight - dHeight) / 2;

    // 先填背景
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  } else {
    // crop：等比例放大填滿，置中裁切
    if (imgRatio > targetRatio) {
      // 圖較寬，以高為準裁切左右
      sHeight = imgH;
      sWidth = imgH * targetRatio;
      sx = (imgW - sWidth) / 2;
    } else {
      // 圖較高，以寬為準裁切上下
      sWidth = imgW;
      sHeight = imgW / targetRatio;
      sy = (imgH - sHeight) / 2;
    }
  }

  ctx.drawImage(
    image,
    sx, sy, sWidth, sHeight,
    dx, dy, dWidth, dHeight
  );
}

export type OutputFormat = 'image/png' | 'image/jpeg';

/**
 * 將 canvas 轉為 Blob
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: OutputFormat,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('無法產生 Blob'));
      },
      format,
      format === 'image/jpeg' ? (quality ?? 0.92) : undefined
    );
  });
}
