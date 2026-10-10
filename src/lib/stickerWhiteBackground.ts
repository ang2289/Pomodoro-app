/**
 * 純前端 LINE 貼圖去白底：只沿外緣去除連通淺白背景。
 * 本函式無法辨識真人衣服/背景語意；預設先保住白衣、皮膚高光及白色描邊。
 */
export type StickerWhiteRemovalMode = "protect" | "balanced" | "strong" | "off";

export type StickerWhiteRemovalResult = {
  removedPixels: number;
  skippedExistingTransparency: boolean;
};

const MODES = {
  protect: { brightness: 248, neutrality: 12, inkGuard: 5 },
  balanced: { brightness: 243, neutrality: 18, inkGuard: 2 },
  strong: { brightness: 232, neutrality: 28, inkGuard: 0 },
} as const;

/**
 * 改寫 rgba 陣列的透明度，RGB 不變。已具透明背景的原圖絕不二次去白。
 * 除非使用者主動切到「加強」，否則不會刪除靠近非白色描邊的純白細節。
 */
export function removeStickerWhiteBackground(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
  mode: StickerWhiteRemovalMode = "protect",
): StickerWhiteRemovalResult {
  const total = width * height;
  if (rgba.length !== total * 4) {
    throw new Error("貼圖圖片資料與實際寬高不一致");
  }
  if (mode === "off" || total <= 0) return { removedPixels: 0, skippedExistingTransparency: false };

  let alreadyTransparent = 0;
  for (let i = 0; i < total; i++) {
    if (rgba[i * 4 + 3] < 32) alreadyTransparent++;
  }
  if (alreadyTransparent / total >= 0.02) {
    return { removedPixels: 0, skippedExistingTransparency: true };
  }

  const settings = MODES[mode];
  const isWhite = new Uint8Array(total);
  const colored = new Uint8Array(total);
  for (let i = 0; i < total; i++) {
    const p = i * 4;
    const r = rgba[p], g = rgba[p + 1], b = rgba[p + 2];
    const min = Math.min(r, g, b), max = Math.max(r, g, b);
    if (rgba[p + 3] <= 32 || (min >= settings.brightness && max - min <= settings.neutrality)) {
      isWhite[i] = 1;
    }
    // 保護黑色文字、白衣周圍的彩色線條及人物色塊。
    if (rgba[p + 3] > 32 && (min < 228 || max - min > 28)) colored[i] = 1;
  }

  const guard = new Uint8Array(total);
  if (settings.inkGuard > 0) {
    const distances = new Uint8Array(total);
    distances.fill(255);
    const queue = new Int32Array(total);
    let head = 0, tail = 0;
    for (let i = 0; i < total; i++) {
      if (!colored[i]) continue;
      distances[i] = 0;
      queue[tail++] = i;
    }
    while (head < tail) {
      const index = queue[head++];
      const dist = distances[index] + 1;
      if (dist > settings.inkGuard) continue;
      const x = index % width, y = Math.floor(index / width);
      const tryNext = (next: number) => {
        if (distances[next] <= dist) return;
        distances[next] = dist;
        queue[tail++] = next;
      };
      if (x > 0) tryNext(index - 1);
      if (x + 1 < width) tryNext(index + 1);
      if (y > 0) tryNext(index - width);
      if (y + 1 < height) tryNext(index + width);
    }
    for (let i = 0; i < total; i++) {
      if (distances[i] <= settings.inkGuard) guard[i] = 1;
    }
  }

  const visited = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0, tail = 0;
  const push = (index: number) => {
    if (visited[index] || !isWhite[index] || guard[index]) return;
    visited[index] = 1;
    queue[tail++] = index;
  };
  for (let x = 0; x < width; x++) {
    push(x);
    if (height > 1) push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    push(y * width);
    if (width > 1) push(y * width + width - 1);
  }
  while (head < tail) {
    const index = queue[head++];
    const x = index % width, y = Math.floor(index / width);
    if (x > 0) push(index - 1);
    if (x + 1 < width) push(index + 1);
    if (y > 0) push(index - width);
    if (y + 1 < height) push(index + width);
  }
  for (let i = 0; i < total; i++) {
    if (visited[i]) rgba[i * 4 + 3] = 0;
  }
  return { removedPixels: tail, skippedExistingTransparency: false };
}
