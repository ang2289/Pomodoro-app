import mainHandler from "./main.js";

export default async function handler(req: any, res: any) {
  try {
    let body: any = {};

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    if (req.method === "POST") {
      if (typeof req.body === "string") {
        body = req.body.trim() ? JSON.parse(req.body) : {};
      } else {
        body = req.body || {};
      }
    } else {
      body = req.body || {};
    }

    const action = body?.action || req.query?.action;

    if (action === "shopeeParse") {
      req.query = {
        ...(req.query || {}),
        action: "shopeeparse",
      };
    }

    req.body = body;

    return await mainHandler(req, res);
  } catch (err: any) {
    console.error("commerce proxy error:", err);

    return res.status(500).json({
      ok: false,
      reason: "COMMERCE_PROXY_ERROR",
      message: err?.message || String(err),
      stack: process.env.NODE_ENV !== "production" ? err?.stack : undefined,
    });
  }
}