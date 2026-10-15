/**
 * Check the actual encoded PNG/APNG bytes before allowing a LINE submission
 * download. Browser-only encoding is not a substitute for verifying metadata.
 */
export type LinePngAudit = {
  width: number;
  height: number;
  frames: number;
  loops: number;
  cycleSeconds: number;
  animated: boolean;
};

const MAX_PNG_BYTES = 1_000_000;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let value = i;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function verifyLinePngBytes(
  data: Uint8Array,
  filename: string,
  expectedWidth: number,
  expectedHeight: number,
  animated: boolean,
): LinePngAudit {
  const error = (reason: string): never => { throw new Error(`${filename}：${reason}`); };
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (data.length < 57 || signature.some((byte, i) => data[i] !== byte)) {
    error("PNG 檔案損毀或格式錯誤");
  }
  if (data.length >= MAX_PNG_BYTES) error("檔案必須小於 1MB");
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const width = view.getUint32(16);
  const height = view.getUint32(20);
  if (width !== expectedWidth || height !== expectedHeight) {
    error(`尺寸為 ${width}×${height}，應為 ${expectedWidth}×${expectedHeight}`);
  }
  if (view.getUint8(24) !== 8 || view.getUint8(25) !== 6 ||
      view.getUint8(26) !== 0 || view.getUint8(27) !== 0 || view.getUint8(28) !== 0) {
    error("需為 8-bit RGBA PNG（非調色盤、RGB 或隔行格式）");
  }

  let offset = 8;
  let first = true;
  let seenEnd = false;
  let hasIdat = false;
  let frames = 0;
  let declaredFrames = 0;
  let loops = 0;
  let cycleSeconds = 0;
  let hasAnimation = false;
  let fdatCount = 0;
  while (offset + 12 <= data.length) {
    const length = view.getUint32(offset);
    const end = offset + 12 + length;
    if (!Number.isSafeInteger(end) || end > data.length) error("PNG chunk 長度異常");
    const type = String.fromCharCode(...data.subarray(offset + 4, offset + 8));
    if (first && (type !== "IHDR" || length !== 13)) error("缺少有效 IHDR");
    first = false;
    const expectedCrc = view.getUint32(end - 4);
    const actualCrc = crc32(data.subarray(offset + 4, end - 4));
    if (expectedCrc !== actualCrc) error(`${type} 校驗碼不正確`);

    if (type === "acTL") {
      if (length !== 8 || hasAnimation) error("acTL 資料異常");
      hasAnimation = true;
      declaredFrames = view.getUint32(offset + 8);
      loops = view.getUint32(offset + 12);
    }
    if (type === "fcTL") {
      if (length !== 26) error("fcTL 資料異常");
      frames++;
      const frameWidth = view.getUint32(offset + 12);
      const frameHeight = view.getUint32(offset + 16);
      const x = view.getUint32(offset + 20);
      const y = view.getUint32(offset + 24);
      if (!frameWidth || !frameHeight || frameWidth + x > width || frameHeight + y > height) {
        error(`第 ${frames} 格畫面超出邊界`);
      }
      const numerator = view.getUint16(offset + 28);
      const denominator = view.getUint16(offset + 30) || 100;
      if (!numerator || view.getUint8(offset + 32) > 2 || view.getUint8(offset + 33) > 1) {
        error(`第 ${frames} 格播放控制資料不正確`);
      }
      cycleSeconds += numerator / denominator;
    }
    if (type === "IDAT") hasIdat = true;
    if (type === "fdAT") fdatCount++;
    if (type === "IEND") {
      if (length !== 0 || end !== data.length) error("IEND 或尾端資料異常");
      seenEnd = true;
      break;
    }
    offset = end;
  }
  if (!seenEnd || !hasIdat) error("缺少 PNG 必要資料");
  if (animated) {
    if (!hasAnimation || frames < 5 || frames > 20 || declaredFrames !== frames || fdatCount < frames - 1) {
      error("必須包含 5～20 個完整 APNG 畫格");
    }
    if (loops < 1 || loops > 4 || ![1, 2, 3, 4].some((v) => Math.abs(cycleSeconds - v) < 0.001) ||
        cycleSeconds * loops > 4.001) {
      error(`動畫時間或循環次數不符合 LINE 規格（${cycleSeconds.toFixed(3)} 秒 × ${loops} 次）`);
    }
  } else if (hasAnimation || frames || fdatCount) {
    error("聊天室標籤圖必須是靜態 PNG");
  }
  return { width, height, frames, loops, cycleSeconds, animated: hasAnimation };
}


/**
 * Verify the actual composited pixels *inside* our exported APNG, not just the
 * fcTL frame count. This decoder intentionally supports the format produced
 * by the local RxV encoder: 8-bit RGBA, zlib/deflate, PNG scanline filter 0,
 * APNG SOURCE blend (0) and NONE dispose (0). Unknown encodings fail closed.
 *
 * This must run after final quantization/compression and before the LINE ZIP
 * download. The normal metadata+CRC verification is retained separately.
 */
export async function auditEncodedLineApngDistinctFrames(
  data: Uint8Array,
  filename: string,
  expectedWidth: number,
  expectedHeight: number,
): Promise<import("./animatedStickerFrameQuality").StickerFrameAudit> {
  const metadata = verifyLinePngBytes(data, filename, expectedWidth, expectedHeight, true);
  const { requireDistinctLineFrames } = await import("./animatedStickerFrameQuality");
  const decompressor = typeof DecompressionStream !== "undefined" ? DecompressionStream : null;
  if (!decompressor) throw new Error(`${filename}：此瀏覽器缺少 APNG 解壓檢查功能，無法安全輸出上架 ZIP`);
  type EncodedFrame = {
    width: number; height: number; left: number; top: number;
    compressed: Uint8Array[];
  };
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const frames: EncodedFrame[] = [];
  let current: EncodedFrame | null = null;
  for (let offset = 8; offset + 12 <= data.length;) {
    const length = view.getUint32(offset);
    const end = offset + length + 12;
    if (end > data.length) throw new Error(`${filename}：APNG chunk 超出資料長度`);
    const kind = String.fromCharCode(...data.subarray(offset + 4, offset + 8));
    const body = data.subarray(offset + 8, end - 4);
    if (kind === "fcTL") {
      if (current) frames.push(current);
      const width = view.getUint32(offset + 12);
      const height = view.getUint32(offset + 16);
      const left = view.getUint32(offset + 20);
      const top = view.getUint32(offset + 24);
      if (view.getUint8(offset + 32) !== 0 || view.getUint8(offset + 33) !== 0) {
        throw new Error(`${filename}：無法安全解碼非標準的動畫混合／清除模式`);
      }
      current = { width, height, left, top, compressed: [] };
    } else if (kind === "IDAT" || kind === "fdAT") {
      if (!current) throw new Error(`${filename}：APNG 影格資料順序錯誤`);
      if (kind === "fdAT" && body.length < 4) throw new Error(`${filename}：fdAT 資料異常`);
      current.compressed.push(kind === "fdAT" ? body.subarray(4) : body);
    }
    offset = end;
    if (kind === "IEND") break;
  }
  if (current) frames.push(current);
  if (frames.length !== metadata.frames) throw new Error(`${filename}：APNG 畫格數與內容不一致`);

  const composite = new Uint8Array(metadata.width * metadata.height * 4);
  const rendered: { width: number; height: number; data: Uint8Array }[] = [];
  for (let index = 0; index < frames.length; index++) {
    const frame = frames[index];
    const size = frame.compressed.reduce((total, bytes) => total + bytes.byteLength, 0);
    if (size < 2) throw new Error(`${filename}：第 ${index + 1} 格缺少壓縮影像`);
    const compressed = new Uint8Array(size);
    let pos = 0;
    for (const bytes of frame.compressed) { compressed.set(bytes, pos); pos += bytes.byteLength; }
    let inflated: Uint8Array;
    try {
      const buffer = await new Response(
        new Blob([compressed.buffer]).stream().pipeThrough(new decompressor("deflate")),
      ).arrayBuffer();
      inflated = new Uint8Array(buffer);
    } catch {
      throw new Error(`${filename}：第 ${index + 1} 格 APNG 解壓失敗`);
    }
    const stride = frame.width * 4;
    if (inflated.byteLength !== (stride + 1) * frame.height) {
      throw new Error(`${filename}：第 ${index + 1} 格解壓後資料長度不正確`);
    }
    for (let y = 0; y < frame.height; y++) {
      const input = y * (stride + 1);
      if (inflated[input] !== 0) throw new Error(`${filename}：第 ${index + 1} 格不是預期的 RGBA 無濾鏡格式`);
      const dest = ((frame.top + y) * metadata.width + frame.left) * 4;
      composite.set(inflated.subarray(input + 1, input + 1 + stride), dest);
    }
    rendered.push({ width: metadata.width, height: metadata.height, data: composite.slice() });
  }
  return requireDistinctLineFrames(rendered, filename);
}
