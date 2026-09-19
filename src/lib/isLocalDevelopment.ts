/**
 * 是否為「本地開發」環境：可完整使用僅限本機的影音工具。
 * - Vite 開發模式（含以區網 IP 開啟時）
 * - 或 hostname 為 localhost / 127.0.0.1
 */
export function isLocalDevelopment(): boolean {
  if (typeof window === "undefined") return false;
  if (import.meta.env.DEV) return true;
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

/** 正式站要隱藏、僅本機開放的「轉影音／腳本產影片」相關路由（不含尾隨 slash 比對） */
const VIDEO_TOOL_PATHS = [
  "/tools/image-to-video",
  "/tools/shopee-video",
  "/tools/shopee-single-video",
  "/tools/shopee-csv",
  "/video-preview",
  "/rxv-auto-shorts",
] as const;

/** 工具卡片 href / to 是否為上述影音相關路徑 */
export function isVideoToolPublicPath(href: string): boolean {
  if (!href) return false;
  const p = href.split("?")[0].replace(/\/+$/, "") || "/";
  return VIDEO_TOOL_PATHS.some((r) => p === r || p.startsWith(`${r}/`));
}
