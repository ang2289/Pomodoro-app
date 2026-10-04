export type CoupangAdPlacement = "home" | "imagesTop" | "imagesMid" | "tools" | "sticker";
export type CoupangAdConfig = { subId: string; alt: string };

export const COUPANG_PARTNERS_CAMPAIGN = {
  trackingCode: "AF4011605", desktopId: 1879, desktopWidth: 728, desktopHeight: 90,
  mobileId: 1880, mobileWidth: 320, mobileHeight: 100,
  startAt: "2026-10-01T00:00:00+08:00", endAt: "2026-10-10T23:59:59+08:00",
} as const;

export const COUPANG_DYNAMIC_WIDGET = {
  id: 1887,
  template: "carousel",
  trackingCode: "AF4011605",
  desktopWidth: 680,
  desktopHeight: 140,
  mobileWidth: 320,
  mobileHeight: 140,
} as const;

export const COUPANG_ADS: Record<CoupangAdPlacement, CoupangAdConfig> = {
  home: { subId: "rxv_home", alt: "Coupang Partners 廣告" },
  imagesTop: { subId: "rxv_images_top", alt: "Coupang Partners 圖片素材推薦" },
  imagesMid: { subId: "rxv_images_mid", alt: "Coupang Partners 圖片素材推薦" },
  tools: { subId: "rxv_tools", alt: "Coupang Partners 工具推薦" },
  sticker: { subId: "rxv_sticker", alt: "Coupang Partners LINE 貼圖推薦" },
};

export const TOOL_COUPANG_AD = { alt: "Coupang Partners 工具推薦" } satisfies Omit<CoupangAdConfig, "subId">;
export const TOOL_COUPANG_EXCLUDED_PATHS = new Set([
  "/tools", "/tools/line-sticker", "/tools/commercial-image", "/tools/business-card-order",
  "/tools/ai-summary", "/tools/summary", "/tools/homework-helper", "/tools/ai", "/tools/image",
  "/tools/productivity", "/tools/life",
]);
export const TOOL_COUPANG_INLINE_SLOT_PATHS = new Set([
  "/tools/qr", "/tools/qr-code", "/tools/image-resize", "/tools/image-crop",
  "/tools/image-convert", "/tools/image-prompt", "/tools/pet-prompt",
]);
export const TOOL_COUPANG_SUB_ID_ALIASES: Record<string, string> = {
  "/tools/qr": "rxv_tool_qrcode", "/tools/qr-code": "rxv_tool_qrcode",
};
export type ToolCoupangAdPosition = "fallback" | "inline";

export function getToolCoupangAd(pathname: string, position: ToolCoupangAdPosition = "fallback"): CoupangAdConfig | null {
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  if (!normalizedPath.startsWith("/tools/") || TOOL_COUPANG_EXCLUDED_PATHS.has(normalizedPath) ||
      (position === "fallback" && TOOL_COUPANG_INLINE_SLOT_PATHS.has(normalizedPath)) ||
      (position === "inline" && !TOOL_COUPANG_INLINE_SLOT_PATHS.has(normalizedPath))) return null;
  const toolSlug = normalizedPath.slice("/tools/".length);
  if (!toolSlug) return null;
  return { ...TOOL_COUPANG_AD, subId: TOOL_COUPANG_SUB_ID_ALIASES[normalizedPath] || `rxv_tool_${toolSlug.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "")}` };
}
