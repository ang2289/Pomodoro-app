function safeText(value: unknown) {
  return String(value ?? "").trim();
}

function sendJson(res: any, status: number, payload: any) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(status).json(payload);
  }
  res.statusCode = status;
  res.setHeader?.("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function isAllowedPublicBase(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return false;
    return url.hostname.endsWith(".r2.dev");
  } catch {
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return sendJson(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const imageId = safeText(req?.query?.id);
  const baseRaw = safeText(req?.query?.base);
  if (!imageId || imageId.length > 160) {
    return sendJson(res, 400, { ok: false, error: "INVALID_IMAGE_ID" });
  }
  if (!isAllowedPublicBase(baseRaw)) {
    return sendJson(res, 400, { ok: false, error: "INVALID_PUBLIC_BASE" });
  }

  const base = new URL(baseRaw).origin;
  const extensions = ["webp", "jpg", "jpeg", "png"];

  for (const ext of extensions) {
    const remoteUrl = `${base}/free/originals/${encodeURIComponent(imageId)}.${ext}`;
    try {
      const upstream = await fetch(remoteUrl, { method: "GET", cache: "no-store" });
      if (!upstream.ok) continue;

      const arrayBuffer = await upstream.arrayBuffer();
      const body = Buffer.from(arrayBuffer);
      if (!body.length) continue;

      res.status(200);
      res.setHeader("Content-Type", upstream.headers.get("content-type") || (ext === "jpg" ? "image/jpeg" : `image/${ext}`));
      res.setHeader("Content-Length", String(body.length));
      res.setHeader("Content-Disposition", `attachment; filename="RXV-${imageId}.${ext}"`);
      res.setHeader("Cache-Control", "private, no-store");
      return res.end(body);
    } catch {
      // Try the next extension.
    }
  }

  return sendJson(res, 404, { ok: false, error: "FREE_IMAGE_NOT_FOUND" });
}
