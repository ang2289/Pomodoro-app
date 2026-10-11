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

  // Sample 1 in 16 pixels. A difference must occupy a real visible region,
  // not simply a single compression artifact.
  const minChangedSamples = Math.max(9, Math.floor((a.width * a.height) / 6400));
  let changed = 0;
  for (let y = 0; y < a.height; y += 4) {
    for (let x = 0; x < a.width; x += 4) {
      const i = (y * a.width + x) * 4;
      const alphaA = a.data[i + 3];
      const alphaB = b.data[i + 3];
      if (Math.abs(alphaA - alphaB) >= 28 ||
        (alphaA >= 32 && alphaB >= 32 && (
          Math.abs(a.data[i] - b.data[i]) >= 28 ||
          Math.abs(a.data[i + 1] - b.data[i + 1]) >= 28 ||
          Math.abs(a.data[i + 2] - b.data[i + 2]) >= 28
        ))
      ) {
        changed++;
        if (changed >= minChangedSamples) return true;
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
