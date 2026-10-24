/**
 * Conservative title/body reflow for already-transparent LINE sticker PNGs.
 * Use only when there is a real horizontal transparent gutter between the
 * caption and the character. Connected artwork is never divided.
 */
export type StickerRect = { x: number; y: number; width: number; height: number };
export type StickerReadablePlan = { title: { source: StickerRect; target: StickerRect }; body: { source: StickerRect; target: StickerRect } };

function getRegionBounds(
  rgba: Uint8ClampedArray, width: number, height: number,
  startRow: number, endRow: number, threshold: number,
): StickerRect | null {
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = Math.max(0, startRow); y < Math.min(height, endRow); y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (rgba[(y * width + x) * 4 + 3] <= threshold) continue;
      left = Math.min(left, x); top = Math.min(top, y);
      right = Math.max(right, x); bottom = Math.max(bottom, y);
    }
  }
  return right < left ? null : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

function centeredFit(source: StickerRect, maxWidth: number, maxHeight: number, centerX: number, centerY: number): StickerRect {
  const scale = Math.min(maxWidth / source.width, maxHeight / source.height);
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  return { x: Math.round(centerX - width / 2), y: Math.round(centerY - height / 2), width, height };
}

export function planStickerReadableLayout(
  rgba: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
  alphaThreshold = 12,
): StickerReadablePlan | null {
  if (rgba.length !== sourceWidth * sourceHeight * 4 || sourceWidth < 30 || sourceHeight < 30 || targetWidth <= 0 || targetHeight <= 0) return null;
  const total = getRegionBounds(rgba, sourceWidth, sourceHeight, 0, sourceHeight, alphaThreshold);
  if (!total || total.height < 30 || total.width < 30) return null;

  // Look for the caption/body gutter, never divide the torso or feet.
  const first = total.y + Math.round(total.height * 0.13);
  const last = total.y + Math.round(total.height * 0.47);
  const gapMinimum = Math.max(3, Math.round(total.height * 0.012));
  const maxInk = Math.max(1, Math.floor(total.width * 0.007));
  let best: { first: number; last: number; length: number } | null = null;
  let gapStart = -1;
  for (let y = first; y <= last + 1; y += 1) {
    let count = 0;
    if (y <= last) {
      for (let x = total.x; x < total.x + total.width; x += 1) {
        if (rgba[(y * sourceWidth + x) * 4 + 3] > alphaThreshold && ++count > maxInk) break;
      }
    }
    if (y <= last && count <= maxInk) {
      if (gapStart < 0) gapStart = y;
    } else if (gapStart >= 0) {
      const length = y - gapStart;
      if (length >= gapMinimum && (!best || length > best.length)) best = { first: gapStart, last: y, length };
      gapStart = -1;
    }
  }
  if (!best) return null;
  const boundary = Math.floor((best.first + best.last) / 2);
  const title = getRegionBounds(rgba, sourceWidth, sourceHeight, total.y, boundary, alphaThreshold);
  const body = getRegionBounds(rgba, sourceWidth, sourceHeight, boundary, total.y + total.height, alphaThreshold);
  if (!title || !body) return null;
  // Reject likely splits inside hairstyles, faces, gestures or decorations.
  if (title.width < total.width * 0.48 || title.height < total.height * 0.06 || title.height > total.height * 0.33) return null;
  if (body.height < total.height * 0.43 || body.width < total.width * 0.27) return null;

  const padX = Math.max(5, Math.round(targetWidth * 0.075));
  const padY = Math.max(5, Math.round(targetHeight * 0.07));
  const maxWidth = targetWidth - 2 * padX;
  const availableHeight = targetHeight - 2 * padY;
  const captionHeight = Math.round(availableHeight * 0.28);
  const gap = Math.max(4, Math.round(targetHeight * 0.025));
  const bodyHeight = availableHeight - captionHeight - gap;
  if (maxWidth <= 0 || bodyHeight <= 0) return null;
  const centerX = targetWidth / 2;
  const titleTarget = centeredFit(title, maxWidth, captionHeight, centerX, padY + captionHeight / 2);
  const bodyTarget = centeredFit(body, maxWidth, bodyHeight, centerX, padY + captionHeight + gap + bodyHeight / 2);
  return { title: { source: title, target: titleTarget }, body: { source: body, target: bodyTarget } };
}
