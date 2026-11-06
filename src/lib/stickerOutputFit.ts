/**
 * Keep the entire alpha content rectangle (text, character, props and effects)
 * within the output canvas. Fit uniformly; never crop one axis to enlarge.
 * maxScale limits extra enlargement when eight animated frames are normalized.
 */
export function fitStickerBoundsToCanvas(
  contentWidth: number,
  contentHeight: number,
  canvasWidth: number,
  canvasHeight: number,
  paddingPx: number,
  maxScale = Number.POSITIVE_INFINITY,
): number {
  if (
    !Number.isFinite(contentWidth) || !Number.isFinite(contentHeight) ||
    !Number.isFinite(canvasWidth) || !Number.isFinite(canvasHeight) ||
    !Number.isFinite(paddingPx) || Number.isNaN(maxScale) ||
    contentWidth <= 0 || contentHeight <= 0 ||
    canvasWidth <= 0 || canvasHeight <= 0 ||
    maxScale <= 0
  ) {
    throw new Error("無法計算貼圖安全縮放：尺寸無效");
  }
  const padding = Math.min(
    Math.max(0, paddingPx),
    Math.max(0, (Math.min(canvasWidth, canvasHeight) - 1) / 2),
  );
  return Math.min(
    maxScale,
    Math.max(1, canvasWidth - padding * 2) / contentWidth,
    Math.max(1, canvasHeight - padding * 2) / contentHeight,
  );
}
