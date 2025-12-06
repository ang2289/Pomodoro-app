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
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept-Language": "zh-TW,zh;q=0.9",
      }
    }).then(r => r.text());

    // ⬇⬇⬇ 新增：輸出前 300 字讓我們知道抓到什麼
    const debugLog = html.substring(0, 300);

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
      title,
      image,
      debugLog   // <-- 加這個
    });

  } catch (err) {
    return res.status(500).json({
      ok: false,
      message: "解析失敗",
      error: String(err),
    });
  }
}
