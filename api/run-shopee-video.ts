import type { VercelRequest, VercelResponse } from "@vercel/node";

/**
 * 舊入口保留：轉發提示到 /api/main?action=shoeeerender
 * 建議前端之後直接改打 /api/main
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const body =
    typeof req.body === "string"
      ? (() => {
          try { return JSON.parse(req.body); } catch { return {}; }
        })()
      : (req.body || {});

  const jobId = String((body as any)?.jobId || "").trim();

  return res.status(200).json({
    ok: true,
    deprecated: true,
    message: "請改用 /api/main?action=shoeeerender",
    suggestedAction: "shoeeerender",
    jobId,
  });
}
