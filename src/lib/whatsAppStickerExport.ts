/**
 * WhatsApp 貼圖素材輸出：瀏覽器本機 WebP，不會上傳圖片至雲端。
 * 注意：ZIP 是供貼圖匯入 APP 使用的素材包，非直接安裝 WhatsApp 貼圖集。
 * 官方第三方貼圖：512x512 WebP、靜態單張 <= 100KB、每包 3~30 張。
 */
export const WHATSAPP_STICKER_SIZE = 512;
export const WHATSAPP_STICKER_MAX_BYTES = 100_000; // 保守十進位限制
export const WHATSAPP_TRAY_SIZE = 96;
export const WHATSAPP_TRAY_MAX_BYTES = 50_000;

export function partitionWhatsAppPacks(count: number): number[] {
  if (!Number.isInteger(count) || count < 3) throw new Error("WhatsApp 每組至少需要 3 張貼圖。");
  // 均分到最少組數；32 張 => 16+16，40 張 => 20+20，
  // 不會產生客戶不好管理的 29+3 迷你貼圖集。
  const packCount = Math.ceil(count / 30);
  const base = Math.floor(count / packCount);
  return Array.from({ length: packCount }, (_, index) =>
    base + (index < count % packCount ? 1 : 0),
  );
}

export function isRealWebp(blob: Blob): boolean {
  return blob.type === "image/webp" && blob.size > 12;
}

async function encode(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (output) => output ? resolve(output) : reject(new Error("無法產生 WhatsApp WebP。")),
      "image/webp",
      quality,
    );
  });
  if (!isRealWebp(blob)) {
    throw new Error("這個瀏覽器不支援 WebP 輸出，請使用新版 Edge 或 Chrome。");
  }
  const header = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  const signature = String.fromCharCode(...header);
  if (!signature.startsWith("RIFF") || signature.slice(8, 12) !== "WEBP") {
    throw new Error("輸出的圖片不是有效 WebP，請改用新版 Chrome 或 Edge。");
  }
  return blob;
}

export async function createWhatsAppWebpSticker(
  source: HTMLCanvasElement,
  maxBytes = WHATSAPP_STICKER_MAX_BYTES,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = WHATSAPP_STICKER_SIZE;
  canvas.height = WHATSAPP_STICKER_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法建立 WhatsApp 圖片畫布。");
  for (const scale of [1, 0.94, 0.88, 0.8]) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const factor = Math.min(480 / source.width, 480 / source.height) * scale;
    const width = source.width * factor;
    const height = source.height * factor;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source, (512 - width) / 2, (512 - height) / 2, width, height);
    for (const quality of [0.93, 0.86, 0.78, 0.68, 0.58, 0.46, 0.35]) {
      const blob = await encode(canvas, quality);
      if (blob.size <= maxBytes) return blob;
    }
  }
  throw new Error("WhatsApp WebP 經多次壓縮仍超過 100KB，請簡化原圖或減少細小裝飾後重試。");
}

export async function createWhatsAppTrayPng(source: HTMLCanvasElement): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = WHATSAPP_TRAY_SIZE;
  canvas.height = WHATSAPP_TRAY_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法建立 WhatsApp 貼圖集封面。");
  const scale = Math.min(88 / source.width, 88 / source.height);
  const width = source.width * scale;
  const height = source.height * scale;
  ctx.drawImage(source, (96 - width) / 2, (96 - height) / 2, width, height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (png) => png ? resolve(png) : reject(new Error("無法輸出貼圖集封面 PNG。")),
      "image/png",
    ),
  );
  if (blob.size > WHATSAPP_TRAY_MAX_BYTES) {
    throw new Error("WhatsApp 封面圖超過 50KB，請更換較簡單的主圖。");
  }
  return blob;
}
