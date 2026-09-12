/**
 * QR 短網址：POST /api/shorten → 與 POST /api/main?action=shorten 相同（僅內部 Supabase，無第三方）
 */
import mainHandler from "./main.js";

export default async function handler(req: any, res: any) {
  const q = req.query && typeof req.query === "object" ? { ...req.query } : {};
  (q as Record<string, string>).action = "shorten";
  return mainHandler({ ...req, query: q }, res);
}

