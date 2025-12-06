import type { VercelRequest, VercelResponse } from "@vercel/node";
import * as cheerio from "cheerio";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "缺少商品網址" });
    }

    // 1. 取得 Shopee 商品 HTML
    const html = await fetch(url as string, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    }).then((res) => res.text());

    // 2. 用 Cheerio 抓商品名稱 & 圖片
    const $ = cheerio.load(html);

    // 商品標題在 <title>
    let title = $("title").text().replace("| 蝦皮購物", "").trim();

    // 商品圖片（從 meta og:image 抓）
    let image = $('meta[property="og:image"]').attr("content") || "";

    if (!title) title = "（找不到商品名稱）";

    return res.status(200).json({
      success: true,
      title,
      image,
      source: "HTML-cheerio",
    });
  } catch (err: any) {
    console.error("Shopee parser error:", err);
    return res.status(500).json({
      error: true,
      message: "Shopee 解析失敗",
      detail: err.message,
    });
  }
}
