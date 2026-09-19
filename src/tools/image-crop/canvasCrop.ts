import type { Area } from 'react-easy-crop';

export type OutputMimeType = 'image/png' | 'image/jpeg' | 'image/webp';

/** 僅對可能跨網域的 http(s) 圖設定 CORS；blob / data 不設以免 canvas 汙染或載入失敗 */
export async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    if (/^https?:\/\//i.test(src)) {
      el.crossOrigin = 'anonymous';
    }
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error('IMAGE_LOAD'));
    el.src = src;
  });
  if ('decode' in img && typeof img.decode === 'function') {
    try {
      await img.decode();
    } catch {
      throw new Error('IMAGE_DECODE');
    }
  }
  return img;
}

/**
 * 將 react-easy-crop 的像素裁切區限制在圖片範圍內，避免 drawImage 座標越界造成例外或 toBlob 失敗。
 */
export function clampCroppedAreaToImage(image: HTMLImageElement, pixelCrop: Area): Area {
  const iw = image.naturalWidth;
  const ih = image.naturalHeight;
  if (!iw || !ih) {
    throw new Error('IMAGE_NO_DIMENSIONS');
  }

  let x = Math.max(0, Math.floor(pixelCrop.x));
  let y = Math.max(0, Math.floor(pixelCrop.y));
  let w = Math.round(pixelCrop.width);
  let h = Math.round(pixelCrop.height);

  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) {
    throw new Error('CROP_NAN');
  }

  x = Math.min(x, iw - 1);
  y = Math.min(y, ih - 1);
  w = Math.max(1, w);
  h = Math.max(1, h);
  w = Math.min(w, iw - x);
  h = Math.min(h, ih - y);

  if (w < 1 || h < 1) {
    throw new Error('CROP_INVALID_SIZE');
  }

  return { x, y, width: w, height: h };
}

function lossyQuality(quality: number): number {
  return Math.min(1, Math.max(0.5, quality));
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: OutputMimeType,
  quality: number
): Promise<Blob> {
  const q =
    mimeType === 'image/jpeg' || mimeType === 'image/webp' ? lossyQuality(quality) : undefined;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) {
          resolve(b);
          return;
        }
        try {
          const dataUrl =
            q !== undefined ? canvas.toDataURL(mimeType, q) : canvas.toDataURL(mimeType);
          const fallback = dataURLToBlob(dataUrl);
          if (fallback) resolve(fallback);
          else reject(new Error('TO_BLOB'));
        } catch {
          reject(new Error('TO_DATA_URL'));
        }
      },
      mimeType,
      q
    );
  });
}

function dataURLToBlob(dataUrl: string): Blob | null {
  const m = /^data:([^;]+);base64,([\s\S]+)$/.exec(dataUrl);
  if (!m) return null;
  const mime = m[1];
  try {
    const binary = atob(m[2]);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

/**
 * 以 canvas 輸出裁切區域；JPG 時先填白底以符合不透明輸出。PNG／WebP 保留透明。
 */
export async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  mimeType: OutputMimeType,
  quality: number
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const safe = clampCroppedAreaToImage(image, pixelCrop);

  const w = safe.width;
  const h = safe.height;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('NO_2D_CONTEXT');

  if (mimeType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }

  try {
    ctx.drawImage(image, safe.x, safe.y, safe.width, safe.height, 0, 0, w, h);
  } catch (e) {
    const err = new Error('DRAW_IMAGE');
    (err as Error & { cause?: unknown }).cause = e;
    throw err;
  }

  return canvasToBlob(canvas, mimeType, quality);
}

export function mimeToExt(m: OutputMimeType): 'png' | 'jpg' | 'webp' {
  if (m === 'image/png') return 'png';
  if (m === 'image/jpeg') return 'jpg';
  return 'webp';
}
