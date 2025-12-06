import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).json({ ok: false, message: "缺少 url 參數" });
    }

    const html = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "Mozilla/5.0",
      }
    }).then(r => r.text());

    // 解析 og:title
    let title = "";
    const titleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
    if (titleMatch) title = titleMatch[1];

    // 解析 og:image
    let image = "";
    const imgMatch = html.match(/<meta property="og:image" content="(.*?)"/);
    if (imgMatch) image = imgMatch[1];

    return res.status(200).json({
      ok: true,
      title: title || "未找到商品名稱",
      image,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "解析失敗",
      error: String(err),
    });
  }
}
