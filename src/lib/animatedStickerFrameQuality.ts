/**
 * Lightweight, browser-only / pure-pixel quality gate for LINE animated stickers.
 *
 * Count visibly distinct *rendered* frames, not only fcTL chunks: identical
 * frames can meet APNG structure checks while looking static in a chat.
 * The sampled comparison intentionally ignores transparent RGB garbage and
 * microscopic antialiasing/quantization differences.
 */
export type StickerFramePixels = {
  width: number;
  height: number;
  data: Uint8Array | Uint8ClampedArray;
};

export type StickerFrameAudit = {
  total: number;
  distinct: number;
  duplicateIndices: number[];
};

function meaningfullyDifferent(
  a: StickerFramePixels,
  b: StickerFramePixels,
): boolean {
  if (a.width !== b.width || a.height !== b.height) return true;

  // Ignore isolated pixel changes: real motion needs a connected visible
  // region (such as a moving outline), not scattered antialiasing artifacts.
  const columns = Math.ceil(a.width / 4);
  const rows = Math.ceil(a.height / 4);
  const changed = new Uint8Array(columns * rows);
  let changedCount = 0;
  const minChanged = Math.max(9, Math.floor((a.width * a.height) / 6400));

  for (let y = 0, row = 0; y < a.height; y += 4, row++) {
    for (let x = 0, col = 0; x < a.width; x += 4, col++) {
      const i = (y * a.width + x) * 4;
      const alphaA = a.data[i + 3];
      const alphaB = b.data[i + 3];
      const alphaChanged = Math.abs(alphaA - alphaB) >= 28;
      const colorChanged = alphaA >= 32 && alphaB >= 32 && (
        Math.abs(a.data[i] - b.data[i]) >= 28 ||
        Math.abs(a.data[i + 1] - b.data[i + 1]) >= 28 ||
        Math.abs(a.data[i + 2] - b.data[i + 2]) >= 28
      );
      if (alphaChanged || colorChanged) {
        changed[row * columns + col] = 1;
        changedCount++;
      }
    }
  }
  if (changedCount < minChanged) return false;

  // 8-connected groups allow thin curved text/character edges to count,
  // but prevent many unrelated specks from becoming a fake new frame.
  const minCluster = Math.max(4, Math.ceil(minChanged / 2));
  const stack: number[] = [];
  for (let i = 0; i < changed.length; i++) {
    if (changed[i] !== 1) continue;
    let clusterSize = 0;
    changed[i] = 2;
    stack.push(i);
    while (stack.length) {
      const current = stack.pop() as number;
      clusterSize++;
      if (clusterSize >= minCluster) return true;
      const cx = current % columns;
      const cy = Math.floor(current / columns);
      for (let dy = -1; dy <= 1; dy++) {
        const ny = cy + dy;
        if (ny < 0 || ny >= rows) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx;
          if (nx < 0 || nx >= columns || (dx === 0 && dy === 0)) continue;
          const next = ny * columns + nx;
          if (changed[next] === 1) {
            changed[next] = 2;
            stack.push(next);
          }
        }
      }
    }
  }
  return false;
}

export function auditStickerFrames(frames: readonly StickerFramePixels[]): StickerFrameAudit {
  const unique: StickerFramePixels[] = [];
  const duplicateIndices: number[] = [];
  frames.forEach((frame, index) => {
    if (unique.some((seen) => !meaningfullyDifferent(frame, seen))) {
      duplicateIndices.push(index);
    } else {
      unique.push(frame);
    }
  });
  return { total: frames.length, distinct: unique.length, duplicateIndices };
}

/**
 * The 5 unique frame target is a conservative creative-quality safeguard.
 * LINE mandates 5–20 frames, but does NOT explicitly guarantee that any
 * 5 distinct frames will be approved; content is reviewed separately.
 */
export const LINE_RECOMMENDED_DISTINCT_FRAMES = 5;

export function requireDistinctLineFrames(
  frames: readonly StickerFramePixels[],
  filename: string,
): StickerFrameAudit {
  const result = auditStickerFrames(frames);
  if (result.distinct < LINE_RECOMMENDED_DISTINCT_FRAMES) {
    throw new Error(
      `${filename} 只有 ${result.distinct}/${result.total} 個明顯不同的畫格；為避免動畫近似靜止，請改用其他動作效果，或提供至少 5 個不同畫格後重新輸出。`,
    );
  }
  return result;
}
