/**
 * WhatsApp animation WebP writer: RIFF / VP8X / ANIM / ANMF per WebP container spec.
 * Encodes each frame with native browser image/webp, then muxes frames locally.
 * Throws if validation or the 500KB WhatsApp limit fails: never exports a fake animated file.
 */
export const WHATSAPP_ANIM_MAX_BYTES = 500_000;
export const WHATSAPP_ANIM_SIDE = 512;
const to3 = (v: number) => new Uint8Array([v & 255, (v >>> 8) & 255, (v >>> 16) & 255]);
const to4 = (v: number) => new Uint8Array([v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]);
const tag = (value: string) => new Uint8Array([...value].map((c) => c.charCodeAt(0)));
const concat = (parts: Uint8Array[]) => {
  const output = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
};
function makeChunk(id: string, data: Uint8Array): Uint8Array {
  return concat([tag(id), to4(data.length), data, ...(data.length % 2 ? [new Uint8Array(1)] : [])]);
}
function get4(data: Uint8Array, start: number) {
  return (data[start] | (data[start+1] << 8) | (data[start+2] << 16) | (data[start+3] << 24)) >>> 0;
}
function word(data: Uint8Array, pos: number) {
  return String.fromCharCode(...data.subarray(pos, pos + 4));
}
/** Extract actual VP8/VP8L compressed frame payload. Remove source VP8X headers. */
export function extractWebpFrame(data: Uint8Array): Uint8Array {
  if (data.length < 20 || word(data, 0) !== "RIFF" || word(data, 8) !== "WEBP") {
    throw new Error("影格不是有效 WebP（RIFF）。");
  }
  const parts: Uint8Array[] = [];
  let hasImage = false;
  for (let offset = 12; offset + 8 <= data.length;) {
    const id = word(data, offset);
    const size = get4(data, offset + 4);
    const end = offset + 8 + size + (size & 1);
    if (end > data.length) throw new Error("WebP 影格資料不完整。");
    if (id === "VP8 " || id === "VP8L") {
      hasImage = true;
      parts.push(data.slice(offset, end));
    } else if (id === "ALPH") {
      parts.push(data.slice(offset, end));
    }
    offset = end;
  }
  if (!hasImage) throw new Error("WebP 影格缺少 VP8 或 VP8L 圖像資料。");
  return concat(parts);
}
/** All frames cover whole 512x512 square. No blend means each frame replaces previous. */
export function muxAnimatedWebp(frames: Uint8Array[], durationMs = 250): Uint8Array {
  if (frames.length < 2 || frames.length > 100) throw new Error("動畫需包含 2 至 100 個影格。");
  if (!Number.isInteger(durationMs) || durationMs < 8 || durationMs > 10_000) throw new Error("動畫影格時間設定錯誤。");
  if (frames.length * durationMs > 10_000) throw new Error("WhatsApp 動畫不可超過 10 秒。");
  const size = WHATSAPP_ANIM_SIDE - 1;
  const vp8x = makeChunk("VP8X", concat([new Uint8Array([0x12, 0, 0, 0]), to3(size), to3(size)]));
  const anim = makeChunk("ANIM", new Uint8Array([0, 0, 0, 0, 0, 0]));
  const anmfs = frames.map((frame) => {
    const header = concat([
      to3(0), to3(0), to3(size), to3(size), to3(durationMs),
      new Uint8Array([2]), // do not blend; a full-frame replacement
    ]);
    return makeChunk("ANMF", concat([header, extractWebpFrame(frame)]));
  });
  const body = concat([tag("WEBP"), vp8x, anim, ...anmfs]);
  return concat([tag("RIFF"), to4(body.length), body]);
}
async function imageBitmap(file: Blob): Promise<ImageBitmap> {
  if (typeof createImageBitmap !== "function") throw new Error("瀏覽器不支援圖片解析，請改用新版 Edge/Chrome。");
  return createImageBitmap(file);
}
async function encodeFrame(bitmap: ImageBitmap, quality: number, graphicScale: number): Promise<Uint8Array> {
  const canvas = document.createElement("canvas");
  canvas.width = WHATSAPP_ANIM_SIDE;
  canvas.height = WHATSAPP_ANIM_SIDE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("無法建立 WhatsApp 動畫畫布。");
  const ratio = Math.min(472 / bitmap.width, 472 / bitmap.height) * graphicScale;
  const w = bitmap.width * ratio, h = bitmap.height * ratio;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, (512 - w) / 2, (512 - h) / 2, w, h);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error("WebP 影格編碼失敗。")), "image/webp", quality),
  );
  if (blob.type !== "image/webp") throw new Error("瀏覽器不支援 WebP 編碼。");
  return new Uint8Array(await blob.arrayBuffer());
}
export async function createWhatsAppAnimatedSticker(
  pngFrames: Blob[],
  maxBytes = WHATSAPP_ANIM_MAX_BYTES,
): Promise<Blob> {
  if (pngFrames.length < 2 || pngFrames.length > 40) throw new Error("需要 2～40 個動畫 PNG 影格。");
  const images = await Promise.all(pngFrames.map(imageBitmap));
  try {
    for (const scale of [1, 0.9, 0.78]) {
      for (const quality of [0.75, 0.6, 0.46, 0.35, 0.25]) {
        const encoded: Uint8Array[] = [];
        for (const img of images) encoded.push(await encodeFrame(img, quality, scale));
        const merged = muxAnimatedWebp(encoded, 250);
        if (merged.length <= maxBytes) {
          // Verify real animated container before downloading; never rename PNG/WebM to animated WebP.
          if (word(merged, 12) !== "VP8X" || word(merged, 30) !== "ANIM") {
            throw new Error("動畫 WebP 封裝驗證失敗。");
          }
          return new Blob([new Uint8Array(merged)], { type: "image/webp" });
        }
      }
    }
  } finally {
    images.forEach((img) => img.close());
  }
  throw new Error("這張動畫經壓縮仍超過 WhatsApp 500KB；請減少畫面裝飾或影格數。");
}
